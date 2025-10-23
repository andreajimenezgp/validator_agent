class BaseProvider {
  constructor(config = {}) {
    this.config = config;
  }
  
  async generateResponse(messages, systemPrompt, options = {}) {
    throw new Error('generateResponse() must be implemented by subclass');
  }
  
  async extractStructuredData(userInput, extractionPrompt, conversationHistory = []) {
    throw new Error('extractStructuredData() must be implemented by subclass');
  }
  
  getName() {
    throw new Error('getName() must be implemented by subclass');
  }
  
  async isAvailable() {
    throw new Error('isAvailable() must be implemented by subclass');
  }
  
  getAvailableModels() {
    return null;
  }
  
  getCurrentModel() {
    return this.model || 'unknown';
  }
}

module.exports = BaseProvider;