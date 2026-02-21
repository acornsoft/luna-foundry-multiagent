// Demo 2: Voice Query and Sync with grok.com
// This demo shows hands-free querying and cross-device sync.
// Requires VS Code Insiders for voice features.

// Steps:
// 1. Ensure you have an xAI API key set up.
// 2. Run "Luna Sherpa: Voice Query" from the Command Palette.
// 3. Speak a query like: "How can I improve this xAI code for better performance?"
// 4. The extension processes the voice input and queries the agents.
// 5. After the response, run "Luna Sherpa: Sync with grok.com" to export the conversation.
// 6. Access grok.com to continue the chat on another device.

// Sample code context (select this for the query):
const xai = require('xai-node');

async function multiAgentQuery(agents, query) {
  const responses = await Promise.all(
    agents.map(agent => agent.query(query))
  );
  return responses;
}

// Expected Outcome:
// - Voice input is transcribed and processed.
// - Agents respond in parallel.
// - Sync allows seamless continuation on grok.com, demonstrating the teaser for full MacroFlow skills.