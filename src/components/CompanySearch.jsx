import { useState, useRef, useEffect, useCallback } from 'react';
import { searchCompanies } from '../utils/companyApi';

export default function CompanySearch({ onCompanySelected, isResearching }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (value) => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    const results = await searchCompanies(value);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedCompany(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setSelectedCompany(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    if (selectedCompany) {
      onCompanySelected(selectedCompany.name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedCompany) {
      handleConfirm();
    }
  };

  return (
    <div className="search-screen">
      <div className="search-screen-inner">
        <div className="search-hero">
          <div className="search-icon-circle">
            <i className="fas fa-building"></i>
          </div>
          <h1 className="search-title">Strategic Planning Suite</h1>
          <p className="search-subtitle">
            Search for a company to begin your strategic analysis
          </p>
        </div>

        <div className="search-box-container" ref={containerRef}>
          <div className="search-input-wrapper">
            <i className="fas fa-search search-input-icon"></i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0 && !selectedCompany) {
                  setShowSuggestions(true);
                }
              }}
              className="search-input"
              placeholder="Type a company name..."
              disabled={isResearching}
            />
            {isLoading && (
              <div className="search-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="search-suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="search-suggestion-name">
                    <i className="fas fa-building search-suggestion-icon"></i>
                    {suggestion.name}
                  </div>
                  {suggestion.description && (
                    <div className="search-suggestion-desc">
                      {suggestion.description.length > 120
                        ? suggestion.description.substring(0, 120) + '...'
                        : suggestion.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCompany && !isResearching && (
          <div className="search-selected-card">
            <div className="search-selected-info">
              <div className="search-selected-name">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                {selectedCompany.name}
              </div>
              {selectedCompany.description && (
                <div className="search-selected-desc">
                  {selectedCompany.description.length > 200
                    ? selectedCompany.description.substring(0, 200) + '...'
                    : selectedCompany.description}
                </div>
              )}
            </div>
            <button className="search-confirm-btn" onClick={handleConfirm}>
              <i className="fas fa-arrow-right mr-2"></i>
              Research & Analyze
            </button>
          </div>
        )}

        {isResearching && (
          <div className="search-researching">
            <div className="search-researching-spinner">
              <i className="fas fa-cog fa-spin"></i>
            </div>
            <h3 className="search-researching-title">
              Researching {query}...
            </h3>
            <p className="search-researching-subtitle">
              Fetching company information from Wikipedia and Wikidata
            </p>
            <div className="search-progress-bar">
              <div className="search-progress-fill"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
