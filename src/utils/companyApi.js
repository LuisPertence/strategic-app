const RESEARCH_API_URL = import.meta.env.VITE_RESEARCH_API_URL || '';
const RESEARCH_AUTH_TOKEN = import.meta.env.VITE_RESEARCH_AUTH_TOKEN || '';
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

// ─── Search (Wikidata - works fine for finding company names) ────────────────

export async function searchCompanies(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    limit: '10',
    format: 'json',
    origin: '*'
  });

  try {
    const res = await fetch(`${WIKIDATA_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.search || []).map(entity => ({
      name: entity.label || '',
      description: entity.description || '',
      url: `https://www.wikidata.org/wiki/${entity.id}`
    }));
  } catch {
    return [];
  }
}

// ─── Research (AI-powered via proxy, with Wikidata fallback) ─────────────────

export async function researchCompanyData(companyName) {
  // Try AI-powered research first
  if (RESEARCH_API_URL) {
    try {
      const data = await aiResearch(companyName);
      if (data) return data;
    } catch (e) {
      console.warn('AI research failed, falling back to Wikidata:', e);
    }
  }

  // Fallback to Wikipedia + Wikidata
  return wikiResearch(companyName);
}

// ─── AI Research via Cloudflare Worker proxy ─────────────────────────────────

async function aiResearch(companyName) {
  const headers = { 'Content-Type': 'application/json' };
  if (RESEARCH_AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${RESEARCH_AUTH_TOKEN}`;
  }

  const res = await fetch(RESEARCH_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ companyName })
  });

  if (!res.ok) throw new Error(`Research API returned ${res.status}`);

  const data = await res.json();

  // Normalize to match our app's data structure
  return {
    name: data.name || companyName,
    description: data.description || '',
    website: data.website || '',
    foundedYear: data.foundedYear || '',
    headquarters: data.headquarters || '',
    industry: data.industry || '',
    size: normalizeSize(data.size),
    revenue: data.revenue || '',
    primaryMarket: normalizePrimaryMarket(data.primaryMarket),
    businessModel: normalizeBusinessModel(data.businessModel),
    missionStatement: data.missionStatement || '',
    visionStatement: data.visionStatement || '',
    keyProducts: Array.isArray(data.keyProducts) ? data.keyProducts : [],
    coreValues: Array.isArray(data.coreValues) ? data.coreValues : [],
    keyExecutives: Array.isArray(data.keyExecutives) ? data.keyExecutives : [],
    _thumbnail: null,
    _wikiUrl: ''
  };
}

function normalizeSize(size) {
  const valid = ['startup', 'small', 'medium', 'large', 'enterprise'];
  if (valid.includes(size)) return size;
  return '';
}

function normalizePrimaryMarket(market) {
  const valid = ['australia', 'united-states', 'global', 'other'];
  if (valid.includes(market)) return market;
  return '';
}

function normalizeBusinessModel(model) {
  const valid = ['b2b', 'b2c', 'saas', 'e-commerce', 'other'];
  if (valid.includes(model)) return model;
  return '';
}

// ─── Wikidata Fallback ───────────────────────────────────────────────────────

async function wikiResearch(companyName) {
  const [wikiData, wikidataInfo] = await Promise.all([
    fetchWikipediaExtract(companyName),
    fetchWikidataInfo(companyName)
  ]);

  return {
    name: companyName,
    description: wikiData?.extract || `${companyName} is a company.`,
    website: wikidataInfo?.website || '',
    foundedYear: wikidataInfo?.foundedYear || '',
    headquarters: wikidataInfo?.headquarters || '',
    industry: wikidataInfo?.industry || '',
    size: formatEmployees(wikidataInfo?.employees) || '',
    revenue: formatRevenue(wikidataInfo?.revenue) || '',
    primaryMarket: '',
    businessModel: '',
    missionStatement: '',
    visionStatement: '',
    keyProducts: [],
    coreValues: [],
    keyExecutives: wikidataInfo?.ceo ? [`${wikidataInfo.ceo} - Chief Executive Officer`] : [],
    _thumbnail: wikiData?.thumbnail || null,
    _wikiUrl: wikiData?.url || ''
  };
}

async function fetchWikipediaExtract(companyName) {
  const params = new URLSearchParams({
    action: 'query',
    titles: companyName,
    prop: 'extracts|pageimages|info',
    exintro: 'true',
    explaintext: 'true',
    piprop: 'thumbnail',
    pithumbsize: '300',
    inprop: 'url',
    format: 'json',
    origin: '*'
  });

  try {
    const res = await fetch(`${WIKI_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    return {
      title: page.title,
      extract: page.extract || '',
      thumbnail: page.thumbnail?.source || null,
      url: page.fullurl || ''
    };
  } catch {
    return null;
  }
}

async function fetchWikidataInfo(companyName) {
  const searchParams = new URLSearchParams({
    action: 'wbsearchentities',
    search: companyName,
    language: 'en',
    limit: '1',
    format: 'json',
    origin: '*'
  });

  try {
    const searchRes = await fetch(`${WIKIDATA_API}?${searchParams}`);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const entity = searchData.search?.[0];
    if (!entity) return null;

    const entityParams = new URLSearchParams({
      action: 'wbgetentities',
      ids: entity.id,
      props: 'claims|labels|descriptions',
      languages: 'en',
      format: 'json',
      origin: '*'
    });

    const entityRes = await fetch(`${WIKIDATA_API}?${entityParams}`);
    if (!entityRes.ok) return null;
    const entityData = await entityRes.json();
    const entityInfo = entityData.entities?.[entity.id];
    if (!entityInfo) return null;

    const claims = entityInfo.claims || {};

    return {
      industry: await resolveClaimLabel(claims, 'P452'),
      foundedYear: getClaimTime(claims, 'P571'),
      headquarters: await resolveClaimLabel(claims, 'P159'),
      website: getClaimStringValue(claims, 'P856'),
      ceo: await resolveClaimLabel(claims, 'P169'),
      employees: getClaimAmount(claims, 'P1128'),
      revenue: getClaimAmount(claims, 'P2139'),
      description: entityInfo.descriptions?.en?.value || ''
    };
  } catch {
    return null;
  }
}

// ─── Wikidata helpers ────────────────────────────────────────────────────────

function getClaimStringValue(claims, property) {
  const claim = claims[property]?.[0];
  return claim?.mainsnak?.datavalue?.value || null;
}

function getClaimTime(claims, property) {
  const claim = claims[property]?.[0];
  const time = claim?.mainsnak?.datavalue?.value?.time;
  if (!time) return null;
  const match = time.match(/\+(\d{4})/);
  return match ? match[1] : null;
}

function getClaimAmount(claims, property) {
  const claim = claims[property]?.[0];
  const amount = claim?.mainsnak?.datavalue?.value?.amount;
  if (!amount) return null;
  return amount.replace('+', '');
}

async function resolveClaimLabel(claims, property) {
  const claim = claims[property]?.[0];
  const id = claim?.mainsnak?.datavalue?.value?.id;
  if (!id) return claim?.mainsnak?.datavalue?.value || null;

  try {
    const params = new URLSearchParams({
      action: 'wbgetentities',
      ids: id,
      props: 'labels',
      languages: 'en',
      format: 'json',
      origin: '*'
    });
    const res = await fetch(`${WIKIDATA_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.entities?.[id]?.labels?.en?.value || null;
  } catch {
    return null;
  }
}

function formatRevenue(amount) {
  if (!amount) return null;
  const num = parseFloat(amount);
  if (isNaN(num)) return null;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num}`;
}

function formatEmployees(amount) {
  if (!amount) return null;
  const num = parseInt(amount, 10);
  if (isNaN(num)) return null;
  if (num >= 1000) return 'enterprise';
  if (num >= 201) return 'large';
  if (num >= 51) return 'medium';
  if (num >= 11) return 'small';
  return 'startup';
}
