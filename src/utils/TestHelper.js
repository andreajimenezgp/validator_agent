class TestHelper {
  static validateCollectedData(collected, applicant) {
    const validation = {};
    
    validation['DOB'] = {
      valid: collected.identity.dob !== null,
      message: collected.identity.dob ? `Collected: ${collected.identity.dob}` : 'Not collected'
    };
    
    validation['SSN Last 4'] = {
      valid: collected.identity.ssnLast4 !== null,
      message: collected.identity.ssnLast4 ? `Collected: ${collected.identity.ssnLast4}` : 'Not collected'
    };
    
    validation['Street Address'] = {
      valid: collected.contact.street !== null,
      message: collected.contact.street ? `Collected: ${collected.contact.street}` : 'Not collected'
    };
    
    validation['Email'] = {
      valid: collected.contact.email !== null,
      message: collected.contact.email ? `Collected: ${collected.contact.email}` : 'Not collected'
    };
    
    validation['Monthly Income'] = {
      valid: collected.financial.monthlyIncome !== null,
      message: collected.financial.monthlyIncome ? `Collected: $${collected.financial.monthlyIncome}` : 'Not collected'
    };
    
    validation['Employment Tenure'] = {
      valid: collected.financial.jobTenure !== null,
      message: collected.financial.jobTenure ? `Collected: ${collected.financial.jobTenure} months` : 'Not collected'
    };
    
    return validation;
  }

  static getDataCollectionStatus(state) {
    return {
      identity: {
        dob: state.data.identity.dob !== null,
        ssn: state.data.identity.ssnLast4 !== null
      },
      contact: {
        street: state.data.contact.street !== null,
        email: state.data.contact.email !== null
      },
      financial: {
        income: state.data.financial.monthlyIncome !== null,
        tenure: state.data.financial.jobTenure !== null
      }
    };
  }
}

module.exports = TestHelper;
