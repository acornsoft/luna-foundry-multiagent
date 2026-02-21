// interfaces.ts - Core interfaces for Luna Sherpa extension

export interface Agent {
  id: string;
  name: string;
  color: string;
  emoji: string;
  system: string;
  capabilities?: AgentCapability[];
}

export interface AgentResponse {
  id: string;
  name: string;
  color: string;
  emoji: string;
  content: string;
  mediaType?: 'text' | 'audio' | 'video' | 'multimodal';
  mediaUrl?: string;
  metadata?: Record<string, any>;
}

export interface ApiClient {
  callAgent(agent: Agent, prompt: string, apiKey: string, model: string): Promise<AgentResponse>;
  supportsVideo?(): boolean;
  supportsVoice?(): boolean;
  supportsBuild?(): boolean;
}

export interface VideoApiClient extends ApiClient {
  processVideo(videoData: Buffer | string, prompt: string, apiKey: string, model: string): Promise<AgentResponse>;
  generateVideo(description: string, apiKey: string, model: string): Promise<AgentResponse>;
}

export interface VoiceApiClient extends ApiClient {
  processVoice(audioData: Buffer, prompt: string, apiKey: string, model: string): Promise<AgentResponse>;
  generateVoice(text: string, voice?: string, apiKey?: string, model?: string): Promise<AgentResponse>;
  transcribeAudio(audioData: Buffer, apiKey: string, model: string): Promise<string>;
}

export interface BuildApiClient extends ApiClient {
  createBuild(spec: BuildSpec, apiKey: string, model: string): Promise<BuildResult>;
  validateBuild(buildId: string, apiKey: string, model: string): Promise<ValidationResult>;
}

export interface WebviewManager {
  createPanel(title: string, viewColumn: any): any;
  updatePanel(panel: any, type: string, data: any): void;
  createVideoPanel?(title: string, viewColumn: any): any;
  createVoicePanel?(title: string, viewColumn: any): any;
}

export interface ConfigurationManager {
  getApiKey(): Promise<string | undefined>;
  storeApiKey(key: string): Promise<void>;
  getModel(): string;
  getUserAddress(): string;
  getVideoEnabled(): boolean;
  getVoiceEnabled(): boolean;
  getBuildEnabled(): boolean;
  getPreferredVoice?(): string;
  getVideoQuality?(): string;
}

export interface TelemetryService {
  trackEvent(name: string, properties?: Record<string, string>): void;
  trackException(error: Error, properties?: Record<string, string>): void;
  trackMediaEvent?(event: string, mediaType: string, properties?: Record<string, string>): void;
}

export interface AgentCapability {
  type: 'text' | 'voice' | 'video' | 'build' | 'multimodal';
  description: string;
}

export interface BuildSpec {
  name: string;
  description: string;
  requirements: string[];
  architecture: string;
  technologies: string[];
  constraints?: string[];
}

export interface BuildResult {
  buildId: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  artifacts: BuildArtifact[];
  logs: string[];
  metadata: Record<string, any>;
}

export interface BuildArtifact {
  name: string;
  type: 'code' | 'config' | 'docs' | 'test';
  content: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  type: 'syntax' | 'logic' | 'security' | 'performance';
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  type: 'style' | 'optimization' | 'compatibility';
  message: string;
  suggestion?: string;
}