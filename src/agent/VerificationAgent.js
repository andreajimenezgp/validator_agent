const StateManager = require('./StateManager');
const ConversationEngine = require('./ConversationEngine');
const LLMService = require('../services/LLMService');

class VerificationAgent {
  constructor(applicantData = null, llmConfig = {}) {
    this.stateManager = new StateManager();
    this.stateManager.applicantData = applicantData;
    
    // Get provider and model from env or config
    const provider = llmConfig.provider || process.env.LLM_PROVIDER;
    const modelTier = llmConfig.modelTier || process.env.LLM_MODEL_TIER;
    const exactModel = llmConfig.model || process.env.LLM_MODEL;
    
    // If model tier specified, get the model name
    let finalConfig = { ...llmConfig };
    if (modelTier && !exactModel) {
      // This will be resolved by the provider
      finalConfig.modelTier = modelTier;
    } else if (exactModel) {
      finalConfig.model = exactModel;
    }
    
    this.llmService = new LLMService(provider, finalConfig);
    this.conversationEngine = new ConversationEngine(this.llmService, this.stateManager);
    this.conversationHistory = [];
  }
  
  start() {
    const greeting = "Hello, my name is Sarah, I'm calling from Fuse Finance regarding your recent vehicle financing application. This call may be recorded for quality assurance. Am I speaking with you?";
    this.conversationHistory.push({ role: 'assistant', content: greeting });
    return greeting;
  }
  
  async processInput(userInput) {
    this.conversationHistory.push({ role: 'user', content: userInput });
    
    if (this.stateManager.isTerminated()) {
      return "I'm sorry, but this call has been concluded. Please call back when you have the required information.";
    }
    
    const response = await this.conversationEngine.generateResponse(
      userInput,
      this.conversationHistory,
      this.stateManager.applicantData
    );
    
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }
  
  isComplete() {
    return this.stateManager.isComplete() || this.stateManager.isTerminated();
  }
  
  getCollectedData() {
    return this.stateManager.getState();
  }
  
  getConversationHistory() {
    return this.conversationHistory;
  }
  
  getLLMInfo() {
    return {
      provider: this.llmService.getProviderName(),
      availableModels: this.llmService.getAvailableModels()
    };
  }
}

module.exports = VerificationAgent;