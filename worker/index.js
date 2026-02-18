/**
 * Cloudflare Worker — Company Research Proxy
 *
 * This worker proxies requests to the Anthropic Claude API to research companies.
 * It keeps your API key secure on the server side.
 *
 * Setup:
 *   1. npm install -g wrangler
 *   2. cd worker
 *   3. wrangler login
 *   4. wrangler secret put ANTHROPIC_API_KEY    (paste your Anthropic key)
 *   5. wrangler secret put AUTH_TOKEN            (pick any secret password)
 *   6. wrangler deploy
 *
 * Then in your React app's .env.local:
 *   VITE_RESEARCH_API_URL=https://your-worker.your-subdomain.workers.dev
 *   VITE_RESEARCH_AUTH_TOKEN=<same AUTH_TOKEN you set in step 5>
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // ── Authentication ──────────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token !== env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Parse request ───────────────────────────────────────────────────────
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

    // ── Call Claude API ─────────────────────────────────────────────────────
    const prompt = `Research the company "${companyName}" and return accurate, factual information.
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
Rules for businessModel: pick the dominant model. Use "other" only if none of the options fit.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
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
        return new Response(JSON.stringify({ error: 'Claude API error', details: errText }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      // Parse JSON from Claude's response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const companyData = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(companyData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error', message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
