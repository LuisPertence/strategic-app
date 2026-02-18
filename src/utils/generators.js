const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateCompanyData = (companyName) => {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education'];
  const markets = ['Australia', 'United States', 'Global', 'Asia-Pacific', 'Europe'];
  const businessModels = ['B2B', 'B2C', 'SaaS', 'E-commerce', 'Marketplace'];
  const sizes = ['startup', 'small', 'medium', 'large', 'enterprise'];

  const currentYear = new Date().getFullYear();

  const productsByIndustry = {
    'Technology': ['Cloud Software', 'AI Solutions', 'Cybersecurity Platform', 'Data Analytics Tool'],
    'Healthcare': ['Telemedicine Platform', 'Medical Devices', 'Pharmaceuticals', 'Health Management Software'],
    'Finance': ['Fintech App', 'Investment Platform', 'Digital Banking Solution', 'Wealth Management Service'],
    'Retail': ['E-commerce Platform', 'Supply Chain Software', 'POS System', 'Customer Loyalty Program'],
    'Manufacturing': ['Automation Robotics', 'Industrial IoT Solutions', 'Quality Control Systems', 'Advanced Materials'],
    'Education': ['E-learning Platform', 'Virtual Classroom Software', 'Educational Content', 'Student Management System']
  };

  const selectedIndustry = randomChoice(industries);
  const selectedProducts = productsByIndustry[selectedIndustry] || [`${companyName} Core Product`];

  return {
    industry: selectedIndustry,
    primaryMarket: randomChoice(markets),
    businessModel: randomChoice(businessModels),
    size: randomChoice(sizes),
    revenue: `$${Math.floor(Math.random() * 1000) + 10}M`,
    foundedYear: (currentYear - Math.floor(Math.random() * 30) - 5).toString(),
    headquarters: `${randomChoice(['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'San Francisco', 'New York'])}, ${randomChoice(['Australia', 'USA', 'UK'])}`,
    website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    description: `${companyName} is a leading company in the ${selectedIndustry.toLowerCase()} sector, providing innovative solutions to customers worldwide.`,
    missionStatement: `To deliver exceptional value through innovative ${randomChoice(['products', 'services', 'solutions'])} that transform how businesses operate.`,
    visionStatement: `To be the global leader in ${randomChoice(['innovation', 'customer satisfaction', 'sustainable growth'])}, setting new standards for excellence.`,
    keyProducts: selectedProducts.map(p => p.replace('Company Name', companyName)),
    coreValues: ['Innovation', 'Integrity', 'Customer Focus', 'Excellence', 'Collaboration'],
    keyExecutives: [
      'John Smith - Chief Executive Officer',
      'Sarah Johnson - Chief Technology Officer',
      'Michael Brown - Chief Financial Officer',
      'Emily Davis - Chief Operating Officer'
    ]
  };
};

export const generateCompanyPestelData = (companyName, industry) => {
  const pestelFactors = {
    political: [
      { name: 'Government regulations in ' + industry, gravity: 4, urgency: 3, tendency: 3, description: '' },
      { name: 'Political stability in key markets', gravity: 3, urgency: 2, tendency: 4, description: '' },
    ],
    economic: [
      { name: 'Economic growth in target markets', gravity: 4, urgency: 4, tendency: 3, description: '' },
      { name: 'Interest rate fluctuations', gravity: 3, urgency: 3, tendency: 4, description: '' },
    ],
    social: [
      { name: 'Changing consumer preferences', gravity: 4, urgency: 4, tendency: 4, description: '' },
      { name: 'Demographic shifts', gravity: 3, urgency: 2, tendency: 4, description: '' },
    ],
    technological: [
      { name: 'AI and automation adoption', gravity: 5, urgency: 5, tendency: 5, description: '' },
      { name: 'Cybersecurity threats', gravity: 4, urgency: 5, tendency: 4, description: '' },
    ],
    environmental: [
      { name: 'Climate change regulations', gravity: 4, urgency: 4, tendency: 5, description: '' },
      { name: 'Sustainability requirements', gravity: 4, urgency: 3, tendency: 4, description: '' },
    ],
    legal: [
      { name: 'Data protection laws (GDPR, CCPA)', gravity: 5, urgency: 5, tendency: 4, description: '' },
      { name: 'Industry-specific regulations', gravity: 4, urgency: 4, tendency: 3, description: '' },
    ]
  };

  return {
    political: { factors: pestelFactors.political, isCollapsed: false },
    economic: { factors: pestelFactors.economic, isCollapsed: false },
    social: { factors: pestelFactors.social, isCollapsed: false },
    technological: { factors: pestelFactors.technological, isCollapsed: false },
    environmental: { factors: pestelFactors.environmental, isCollapsed: false },
    legal: { factors: pestelFactors.legal, isCollapsed: false }
  };
};

export const generateCompetitors = (companyName) => {
  const lowerCaseCompany = companyName.toLowerCase();
  if (lowerCaseCompany.includes("apple")) {
    return ["Samsung Electronics", "Google (Pixel)", "Huawei", "Xiaomi", "Microsoft (Surface)", "HP", "Dell", "Lenovo", "Sony", "LG", "OnePlus", "Asus", "Acer", "Razer", "HTC", "Motorola", "Nokia", "BlackBerry", "Fujitsu", "Panasonic"];
  } else if (lowerCaseCompany.includes("microsoft")) {
    return ["Google", "Amazon (AWS)", "Apple", "Salesforce", "Oracle", "IBM", "SAP", "Adobe", "Workday", "ServiceNow", "VMware", "Red Hat", "Cisco", "Dell Technologies", "HP Inc.", "Lenovo", "Samsung", "Sony", "Nintendo", "Activision Blizzard"];
  }
  return [
    "Competitor A Corp.", "Competitor B Ltd.", "Competitor C Inc.", "Competitor D Group",
    "Competitor E Solutions", "Competitor F Innovations", "Competitor G Global",
    "Competitor H Systems", "Competitor I Enterprises", "Competitor J Holdings",
    "Competitor K Dynamics", "Competitor L Industries", "Competitor M Ventures",
    "Competitor N Tech", "Competitor O Services", "Competitor P Corp.",
    "Competitor Q Ltd.", "Competitor R Inc.", "Competitor S Group", "Competitor T Solutions"
  ];
};

export const generatePortersForces = (industry, primaryMarket) => {
  const lowerCaseIndustry = (industry || '').toLowerCase();
  const lowerCaseMarket = (primaryMarket || '').toLowerCase();
  let forces = {
    threatOfNewEntrants: { description: 'Moderate - Capital requirements can be high, but digital disruption lowers barriers.', gravity: 3, urgency: 3, tendency: 3 },
    bargainingPowerOfBuyers: { description: 'High - Buyers have many choices and access to information.', gravity: 4, urgency: 4, tendency: 3 },
    bargainingPowerOfSuppliers: { description: 'Moderate - Depends on uniqueness of components/services.', gravity: 3, urgency: 3, tendency: 3 },
    threatOfSubstituteProductsOrServices: { description: 'High - Technology evolves rapidly, leading to new substitutes.', gravity: 4, urgency: 4, tendency: 4 },
    rivalryAmongExistingCompetitors: { description: 'Very High - Intense competition, frequent innovation, price wars.', gravity: 5, urgency: 5, tendency: 4 },
    relativePowerOfNewComplementors: { description: 'High - Complementary products/services (e.g., apps, accessories) enhance value.', gravity: 4, urgency: 3, tendency: 4 }
  };

  if (lowerCaseIndustry.includes("healthcare")) {
    forces.threatOfNewEntrants = { description: 'Low - High regulatory hurdles, capital intensity, and specialized knowledge required.', gravity: 2, urgency: 2, tendency: 2 };
    forces.bargainingPowerOfBuyers = { description: 'Moderate - Patients often rely on insurance/providers, but consumer choice is growing.', gravity: 3, urgency: 3, tendency: 3 };
    forces.bargainingPowerOfSuppliers = { description: 'High - Specialized medical equipment and pharmaceutical suppliers have strong power.', gravity: 4, urgency: 4, tendency: 3 };
    forces.threatOfSubstituteProductsOrServices = { description: 'Low to Moderate - Alternatives exist (e.g., preventative care vs. treatment), but direct substitutes for critical care are limited.', gravity: 2, urgency: 3, tendency: 2 };
    forces.rivalryAmongExistingCompetitors = { description: 'Moderate to High - Competition among hospitals, clinics, and pharma companies, but often localized or specialized.', gravity: 4, urgency: 4, tendency: 3 };
    forces.relativePowerOfNewComplementors = { description: 'Moderate - Telemedicine platforms, health tech apps, and diagnostic tools enhance services.', gravity: 3, urgency: 3, tendency: 4 };
  } else if (lowerCaseIndustry.includes("finance")) {
    forces.threatOfNewEntrants = { description: 'Moderate to High - Fintech startups are lowering barriers, but regulatory burden remains high for traditional banking.', gravity: 4, urgency: 4, tendency: 3 };
    forces.bargainingPowerOfBuyers = { description: 'High - Customers can easily switch banks/financial providers due to low switching costs and digital options.', gravity: 4, urgency: 4, tendency: 4 };
    forces.bargainingPowerOfSuppliers = { description: 'Moderate - Technology providers, data services, and interbank networks hold some power.', gravity: 3, urgency: 3, tendency: 3 };
    forces.threatOfSubstituteProductsOrServices = { description: 'High - Cryptocurrencies, peer-to-peer lending, and alternative investment platforms pose significant threats.', gravity: 4, urgency: 5, tendency: 4 };
    forces.rivalryAmongExistingCompetitors = { description: 'Very High - Intense competition among banks, investment firms, and fintechs, often leading to aggressive marketing and product innovation.', gravity: 5, urgency: 5, tendency: 5 };
    forces.relativePowerOfNewComplementors = { description: 'High - Payment gateways, financial planning software, and data analytics tools are crucial for modern financial services.', gravity: 4, urgency: 4, tendency: 4 };
  } else if (lowerCaseIndustry.includes("retail")) {
    forces.threatOfNewEntrants = { description: 'High - Low barriers to entry for online retail, but physical retail requires significant capital.', gravity: 4, urgency: 4, tendency: 4 };
    forces.bargainingPowerOfBuyers = { description: 'Very High - Consumers have vast choices, price transparency, and low switching costs.', gravity: 5, urgency: 5, tendency: 4 };
    forces.bargainingPowerOfSuppliers = { description: 'Moderate - Large retailers have significant power, but unique brands can command higher prices.', gravity: 3, urgency: 3, tendency: 3 };
    forces.threatOfSubstituteProductsOrServices = { description: 'High - E-commerce, direct-to-consumer brands, and sharing economy models are strong substitutes.', gravity: 4, urgency: 4, tendency: 4 };
    forces.rivalryAmongExistingCompetitors = { description: 'Very High - Intense price competition, constant innovation in customer experience, and rapid trend changes.', gravity: 5, urgency: 5, tendency: 5 };
    forces.relativePowerOfNewComplementors = { description: 'High - Payment solutions, logistics providers, and marketing platforms are essential for retail success.', gravity: 4, urgency: 4, tendency: 4 };
  }

  if (lowerCaseMarket.includes("australia")) {
    if (lowerCaseIndustry.includes("finance")) {
      forces.threatOfNewEntrants.description += ' (Australia: Strong regulatory oversight, but fintech growth is notable).';
      forces.rivalryAmongExistingCompetitors.description += ' (Australia: Dominated by major banks, but increasing competition from smaller players).';
    }
  } else if (lowerCaseMarket.includes("united-states")) {
    if (lowerCaseIndustry.includes("technology")) {
      forces.threatOfNewEntrants.description += ' (USA: High innovation, but strong incumbents).';
      forces.rivalryAmongExistingCompetitors.description += ' (USA: Global tech giants lead to fierce competition).';
    }
  }

  return forces;
};
