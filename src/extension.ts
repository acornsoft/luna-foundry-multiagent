import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Agent } from './interfaces';
import { AgentManager, XaiApiClient, DemoApiClient, Grok420ApiClient } from './agentManager';
import { VSCodeConfigurationManager } from './configurationManager';
import { AppInsightsTelemetryService } from './telemetryService';
import { VSCodeWebviewManager } from './webviewManager';

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

  context.subscriptions.push(startMacroFlow, voiceQuery, syncGrokCom, setupWorkspace, askTeam, processVideo, generateVideo, processVoice, generateVoice, createBuild);
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

export function deactivate() {
  telemetryService.trackEvent('ExtensionDeactivated');
  telemetryService.flush();
}