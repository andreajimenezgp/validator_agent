const Anthropic = require('@anthropic-ai/sdk');
const BaseProvider = require('./BaseProvider');

class AnthropicProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('Anthropic API key not provided');
    }
    
    this.client = new Anthropic({ apiKey: this.apiKey });
    
    // Model options from best to cheapest
    this.models = {
      best: 'claude-opus-4-20250514',
      premium: 'claude-sonnet-4-20250514',
      standard: 'claude-3-5-sonnet-20241022',
      cheap: 'claude-3-haiku-20240307'
    };
    
    // Determine which model to use
    this.model = this.resolveModel(config);
    this.defaultTemperature = config.temperature || 0.7;
    this.defaultMaxTokens = config.maxTokens || 300;
  }
  
  resolveModel(config) {
    if (config.model) {
      return config.model;
    }
    
    const tier = config.modelTier || process.env.LLM_MODEL_TIER || 'best';
    return this.models[tier] || this.models.best;
  }
  
  getName() {
    return 'Anthropic';
  }
  
  async isAvailable() {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      console.error('Anthropic not available:', error.message);
      return false;
    }
  }
  
  async generateResponse(messages, systemPrompt, options = {}) {
    try {
      const anthropicMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      const response = await this.client.messages.create({
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature ?? this.defaultTemperature,
        system: systemPrompt,
        messages: anthropicMessages
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error(`Anthropic Error: ${error.message}`);
      throw new Error(`Failed to generate response from Anthropic: ${error.message}`);
    }
  }
  
  async extractStructuredData(userInput, extractionPrompt, conversationHistory = []) {
    const recentHistory = conversationHistory.slice(-4);
    
    try {
      const anthropicMessages = [
        ...recentHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: userInput }
      ];
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        temperature: 0.1,
        system: extractionPrompt,
        messages: anthropicMessages
      });
      
      const content = response.content[0].text.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Anthropic extraction error:', error);
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

module.exports = AnthropicProvider;