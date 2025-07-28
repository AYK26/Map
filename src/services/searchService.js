// Search Service following SOLID Principles
// Single Responsibility: Only handles search operations
// Open/Closed: Can be extended without modification
// Liskov Substitution: Can be replaced with different implementations
// Interface Segregation: Focused on search interface
// Dependency Inversion: Depends on abstractions, not concrete implementations

/**
 * Interface for searchable features
 */
export class SearchableFeature {
  constructor(id, name, type, geometry, feature) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.geometry = geometry;
    this.feature = feature; // Original OpenLayers feature
  }
}

/**
 * Search strategy interface
 */
export class SearchStrategy {
  search(query, features) {
    throw new Error('search method must be implemented');
  }
}

/**
 * Name-based search strategy
 */
export class NameSearchStrategy extends SearchStrategy {
  search(query, features) {
    const searchTerm = this.normalizeString(query);
    
    return features
      .filter(feature => {
        const name = feature.get('name') || '';
        const normalizedName = this.normalizeString(name);
        return normalizedName.includes(searchTerm);
      })
      .map(feature => new SearchableFeature(
        feature.get('id'),
        feature.get('name'),
        this.getFeatureType(feature),
        feature.getGeometry(),
        feature
      ));
  }

  // Türkçe karakterleri normalize eder ve case insensitive yapar
  normalizeString(str) {
    return str
      .toLowerCase('tr-TR')  // Türkçe locale ile lowercase
      .trim()
      .normalize('NFD')  // Unicode normalization
      .replace(/[\u0300-\u036f]/g, '')  // Accent removal
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'u')
      .replace(/Ş/g, 's')
      .replace(/İ/g, 'i')  // Türkçe büyük İ -> i
      .replace(/I/g, 'i')  // İngilizce büyük I -> i
      .replace(/Ö/g, 'o')
      .replace(/Ç/g, 'c');
  }

  getFeatureType(feature) {
    const geometryType = feature.getGeometry().getType().toLowerCase();
    if (geometryType === 'point') return 'point';
    if (geometryType === 'linestring') return 'line';
    if (geometryType === 'polygon') return 'polygon';
    return geometryType;
  }
}

/**
 * Advanced search strategy with fuzzy matching
 */
export class FuzzySearchStrategy extends SearchStrategy {
  search(query, features) {
    const searchTerm = query.toLowerCase().trim();
    
    return features
      .map(feature => {
        const name = feature.get('name') || '';
        const score = this.calculateSimilarity(name.toLowerCase(), searchTerm);
        return { feature, score };
      })
      .filter(item => item.score > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score)
      .map(item => new SearchableFeature(
        item.feature.get('id'),
        item.feature.get('name'),
        this.getFeatureType(item.feature),
        item.feature.getGeometry(),
        item.feature
      ));
  }

  calculateSimilarity(str1, str2) {
    if (str1.includes(str2) || str2.includes(str1)) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  editDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  getFeatureType(feature) {
    const geometryType = feature.getGeometry().getType().toLowerCase();
    if (geometryType === 'point') return 'point';
    if (geometryType === 'linestring') return 'line';
    if (geometryType === 'polygon') return 'polygon';
    return geometryType;
  }
}

/**
 * Main search service
 */
export class SearchService {
  constructor(strategy = new NameSearchStrategy()) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async search(query, featureProviders) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const results = [];

    // Search through all feature providers
    for (const [type, provider] of Object.entries(featureProviders)) {
      try {
        const features = await provider();
        const searchResults = this.strategy.search(query, features);
        
        // Add type information and limit results per type
        const typedResults = searchResults
          .map(result => ({ ...result, type }))
          .slice(0, 10);
        
        results.push(...typedResults);
      } catch (error) {
        console.error(`Error searching ${type} features:`, error);
      }
    }

    // Sort results by relevance and limit total
    return this.sortResults(results, query).slice(0, 20);
  }

  sortResults(results, query) {
    const searchTerm = query.toLowerCase().trim();
    
    return results.sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }
}

// Export default instance
export default new SearchService(); 