require('dotenv').config();
const readline = require('readline');
const chalk = require('chalk');
const VerificationAgent = require('./src/agent/VerificationAgent');
const TestDataLoader = require('./src/utils/TestDataLoader');
const TestHelper = require('./src/utils/TestHelper');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log(chalk.blue.bold('\n=== AI Verification Agent - Interactive Test ===\n'));
  
  // Load test data
  const dataLoader = new TestDataLoader();
  const loaded = dataLoader.load();
  
  let applicant = null;
  if (loaded) {
    const applicants = dataLoader.getAllApplicants();
    console.log(chalk.cyan('\nAvailable test applicants:'));
    applicants.slice(0, 5).forEach((app, idx) => {
      console.log(`  ${idx + 1}. ${app.first_name} ${app.last_name}`);
    });
    
    const choice = await ask(chalk.yellow(`\nSelect applicant (1-${Math.min(5, applicants.length)}) or press Enter for random: `));
    
    if (choice.trim()) {
      const index = parseInt(choice) - 1;
      applicant = dataLoader.getApplicant(index);
    } else {
      applicant = dataLoader.getRandomApplicant();
    }
    
    console.log(chalk.green(`\n[CHECK] Testing with: ${applicant.first_name} ${applicant.last_name}`));
    console.log(chalk.gray('\n--- Correct Answers (for your reference) ---'));
    console.log(chalk.gray(`  DOB: ${applicant.date_of_birth}`));
    console.log(chalk.gray(`  SSN Last 4: ${applicant.ssn_last_four}`));
    console.log(chalk.gray(`  Address: ${applicant.street_address}`));
    if (applicant.unit_number) console.log(chalk.gray(`  Unit: ${applicant.unit_number}`));
    console.log(chalk.gray(`  City, State ZIP: ${applicant.city}, ${applicant.state} ${applicant.zip_code}`));
    console.log(chalk.gray(`  Email: ${applicant.email}`));
    console.log(chalk.gray(`  Monthly Income: $${applicant.monthly_income}`));
    console.log(chalk.gray(`  Employment Tenure: ${applicant.employment_length_months} months`));
  } else {
    console.log(chalk.yellow('\n[WARNING] No test data loaded. Using mock validation.'));
    console.log(chalk.gray('Correct answers: DOB="March 15, 1985", SSN="7234"\n'));
  }
  
  console.log(chalk.blue('\n' + '='.repeat(60)));
  console.log(chalk.blue('Starting Conversation'));
  console.log(chalk.blue('='.repeat(60)));
  console.log(chalk.gray('Commands: "exit" to quit | "data" to see collected data | "stage" to see current stage\n'));
  
  const agent = new VerificationAgent(applicant);
  const llmInfo = agent.getLLMInfo();
  console.log(chalk.cyan(`\n[LLM] Provider: ${llmInfo.provider}`));
  
  // Start conversation
  let response = agent.start();
  console.log(chalk.green('\nAgent: ') + chalk.white(response));
  
  let turnCount = 0;
  
  // Conversation loop
  while (!agent.isComplete()) {
    const input = await ask(chalk.yellow('\nYou: '));
    turnCount++;
    
    if (input.toLowerCase() === 'exit') {
      console.log(chalk.blue('\n[EXIT] Exiting test...'));
      break;
    }
    
    if (input.toLowerCase() === 'data') {
      const results = agent.getCollectedData();
      console.log(chalk.cyan('\n--- Current Collected Data ---'));
      console.log(chalk.white(JSON.stringify(results.data, null, 2)));
      console.log(chalk.cyan(`\nIdentity Verified: ${results.state.identityVerified}`));
      console.log(chalk.cyan(`Attempts: ${results.state.identityAttempts}/2`));
      console.log(chalk.cyan(`Status: ${results.state.terminated ? 'TERMINATED' : results.state.complete ? 'COMPLETE' : 'IN PROGRESS'}`));
      continue;
    }
    
    if (input.toLowerCase() === 'stage') {
      const state = agent.getCollectedData();
      const status = TestHelper.getDataCollectionStatus(state);
      console.log(chalk.cyan(`\n[LOCATION] Current Node: ${state.state.currentNode}`));
      console.log(chalk.cyan(`   Identity Verified: ${state.state.identityVerified}`));
      console.log(chalk.cyan(`   Awaiting: ${state.state.awaitingConfirmation || 'nothing'}`));
      console.log(chalk.gray(`   Data: Identity=${status.identity.dob && status.identity.ssn ? '✓' : '✗'} Contact=${status.contact.street && status.contact.email ? '✓' : '✗'} Financial=${status.financial.income && status.financial.tenure ? '✓' : '✗'}`));
      continue;
    }
    
    try {
      console.log(chalk.gray('\n[Processing with LLM...]'));
      const startTime = Date.now();
      
      response = await agent.processInput(input);
      
      const duration = Date.now() - startTime;
      console.log(chalk.gray(`[Response generated in ${duration}ms]`));
      console.log(chalk.green('\nAgent: ') + chalk.white(response));
      
    } catch (error) {
      console.log(chalk.red('\n[ERROR] ') + error.message);
      
      if (error.message.includes('API key') || error.message.includes('not provided')) {
        console.log(chalk.yellow('\nCheck your LLM provider configuration in .env file'));
        break;
      }
      
      console.log(chalk.gray('Attempting to continue conversation...\n'));
    }
  }
  
  // Show final results
  if (agent.isComplete()) {
    const results = agent.getCollectedData();
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue.bold('Verification Complete'));
    console.log(chalk.blue('='.repeat(60)));
    
    if (results.state.terminated) {
      console.log(chalk.red('\n[TERMINATED] Status: TERMINATED'));
      console.log(chalk.yellow('Reason: Failed identity verification after 2 attempts'));
    } else {
      console.log(chalk.green('\n[SUCCESS] Status: SUCCESS'));
    }
    
    console.log(chalk.cyan('\n--- Final Collected Data ---'));
    console.log(chalk.white(JSON.stringify(results.data, null, 2)));
    
    if (applicant) {
      console.log(chalk.cyan('\n--- Data Validation ---'));
      const validation = TestHelper.validateCollectedData(results.data, applicant);
      Object.entries(validation).forEach(([field, status]) => {
        const icon = status.valid ? chalk.green('✓') : chalk.red('✗');
        console.log(chalk.gray(`  ${icon} ${field}: ${status.message}`));
      });
    }
    
    console.log(chalk.cyan(`\n--- Statistics ---`));
    console.log(chalk.cyan(`Total Turns: ${turnCount}`));
    console.log(chalk.cyan(`Conversation Length: ${agent.getConversationHistory().length} messages`));
    console.log(chalk.cyan(`Identity Attempts: ${results.state.identityAttempts}`));
    console.log(chalk.cyan(`Identity Verified: ${results.state.identityVerified}`));
  }
  
  console.log(chalk.blue('\n' + '='.repeat(60) + '\n'));
  rl.close();
}

main().catch(error => {
  console.error(chalk.red('\n[FATAL] Fatal error:'), error);
  process.exit(1);
});