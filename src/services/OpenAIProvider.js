const OpenAI = require('openai');
const BaseProvider = require('./BaseProvider');

class OpenAIProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }
    
    this.client = new OpenAI({ apiKey: this.apiKey });
    
    // Model options from best to cheapest
    this.models = {
      best: 'gpt-4o',
      premium: 'gpt-4-turbo',
      standard: 'gpt-3.5-turbo',
      cheap: 'gpt-3.5-turbo-16k'
    };
    
    // Determine which model to use
    this.model = this.resolveModel(config);
    this.defaultTemperature = config.temperature || 0.7;
    this.defaultMaxTokens = config.maxTokens || 300;
  }
  
  resolveModel(config) {
    // Priority: 1. Exact model, 2. Model tier, 3. Default to 'best'
    if (config.model) {
      return config.model;
    }
    
    const tier = config.modelTier || process.env.LLM_MODEL_TIER || 'best';
    return this.models[tier] || this.models.best;
  }
  
  getName() {
    return 'OpenAI';
  }
  
  async isAvailable() {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI not available:', error.message);
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
      console.error(`OpenAI Error: ${error.message}`);
      throw new Error(`Failed to generate response from OpenAI: ${error.message}`);
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('OpenAI extraction error:', error);
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

module.exports = OpenAIProvider;