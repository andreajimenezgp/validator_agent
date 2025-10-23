class VoiceOptimizer {
  static formatSSN(ssn) {
    // "7234" becomes "7-2-3-4"
    return ssn.toString().split('').join('-');
  }
  
  static formatEmail(email) {
    // "test@example.com" becomes "T-E-S-T at E-X-A-M-P-L-E dot com"
    return email.split('').map(char => {
      if (char === '@') return 'at';
      if (char === '.') return 'dot';
      if (char === '-') return 'dash';
      if (char === '_') return 'underscore';
      return char.toUpperCase();
    }).join('-');
  }
  
  static formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits[0]}${digits[1]}${digits[2]}-${digits[3]}${digits[4]}${digits[5]}-${digits[6]}${digits[7]}${digits[8]}${digits[9]}`;
    }
    return phone;
  }
  
  static formatAddress(addressObj) {
    const parts = [];
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.unit) parts.push(`Unit ${addressObj.unit}`);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.zip) parts.push(addressObj.zip);
    return parts.join(', ');
  }
  
  static formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  
  static formatCurrency(amount) {
    return `$${amount.toLocaleString()}`;
  }
}

module.exports = VoiceOptimizer;