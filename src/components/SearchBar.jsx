import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';
import SearchService from '../services/searchService';

const SearchBar = ({ 
  onFeatureSelect, 
  pointFeatures = [], 
  lineFeatures = [], 
  polygonFeatures = [],
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const featureProviders = {
            point: () => Promise.resolve(pointFeatures),
            line: () => Promise.resolve(lineFeatures),
            polygon: () => Promise.resolve(polygonFeatures)
          };
          
          const searchResults = await SearchService.search(query, featureProviders);
          setResults(searchResults);
        } catch (error) {
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, pointFeatures, lineFeatures, polygonFeatures]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle result selection
  const handleResultClick = (result) => {
    onFeatureSelect(result.feature);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update showResults when results change
  useEffect(() => {
    setShowResults(results.length > 0);
    setSelectedIndex(-1);
  }, [results]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'point': return '📍';
      case 'line': return '📏';
      case 'polygon': return '🔷';
      default: return '📍';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'point': return 'Nokta';
      case 'line': return 'Çizgi';
      case 'polygon': return 'Poligon';
      default: return type;
    }
  };

  return (
    <div className={`search-bar-container ${className}`} ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Nokta, çizgi veya poligon ara..."
          className="search-input"
        />
        {isLoading && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}
        {query && !isLoading && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            aria-label="Temizle"
          >
            ✕
          </button>
        )}
      </div>
      
      {showResults && (
        <div className="search-results" ref={resultsRef}>
          {results.length === 0 ? (
            <div className="search-no-results">
              Sonuç bulunamadı
            </div>
          ) : (
            <ul className="search-results-list">
              {results.map((result, index) => (
                <li
                  key={`${result.type}-${result.id}`}
                  className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="result-icon">{getTypeIcon(result.type)}</span>
                  <div className="result-content">
                    <span className="result-name">{result.name}</span>
                    <span className="result-type">{getTypeLabel(result.type)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 