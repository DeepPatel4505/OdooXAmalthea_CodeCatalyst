// Countries cache service to avoid repeated API calls
class CountriesCache {
  constructor() {
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Get cached countries or fetch from API
  async getCountries() {
    // Check if cache is valid
    if (
      this.cache &&
      this.cacheTimestamp &&
      Date.now() - this.cacheTimestamp < this.cacheTimeout
    ) {
      return this.cache;
    }

    // Cache is invalid or doesn't exist, fetch from API
    try {
      const { currencyAPI } = await import("./api");
      const response = await currencyAPI.getCountries();

      if (response.success && Array.isArray(response.data.countries)) {
        this.cache = response.data.countries;
        this.cacheTimestamp = Date.now();
        return this.cache;
      }

      throw new Error("Failed to fetch countries");
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      // Return fallback countries if API fails
      return this.getFallbackCountries();
    }
  }

  // Fallback countries in case API fails
  getFallbackCountries() {
    return [
      { code: "US", name: "United States", currency: "USD" },
      { code: "GB", name: "United Kingdom", currency: "GBP" },
      { code: "DE", name: "Germany", currency: "EUR" },
      { code: "FR", name: "France", currency: "EUR" },
      { code: "JP", name: "Japan", currency: "JPY" },
      { code: "CA", name: "Canada", currency: "CAD" },
      { code: "AU", name: "Australia", currency: "AUD" },
      { code: "IN", name: "India", currency: "INR" },
      { code: "BR", name: "Brazil", currency: "BRL" },
      { code: "CN", name: "China", currency: "CNY" },
      { code: "CH", name: "Switzerland", currency: "CHF" },
      { code: "SG", name: "Singapore", currency: "SGD" },
      { code: "NL", name: "Netherlands", currency: "EUR" },
      { code: "IT", name: "Italy", currency: "EUR" },
      { code: "ES", name: "Spain", currency: "EUR" },
    ];
  }

  // Clear cache (useful for testing or forcing refresh)
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  // Get cache status
  getCacheStatus() {
    return {
      hasCache: !!this.cache,
      timestamp: this.cacheTimestamp,
      age: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
      isValid:
        this.cache &&
        this.cacheTimestamp &&
        Date.now() - this.cacheTimestamp < this.cacheTimeout,
    };
  }
}

// Export singleton instance
export const countriesCache = new CountriesCache();
export default countriesCache;
