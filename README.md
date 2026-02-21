# Luna Sherpa Multi-Agent

An AI-first development assistant embodying the Sherpa ethos—wise, calm, and patient guidance for crafting business solutions with Grok xAI. Luna Sherpa orchestrates MacroFlow rituals to deliver structured, truth-seeking development workflows, empowering teams to build innovative, scalable applications through gentle, iterative AI collaboration.

**Alpha Release v0.5.0-alpha.1**: This extension is in alpha stage and serves as a proof of concept for multi-agent AI collaboration in VS Code with Grok 4.20 multimodal capabilities. Features are experimental and may evolve based on community feedback and xAI API updates.

## Overview

Luna Sherpa is an AI-first extension for business solution development, leveraging Grok xAI's multi-agent capabilities to provide gentle, expert guidance. As your eternal Sherpa guide, it enforces MacroFlow—a disciplined ritual of Constitution (foundations), Clarify (truth-seeking), Solutioning (specs/architecture), Tasks (decomposition), and Implement (artifacts)—ensuring first principles, critical thinking, and scalable outcomes in xAI workflows.

This extension simulates Grok 4.20's collaborative 4-agent team (Captain Grok, Harper Research, Benjamin Logic, Lucas Creative) for deep reasoning in code and projects. With voice support, background sync, and seamless grok.com integration, it offers hands-free, cross-device continuity for professional development.

**Note**: Rooted in personal inspiration, this platform lays the groundwork for broader AI applications, including compassionate care solutions. For more on the Luna Companion vision and personal motivation, see [LUNA-COMPANION-VISION.md](LUNA-COMPANION-VISION.md).

## Features

- **Multi-Agent Collaboration**: Parallel queries to Grok's 4-agent team for comprehensive analysis.
- **MacroFlow Orchestration**: Sequential phase execution (Constitution, Clarify, Solutioning, Tasks, Implement) with natural hand-offs.
- **Voice Support**: Hands-free queries using Web Speech API (VS Code Insiders recommended).
- **Background Sync**: Automatic conversation syncing with grok.com for cross-device continuity.
- **Skill Integration**: On-demand loading of Luna Foundry skills for specialized tasks.
- **Secure API Handling**: xAI API key stored securely in VS Code secrets.
- **Customizable Models**: Choose between grok-4-1-fast-reasoning and grok-4.- **Grok 4.20 Multimodal Support**: Process video content, generate voice audio, and create AI builds.
- **Video Processing**: Analyze video files and generate video content from text descriptions.
- **Voice Generation**: Convert text to speech with customizable voice options.
- **AI Build Generation**: Create complete software builds with validation and artifact generation.

## Installation

### From VSIX (Recommended for Development)

1. Download the `.vsix` file from the releases or build it locally with `npm run package`.
2. Open VS Code.
3. Go to Extensions (Ctrl+Shift+X).
4. Click the ... menu > Install from VSIX...
5. Select the downloaded `.vsix` file.
6. Reload VS Code.

### From Source

1. Clone the repository: `git clone https://github.com/acornsoft/luna-foundry-multiagent.git`
2. Navigate to `luna-foundry-multiagent/`
3. Run `npm install`
4. Run `npm run package` to build the `.vsix`
5. Install as above.

### Obtaining an xAI API Key

This extension requires a free xAI API key to function. Do not use the developer's key.

1. Visit [console.x.ai](https://console.x.ai).
2. Sign up or log in (email/Google).
3. Navigate to API Keys.
4. Create a new key (e.g., "Luna Extension").
5. Copy the key (it starts with 'xai-') and paste it when prompted in VS Code.

New accounts get $25 in free credits for testing.

## Usage

### First-Time Setup

1. After installation, open the Command Palette (Ctrl+Shift+P).
2. Run `Luna Sherpa: Start MacroFlow Ritual`.
3. Enter your xAI API key when prompted (get it from [console.x.ai](https://console.x.ai)).

### Basic Usage

- **Start MacroFlow**: Run `Luna Sherpa: Start MacroFlow Ritual` to begin a full ritual with sequential phases.
- **Voice Query**: Use `Luna Sherpa: Voice Query` for hands-free input (requires VS Code Insiders).
- **Sync Conversations**: Run `Luna Sherpa: Sync with grok.com` to import/export chats for continuity.
- **Video Processing**: Run `Luna Sherpa: Process Video with AI` to analyze video content.
- **Video Generation**: Run `Luna Sherpa: Generate Video` to create video from text descriptions.
- **Voice Processing**: Run `Luna Sherpa: Process Voice/Audio` to transcribe and analyze audio.
- **Voice Generation**: Run `Luna Sherpa: Generate Voice` to convert text to speech.
- **AI Build Creation**: Run `Luna Sherpa: Create AI Build` to generate software builds.

### Example Workflow

1. Open a file with xAI-related code.
2. Select code or leave unselected.
3. Run `Luna Sherpa: Start MacroFlow Ritual`.
4. Enter a query like "Optimize this Grok API call for multi-agent use".
5. View the 4-agent responses in the webview panel.

## Quick Demos

Get started quickly with these hands-on examples. Each demo includes sample code in the `demos/` folder.

### Demo 1: MacroFlow Ritual for Code Optimization

1. Open `demos/demo-macroflow-optimization.js` in VS Code.
2. Select the sample API call code.
3. Run `Luna Sherpa: Start MacroFlow Ritual` from the Command Palette.
4. Enter a query like "Optimize this for better error handling and performance".
5. Watch Luna orchestrate the phases and agents provide insights.

*Outcome*: See how the extension decomposes tasks, analyzes code, and synthesizes actionable improvements.

### Demo 2: Voice Query and grok.com Sync

1. Open `demos/demo-voice-sync.js` in VS Code.
2. Run `Luna Sherpa: Voice Query` (requires VS Code Insiders).
3. Speak: "How can I add multi-agent support to this code?"
4. After the response, run `Luna Sherpa: Sync with grok.com`.
5. Check grok.com to continue the conversation.

*Outcome*: Experience hands-free input and cross-device continuity, teasing the full MacroFlow skills approach.

### Demo 3: 4-Agent Team Collaboration (Key Deliverable)

Experience the core innovation of Luna Sherpa: collaborative AI with 4 specialized agents working in parallel.

1. Open any file in VS Code (or none).
2. Run `Ask the Team (Research, Logician, Designer)` from the Command Palette.
3. Enter "demo" as the API key to use sample responses (or provide your real xAI key).
4. Enter a query like "Design a simple REST API for a todo app".
5. Watch the webview panel display responses from:
   - **Research Agent**: Gathers information and context
   - **Logician Agent**: Analyzes logic and structure
   - **Designer Agent**: Provides creative design insights
   - **Luna (Orchestrator)**: Synthesizes the collaborative output

*Outcome*: See multi-agent AI in action, demonstrating parallel processing and specialized expertise for comprehensive problem-solving. This demo showcases the extension's flagship feature and the foundation for future MacroFlow rituals.

## Future Roadmap

Luna Sherpa is evolving into the full **MacroFlow** platform—a skills-based, agentic development system tailored for business solutions with Grok xAI. This AI-first approach will replace traditional spec tools with intelligent, ritual-driven workflows, enabling teams to build scalable, innovative applications through gentle, iterative guidance.

Building on this foundation, future expansions will explore compassionate AI applications, including care-focused solutions inspired by personal motivations. Stay tuned as Luna grows into a comprehensive guide for both professional development and empathetic support!

- `luna.startMacroFlow`: Initiates the MacroFlow ritual.
- `luna.voiceQuery`: Starts a voice-based query.
- `luna.syncGrokCom`: Syncs conversations with grok.com.
- `luna.askTeam`: Ask the team (Research, Logician, Designer) for collaborative AI responses. Enter "demo" as API key to showcase the workflow with sample responses.

## Configuration

Access settings via `File > Preferences > Settings > Extensions > Luna Sherpa Multi-Agent`:

- `lunaSherpa.apiKey`: Your xAI API key (stored securely).
- `lunaSherpa.model`: Default model (`grok-4-1-fast-reasoning` or `grok-4`).
- `lunaSherpa.grok420Enabled`: Enable Grok 4.20 multimodal features (default: true).
- `lunaSherpa.videoEnabled`: Enable video processing and generation (default: false).
- `lunaSherpa.voiceEnabled`: Enable voice processing and generation (default: false).
- `lunaSherpa.buildEnabled`: Enable AI build generation (default: false).
- `lunaSherpa.preferredVoice`: Choose voice type for text-to-speech (default, male, female, neutral).
- `lunaSherpa.videoQuality`: Set video generation quality (low, medium, high, ultra).

## Requirements

- VS Code 1.85.0 or later.
- xAI API key (free credits available).
- For voice features: VS Code Insiders.
- For multimodal features (video/voice/build): Grok 4.20 API access (features are backward compatible).

## Contributing

Contributions are welcome! Please see the [Luna Foundry repository](https://github.com/acornsoft/luna-foundry-multiagent) for guidelines.

If you're inspired to contribute or help fund these efforts, consider sponsoring via GitHub Sponsors or reaching out directly.

## License

This extension is licensed under the MIT License. See LICENSE for details.

## Disclaimer

- This extension requires an xAI API key and may incur usage costs after free credits.
- Features are experimental and simulate Grok 4.20 and beyond; actual API may differ.
- Conversations are processed by xAI; review their privacy policy.
- For best experience, use VS Code Insiders.
- This extension is designed to support Grok 4.20 and beyond multi-agent features, simulating current capabilities while adapting to API updates.

## Support

For issues or questions, open an issue in the [GitHub repository](https://github.com/acornsoft/luna-foundry-multiagent) or contact the maintainers.

## Donations and Funding

If Luna Sherpa has been helpful in your development journey, consider supporting its continued growth. Donations help fund xAI API usage, project maintenance, and future expansions inspired by compassionate AI applications.

- **GitHub Sponsors**: Support directly via [GitHub Sponsors](https://github.com/sponsors/acornsoft).
- **xAI Credits**: If you'd like to contribute xAI API credits, reach out via the repository issues or email for coordination.

Your support enables Luna to guide more developers and explore AI's potential for good. Thank you!

---

*Built with ❤️ by Acornsoft for the xAI community.*
