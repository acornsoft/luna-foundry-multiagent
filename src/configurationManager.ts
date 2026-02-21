// configurationManager.ts - Handles VS Code configuration and secrets

import * as vscode from 'vscode';

export class VSCodeConfigurationManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async getApiKey(): Promise<string | undefined> {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<string>('apiKey') || await this.context.secrets.get('xaiApiKey');
  }

  async storeApiKey(key: string): Promise<void> {
    await this.context.secrets.store('xaiApiKey', key);
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    await config.update('apiKey', '***', true);
  }

  getModel(): string {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<string>('model') || 'grok-4-1-fast-reasoning';
  }

  getUserAddress(): string {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<string>('userAddress') || 'explorer';
  }

  getVideoEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<boolean>('videoEnabled') ?? false;
  }

  getVoiceEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<boolean>('voiceEnabled') ?? false;
  }

  getBuildEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<boolean>('buildEnabled') ?? false;
  }

  getPreferredVoice(): string {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<string>('preferredVoice') || 'default';
  }

  getVideoQuality(): string {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<string>('videoQuality') || 'high';
  }

  getGrok420Enabled(): boolean {
    const config = vscode.workspace.getConfiguration('lunaSherpa');
    return config.get<boolean>('grok420Enabled') ?? true;
  }
}