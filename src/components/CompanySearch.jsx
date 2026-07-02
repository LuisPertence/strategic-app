import { useState, useRef, useEffect, useCallback } from 'react';
import { searchCompanies } from '../utils/companyApi';

export default function CompanySearch({ onCompanySelected, isResearching }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
    setHighlightedIndex(-1);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedCompany(null);
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setSelectedCompany(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleConfirm = () => {
    const name = selectedCompany?.name || query.trim();
    if (name) {
      onCompanySelected(name);
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        return;
      }
    }

    if (e.key === 'Enter') {
      if (selectedCompany) {
        handleConfirm();
      } else if (query.trim().length >= 2 && !showSuggestions) {
        setSelectedCompany({ name: query.trim(), description: '' });
      }
    }
  };

  const showManualSearchCard = !selectedCompany
    && !isResearching
    && !showSuggestions
    && !isLoading
    && query.trim().length >= 2;

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
              role="combobox"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
            />
            {isLoading && (
              <div className="search-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions" role="listbox">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`search-suggestion-item${index === highlightedIndex ? ' search-suggestion-highlighted' : ''}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
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

        {showManualSearchCard && (
          <div className="search-selected-card">
            <div className="search-selected-info">
              <div className="search-selected-desc">
                Company not in the list? You can still research it.
              </div>
            </div>
            <button
              className="search-confirm-btn"
              onClick={() => {
                setSelectedCompany({ name: query.trim(), description: '' });
              }}
            >
              <i className="fas fa-search mr-2"></i>
              Search "{query.trim()}"
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
              Finding business details, industry data, and strategic information
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
