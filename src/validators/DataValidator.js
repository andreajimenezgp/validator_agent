class DataValidator {
  static extractSSN(input) {
    const matches = input.match(/\d{4}/);
    return matches ? matches[0] : null;
  }
  
  static extractEmail(input) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = input.match(emailPattern);
    return match ? match[0].toLowerCase() : null;
  }
  
  static extractIncome(input) {
    const amounts = input.match(/\$?([\d,]+)/);
    if (amounts) {
      return parseInt(amounts[1].replace(/,/g, ''));
    }
    return null;
  }
  
  static extractTenure(input) {
    const lower = input.toLowerCase();
    
    // Check for months
    const monthsMatch = lower.match(/(\d+)\s*months?/);
    if (monthsMatch) return parseInt(monthsMatch[1]);
    
    // Check for years
    const yearsMatch = lower.match(/(\d+)\s*years?/);
    if (yearsMatch) return parseInt(yearsMatch[1]) * 12;
    
    // Check for combined "2 years and 3 months"
    const combinedMatch = lower.match(/(\d+)\s*years?.*?(\d+)\s*months?/);
    if (combinedMatch) {
      return parseInt(combinedMatch[1]) * 12 + parseInt(combinedMatch[2]);
    }
    
    // Just a number
    const numberMatch = input.match(/\d+/);
    if (numberMatch) {
      const num = parseInt(numberMatch[0]);
      return num < 20 ? num : num * 12; // assume months if < 20, else years
    }
    
    return null;
  }
  
  static async extractAddress(input, llmService) {
    const systemPrompt = `You are a data extraction assistant. Extract address components from user input.
Return ONLY valid JSON with these fields: street, city, state, zip, unit (optional).
Example: {"street": "123 Main St", "city": "Denver", "state": "Colorado", "zip": "80202", "unit": "3B"}
If unit is not mentioned, omit it.`;
    
    try {
      const response = await llmService.generateResponse(
        [{ role: 'user', content: `Extract address from: "${input}"` }],
        systemPrompt,
        { temperature: 0.3 }
      );
      
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          street: parsed.street || null,
          city: parsed.city || null,
          state: parsed.state || null,
          zip: parsed.zip || null,
          unit: parsed.unit || null
        };
      }
    } catch (error) {
      console.error('Address extraction error:', error);
    }
    
    return null;
  }
}

module.exports = DataValidator;