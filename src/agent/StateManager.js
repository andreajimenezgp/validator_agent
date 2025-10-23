class StateManager {
  constructor() {
    this.applicantData = null; 
    this.state = {
      currentNode: 'greeting',
      identityVerified: false,
      identityAttempts: 0,
      complete: false,
      terminated: false,
      awaitingConfirmation: null
    };
    
    this.collectedData = {
      identity: {
        dob: null,
        ssnLast4: null
      },
      contact: {
        street: null,
        city: null,
        state: null,
        zip: null,
        unit: null,
        email: null
      },
      financial: {
        monthlyIncome: null,
        jobTenure: null
      }
    };
    
    this.jobTenureThreshold = parseInt(process.env.JOB_TENURE_THRESHOLD) || 24;
  }
  
  // Node management
  getCurrentNode() {
    return this.state.currentNode;
  }
  
  moveToNode(nodeName) {
    this.state.currentNode = nodeName;
  }
  
  // Data management
  updateCollectedData(updates) {
    Object.keys(updates).forEach(category => {
      if (this.collectedData[category]) {
        Object.assign(this.collectedData[category], updates[category]);
      }
    });
  }
  
  getCollectedData() {
    return this.collectedData;
  }
  
  // Identity management
  isIdentityVerified() {
    return this.state.identityVerified;
  }
  
  setIdentityVerified(verified) {
    this.state.identityVerified = verified;
  }
  
  incrementIdentityAttempts() {
    this.state.identityAttempts++;
    return this.state.identityAttempts;
  }
  
  getIdentityAttempts() {
    return this.state.identityAttempts;
  }
  
  resetIdentityData() {
    this.collectedData.identity = {
      dob: null,
      ssnLast4: null
    };
  }
  
  // Confirmation management
  setAwaitingConfirmation(type) {
    this.state.awaitingConfirmation = type;
  }
  
  getAwaitingConfirmation() {
    return this.state.awaitingConfirmation;
  }
  
  clearAwaitingConfirmation() {
    this.state.awaitingConfirmation = null;
  }
  
  // Status management
  terminate() {
    this.state.terminated = true;
  }
  
  isTerminated() {
    return this.state.terminated;
  }
  
  markComplete() {
    this.state.complete = true;
  }
  
  isComplete() {
    return this.state.complete;
  }
  
  // Configuration
  getJobTenureThreshold() {
    return this.jobTenureThreshold;
  }
  
  // Full state access
  getState() {
    return {
      state: this.state,
      data: this.collectedData
    };
  }
}

module.exports = StateManager;