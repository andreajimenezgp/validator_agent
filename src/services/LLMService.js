const OpenAIProvider = require('./providers/OpenAIProvider');
const OllamaProvider = require('./providers/OllamaProvider');
const AnthropicProvider = require('./providers/AnthropicProvider');
const GeminiProvider = require('./providers/GeminiProvider');

class LLMService {
  constructor(providerName = null, config = {}) {
    this.provider = this.createProvider(providerName, config);
    console.log(`✓ LLM Service initialized with ${this.provider.getName()}`);
    console.log(`  Model: ${this.provider.getCurrentModel()}`);
    
    // Show available model tiers
    const models = this.provider.getAvailableModels();
    if (models) {
      console.log(`  Available tiers: ${Object.keys(models).join(', ')}`);
    }
  }
  
  createProvider(providerName, config) {
    if (!providerName) {
      providerName = this.detectProvider();
    }
    
    const providers = {
      'openai': OpenAIProvider,
      'ollama': OllamaProvider,
      'anthropic': AnthropicProvider,
      'gemini': GeminiProvider,
      'google': GeminiProvider
    };
    
    const ProviderClass = providers[providerName.toLowerCase()];
    
    if (!ProviderClass) {
      throw new Error(`Unknown LLM provider: ${providerName}. Available: ${Object.keys(providers).join(', ')}`);
    }
    
    return new ProviderClass(config);
  }
  
  detectProvider() {
    if (process.env.LLM_PROVIDER) {
      return process.env.LLM_PROVIDER.toLowerCase();
    }
    
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      return 'gemini';
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      return 'anthropic';
    }
    
    if (process.env.OPENAI_API_KEY) {
      return 'openai';
    }
    
    return 'ollama';
  }
  
  async generateResponse(messages, systemPrompt, options = {}) {
    return await this.provider.generateResponse(messages, systemPrompt, options);
  }
  
  async extractStructuredData(userInput, extractionPrompt, conversationHistory = []) {
    return await this.provider.extractStructuredData(userInput, extractionPrompt, conversationHistory);
  }
  
  async isAvailable() {
    return await this.provider.isAvailable();
  }
  
  getProviderName() {
    return this.provider.getName();
  }
  
  getCurrentModel() {
    return this.provider.getCurrentModel();
  }
  
  getAvailableModels() {
    return this.provider.getAvailableModels ? this.provider.getAvailableModels() : null;
  }
}

module.exports = LLMService;