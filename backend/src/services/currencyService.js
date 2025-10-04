import axios from "axios";

class CurrencyService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  // Get countries and their currencies from REST Countries API
  async getCountries() {
    try {
      const response = await axios.get(
        "https://restcountries.com/v3.1/all?fields=name,currencies,cca2,cca3"
      );

      return response.data.map((country) => ({
        code: country.cca2 || country.cca3,
        name: country.name.common,
        currency: Object.keys(country.currencies || {})[0] || "USD",
        symbol: Object.values(country.currencies || {})[0]?.symbol || "$",
      }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw new Error("Failed to fetch countries data");
    }
  }

  // Get exchange rates from ExchangeRate API
  async getExchangeRates(baseCurrency = "USD") {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      const rates = {
        base: response.data.base,
        rates: response.data.rates,
        timestamp: Date.now(),
      };

      this.cache.set(cacheKey, rates);
      return rates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw new Error("Failed to fetch exchange rates");
    }
  }

  // Convert amount from one currency to another
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return {
        amount: parseFloat(amount),
        rate: 1,
        fromCurrency,
        toCurrency,
      };
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates.rates[toCurrency];

      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      const convertedAmount = parseFloat(amount) * rate;

      return {
        amount: convertedAmount,
        rate: rate,
        fromCurrency,
        toCurrency,
      };
    } catch (error) {
      console.error("Currency conversion error:", error);
      throw new Error("Failed to convert currency");
    }
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "EUR", name: "Euro", symbol: "€" },
      { code: "GBP", name: "British Pound", symbol: "£" },
      { code: "JPY", name: "Japanese Yen", symbol: "¥" },
      { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
      { code: "AUD", name: "Australian Dollar", symbol: "A$" },
      { code: "INR", name: "Indian Rupee", symbol: "₹" },
      { code: "BRL", name: "Brazilian Real", symbol: "R$" },
      { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
      { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
      { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
      { code: "MXN", name: "Mexican Peso", symbol: "$" },
      { code: "ZAR", name: "South African Rand", symbol: "R" },
      { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    ];
  }
}

export default new CurrencyService();
