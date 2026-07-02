import { useState, useRef, useEffect } from 'react';
import { industrySuggestions } from '../data/suggestions';

export default function CompanyInfo({ companyData, setCompanyData, onProductAdded, onProductRemoved, researchCompany, researchSource }) {
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [filteredIndustrySuggestions, setFilteredIndustrySuggestions] = useState([]);
  const [isReloading, setIsReloading] = useState(false);
  const industryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (industryRef.current && !industryRef.current.contains(event.target)) {
        setShowIndustrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIndustryChange = (value) => {
    setCompanyData(prev => ({ ...prev, industry: value }));
    if (value.length > 0) {
      const filtered = industrySuggestions.filter(i =>
        i.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredIndustrySuggestions(filtered);
      setShowIndustrySuggestions(filtered.length > 0);
    } else {
      setShowIndustrySuggestions(false);
      setFilteredIndustrySuggestions([]);
    }
  };

  const selectIndustrySuggestion = (industry) => {
    setCompanyData(prev => ({ ...prev, industry }));
    setShowIndustrySuggestions(false);
    setFilteredIndustrySuggestions([]);
  };

  const addArrayItem = (newItem, fieldName) => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const existing = companyData[fieldName].map(v => v.toLowerCase());
    if (existing.includes(trimmed.toLowerCase())) return;
    setCompanyData(prev => ({ ...prev, [fieldName]: [...prev[fieldName], trimmed] }));
    if (fieldName === 'keyProducts') {
      onProductAdded(trimmed);
    }
  };

  const removeArrayItem = (index, fieldName) => {
    const itemToRemove = companyData[fieldName][index];
    setCompanyData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
    if (fieldName === 'keyProducts') {
      onProductRemoved(itemToRemove);
    }
  };

  const handleReResearch = async () => {
    if (!companyData.name.trim() || isReloading) return;
    setIsReloading(true);
    try {
      await researchCompany();
    } finally {
      setIsReloading(false);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'industry', 'primaryMarket', 'businessModel'];
    const optionalFields = ['size', 'revenue', 'description', 'foundedYear', 'headquarters', 'website'];
    const requiredCompleted = requiredFields.filter(f => companyData[f]).length;
    const optionalCompleted = optionalFields.filter(f => companyData[f]).length;
    const arrayFieldsCompleted = (companyData.keyProducts.length > 0 ? 1 : 0) +
      (companyData.coreValues.length > 0 ? 1 : 0);
    const totalCompleted = requiredCompleted + optionalCompleted + arrayFieldsCompleted;
    const totalFields = requiredFields.length + optionalFields.length + 2;
    return Math.round((totalCompleted / totalFields) * 100);
  };

  const hasPlacesData = companyData._placesAddress || companyData._phone || companyData._rating;

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Company Information</h3>
            <p className="text-blue-100">Build your company profile for strategic analysis</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
            <div className="text-sm text-blue-100">Complete</div>
          </div>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Limited research notice */}
      {researchSource === 'limited' && (
        <div className="form-section bg-amber-50 border-amber-300">
          <div className="flex items-start gap-3">
            <div className="text-amber-500 mt-0.5">
              <i className="fas fa-exclamation-triangle text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">Limited research data found</h4>
              <p className="text-sm text-amber-700 mb-2">
                Automatic research couldn't find detailed information for this company.
                This typically happens with small, local, or recently founded businesses.
              </p>
              <p className="text-sm text-amber-700">
                You can <strong>fill in the fields manually</strong> below, or set up the
                AI-powered research proxy (Google Places + Claude) for much better results
                with businesses of any size.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Places info card */}
      {hasPlacesData && (
        <div className="form-section bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 mt-1">
              <i className="fas fa-map-marker-alt text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Business Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {companyData._placesAddress && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fas fa-location-dot text-blue-400 w-4"></i>
                    <span>{companyData._placesAddress}</span>
                  </div>
                )}
                {companyData._phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fas fa-phone text-blue-400 w-4"></i>
                    <span>{companyData._phone}</span>
                  </div>
                )}
                {companyData._rating && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fas fa-star text-yellow-400 w-4"></i>
                    <span>{companyData._rating}/5{companyData._ratingCount ? ` (${companyData._ratingCount.toLocaleString()} reviews)` : ''}</span>
                  </div>
                )}
                {companyData._mapsUrl && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-map text-blue-400 w-4"></i>
                    <a href={companyData._mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="form-section">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
          <button
            onClick={handleReResearch}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!companyData.name || isReloading}
          >
            <i className={`fas ${isReloading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
            {isReloading ? 'Researching...' : 'Re-research'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Name — editable text, no autocomplete since user already chose from search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyData.name}
              onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="Enter company name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
            <input
              type="number"
              value={companyData.foundedYear}
              onChange={(e) => setCompanyData(prev => ({ ...prev, foundedYear: e.target.value }))}
              className="input-field"
              placeholder="e.g., 2010"
              min="1800"
              max="2026"
            />
          </div>

          <div ref={industryRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyData.industry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              onFocus={() => {
                if (companyData.industry.length > 0) {
                  const filtered = industrySuggestions.filter(i =>
                    i.toLowerCase().includes(companyData.industry.toLowerCase())
                  );
                  setFilteredIndustrySuggestions(filtered);
                  setShowIndustrySuggestions(filtered.length > 0);
                }
              }}
              className="input-field"
              placeholder="Enter industry..."
            />
            {showIndustrySuggestions && filteredIndustrySuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredIndustrySuggestions.slice(0, 8).map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectIndustrySuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{suggestion}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Market <span className="text-red-500">*</span>
            </label>
            <select
              value={companyData.primaryMarket}
              onChange={(e) => setCompanyData(prev => ({ ...prev, primaryMarket: e.target.value }))}
              className="input-field"
            >
              <option value="">Select Primary Market</option>
              <optgroup label="Americas">
                <option value="united-states">United States</option>
                <option value="canada">Canada</option>
                <option value="brazil">Brazil</option>
                <option value="mexico">Mexico</option>
                <option value="latin-america">Latin America</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="united-kingdom">United Kingdom</option>
                <option value="germany">Germany</option>
                <option value="france">France</option>
                <option value="spain">Spain</option>
                <option value="italy">Italy</option>
                <option value="netherlands">Netherlands</option>
                <option value="europe">Europe (Multi-country)</option>
              </optgroup>
              <optgroup label="Asia-Pacific">
                <option value="australia">Australia</option>
                <option value="new-zealand">New Zealand</option>
                <option value="japan">Japan</option>
                <option value="china">China</option>
                <option value="india">India</option>
                <option value="south-korea">South Korea</option>
                <option value="southeast-asia">Southeast Asia</option>
              </optgroup>
              <optgroup label="Middle East & Africa">
                <option value="uae">UAE</option>
                <option value="saudi-arabia">Saudi Arabia</option>
                <option value="south-africa">South Africa</option>
                <option value="middle-east">Middle East</option>
                <option value="africa">Africa</option>
              </optgroup>
              <optgroup label="Multi-Region">
                <option value="global">Global</option>
                <option value="other">Other</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Model <span className="text-red-500">*</span>
            </label>
            <select
              value={companyData.businessModel}
              onChange={(e) => setCompanyData(prev => ({ ...prev, businessModel: e.target.value }))}
              className="input-field"
            >
              <option value="">Select Business Model</option>
              <option value="b2b">B2B (Business to Business)</option>
              <option value="b2c">B2C (Business to Consumer)</option>
              <option value="b2b2c">B2B2C (Business to Business to Consumer)</option>
              <option value="saas">SaaS (Software as a Service)</option>
              <option value="e-commerce">E-commerce</option>
              <option value="marketplace">Marketplace / Platform</option>
              <option value="franchise">Franchise</option>
              <option value="subscription">Subscription</option>
              <option value="freemium">Freemium</option>
              <option value="d2c">D2C (Direct to Consumer)</option>
              <option value="consulting">Consulting / Services</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
            <select
              value={companyData.size}
              onChange={(e) => setCompanyData(prev => ({ ...prev, size: e.target.value }))}
              className="input-field"
            >
              <option value="">Select Size</option>
              <option value="startup">Startup (1-10 employees)</option>
              <option value="small">Small (11-50 employees)</option>
              <option value="medium">Medium (51-200 employees)</option>
              <option value="large">Large (201-1000 employees)</option>
              <option value="enterprise">Enterprise (1000+ employees)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
            <input
              type="text"
              value={companyData.revenue}
              onChange={(e) => setCompanyData(prev => ({ ...prev, revenue: e.target.value }))}
              className="input-field"
              placeholder="e.g., $10M, $100M, $1B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
            <input
              type="text"
              value={companyData.headquarters}
              onChange={(e) => setCompanyData(prev => ({ ...prev, headquarters: e.target.value }))}
              className="input-field"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <div className="relative">
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                className="input-field"
                placeholder="https://www.company.com"
              />
              {companyData.website && (
                <a
                  href={companyData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  title="Open website"
                >
                  <i className="fas fa-external-link-alt text-sm"></i>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
          <textarea
            value={companyData.description}
            onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
            className="input-field"
            rows="4"
            placeholder="Brief description of your company's business model, main activities, and market position..."
          />
        </div>
      </div>

      {/* Products & Services */}
      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Products & Services</h4>
        <ArrayField
          items={companyData.keyProducts}
          onAdd={(item) => addArrayItem(item, 'keyProducts')}
          onRemove={(index) => removeArrayItem(index, 'keyProducts')}
          placeholder="Add product or service and press Enter..."
          icon="fa-box"
        />
      </div>

      {/* Mission, Vision & Values */}
      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Mission, Vision & Values</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
            <textarea
              value={companyData.missionStatement}
              onChange={(e) => setCompanyData(prev => ({ ...prev, missionStatement: e.target.value }))}
              className="input-field"
              rows="3"
              placeholder="What is your company's purpose and primary objectives?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vision Statement</label>
            <textarea
              value={companyData.visionStatement}
              onChange={(e) => setCompanyData(prev => ({ ...prev, visionStatement: e.target.value }))}
              className="input-field"
              rows="3"
              placeholder="What does your company aspire to become in the future?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Core Values</label>
            <ArrayField
              items={companyData.coreValues}
              onAdd={(item) => addArrayItem(item, 'coreValues')}
              onRemove={(index) => removeArrayItem(index, 'coreValues')}
              placeholder="Add core value and press Enter..."
              icon="fa-heart"
            />
          </div>
        </div>
      </div>

      {/* Leadership */}
      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Leadership</h4>
        <ArrayField
          items={companyData.keyExecutives}
          onAdd={(item) => addArrayItem(item, 'keyExecutives')}
          onRemove={(index) => removeArrayItem(index, 'keyExecutives')}
          placeholder="Add executive (Name - Title) and press Enter..."
          icon="fa-user-tie"
        />
      </div>
    </div>
  );
}

function ArrayField({ items, onAdd, onRemove, placeholder, icon }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <div className="flex-1 p-2.5 bg-gray-50 rounded border border-gray-200 text-sm flex items-center gap-2">
            <i className={`fas ${icon} text-gray-400 text-xs`}></i>
            {item}
          </div>
          <button
            onClick={() => onRemove(index)}
            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
            title="Remove"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="input-field flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        {inputValue.trim() && (
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            title="Add"
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>
    </div>
  );
}
