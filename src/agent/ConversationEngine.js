const PromptGenerator = require('../prompts/PromptGenerator');

class ConversationEngine {
  constructor(llmService, stateManager) {
    this.llmService = llmService;
    this.stateManager = stateManager;
    this.promptGenerator = new PromptGenerator();
  }
  
  async generateResponse(userInput, conversationHistory, applicantData) {
    const state = this.stateManager.getState();
    const currentStage = this.determineConversationStage(state);
    
    // Get appropriate system prompt for current stage
    const systemPrompt = this.promptGenerator.getSystemPrompt(currentStage, state);
    
    // Build context for LLM
    const contextPrompt = this.promptGenerator.getContextPrompt(
      currentStage,
      state,
      applicantData
    );
    
    // Prepare messages for LLM
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];
    
    // Generate response using LLM
    const response = await this.llmService.generateResponse(
      messages,
      systemPrompt + '\n\n' + contextPrompt,
      { temperature: 0.7, maxTokens: 200 }
    );
    
    // Extract any data from the conversation
    await this.extractAndUpdateData(userInput, currentStage, conversationHistory);
    
    // Check if we should move to next stage
    await this.evaluateStageTransition(currentStage, conversationHistory);
    
    return response;
  }
  
  determineConversationStage(state) {
    if (!state.state.identityVerified) {
      if (!state.data.identity.dob) return 'greeting_and_dob';
      if (!state.data.identity.ssnLast4) return 'ssn_collection';
      return 'identity_verification';
    }
    
    if (!state.data.contact.email) {
      if (!state.data.contact.street) return 'address_collection';
      return 'email_collection';
    }
    
    if (!state.data.financial.monthlyIncome) return 'income_collection';
    if (!state.data.financial.jobTenure) return 'tenure_collection';
    
    return 'final_confirmation';
  }
  
  async extractAndUpdateData(userInput, stage, conversationHistory) {
    // Use LLM to extract structured data from user input
    const extractionPrompt = this.promptGenerator.getDataExtractionPrompt(stage);
    
    try {
      const extracted = await this.llmService.extractStructuredData(
        userInput,
        extractionPrompt,
        conversationHistory
      );
      
      if (extracted) {
        this.stateManager.updateCollectedData(extracted);
      }
    } catch (error) {
      console.error('Data extraction error:', error);
    }
  }
  
  async evaluateStageTransition(currentStage, conversationHistory) {
    const state = this.stateManager.getState();
    
    // Identity verification check
    if (currentStage === 'identity_verification') {
      const lastMessages = conversationHistory.slice(-4);
      const userConfirmed = await this.checkUserConfirmation(lastMessages);
      
      if (userConfirmed) {
        // Use validator to check identity
        const IdentityValidator = require('../validators/IdentityValidator');
        const isValid = IdentityValidator.validate(
          state.data.identity.dob,
          state.data.identity.ssnLast4,
          this.stateManager.applicantData
        );
        
        if (isValid) {
          this.stateManager.setIdentityVerified(true);
        } else {
          const attempts = this.stateManager.incrementIdentityAttempts();
          if (attempts >= 2) {
            this.stateManager.terminate();
          } else {
            this.stateManager.resetIdentityData();
          }
        }
      }
    }
    
    // Tenure discrepancy check
    if (currentStage === 'tenure_collection' && state.data.financial.jobTenure) {
      const FinancialValidator = require('../validators/FinancialValidator');
      const hasDiscrepancy = FinancialValidator.checkTenureDiscrepancy(
        state.data.financial.jobTenure,
        this.stateManager.applicantData,
        this.stateManager.getJobTenureThreshold()
      );
      
      if (hasDiscrepancy) {
        this.stateManager.setAwaitingConfirmation('tenure_discrepancy');
      }
    }
    
    // Final confirmation check
    if (currentStage === 'final_confirmation') {
      const lastMessages = conversationHistory.slice(-2);
      const userConfirmed = await this.checkUserConfirmation(lastMessages);
      
      if (userConfirmed) {
        this.stateManager.markComplete();
      }
    }
  }
  
  async checkUserConfirmation(messages) {
    // Use LLM to determine if user confirmed
    const confirmationPrompt = `Based on the conversation, did the user confirm or agree? 
Reply ONLY with "YES" or "NO".`;
    
    const response = await this.llmService.generateResponse(
      messages,
      confirmationPrompt,
      { temperature: 0.1, maxTokens: 10 }
    );
    
    return response.toUpperCase().includes('YES');
  }
}

module.exports = ConversationEngine;