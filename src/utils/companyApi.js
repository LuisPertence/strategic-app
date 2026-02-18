const WIKI_API = 'https://en.wikipedia.org/w/api.php';

export async function searchCompanies(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    action: 'opensearch',
    search: query + ' company',
    limit: '10',
    namespace: '0',
    format: 'json',
    origin: '*'
  });

  try {
    const res = await fetch(`${WIKI_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    // opensearch returns [query, titles[], descriptions[], urls[]]
    const titles = data[1] || [];
    const descriptions = data[2] || [];
    const urls = data[3] || [];

    return titles.map((title, i) => ({
      name: title,
      description: descriptions[i] || '',
      url: urls[i] || ''
    }));
  } catch {
    return [];
  }
}

export async function fetchCompanyWikipediaData(companyName) {
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

export async function fetchWikidataInfo(companyName) {
  // Step 1: Find the Wikidata entity ID from the Wikipedia title
  const searchParams = new URLSearchParams({
    action: 'wbsearchentities',
    search: companyName,
    language: 'en',
    limit: '1',
    format: 'json',
    origin: '*'
  });

  try {
    const searchRes = await fetch(`https://www.wikidata.org/w/api.php?${searchParams}`);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const entity = searchData.search?.[0];
    if (!entity) return null;

    // Step 2: Fetch the entity claims
    const entityParams = new URLSearchParams({
      action: 'wbgetentities',
      ids: entity.id,
      props: 'claims|labels|descriptions',
      languages: 'en',
      format: 'json',
      origin: '*'
    });

    const entityRes = await fetch(`https://www.wikidata.org/w/api.php?${entityParams}`);
    if (!entityRes.ok) return null;
    const entityData = await entityRes.json();
    const entityInfo = entityData.entities?.[entity.id];
    if (!entityInfo) return null;

    const claims = entityInfo.claims || {};

    return {
      industry: await resolveClaimLabel(claims, 'P452'),      // industry
      foundedYear: getClaimTime(claims, 'P571'),               // inception
      headquarters: await resolveClaimLabel(claims, 'P159'),   // headquarters location
      website: getClaimStringValue(claims, 'P856'),            // official website
      ceo: await resolveClaimLabel(claims, 'P169'),            // CEO
      employees: getClaimAmount(claims, 'P1128'),              // employees
      revenue: getClaimAmount(claims, 'P2139'),                // revenue
      description: entityInfo.descriptions?.en?.value || ''
    };
  } catch {
    return null;
  }
}

function getClaimStringValue(claims, property) {
  const claim = claims[property]?.[0];
  return claim?.mainsnak?.datavalue?.value || null;
}

function getClaimTime(claims, property) {
  const claim = claims[property]?.[0];
  const time = claim?.mainsnak?.datavalue?.value?.time;
  if (!time) return null;
  // time format: +YYYY-MM-DDT00:00:00Z
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
  if (!id) {
    // Maybe it's a string value
    return claim?.mainsnak?.datavalue?.value || null;
  }

  try {
    const params = new URLSearchParams({
      action: 'wbgetentities',
      ids: id,
      props: 'labels',
      languages: 'en',
      format: 'json',
      origin: '*'
    });
    const res = await fetch(`https://www.wikidata.org/w/api.php?${params}`);
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

export async function researchCompanyData(companyName) {
  // Fetch Wikipedia extract and Wikidata structured info in parallel
  const [wikiData, wikidataInfo] = await Promise.all([
    fetchCompanyWikipediaData(companyName),
    fetchWikidataInfo(companyName)
  ]);

  const result = {
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

  return result;
}
