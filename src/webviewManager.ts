// webviewManager.ts - Handles webview creation and updates

import * as vscode from 'vscode';

export class VSCodeWebviewManager {
  createPanel(title: string, viewColumn: vscode.ViewColumn): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel(
      'xaiMultiAgent',
      title,
      viewColumn,
      { enableScripts: true, retainContextWhenHidden: true }
    );
  }

  createVideoPanel(title: string, viewColumn: vscode.ViewColumn): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel(
      'xaiVideoAgent',
      title,
      viewColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(require('path').join(require('vscode').workspace.workspaceFolders[0].uri.fsPath, 'media'))]
      }
    );
  }

  createVoicePanel(title: string, viewColumn: vscode.ViewColumn): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel(
      'xaiVoiceAgent',
      title,
      viewColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(require('path').join(require('vscode').workspace.workspaceFolders[0].uri.fsPath, 'audio'))]
      }
    );
  }

  updatePanel(panel: vscode.WebviewPanel, type: string, data: any): void {
    panel.webview.postMessage({ type, ...data });
  }

  setHtml(panel: vscode.WebviewPanel, html: string): void {
    panel.webview.html = html;
  }
}