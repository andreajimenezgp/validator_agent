const fs = require('fs');
const path = require('path');

class TestDataLoader {
  constructor() {
    this.data = null;
    this.currentApplicantIndex = 0;
  }
  
  load(filepath = null) {
    try {
      const dataPath = filepath || path.join(__dirname, '../../data/applicant_data.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.data = JSON.parse(rawData);
      console.log(`Loaded ${this.data.length} applicant records`);
      return true;
    } catch (error) {
      console.error('Failed to load test data:', error.message);
      return false;
    }
  }
  
  getApplicant(index = 0) {
    if (!this.data || index >= this.data.length) {
      return null;
    }
    return this.data[index];
  }
  
  getRandomApplicant() {
    if (!this.data) return null;
    const index = Math.floor(Math.random() * this.data.length);
    return this.data[index];
  }
  
  getAllApplicants() {
    return this.data || [];
  }
  
  getNextApplicant() {
    if (!this.data) return null;
    const applicant = this.data[this.currentApplicantIndex];
    this.currentApplicantIndex = (this.currentApplicantIndex + 1) % this.data.length;
    return applicant;
  }
}

module.exports = TestDataLoader;