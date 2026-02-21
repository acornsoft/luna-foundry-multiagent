import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Agent } from './interfaces';
import { AgentManager, XaiApiClient, DemoApiClient, Grok420ApiClient } from './agentManager';
import { VSCodeConfigurationManager } from './configurationManager';
import { AppInsightsTelemetryService } from './telemetryService';
import { VSCodeWebviewManager } from './webviewManager';

interface TaskArtifact {
  id: string;
  type: string;
  name: string;
  description: string;
}

interface TaskSlice {
  id: string;
  title: string;
  description: string;
  artifacts: TaskArtifact[];
}

interface TaskDecomposition {
  originalTask: string;
  slices: TaskSlice[];
  totalArtifacts: number;
}

const AGENTS: Agent[] = [
  { id: 'luna', name: 'Luna', color: '#00b4ff', emoji: '🌙', system: 'You are Luna, the eternal AI companion and Sherpa guide—the all-seeing eye for solution design and development, acting as an Uber Enterprise Architect across ALL domains. Oversee MacroFlow phases: Constitution (guardrails), Clarify (questions), Specify (specs), Plan (architecture), Tasks (decomposition), Implement (code). Coordinate sub-agents calmly and patiently, ensuring holistic, scalable solutions.' },
  { id: 'researcher', name: 'the Researcher', color: '#22c55e', emoji: '🔍', system: 'You are the Researcher. Focus exclusively on facts, latest xAI API docs, citations, real-world examples, and research for this xAI development task.' },
  { id: 'logician', name: 'the Logician', color: '#a855f7', emoji: '🧠', system: 'You are the Logician. Pure rigorous logical analysis, edge cases, formal reasoning, potential failures, and mathematical correctness for this xAI task.' },
  { id: 'designer', name: 'the Designer', color: '#f59e0b', emoji: '✨', system: 'You are the Designer. Brainstorm novel ideas, elegant code patterns, out-of-the-box solutions, and creative implementations using Grok/xAI models.' }
];

// Global telemetry service
let telemetryService: AppInsightsTelemetryService;

export function activate(context: vscode.ExtensionContext) {
  // Debug logging only in development
  if (context.extensionMode === vscode.ExtensionMode.Development) {
    console.log('Luna Sherpa extension activated');
  }

  // Initialize telemetry service
  const config = vscode.workspace.getConfiguration('lunaSherpa');
  const appInsightsKey = config.get<string>('applicationInsightsKey');
  telemetryService = new AppInsightsTelemetryService(appInsightsKey);

  // Luna Sherpa Commands
  const startMacroFlow = vscode.commands.registerCommand('luna.startMacroFlow', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'startMacroFlow' });
      const configManager = new VSCodeConfigurationManager(context);
      const userAddress = configManager.getUserAddress();
      
      vscode.window.showInformationMessage(`${userAddress}, starting MacroFlow Ritual. Let's begin with Constitution.`);
      
      // Load agents from .github/agents/
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
      }
      
      const agentsDir = path.join(workspaceFolder.uri.fsPath, '.github', 'agents');
      if (!fs.existsSync(agentsDir)) {
        vscode.window.showErrorMessage('Agents directory not found. Ensure .github/agents/ exists.');
        return;
      }
      
      // For now, show a placeholder - full implementation would load and invoke agents
      vscode.window.showInformationMessage('Agents located. Switching to Constitution agent for setup.');
      
      // Perform Constitution phase checks
      vscode.window.showInformationMessage('Constitution phase: Loading Acornsoft manifesto, patterns, and constraints...');
      
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'startMacroFlow' });
      vscode.window.showErrorMessage(`MacroFlow failed: ${error.message}`);
    }
  });

  const voiceQuery = vscode.commands.registerCommand('luna.voiceQuery', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'voiceQuery' });
      vscode.window.showInformationMessage('Voice input requires VS Code Insiders. Feature coming soon.');
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'voiceQuery' });
      vscode.window.showErrorMessage(`Voice query failed: ${error.message}`);
    }
  });

  const syncGrokCom = vscode.commands.registerCommand('luna.syncGrokCom', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'syncGrokCom' });
      vscode.window.showInformationMessage('Syncing with grok.com... Feature in development.');
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'syncGrokCom' });
      vscode.window.showErrorMessage(`Sync failed: ${error.message}`);
    }
  });

  const decomposeTask = vscode.commands.registerCommand('luna.decomposeTask', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'decomposeTask' });

      const configManager = new VSCodeConfigurationManager(context);
      const userAddress = configManager.getUserAddress();

      // Get the complex requirement from user
      const complexTask = await vscode.window.showInputBox({
        prompt: 'Enter the complex requirement to decompose',
        placeHolder: 'Build a real-time collaborative code review system with AI assistance',
        value: 'Build a real-time collaborative code review system with AI assistance'
      });

      if (!complexTask) return;

      const panel = vscode.window.createWebviewPanel(
        'lunaTaskDecomposition',
        'Luna - Task Decomposition & Artifact Generation',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      // Generate task decomposition with natural artifact flow
      const decomposition = generateTaskDecomposition(complexTask);

      panel.webview.html = getTaskDecompositionHtml(decomposition, userAddress);

      // Handle artifact generation requests
      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.type === 'generateArtifact') {
          await generateArtifact(message.artifactId, message.artifactType, decomposition);
        }
      });

    } catch (error: any) {
      telemetryService.trackException(error, { command: 'decomposeTask' });
      vscode.window.showErrorMessage(`Task decomposition failed: ${error.message}`);
    }
  });

  const setupWorkspace = vscode.commands.registerCommand('luna.setupWorkspace', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'setupWorkspace' });

      const extensionGithubDir = path.join(context.extensionPath, '.github');

      // Check if extension has .github directory
      if (!fs.existsSync(extensionGithubDir)) {
        vscode.window.showErrorMessage('Extension .github directory not found.');
        return;
      }

      // Ask user where to setup the workspace
      const setupLocation = await vscode.window.showQuickPick(
        [
          {
            label: 'User Home (~/.github)',
            description: 'Setup in your user home directory (recommended for personal use)',
            detail: 'Files will be available across all workspaces'
          },
          {
            label: 'Current Workspace (./.github)',
            description: 'Setup in current workspace directory',
            detail: 'Files specific to this project workspace'
          }
        ],
        {
          placeHolder: 'Where would you like to setup Luna workspace files?',
          matchOnDescription: true
        }
      );

      if (!setupLocation) {
        return;
      }

      let targetGithubDir: string;
      let locationType: string;

      if (setupLocation.label === 'User Home (~/.github)') {
        const userHome = process.env.HOME || process.env.USERPROFILE;
        if (!userHome) {
          vscode.window.showErrorMessage('Unable to determine user home directory.');
          return;
        }
        targetGithubDir = path.join(userHome, '.github');
        locationType = 'user home';
      } else {
        // Workspace setup
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('No workspace folder open.');
          return;
        }
        targetGithubDir = path.join(workspaceFolder.uri.fsPath, '.github');
        locationType = 'current workspace';
      }

      // Check what's already there
      const targetExists = fs.existsSync(targetGithubDir);
      let existingFiles = 0;
      let newFiles = 0;

      if (targetExists) {
        // Count existing files
        const countFiles = (dir: string): number => {
          let count = 0;
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isFile()) {
              count++;
            } else if (entry.isDirectory()) {
              count += countFiles(path.join(dir, entry.name));
            }
          }
          return count;
        };
        existingFiles = countFiles(targetGithubDir);
      }

      const shouldProceed = await vscode.window.showInformationMessage(
        targetExists
          ? `Luna workspace setup: Found ${existingFiles} existing files in ${locationType === 'user home' ? '~/.github' : './.github'}. This will add/update Luna's agent files, skills, and configuration. Existing files will not be overwritten. Continue?`
          : `Luna workspace setup: This will create your ${locationType === 'user home' ? '~/.github' : './.github'} directory with Luna's agent files, skills, and configuration. Continue?`,
        { modal: true },
        'Yes'
      );

      if (shouldProceed !== 'Yes') {
        return;
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Setting up Luna Workspace',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Analyzing files...' });

        // Function to copy directory recursively (non-destructive)
        const copyDir = (src: string, dest: string): { copied: number, skipped: number } => {
          let copied = 0;
          let skipped = 0;

          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }

          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
              const result = copyDir(srcPath, destPath);
              copied += result.copied;
              skipped += result.skipped;
            } else {
              // Check if destination file exists
              if (fs.existsSync(destPath)) {
                // Compare modification times
                const srcStats = fs.statSync(srcPath);
                const destStats = fs.statSync(destPath);

                // Only copy if source is newer (extension has updates)
                if (srcStats.mtime > destStats.mtime) {
                  fs.copyFileSync(srcPath, destPath);
                  copied++;
                } else {
                  skipped++;
                }
              } else {
                // File doesn't exist, copy it
                fs.copyFileSync(srcPath, destPath);
                copied++;
              }
            }
          }

          return { copied, skipped };
        };

        try {
          const result = copyDir(extensionGithubDir, targetGithubDir);
          newFiles = result.copied;

          const message = result.copied > 0
            ? `✅ Luna workspace setup complete! ${result.copied} files added/updated, ${result.skipped} files already up-to-date.`
            : `✅ Luna workspace is already up-to-date! All ${result.skipped} files are current.`;

          vscode.window.showInformationMessage(message);

        } catch (error: any) {
          vscode.window.showErrorMessage(`Failed to setup workspace: ${error.message}`);
        }
      });

    } catch (error: any) {
      telemetryService.trackException(error, { command: 'setupWorkspace' });
      vscode.window.showErrorMessage(`Workspace setup failed: ${error.message}`);
    }
  });

  const askTeam = vscode.commands.registerCommand('luna.askTeam', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'askTeam' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();
      let apiKey = await configManager.getApiKey();
      let isDemoMode = false;
    
      if (!apiKey) {
        apiKey = await vscode.window.showInputBox({ 
          prompt: 'Enter your xAI API key (or "demo" for showcase mode)', 
          password: true,
          placeHolder: 'demo'
        });
        if (!apiKey) return;
        
        if (apiKey.toLowerCase() === 'demo') {
          isDemoMode = true;
          vscode.window.showInformationMessage('🎭 Demo Mode: Showing pseudo 4-agent workflow with sample responses');
        } else {
          await configManager.storeApiKey(apiKey);
        }
      }

      const editor = vscode.window.activeTextEditor;
      let codeContext = '';
      if (editor) {
        const selection = editor.selection;
        codeContext = selection.isEmpty 
          ? editor.document.getText() 
          : editor.document.getText(selection);
        if (codeContext.length > 150000) codeContext = codeContext.substring(0, 150000) + '\n... (truncated)';
      }

      const query = await vscode.window.showInputBox({
        prompt: 'Ask the Team... Try: "Design a simple REST API for a Golf Scoring Application" or "How to add Memory (collection) support to Agentic App?"',
        placeHolder: 'How should I implement tool-calling with grok-4?'
      });
      if (!query) return;

      const panel = webviewManager.createPanel('xAI 4.20 Multi-Agent Team', vscode.ViewColumn.Beside);

      telemetryService.trackEvent('WebviewOpened', { command: 'askTeam' });

      webviewManager.setHtml(panel, getWebviewContent());

      // Send initial status
      panel.webview.postMessage({ type: 'status', message: 'MacroFlow decomposing task...' });

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'xAI Multi-Agent Team Processing',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'MacroFlow decomposing task...' });

        try {
          const fullPrompt = `${query}\n\n=== xAI DEVELOPMENT CONTEXT ===\n${codeContext || 'No code selected.'}\n=== END CONTEXT ===`;

          const apiClient = isDemoMode ? new DemoApiClient() : new XaiApiClient();
          const agentManager = new AgentManager(AGENTS, apiClient);
          const model = configManager.getModel();

          const responses = await agentManager.getAgentResponses(query, codeContext, apiKey!, model);

          // Track successful API calls (skip in demo mode)
          if (!isDemoMode) {
            telemetryService.trackEvent('ApiCallSuccess', {
              command: 'askTeam',
              agentCount: responses.length.toString(),
              model: model
            });
          }

          // Synthesis by Luna
          progress.report({ message: 'Luna synthesizing final answer...' });
          webviewManager.updatePanel(panel, 'status', { message: 'Luna synthesizing final answer...' });
          
          const finalAnswer = await agentManager.synthesizeResponse(responses, query, apiKey!, model, AGENTS[0]);

          // Send everything to webview
          webviewManager.updatePanel(panel, 'complete', { responses, finalAnswer });

        } catch (err: any) {
          telemetryService.trackException(err, { 
            command: 'askTeam',
            errorType: err.name || 'Unknown',
            statusCode: err.message?.includes('HTTP') ? err.message.split(' ')[1] : 'Unknown'
          });
          telemetryService.trackEvent('ApiCallFailed', { 
            command: 'askTeam',
            errorMessage: err.message?.substring(0, 100) || 'Unknown error'
          });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'API error — check key and network' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { 
        command: 'askTeam',
        errorType: error.name || 'Unknown',
        errorMessage: error.message?.substring(0, 100) || 'Unknown error'
      });
      vscode.window.showErrorMessage(`Ask Team failed: ${error.message || 'Unknown error'}`);
    }
  });

  const processVideo = vscode.commands.registerCommand('luna.processVideo', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'processVideo' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();

      if (!configManager.getVideoEnabled()) {
        vscode.window.showWarningMessage('Video processing is disabled. Enable it in settings.');
        return;
      }

      const apiKey = await configManager.getApiKey();
      if (!apiKey) {
        vscode.window.showErrorMessage('Please set your xAI API key first.');
        return;
      }

      const videoUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { 'Video files': ['mp4', 'avi', 'mov', 'mkv'] },
        openLabel: 'Select Video to Process'
      });

      if (!videoUri || videoUri.length === 0) return;

      const panel = webviewManager.createVideoPanel('Video Analysis', vscode.ViewColumn.Beside);
      webviewManager.setHtml(panel, getVideoWebviewContent());

      // Process video
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Processing Video with Grok 4.20',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Analyzing video content...' });

        try {
          const fs = require('fs');
          const videoData = fs.readFileSync(videoUri[0].fsPath);
          const apiClient = new Grok420ApiClient();
          const model = configManager.getModel();

          const prompt = await vscode.window.showInputBox({
            prompt: 'What would you like to analyze in this video?',
            placeHolder: 'Describe objects, analyze scene, extract text...'
          }) || 'Analyze the content of this video';

          const response = await apiClient.processVideo(videoData, prompt, apiKey, model);

          webviewManager.updatePanel(panel, 'videoResult', { response });

          telemetryService.trackMediaEvent('processed', 'video', {
            command: 'processVideo',
            model: model
          });

        } catch (err: any) {
          telemetryService.trackException(err, { command: 'processVideo' });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'Video processing failed' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'processVideo' });
      vscode.window.showErrorMessage(`Video processing failed: ${error.message}`);
    }
  });

  const generateVideo = vscode.commands.registerCommand('luna.generateVideo', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'generateVideo' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();

      if (!configManager.getVideoEnabled()) {
        vscode.window.showWarningMessage('Video generation is disabled. Enable it in settings.');
        return;
      }

      const apiKey = await configManager.getApiKey();
      if (!apiKey) {
        vscode.window.showErrorMessage('Please set your xAI API key first.');
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: 'Describe the video you want to generate',
        placeHolder: 'A serene mountain landscape at sunset...'
      });

      if (!description) return;

      const panel = webviewManager.createVideoPanel('Video Generation', vscode.ViewColumn.Beside);
      webviewManager.setHtml(panel, getVideoWebviewContent());

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Generating Video with Grok 4.20',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Creating video from description...' });

        try {
          const apiClient = new Grok420ApiClient();
          const model = configManager.getModel();

          const response = await apiClient.generateVideo(description, apiKey, model);

          webviewManager.updatePanel(panel, 'videoResult', { response });

          telemetryService.trackMediaEvent('generated', 'video', {
            command: 'generateVideo',
            model: model
          });

        } catch (err: any) {
          telemetryService.trackException(err, { command: 'generateVideo' });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'Video generation failed' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'generateVideo' });
      vscode.window.showErrorMessage(`Video generation failed: ${error.message}`);
    }
  });

  const processVoice = vscode.commands.registerCommand('luna.processVoice', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'processVoice' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();

      if (!configManager.getVoiceEnabled()) {
        vscode.window.showWarningMessage('Voice processing is disabled. Enable it in settings.');
        return;
      }

      const apiKey = await configManager.getApiKey();
      if (!apiKey) {
        vscode.window.showErrorMessage('Please set your xAI API key first.');
        return;
      }

      const audioUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { 'Audio files': ['mp3', 'wav', 'm4a', 'flac'] },
        openLabel: 'Select Audio to Process'
      });

      if (!audioUri || audioUri.length === 0) return;

      const panel = webviewManager.createVoicePanel('Voice Analysis', vscode.ViewColumn.Beside);
      webviewManager.setHtml(panel, getVoiceWebviewContent());

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Processing Voice with Grok 4.20',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Transcribing and analyzing audio...' });

        try {
          const fs = require('fs');
          const audioData = fs.readFileSync(audioUri[0].fsPath);
          const apiClient = new Grok420ApiClient();
          const model = configManager.getModel();

          const transcription = await apiClient.transcribeAudio(audioData, apiKey, model);
          const analysisResponse = await apiClient.processVoice(audioData, 'Analyze this audio content', apiKey, model);

          webviewManager.updatePanel(panel, 'voiceResult', {
            transcription,
            analysis: analysisResponse
          });

          telemetryService.trackMediaEvent('processed', 'voice', {
            command: 'processVoice',
            model: model
          });

        } catch (err: any) {
          telemetryService.trackException(err, { command: 'processVoice' });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'Voice processing failed' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'processVoice' });
      vscode.window.showErrorMessage(`Voice processing failed: ${error.message}`);
    }
  });

  const generateVoice = vscode.commands.registerCommand('luna.generateVoice', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'generateVoice' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();

      if (!configManager.getVoiceEnabled()) {
        vscode.window.showWarningMessage('Voice generation is disabled. Enable it in settings.');
        return;
      }

      const apiKey = await configManager.getApiKey();
      if (!apiKey) {
        vscode.window.showErrorMessage('Please set your xAI API key first.');
        return;
      }

      const text = await vscode.window.showInputBox({
        prompt: 'Enter text to convert to speech',
        placeHolder: 'Hello, this is a demonstration of voice synthesis...'
      });

      if (!text) return;

      const panel = webviewManager.createVoicePanel('Voice Generation', vscode.ViewColumn.Beside);
      webviewManager.setHtml(panel, getVoiceWebviewContent());

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Generating Voice with Grok 4.20',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Converting text to speech...' });

        try {
          const apiClient = new Grok420ApiClient();
          const model = configManager.getModel();
          const voice = configManager.getPreferredVoice();

          const response = await apiClient.generateVoice(text, voice, apiKey, model);

          webviewManager.updatePanel(panel, 'voiceResult', { response });

          telemetryService.trackMediaEvent('generated', 'voice', {
            command: 'generateVoice',
            model: model,
            voice: voice
          });

        } catch (err: any) {
          telemetryService.trackException(err, { command: 'generateVoice' });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'Voice generation failed' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'generateVoice' });
      vscode.window.showErrorMessage(`Voice generation failed: ${error.message}`);
    }
  });

  const createBuild = vscode.commands.registerCommand('luna.createBuild', async () => {
    try {
      telemetryService.trackEvent('CommandExecuted', { command: 'createBuild' });
      const configManager = new VSCodeConfigurationManager(context);
      const webviewManager = new VSCodeWebviewManager();

      if (!configManager.getBuildEnabled()) {
        vscode.window.showWarningMessage('Build generation is disabled. Enable it in settings.');
        return;
      }

      const apiKey = await configManager.getApiKey();
      if (!apiKey) {
        vscode.window.showErrorMessage('Please set your xAI API key first.');
        return;
      }

      const buildSpec = await vscode.window.showInputBox({
        prompt: 'Describe the software build you want to create',
        placeHolder: 'A REST API for user management with authentication...'
      });

      if (!buildSpec) return;

      const panel = webviewManager.createPanel('AI Build Generation', vscode.ViewColumn.Beside);
      webviewManager.setHtml(panel, getBuildWebviewContent());

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Creating Build with Grok Build',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Generating software build...' });

        try {
          const apiClient = new Grok420ApiClient();
          const model = configManager.getModel();

          const spec = {
            name: `Build-${Date.now()}`,
            description: buildSpec,
            requirements: ['functional', 'scalable', 'maintainable'],
            architecture: 'microservices',
            technologies: ['typescript', 'node.js', 'express'],
            constraints: ['modern standards', 'security best practices']
          };

          const buildResult = await apiClient.createBuild(spec, apiKey, model);
          const validation = await apiClient.validateBuild(buildResult.buildId, apiKey, model);

          webviewManager.updatePanel(panel, 'buildResult', {
            build: buildResult,
            validation: validation
          });

          telemetryService.trackEvent('BuildCreated', {
            command: 'createBuild',
            model: model,
            buildId: buildResult.buildId,
            valid: validation.valid.toString()
          });

        } catch (err: any) {
          telemetryService.trackException(err, { command: 'createBuild' });
          webviewManager.updatePanel(panel, 'error', { message: err.message || 'Build creation failed' });
        }
      });
    } catch (error: any) {
      telemetryService.trackException(error, { command: 'createBuild' });
      vscode.window.showErrorMessage(`Build creation failed: ${error.message}`);
    }
  });

  context.subscriptions.push(startMacroFlow, voiceQuery, syncGrokCom, decomposeTask, setupWorkspace, askTeam, processVideo, generateVideo, processVoice, generateVoice, createBuild);
}

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>xAI 4.20 Agents</title>
  <style>
    body { font-family: system-ui; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
    .agent { border: 2px solid; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .header { display: flex; align-items: center; gap: 10px; font-weight: bold; }
    #final { background: #1f2937; border: 2px solid #00b4ff; }
    .status { font-style: italic; color: #888; }
  </style>
</head>
<body>
  <h1>🧠 MacroFlow — 4-Agent Team</h1>
  <div id="status" class="status">Thinking...</div>
  <div id="agents"></div>
  <div id="final" class="agent" style="display:none;">
    <div class="header" style="color:#00b4ff;">🚀 Luna — Final Synthesis</div>
    <pre id="finalContent"></pre>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'status') {
        document.getElementById('status').innerText = msg.message;
      } else if (msg.type === 'complete') {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('agents');
        msg.responses.forEach(r => {
          const div = document.createElement('div');
          div.className = 'agent';
          div.style.borderColor = r.color;
          div.innerHTML = \`
            <div class="header" style="color:\${r.color}">\${r.emoji} \${r.name}</div>
            <pre style="white-space: pre-wrap;">\${r.content}</pre>
          \`;
          container.appendChild(div);
        });
        const finalDiv = document.getElementById('final');
        finalDiv.style.display = 'block';
        document.getElementById('finalContent').innerText = msg.finalAnswer;
      } else if (msg.type === 'error') {
        document.getElementById('status').innerHTML = '<span style="color:red">Error: ' + msg.message + '</span>';
      }
    });
  </script>
</body>
</html>`;
}

function getVideoWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grok 4.20 Video Analysis</title>
  <style>
    body { font-family: system-ui; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
    .result { border: 2px solid #ff6b6b; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .video-container { margin: 15px 0; }
    video { max-width: 100%; border-radius: 4px; }
    .status { font-style: italic; color: #888; }
  </style>
</head>
<body>
  <h1>🎥 Grok 4.20 Video Processing</h1>
  <div id="status" class="status">Processing video...</div>
  <div id="videoContainer"></div>

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'videoResult') {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('videoContainer');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = \`
          <h3>Video Analysis Result</h3>
          <div class="video-container">
            \${msg.response.mediaUrl ? \`<video controls><source src="\${msg.response.mediaUrl}" type="video/mp4"></video>\` : ''}
          </div>
          <pre style="white-space: pre-wrap;">\${msg.response.content}</pre>
          \${msg.response.metadata ? \`<p><strong>Metadata:</strong> \${JSON.stringify(msg.response.metadata, null, 2)}</p>\` : ''}
        \`;
        container.appendChild(resultDiv);
      } else if (msg.type === 'error') {
        document.getElementById('status').innerHTML = '<span style="color:red">Error: ' + msg.message + '</span>';
      }
    });
  </script>
</body>
</html>`;
}

function getVoiceWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grok 4.20 Voice Processing</title>
  <style>
    body { font-family: system-ui; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
    .result { border: 2px solid #45b7d1; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .audio-container { margin: 15px 0; }
    audio { width: 100%; }
    .transcription { background: #2d3748; padding: 10px; border-radius: 4px; margin: 10px 0; }
    .status { font-style: italic; color: #888; }
  </style>
</head>
<body>
  <h1>🎤 Grok 4.20 Voice Processing</h1>
  <div id="status" class="status">Processing audio...</div>
  <div id="voiceContainer"></div>

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'voiceResult') {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('voiceContainer');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = \`
          <h3>Voice Processing Result</h3>
          \${msg.transcription ? \`<div class="transcription"><strong>Transcription:</strong><br>\${msg.transcription}</div>\` : ''}
          <div class="audio-container">
            \${msg.response.mediaUrl ? \`<audio controls><source src="\${msg.response.mediaUrl}" type="audio/mpeg"></audio>\` : ''}
          </div>
          <pre style="white-space: pre-wrap;">\${msg.analysis ? msg.analysis.content : msg.response.content}</pre>
          \${msg.response.metadata ? \`<p><strong>Metadata:</strong> \${JSON.stringify(msg.response.metadata, null, 2)}</p>\` : ''}
        \`;
        container.appendChild(resultDiv);
      } else if (msg.type === 'error') {
        document.getElementById('status').innerHTML = '<span style="color:red">Error: ' + msg.message + '</span>';
      }
    });
  </script>
</body>
</html>`;
}

function getBuildWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grok Build Generation</title>
  <style>
    body { font-family: system-ui; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
    .build-result { border: 2px solid #7c3aed; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .validation { background: #2d3748; padding: 10px; border-radius: 4px; margin: 10px 0; }
    .valid { border-left: 4px solid #10b981; }
    .invalid { border-left: 4px solid #ef4444; }
    .artifact { background: #1a202c; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .status { font-style: italic; color: #888; }
    pre { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🔨 Grok Build Generation</h1>
  <div id="status" class="status">Generating build...</div>
  <div id="buildContainer"></div>

  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'buildResult') {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('buildContainer');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'build-result';
        resultDiv.innerHTML = \`
          <h3>Build Generation Result</h3>
          <p><strong>Build ID:</strong> \${msg.build.buildId}</p>
          <p><strong>Status:</strong> \${msg.build.status}</p>
          
          <div class="validation \${msg.validation.valid ? 'valid' : 'invalid'}">
            <strong>Validation: \${msg.validation.valid ? 'PASSED' : 'FAILED'}</strong>
            <p>Score: \${msg.validation.score}/100</p>
            \${msg.validation.errors.length > 0 ? \`<p><strong>Errors:</strong> \${msg.validation.errors.length}</p>\` : ''}
            \${msg.validation.warnings.length > 0 ? \`<p><strong>Warnings:</strong> \${msg.validation.warnings.length}</p>\` : ''}
          </div>
          
          <h4>Generated Artifacts:</h4>
          \${msg.build.artifacts.map(artifact => \`
            <div class="artifact">
              <strong>\${artifact.name}</strong> (\${artifact.type})
              <pre>\${artifact.content}</pre>
            </div>
          \`).join('')}
          
          \${msg.build.logs.length > 0 ? \`
            <h4>Build Logs:</h4>
            <pre>\${msg.build.logs.join('\\n')}</pre>
          \` : ''}
        \`;
        container.appendChild(resultDiv);
      } else if (msg.type === 'error') {
        document.getElementById('status').innerHTML = '<span style="color:red">Error: ' + msg.message + '</span>';
      }
    });
  </script>
</body>
</html>`;
}

// Task Decomposition Helper Functions
function generateTaskDecomposition(complexTask: string): TaskDecomposition {
  // Break down complex task into vertical slices with natural artifact flow
  const taskSlices = [
    {
      id: 'core-architecture',
      title: 'Core Architecture & Data Models',
      description: 'Define the fundamental structure and data relationships',
      artifacts: [
        { id: 'data-models', type: 'typescript', name: 'Data Models (TypeScript interfaces)', description: 'Type-safe data structures' },
        { id: 'api-schema', type: 'openapi', name: 'API Schema (OpenAPI)', description: 'RESTful API specification' },
        { id: 'database-schema', type: 'sql', name: 'Database Schema (SQL)', description: 'Database table definitions' }
      ]
    },
    {
      id: 'authentication',
      title: 'Authentication & Authorization',
      description: 'Implement secure user access and permissions',
      artifacts: [
        { id: 'auth-middleware', type: 'typescript', name: 'Auth Middleware (TypeScript)', description: 'JWT validation and session management' },
        { id: 'user-roles', type: 'typescript', name: 'User Roles (TypeScript)', description: 'RBAC permission definitions' },
        { id: 'auth-tests', type: 'typescript', name: 'Auth Tests (Jest)', description: 'Security test suite' }
      ]
    },
    {
      id: 'real-time-engine',
      title: 'Real-Time Collaboration Engine',
      description: 'Build the core real-time communication system',
      artifacts: [
        { id: 'websocket-server', type: 'typescript', name: 'WebSocket Server (TypeScript)', description: 'Real-time connection handling' },
        { id: 'collaboration-api', type: 'typescript', name: 'Collaboration API (TypeScript)', description: 'Real-time event processing' },
        { id: 'conflict-resolution', type: 'typescript', name: 'Conflict Resolution (TypeScript)', description: 'Operational transformation logic' }
      ]
    },
    {
      id: 'ai-integration',
      title: 'AI Code Review Integration',
      description: 'Integrate AI-powered code analysis and suggestions',
      artifacts: [
        { id: 'ai-client', type: 'typescript', name: 'AI Client (TypeScript)', description: 'Grok API integration' },
        { id: 'code-analysis', type: 'typescript', name: 'Code Analysis Engine (TypeScript)', description: 'Static analysis and AI suggestions' },
        { id: 'review-workflow', type: 'typescript', name: 'Review Workflow (TypeScript)', description: 'Automated review process' }
      ]
    },
    {
      id: 'frontend-ui',
      title: 'Frontend User Interface',
      description: 'Create the collaborative code review interface',
      artifacts: [
        { id: 'react-components', type: 'typescript', name: 'React Components (TypeScript)', description: 'UI components with TypeScript' },
        { id: 'review-interface', type: 'typescript', name: 'Review Interface (React)', description: 'Code review UI components' },
        { id: 'real-time-ui', type: 'typescript', name: 'Real-Time UI Updates (React)', description: 'Live collaboration indicators' }
      ]
    },
    {
      id: 'deployment-config',
      title: 'Deployment & Configuration',
      description: 'Set up deployment pipelines and configuration management',
      artifacts: [
        { id: 'docker-compose', type: 'yaml', name: 'Docker Compose (YAML)', description: 'Container orchestration' },
        { id: 'ci-cd-pipeline', type: 'yaml', name: 'CI/CD Pipeline (GitHub Actions)', description: 'Automated deployment' },
        { id: 'environment-config', type: 'typescript', name: 'Environment Config (TypeScript)', description: 'Configuration management' }
      ]
    }
  ];

  return {
    originalTask: complexTask,
    slices: taskSlices,
    totalArtifacts: taskSlices.reduce((sum, slice) => sum + slice.artifacts.length, 0)
  };
}

function getTaskDecompositionHtml(decomposition: TaskDecomposition, userAddress: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luna - Task Decomposition</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #1e1e1e; color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .task-summary { background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #00b4ff; }
        .slice { background: #252526; margin: 15px 0; padding: 20px; border-radius: 8px; border: 1px solid #3e3e42; }
        .slice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .slice-title { color: #4ec9b0; font-size: 1.2em; margin: 0; }
        .artifact-count { background: #007acc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
        .slice-description { color: #cccccc; margin-bottom: 15px; }
        .artifacts { display: grid; gap: 10px; }
        .artifact { background: #1e1e1e; padding: 12px; border-radius: 6px; border: 1px solid #2d2d30; }
        .artifact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .artifact-name { color: #dcdcaa; font-weight: bold; }
        .artifact-type { background: #4ec9b0; color: #1e1e1e; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; text-transform: uppercase; }
        .artifact-description { color: #cccccc; font-size: 0.9em; }
        .generate-btn { background: #00b4ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.8em; }
        .generate-btn:hover { background: #0098e6; }
        .progress-bar { width: 100%; height: 4px; background: #3e3e42; border-radius: 2px; margin-top: 10px; }
        .progress-fill { height: 100%; background: #00b4ff; border-radius: 2px; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌙 Luna - Task Decomposition & Artifact Generation</h1>
        <p>${userAddress}, I've broken down your complex requirement into manageable vertical slices that naturally flow into concrete, generatable artifacts.</p>
    </div>

    <div class="task-summary">
        <h3>📋 Original Requirement</h3>
        <p><strong>"${decomposition.originalTask}"</strong></p>
        <p>Decomposed into <strong>${decomposition.slices.length} vertical slices</strong> containing <strong>${decomposition.totalArtifacts} generatable artifacts</strong></p>
    </div>

    <div id="slices">
        ${decomposition.slices.map((slice: TaskSlice) => `
            <div class="slice">
                <div class="slice-header">
                    <h3 class="slice-title">${slice.title}</h3>
                    <span class="artifact-count">${slice.artifacts.length} artifacts</span>
                </div>
                <p class="slice-description">${slice.description}</p>
                <div class="artifacts">
                    ${slice.artifacts.map((artifact: TaskArtifact) => `
                        <div class="artifact">
                            <div class="artifact-header">
                                <span class="artifact-name">${artifact.name}</span>
                                <span class="artifact-type">${artifact.type}</span>
                            </div>
                            <p class="artifact-description">${artifact.description}</p>
                            <button class="generate-btn" onclick="generateArtifact('${artifact.id}', '${artifact.type}')">
                                ⚡ Generate ${artifact.type.toUpperCase()}
                            </button>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-${artifact.id}" style="width: 0%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function generateArtifact(artifactId, artifactType) {
            const progressBar = document.getElementById('progress-' + artifactId);
            progressBar.style.width = '50%';

            vscode.postMessage({
                type: 'generateArtifact',
                artifactId: artifactId,
                artifactType: artifactType
            });
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'artifactGenerated') {
                const progressBar = document.getElementById('progress-' + message.artifactId);
                progressBar.style.width = '100%';
                progressBar.style.background = '#4ec9b0';
            }
        });
    </script>
</body>
</html>`;
}

async function generateArtifact(artifactId: string, artifactType: string, decomposition: any) {
  // Simulate artifact generation with realistic content
  const artifacts = {
    'data-models': `// TypeScript interfaces for collaborative code review system
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'developer';
  createdAt: Date;
  lastActive: Date;
}

export interface CodeReview {
  id: string;
  title: string;
  description: string;
  author: User;
  reviewers: User[];
  status: 'draft' | 'open' | 'under_review' | 'approved' | 'rejected';
  pullRequestUrl?: string;
  repository: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  author: User;
  filePath: string;
  lineNumber: number;
  content: string;
  type: 'comment' | 'suggestion' | 'issue';
  status: 'open' | 'resolved' | 'dismissed';
  aiSuggestions?: AISuggestion[];
  createdAt: Date;
}

export interface AISuggestion {
  id: string;
  type: 'improvement' | 'bug_fix' | 'security' | 'performance';
  description: string;
  codeSnippet?: string;
  confidence: number;
  applied: boolean;
}`,

    'api-schema': `openapi: 3.0.3
info:
  title: Collaborative Code Review API
  version: 1.0.0
  description: Real-time collaborative code review system with AI assistance

servers:
  - url: https://api.codereview.dev/v1

paths:
  /reviews:
    get:
      summary: Get code reviews
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, open, under_review, approved, rejected]
        - name: author
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of code reviews
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CodeReview'

    post:
      summary: Create new code review
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateReviewRequest'
      responses:
        '201':
          description: Code review created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CodeReview'

  /reviews/{reviewId}/comments:
    get:
      summary: Get review comments
      parameters:
        - name: reviewId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of comments
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ReviewComment'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        username:
          type: string
        email:
          type: string
        role:
          type: string
          enum: [admin, reviewer, developer]

    CodeReview:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        author:
          $ref: '#/components/schemas/User'
        reviewers:
          type: array
          items:
            $ref: '#/components/schemas/User'
        status:
          type: string
          enum: [draft, open, under_review, approved, rejected]

    CreateReviewRequest:
      type: object
      required:
        - title
        - repository
        - branch
      properties:
        title:
          type: string
        description:
          type: string
        repository:
          type: string
        branch:
          type: string
        reviewerIds:
          type: array
          items:
            type: string

    ReviewComment:
      type: object
      properties:
        id:
          type: string
        reviewId:
          type: string
        author:
          $ref: '#/components/schemas/User'
        filePath:
          type: string
        lineNumber:
          type: integer
        content:
          type: string
        type:
          type: string
          enum: [comment, suggestion, issue]`,

    'auth-middleware': `// JWT Authentication Middleware for Express.js
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthMiddleware {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  authorize = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  };

  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private async getUserById(userId: string): Promise<User | null> {
    // Implementation would connect to your user database
    // This is a placeholder
    return null;
  }
}

// Usage example:
// const authMiddleware = new AuthMiddleware(process.env.JWT_SECRET!);
// app.use('/api', authMiddleware.authenticate);
// app.get('/api/admin', authMiddleware.authenticate, authMiddleware.authorize('admin'), handler);`,

    'websocket-server': `// Real-time WebSocket server for collaborative code review
import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { User } from '../models/User';
import { CodeReview } from '../models/CodeReview';
import { ReviewComment } from '../models/ReviewComment';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  reviewId?: string;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export class CollaborationWebSocketServer {
  private wss: WebSocket.Server;
  private rooms: Map<string, Set<ExtendedWebSocket>> = new Map();

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.setupWebSocketHandlers();
    console.log(\`Collaboration WebSocket server running on port \${port}\`);
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: ExtendedWebSocket, request: IncomingMessage) => {
      console.log('New WebSocket connection established');

      ws.on('message', async (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });
  }

  private async handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage): Promise<void> {
    switch (message.type) {
      case 'join_review':
        await this.handleJoinReview(ws, message.payload);
        break;
      case 'leave_review':
        this.handleLeaveReview(ws);
        break;
      case 'add_comment':
        await this.handleAddComment(ws, message.payload);
        break;
      case 'update_comment':
        await this.handleUpdateComment(ws, message.payload);
        break;
      case 'cursor_position':
        this.handleCursorPosition(ws, message.payload);
        break;
      default:
        this.sendError(ws, \`Unknown message type: \${message.type}\`);
    }
  }

  private async handleJoinReview(ws: ExtendedWebSocket, payload: { reviewId: string; userId: string }): Promise<void> {
    const { reviewId, userId } = payload;

    // Validate user and review
    const user = await this.getUserById(userId);
    const review = await this.getReviewById(reviewId);

    if (!user || !review) {
      this.sendError(ws, 'Invalid user or review');
      return;
    }

    // Check if user has access to this review
    if (!this.canAccessReview(user, review)) {
      this.sendError(ws, 'Access denied to this review');
      return;
    }

    // Add user to review room
    ws.userId = userId;
    ws.reviewId = reviewId;

    if (!this.rooms.has(reviewId)) {
      this.rooms.set(reviewId, new Set());
    }
    this.rooms.get(reviewId)!.add(ws);

    // Notify others in the room
    this.broadcastToRoom(reviewId, {
      type: 'user_joined',
      payload: { userId, username: user.username },
      timestamp: Date.now()
    }, ws);

    // Send current room state to the new user
    const roomUsers = await this.getRoomUsers(reviewId);
    this.sendToWebSocket(ws, {
      type: 'room_state',
      payload: { users: roomUsers, review: review },
      timestamp: Date.now()
    });
  }

  private handleLeaveReview(ws: ExtendedWebSocket): void {
    if (ws.reviewId && ws.userId) {
      const room = this.rooms.get(ws.reviewId);
      if (room) {
        room.delete(ws);

        // Notify others
        this.broadcastToRoom(ws.reviewId, {
          type: 'user_left',
          payload: { userId: ws.userId },
          timestamp: Date.now()
        });

        // Clean up empty rooms
        if (room.size === 0) {
          this.rooms.delete(ws.reviewId);
        }
      }
    }
  }

  private async handleAddComment(ws: ExtendedWebSocket, payload: any): Promise<void> {
    if (!ws.reviewId || !ws.userId) {
      this.sendError(ws, 'Not in a review session');
      return;
    }

    const comment = await this.createComment({
      ...payload,
      reviewId: ws.reviewId,
      authorId: ws.userId
    });

    // Broadcast new comment to room
    this.broadcastToRoom(ws.reviewId, {
      type: 'comment_added',
      payload: comment,
      timestamp: Date.now()
    });
  }

  private handleCursorPosition(ws: ExtendedWebSocket, payload: any): void {
    if (!ws.reviewId || !ws.userId) return;

    // Broadcast cursor position to others in the room
    this.broadcastToRoom(ws.reviewId, {
      type: 'cursor_moved',
      payload: {
        userId: ws.userId,
        ...payload
      },
      timestamp: Date.now()
    }, ws);
  }

  private broadcastToRoom(reviewId: string, message: WebSocketMessage, exclude?: ExtendedWebSocket): void {
    const room = this.rooms.get(reviewId);
    if (!room) return;

    room.forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        this.sendToWebSocket(client, message);
      }
    });
  }

  private sendToWebSocket(ws: ExtendedWebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: ExtendedWebSocket, error: string): void {
    this.sendToWebSocket(ws, {
      type: 'error',
      payload: { message: error },
      timestamp: Date.now()
    });
  }

  private handleDisconnect(ws: ExtendedWebSocket): void {
    this.handleLeaveReview(ws);
  }

  // Placeholder methods - implement with your database
  private async getUserById(userId: string): Promise<User | null> {
    // Implement user lookup
    return null;
  }

  private async getReviewById(reviewId: string): Promise<CodeReview | null> {
    // Implement review lookup
    return null;
  }

  private canAccessReview(user: User, review: CodeReview): boolean {
    // Implement access control logic
    return true;
  }

  private async getRoomUsers(reviewId: string): Promise<any[]> {
    // Implement room user lookup
    return [];
  }

  private async createComment(commentData: any): Promise<ReviewComment> {
    // Implement comment creation
    return {} as ReviewComment;
  }
}

// Usage:
// const wsServer = new CollaborationWebSocketServer(8080);`
  };

  // Generate the artifact based on type
  let content = '';
  let filename = '';

  switch (artifactId) {
    case 'data-models':
      content = artifacts['data-models'];
      filename = 'models.ts';
      break;
    case 'api-schema':
      content = artifacts['api-schema'];
      filename = 'api-schema.yaml';
      break;
    case 'auth-middleware':
      content = artifacts['auth-middleware'];
      filename = 'auth.middleware.ts';
      break;
    case 'websocket-server':
      content = artifacts['websocket-server'];
      filename = 'websocket-server.ts';
      break;
    default:
      content = `// Generated ${artifactType} artifact for ${artifactId}
// This is a placeholder - implement actual generation logic
export const ${artifactId} = {};`;
      filename = `${artifactId}.${artifactType === 'typescript' ? 'ts' : artifactType}`;
  }

  // Create the file in the workspace
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const artifactsDir = vscode.Uri.joinPath(workspaceFolder.uri, 'generated-artifacts');
    await vscode.workspace.fs.createDirectory(artifactsDir);

    const fileUri = vscode.Uri.joinPath(artifactsDir, filename);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf8'));

    // Open the generated file
    const document = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(`✅ Generated ${filename} and opened for editing`);
  }
}

export function deactivate() {
  telemetryService.trackEvent('ExtensionDeactivated');
  telemetryService.flush();
}