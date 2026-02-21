// agentManager.ts - Handles agent operations and API calls

import { Agent, AgentResponse, ApiClient, VideoApiClient, VoiceApiClient, BuildApiClient, BuildSpec, BuildResult, ValidationResult } from './interfaces';

export class XaiApiClient implements ApiClient {
  async callAgent(agent: Agent, prompt: string, apiKey: string, model: string): Promise<AgentResponse> {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: agent.system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: any = await res.json();
    return {
      id: agent.id,
      name: agent.name,
      color: agent.color,
      emoji: agent.emoji,
      content: data.choices[0].message.content,
      mediaType: 'text'
    };
  }

  supportsVideo(): boolean { return false; }
  supportsVoice(): boolean { return false; }
  supportsBuild(): boolean { return false; }
}

export class Grok420ApiClient extends XaiApiClient implements VideoApiClient, VoiceApiClient, BuildApiClient {
  supportsVideo(): boolean { return true; }
  supportsVoice(): boolean { return true; }
  supportsBuild(): boolean { return true; }

  async processVideo(videoData: Buffer | string, prompt: string, apiKey: string, model: string): Promise<AgentResponse> {
    // Grok 4.20 video processing endpoint
    const res = await fetch('https://api.x.ai/v1/video/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        video: typeof videoData === 'string' ? videoData : videoData.toString('base64'),
        prompt: prompt,
        max_tokens: 4096
      })
    });

    if (!res.ok) throw new Error(`Video API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      id: 'video-processor',
      name: 'Video Processor',
      color: '#ff6b6b',
      emoji: '🎥',
      content: data.analysis || data.choices[0].message.content,
      mediaType: 'video',
      metadata: { videoProcessed: true, duration: data.duration }
    };
  }

  async generateVideo(description: string, apiKey: string, model: string): Promise<AgentResponse> {
    // Grok 4.20 video generation endpoint
    const res = await fetch('https://api.x.ai/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        description: description,
        quality: 'high'
      })
    });

    if (!res.ok) throw new Error(`Video generation API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      id: 'video-generator',
      name: 'Video Generator',
      color: '#4ecdc4',
      emoji: '🎬',
      content: `Generated video: ${data.video_url}`,
      mediaType: 'video',
      mediaUrl: data.video_url,
      metadata: { generated: true, duration: data.duration }
    };
  }

  async processVoice(audioData: Buffer, prompt: string, apiKey: string, model: string): Promise<AgentResponse> {
    // Grok 4.20 voice processing endpoint
    const res = await fetch('https://api.x.ai/v1/audio/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        audio: audioData.toString('base64'),
        prompt: prompt,
        max_tokens: 2048
      })
    });

    if (!res.ok) throw new Error(`Voice API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      id: 'voice-processor',
      name: 'Voice Processor',
      color: '#45b7d1',
      emoji: '🎤',
      content: data.transcription || data.choices[0].message.content,
      mediaType: 'audio',
      metadata: { transcribed: true, duration: data.duration }
    };
  }

  async generateVoice(text: string, voice: string = 'default', apiKey: string, model: string): Promise<AgentResponse> {
    // Grok 4.20 voice generation endpoint
    const res = await fetch('https://api.x.ai/v1/audio/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        text: text,
        voice: voice,
        format: 'mp3'
      })
    });

    if (!res.ok) throw new Error(`Voice generation API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      id: 'voice-generator',
      name: 'Voice Generator',
      color: '#96ceb4',
      emoji: '🔊',
      content: `Generated voice: ${data.audio_url}`,
      mediaType: 'audio',
      mediaUrl: data.audio_url,
      metadata: { generated: true, voice: voice, duration: data.duration }
    };
  }

  async transcribeAudio(audioData: Buffer, apiKey: string, model: string): Promise<string> {
    const res = await fetch('https://api.x.ai/v1/audio/transcribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        audio: audioData.toString('base64'),
        format: 'text'
      })
    });

    if (!res.ok) throw new Error(`Transcription API HTTP ${res.status}`);
    const data: any = await res.json();
    return data.transcription || '';
  }

  async createBuild(spec: BuildSpec, apiKey: string, model: string): Promise<BuildResult> {
    // Grok Build API endpoint
    const res = await fetch('https://api.x.ai/v1/build/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        spec: spec,
        generate_artifacts: true
      })
    });

    if (!res.ok) throw new Error(`Build API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      buildId: data.build_id,
      status: data.status,
      artifacts: data.artifacts || [],
      logs: data.logs || [],
      metadata: data.metadata || {}
    };
  }

  async validateBuild(buildId: string, apiKey: string, model: string): Promise<ValidationResult> {
    const res = await fetch(`https://api.x.ai/v1/build/${buildId}/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model
      })
    });

    if (!res.ok) throw new Error(`Build validation API HTTP ${res.status}`);
    const data: any = await res.json();

    return {
      valid: data.valid,
      errors: data.errors || [],
      warnings: data.warnings || [],
      score: data.score || 0
    };
  }
}

export class DemoApiClient implements ApiClient {
  async callAgent(agent: Agent, prompt: string, apiKey: string, model: string): Promise<AgentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const demoResponses: Record<string, string> = {
      researcher: `Based on xAI development best practices for "${prompt}":\n\n• Use grok-4-1-fast-reasoning for optimal performance\n• Implement proper error handling and rate limiting\n• Refer to x.ai/docs for latest API specifications\n• Consider streaming responses for better UX`,
      logician: `Logical analysis for "${prompt}":\n\n1. Parse requirements and validate against xAI constraints\n2. Design error handling for network/API failures\n3. Implement retry logic with exponential backoff\n4. Consider fallback mechanisms for degraded service`,
      designer: `Creative solution for "${prompt}":\n\n• Intuitive UI with real-time progress indicators\n• Color-coded agent responses for clarity\n• Collapsible sections for detailed outputs\n• Voice input capabilities for accessibility\n• Cross-device sync for continuity`
    };

    return {
      id: agent.id,
      name: agent.name,
      color: agent.color,
      emoji: agent.emoji,
      content: demoResponses[agent.id] || `Demo response for ${agent.name}`
    };
  }
}

export class AgentManager {
  private agents: Agent[];
  private apiClient: ApiClient;

  constructor(agents: Agent[], apiClient: ApiClient) {
    this.agents = agents;
    this.apiClient = apiClient;
  }

  async getAgentResponses(query: string, codeContext: string, apiKey: string, model: string): Promise<AgentResponse[]> {
    const fullPrompt = `${query}\n\n=== xAI DEVELOPMENT CONTEXT ===\n${codeContext || 'No code selected.'}\n=== END CONTEXT ===`;

    const promises = this.agents.map(agent =>
      this.apiClient.callAgent(agent, fullPrompt, apiKey, model)
    );

    return Promise.all(promises);
  }

  async synthesizeResponse(responses: AgentResponse[], query: string, apiKey: string, model: string, lunaAgent: Agent): Promise<string> {
    if (this.apiClient instanceof DemoApiClient) {
      return this.getDemoSynthesis(query);
    }

    const synthesisMessages = responses.map(r => `${r.name}: ${r.content}`).join('\n\n');
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: lunaAgent.system + ' Now synthesize the specialist responses into ONE final, actionable answer.' },
          { role: 'user', content: `User query: ${query}\n\nSpecialist responses:\n${synthesisMessages}` }
        ],
        temperature: 0.5,
        max_tokens: 4096
      })
    });
    const data: any = await res.json();
    return data.choices[0].message.content;
  }

  private getDemoSynthesis(query: string): string {
    return `## 🌙 Luna's Synthesized Answer

Based on the collaborative input from our specialist agents, here's the comprehensive solution for **${query}**:

### 🔍 **Research Findings**
The team identified key xAI development patterns and best practices.

### 🧠 **Logical Analysis**
The recommended approach follows structured methodology with proper error handling.

### 🎨 **Design Recommendations**
For optimal UX, consider real-time indicators and intuitive interfaces.

### 💡 **Actionable Implementation**

\`\`\`typescript
// Example implementation structure
async function implement${query.replace(/[^a-zA-Z]/g, '')}() {
  try {
    const response = await callXaiApi(query);
    const synthesized = await synthesizeAgentResponses(response);
    return formatFinalAnswer(synthesized);
  } catch (error) {
    return handleErrorGracefully(error);
  }
}
\`\`\`

**Next Steps:**
1. Review agent recommendations above
2. Implement suggested code structure
3. Test with real xAI API calls
4. Consider voice input capabilities

*This demo showcases collaborative AI agents under Luna's orchestration.*`;
  }
}