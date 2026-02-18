/**
 * Cloudflare Worker — Company Research Proxy (Google Places + Claude hybrid)
 *
 * Flow: company name → Google Places (factual data) → Claude (strategic enrichment) → JSON
 *
 * Setup:
 *   1. npm install -g wrangler
 *   2. cd worker
 *   3. wrangler login
 *   4. wrangler secret put ANTHROPIC_API_KEY       (your Anthropic key)
 *   5. wrangler secret put GOOGLE_PLACES_API_KEY   (your Google Cloud key with Places API enabled)
 *   6. wrangler secret put AUTH_TOKEN               (pick any secret password)
 *   7. wrangler deploy
 *
 * Google Cloud setup:
 *   - Go to console.cloud.google.com → APIs & Services → Enable "Places API (New)"
 *   - Create an API key → restrict it to "Places API (New)" only
 *   - Free $200/month credit covers ~10,000 requests
 *
 * Then in your React app's .env.local:
 *   VITE_RESEARCH_API_URL=https://company-research-proxy.YOUR-SUBDOMAIN.workers.dev
 *   VITE_RESEARCH_AUTH_TOKEN=<same AUTH_TOKEN you set in step 6>
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // ── Authentication ────────────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token !== env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Parse request ─────────────────────────────────────────────────────────
    let companyName;
    try {
      const body = await request.json();
      companyName = body.companyName;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!companyName || typeof companyName !== 'string' || companyName.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid company name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      // ── Step 1: Google Places — factual data ──────────────────────────────
      const placesData = await fetchGooglePlaces(companyName, env.GOOGLE_PLACES_API_KEY);

      // ── Step 2: Claude — strategic enrichment using Places context ────────
      const companyData = await enrichWithClaude(companyName, placesData, env.ANTHROPIC_API_KEY);

      return new Response(JSON.stringify(companyData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Research failed', message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ── Google Places API (New) ───────────────────────────────────────────────────

async function fetchGooglePlaces(companyName, apiKey) {
  if (!apiKey) return null;

  try {
    // Text Search to find the business
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.types,places.businessStatus,places.rating,places.userRatingCount,places.googleMapsUri'
      },
      body: JSON.stringify({
        textQuery: companyName,
        maxResultCount: 1
      })
    });

    if (!searchRes.ok) {
      console.error('Google Places search failed:', searchRes.status);
      return null;
    }

    const searchData = await searchRes.json();
    const place = searchData.places?.[0];
    if (!place) return null;

    return {
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      website: place.websiteUri || '',
      phone: place.internationalPhoneNumber || '',
      types: place.types || [],
      businessStatus: place.businessStatus || '',
      rating: place.rating || null,
      ratingCount: place.userRatingCount || null,
      mapsUrl: place.googleMapsUri || ''
    };
  } catch (err) {
    console.error('Google Places error:', err);
    return null;
  }
}

// ── Claude API — strategic enrichment ─────────────────────────────────────────

async function enrichWithClaude(companyName, placesData, apiKey) {
  const placesContext = placesData
    ? `\nGoogle Places data for this company:
- Official name: ${placesData.name}
- Address: ${placesData.address}
- Website: ${placesData.website}
- Phone: ${placesData.phone}
- Business types: ${placesData.types.join(', ')}
- Status: ${placesData.businessStatus}
- Rating: ${placesData.rating} (${placesData.ratingCount} reviews)\n`
    : '\nNo Google Places data was found for this company.\n';

  const prompt = `Research the company "${companyName}" and return accurate, factual information.
${placesContext}
Use the Google Places data above as a reliable factual foundation, then enrich it with your knowledge.
If you cannot find reliable information for a field, return an empty string or empty array — never make up data.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "name": "Official company name",
  "description": "2-3 sentence factual description of what the company does, its market position, and main activities",
  "industry": "Primary industry (e.g., Technology, Healthcare, Retail, Financial Services, etc.)",
  "foundedYear": "YYYY or empty string if unknown",
  "headquarters": "City, Country",
  "website": "https://... or empty string if unknown",
  "size": "startup | small | medium | large | enterprise",
  "revenue": "e.g. $10M, $500M, $2.1B — or empty string if unknown",
  "primaryMarket": "united-states | australia | global | other",
  "businessModel": "b2b | b2c | saas | e-commerce | other",
  "missionStatement": "The company's actual mission statement if publicly known, otherwise empty string",
  "visionStatement": "The company's actual vision statement if publicly known, otherwise empty string",
  "keyProducts": ["Product/Service 1", "Product/Service 2", "Product/Service 3"],
  "coreValues": ["Value 1", "Value 2", "Value 3"],
  "keyExecutives": ["Full Name - Title", "Full Name - Title"]
}

Rules for size: startup = 1-10 employees, small = 11-50, medium = 51-200, large = 201-1000, enterprise = 1000+.
Rules for primaryMarket: use "global" if the company operates in multiple continents, otherwise pick the most relevant one.
Rules for businessModel: pick the dominant model. Use "other" only if none of the options fit.
For headquarters: extract city and country from the Google Places address if available.
For website: prefer the Google Places website if available.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response as JSON');
  }

  const result = JSON.parse(jsonMatch[0]);

  // Merge Google Places factual data as ground truth where available
  if (placesData) {
    if (placesData.website) result.website = placesData.website;
    if (placesData.address) result._placesAddress = placesData.address;
    if (placesData.phone) result._phone = placesData.phone;
    if (placesData.mapsUrl) result._mapsUrl = placesData.mapsUrl;
    if (placesData.rating) result._rating = placesData.rating;
    if (placesData.ratingCount) result._ratingCount = placesData.ratingCount;
  }

  return result;
}
