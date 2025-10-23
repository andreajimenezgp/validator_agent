const VerificationAgent = require('../src/agent/VerificationAgent');

// Mock LLMService
jest.mock('../src/services/LLMService');

describe('VerificationAgent', () => {
  let agent;
  
  beforeEach(() => {
    // Mock LLM responses
    const LLMService = require('../src/services/LLMService');
    LLMService.mockImplementation(() => ({
      generateResponse: jest.fn().mockResolvedValue('Mock response'),
      extractStructuredData: jest.fn().mockResolvedValue({})
    }));
    
    agent = new VerificationAgent();
  });
  
  test('should initialize properly', () => {
    expect(agent).toBeDefined();
    expect(agent.stateManager).toBeDefined();
    expect(agent.conversationEngine).toBeDefined();
  });
  
  test('should start with greeting', () => {
    const greeting = agent.start();
    expect(greeting).toContain('Sarah');
    expect(greeting).toContain('Fuse Finance');
  });
  
  test('should process input and generate response', async () => {
    agent.start();
    const response = await agent.processInput('yes');
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });
});