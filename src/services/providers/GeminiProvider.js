const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseProvider = require('../BaseProvider');

class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('Google/Gemini API key not provided');
    }
    
    this.client = new GoogleGenerativeAI(this.apiKey);
    
    // Model options from best to cheapest
    this.models = {
      best: 'gemini-2.0-flash-exp',
      premium: 'gemini-1.5-pro',
      standard: 'gemini-1.5-flash',
      cheap: 'gemini-1.5-flash-8b'
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
    return 'Gemini';
  }
  
  async isAvailable() {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('Gemini not available:', error.message);
      return false;
    }
  }
  
  async generateResponse(messages, systemPrompt, options = {}) {
    try {
      const modelName = options.model || this.model;
      const model = this.client.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemPrompt
      });
      
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const lastMessage = messages[messages.length - 1];
      
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: options.temperature ?? this.defaultTemperature,
          maxOutputTokens: options.maxTokens || this.defaultMaxTokens
        }
      });
      
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error(`Gemini Error: ${error.message}`);
      throw new Error(`Failed to generate response from Gemini: ${error.message}`);
    }
  }
  
  async extractStructuredData(userInput, extractionPrompt, conversationHistory = []) {
    const recentHistory = conversationHistory.slice(-4);
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        systemInstruction: extractionPrompt
      });
      
      const history = recentHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200
        }
      });
      
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const content = response.text().trim();
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Gemini extraction error:', error);
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

module.exports = GeminiProvider;