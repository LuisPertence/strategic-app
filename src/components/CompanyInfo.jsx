import { useState, useRef, useEffect } from 'react';
import { companySuggestions, industrySuggestions } from '../data/suggestions';

export default function CompanyInfo({ companyData, setCompanyData, onProductAdded, onProductRemoved, researchCompany }) {
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [filteredCompanySuggestions, setFilteredCompanySuggestions] = useState([]);
  const companyNameRef = useRef(null);

  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [filteredIndustrySuggestions, setFilteredIndustrySuggestions] = useState([]);
  const industryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyNameRef.current && !companyNameRef.current.contains(event.target)) {
        setShowCompanySuggestions(false);
      }
      if (industryRef.current && !industryRef.current.contains(event.target)) {
        setShowIndustrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanyNameChange = (value) => {
    setCompanyData(prev => ({ ...prev, name: value }));
    if (value.length > 0) {
      const filtered = companySuggestions.filter(c =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanySuggestions(filtered);
      setShowCompanySuggestions(filtered.length > 0);
    } else {
      setShowCompanySuggestions(false);
      setFilteredCompanySuggestions([]);
    }
  };

  const selectCompanySuggestion = (company) => {
    setCompanyData(prev => ({ ...prev, name: company }));
    setShowCompanySuggestions(false);
    setFilteredCompanySuggestions([]);
  };

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
    if (newItem.trim()) {
      const trimmed = newItem.trim();
      setCompanyData(prev => ({ ...prev, [fieldName]: [...prev[fieldName], trimmed] }));
      if (fieldName === 'keyProducts') {
        onProductAdded(trimmed);
      }
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

  return (
    <div className="space-y-6">
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

      <div className="form-section">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
          <button
            onClick={researchCompany}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            disabled={!companyData.name}
          >
            <i className="fas fa-search"></i>
            Research Company
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative" ref={companyNameRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name * <span className="text-red-500">Required</span>
            </label>
            <input
              type="text"
              value={companyData.name}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              onFocus={() => {
                if (companyData.name.length > 0) {
                  const filtered = companySuggestions.filter(c =>
                    c.toLowerCase().includes(companyData.name.toLowerCase())
                  );
                  setFilteredCompanySuggestions(filtered);
                  setShowCompanySuggestions(filtered.length > 0);
                }
              }}
              className="input-field"
              placeholder="Enter company name..."
            />
            {showCompanySuggestions && filteredCompanySuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredCompanySuggestions.slice(0, 8).map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectCompanySuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{suggestion}</div>
                  </div>
                ))}
              </div>
            )}
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
              max={new Date().getFullYear()}
            />
          </div>

          <div ref={industryRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Market *</label>
            <select
              value={companyData.primaryMarket}
              onChange={(e) => setCompanyData(prev => ({ ...prev, primaryMarket: e.target.value }))}
              className="input-field"
            >
              <option value="">Select Primary Market</option>
              <option value="australia">Australia</option>
              <option value="united-states">United States</option>
              <option value="global">Global</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Model *</label>
            <select
              value={companyData.businessModel}
              onChange={(e) => setCompanyData(prev => ({ ...prev, businessModel: e.target.value }))}
              className="input-field"
            >
              <option value="">Select Business Model</option>
              <option value="b2b">B2B (Business to Business)</option>
              <option value="b2c">B2C (Business to Consumer)</option>
              <option value="saas">SaaS (Software as a Service)</option>
              <option value="e-commerce">E-commerce</option>
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
            <input
              type="url"
              value={companyData.website}
              onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
              className="input-field"
              placeholder="https://www.company.com"
            />
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

      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Products & Services</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Products/Services</label>
          <div className="space-y-2">
            {companyData.keyProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-50 rounded border">{product}</span>
                <button
                  onClick={() => removeArrayItem(index, 'keyProducts')}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add product or service..."
              className="input-field"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem(e.target.value, 'keyProducts');
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

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
            <div className="space-y-2">
              {companyData.coreValues.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 p-2 bg-gray-50 rounded border">{value}</span>
                  <button
                    onClick={() => removeArrayItem(index, 'coreValues')}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Add core value..."
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addArrayItem(e.target.value, 'coreValues');
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Leadership</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Executives</label>
          <div className="space-y-2">
            {companyData.keyExecutives.map((executive, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-50 rounded border text-sm">{executive}</span>
                <button
                  onClick={() => removeArrayItem(index, 'keyExecutives')}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add executive (Name - Title)..."
              className="input-field"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem(e.target.value, 'keyExecutives');
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
