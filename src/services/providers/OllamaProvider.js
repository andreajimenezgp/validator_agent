const OpenAI = require('openai');
const BaseProvider = require('../BaseProvider');

class OllamaProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    this.baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    
    // Model options from best to cheapest
    this.models = {
      best: 'llama3.3:70b',
      premium: 'llama3.1:70b',
      standard: 'llama3.1:8b',
      cheap: 'phi3:3.8b'
    };
    
    // Determine which model to use
    this.model = this.resolveModel(config);
    this.defaultTemperature = config.temperature || 0.7;
    this.defaultMaxTokens = config.maxTokens || 300;
    
    this.client = new OpenAI({
      baseURL: this.baseURL,
      apiKey: 'ollama'
    });
  }
  
  resolveModel(config) {
    // Priority: 1. Config model, 2. Env OLLAMA_MODEL, 3. Model tier, 4. Default
    if (config.model) {
      return config.model;
    }
    
    if (process.env.OLLAMA_MODEL) {
      return process.env.OLLAMA_MODEL;
    }
    
    const tier = config.modelTier || process.env.LLM_MODEL_TIER || 'standard';
    return this.models[tier] || this.models.standard;
  }
  
  getName() {
    return 'Ollama';
  }
  
  async isAvailable() {
    try {
      const response = await fetch(`${this.baseURL.replace('/v1', '')}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama not available:', error.message);
      return false;
    }
  }
  
  async generateResponse(messages, systemPrompt, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: options.temperature ?? this.defaultTemperature,
        max_tokens: options.maxTokens || this.defaultMaxTokens
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Ollama Error: ${error.message}`);
      throw new Error(`Failed to generate response from Ollama: ${error.message}`);
    }
  }
  
  async extractStructuredData(userInput, extractionPrompt, conversationHistory = []) {
    const recentHistory = conversationHistory.slice(-4);
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: extractionPrompt },
          ...recentHistory,
          { role: 'user', content: userInput }
        ],
        temperature: 0.1,
        max_tokens: 200
      });
      
      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Ollama extraction error:', error);
      return null;
    }
  }
  
  getAvailableModels() {
    return this.models;
  }
  
  getCurrentModel() {
    return this.model;
  }
}

module.exports = OllamaProvider;