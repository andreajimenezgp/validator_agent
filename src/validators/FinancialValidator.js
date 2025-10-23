class FinancialValidator {
  static validateIncome(income, minIncome = 1000, maxIncome = 50000) {
    return income >= minIncome && income <= maxIncome;
  }
  
  static validateTenure(tenureMonths, minTenure = 0, maxTenure = 600) {
    return tenureMonths >= minTenure && tenureMonths <= maxTenure;
  }
  
  static checkTenureDiscrepancy(reportedTenure, applicantData, threshold = 3) {
    if (!applicantData || !applicantData.employment_length_months) {
      return false;
    }
    
    const appTenure = applicantData.employment_length_months;
    const difference = Math.abs(reportedTenure - appTenure);
    
    return difference > threshold;
  }
  
  static formatIncome(income) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(income);
  }
  
  static convertAnnualToMonthly(annualIncome) {
    return Math.round(annualIncome / 12);
  }
  
  static convertHourlyToMonthly(hourlyRate, hoursPerWeek = 40) {
    const weeksPerMonth = 4.33;
    return Math.round(hourlyRate * hoursPerWeek * weeksPerMonth);
  }
}

module.exports = FinancialValidator;