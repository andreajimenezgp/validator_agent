# AI Voice Optimized Agent - Verification System

A Node.js application for conducting personal and financial verification calls using LLM-driven natural conversation.

### Core Components

**ConversationEngine** - Orchestrates LLM-driven dialogue
- Determines conversation stage
- Generates context-aware prompts
- Extracts data from natural language
- Evaluates stage transitions

**PromptGenerator** - Creates dynamic prompts
- System prompts for each conversation stage
- Context injection (state, history, rules)
- Data extraction schemas
- Voice-optimized formatting instructions

**StateManager** - Tracks conversation state
- Current stage and collected data
- Identity verification status
- Confirmation states
- Termination conditions

**VerificationAgent** - Main orchestrator
- Manages conversation flow
- Coordinates components
- Handles conversation history

## Conversation Stages

1. **Greeting & DOB** - Introduction and date of birth collection
2. **SSN Collection** - Last 4 digits of SSN
3. **Identity Verification** - Validate against application data (GATE)
4. **Address Collection** - Complete mailing address
5. **Email Collection** - Email with voice-friendly confirmation
6. **Income Collection** - Monthly income before taxes
7. **Tenure Collection** - Employment length with discrepancy detection
8. **Final Confirmation** - Summary and completion


# Place applicant_data.json in data/
```

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/validator-agent.git
cd validator-agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your API key:
   ```env
   OPENAI_API_KEY=your-api-key-here
   ```

### 4. Add Test Data
1. Create a `data` directory if it doesn't exist:
   ```bash
   mkdir -p data
   ```
2. Add your `applicant_data.json` file to the `data/` directory

### 5. Run the Interactive Tester
```bash
node test-interactive.js
```

### 6. Run Tests
```bash
npm test
```

### Available Commands
- `npm start` - Start the application
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code folder

## Usage

### Interactive Testing
```bash
node test-interactive.js
```

Commands during conversation:
- `exit` - Quit the test
- `data` - View currently collected data
- `stage` - See current conversation stage

### Run Tests
```bash
npm test
```

## Configuration

### Model Configuration

#### Environment Variables

```bash
# Required: Set at least one provider's API key

# Optional: Set a specific provider (auto-detected if not set)
LLM_PROVIDER=openai  # 'openai', 'gemini', 'anthropic', or 'ollama'

# Optional: Model quality tier (defaults to 'best' if not specified)
LLM_MODEL_TIER=best  # 'best', 'premium', 'standard', or 'cheap'

```

#### Model Tiers

Each provider offers different models at various quality/performance tiers:

- **best**: Highest quality model (default)
- **premium**: Balanced quality and cost
- **standard**: Standard performance
- **cheap**: Most cost-effective option

##### OpenAI Models
- **best**: `gpt-4o` (GPT-4 Optimized)
- **premium**: `gpt-4-turbo` (Fast + Quality)
- **standard**: `gpt-3.5-turbo` (Balanced)
- **cheap**: `gpt-3.5-turbo-16k` (Cheapest)

##### Gemini Models
- **best**: `gemini-2.0-flash-exp` (Experimental)
- **premium**: `gemini-1.5-pro` (High quality)
- **standard**: `gemini-1.5-flash` (Balanced)
- **cheap**: `gemini-1.5-flash-8b` (Fastest)

##### Anthropic Models
- **best**: `claude-opus-4-20250514` (Most capable)
- **premium**: `claude-sonnet-4-20250514` (Balanced)
- **standard**: `claude-3-5-sonnet-20241022`
- **cheap**: `claude-3-haiku-20240307` (Fastest)

##### Ollama Models
- **best**: `llama3:70b` (Most capable)
- **premium**: `llama3:13b` (Balanced)
- **standard**: `llama3:8b` (Default)
- **cheap**: `phi3:3.8b` (Fastest)


## Testing Scenarios

### Success Flow
Use correct DOB and SSN from test data to complete verification

### Failed Identity
Provide incorrect information twice to trigger termination

### Tenure Discrepancy
Report job tenure significantly different from application data

### Natural Variations
Try different phrasings:
- "I was born on March 15th, 1985"
- "My birthday is 3/15/85"
- "DOB: March 15, 1985"

All should work naturally.

## Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer). The version number is automatically updated based on commit messages using GitHub Actions.

### Commit Message Format

```
<type>: <description> [<scope>] [#<issue>]
```

### Version Bumps

| Commit Type | Version Bump | Example Tag |
|-------------|-------------|-------------|
| `fix:`      | Patch (0.0.x) | `v1.0.1` |
| `feat:`     | Minor (0.x.0) | `v1.1.0` |
| Breaking Change | Major (x.0.0) | `v2.0.0` |

### Examples

- `fix: resolve authentication issue` → Patch version bump
- `feat: add user profile page` → Minor version bump
- `feat!: remove deprecated API endpoints` → Major version bump (breaking change)

### GitHub Actions

The version is automatically updated based on commit messages. The action will:
1. Analyze commit messages since the last tag
2. Determine the appropriate version bump
3. Create a new tag
4. Push the tag to trigger a release

## Project Structure
```
verification-agent/
├── src/
│   ├── agent/
│   │   ├── VerificationAgent.js      # Main orchestrator
│   │   ├── StateManager.js           # State tracking
│   │   └── ConversationEngine.js     # LLM conversation logic
│   ├── prompts/
│   │   └── PromptGenerator.js        # Dynamic prompt creation
│   ├── validators/
│   │   ├── IdentityValidator.js      # Identity verification
│   │   ├── DataValidator.js          # Data extraction helpers
│   │   └── FinancialValidator.js     # Financial validation
│   ├── services/
│   │   └── LLMService.js             # OpenAI integration
│   └── utils/
│       ├── VoiceOptimizer.js         # Voice formatting
│       └── TestDataLoader.js         # Test data management
├── tests/
│   ├── agent.test.js                 # Agent tests
│   └── validators.test.js            # Validator tests
├── data/
│   └── applicant_data.json           # Test data
├── test-interactive.js               # Interactive tester
├── .env                              # Configuration
└── package.json
```

## Design Decisions

### Why Stage-Based?
- **Clear Progress**: Know exactly where we are
- **Validation Points**: Check data at each stage
- **Identity Gate**: Enforce security checkpoint
- **Error Recovery**: Restart stages if needed

### Why Separate Prompts?
- **Easy Updates**: Change behavior without code changes
- **Testability**: Test prompt effectiveness
- **Documentation**: Prompts document expected behavior
- **Consistency**: Same instructions across stages

## Security Considerations

- Identity verified BEFORE personal data collection
- 2-attempt limit prevents fishing attacks
- Professional termination message
- No sensitive data in logs
- Validation against application data

## Cost Optimization

- Use GPT-3.5-turbo for cost efficiency
- Low token limits for responses
- Minimal conversation history in context
- Efficient prompt design

Estimated cost: $0.002 per conversation (~10 exchanges)

## Troubleshooting

**"OPENAI_API_KEY not set"**
- Check .env file exists
- Verify key is correctly formatted
- Restart terminal after changes

**LLM responses are off-topic**
- Check PromptGenerator prompts
- Verify stage detection logic
- Review conversation history length

**Data not extracting**
- Check extraction schemas in PromptGenerator
- Lower temperature for extraction (0.1)
- Add more examples to prompts

## Next Steps (Phase 3)

- [ ] Enhanced error recovery
- [ ] Conversation logging
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Voice integration
- [ ] A/B testing framework

## License

MIT