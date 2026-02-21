// Demo 1: Basic MacroFlow Ritual for Code Optimization
// This is a sample xAI/Grok API call that can be optimized using the Luna Sherpa extension.
// Open this file in VS Code, select the code below, and run "Luna Sherpa: Start MacroFlow Ritual".

const xai = require('xai-node');

async function getGrokResponse(query) {
  const client = new xai.Client({ apiKey: 'your-api-key' });
  const response = await client.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [{ role: 'user', content: query }],
    temperature: 0.7,
    max_tokens: 1000
  });
  return response.choices[0].message.content;
}

// Usage
getGrokResponse('Explain quantum computing').then(console.log);

// Expected Outcome:
// - Luna orchestrates MacroFlow phases (Constitution, Clarify, etc.).
// - Agents (Noah Research, Luke Logic, Jared Creative) provide insights.
// - Synthesized output suggests optimizations like error handling, model updates, or multi-agent integration.