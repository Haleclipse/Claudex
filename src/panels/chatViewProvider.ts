import * as vscode from 'vscode';
import { logger } from '../utils/logger';
import { ClaudeClient } from '../services/claude/client';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private webviewView?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly claudeClient: ClaudeClient
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this.webviewView = webviewView;
    const { webview } = webviewView;
    
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'dist/media')
      ],
    };
    
    webview.html = this.getHtml(webview);
    
    // 设置 Claude Client 的 webview 引用
    this.claudeClient.setWebview(webview);
    
    // 监听来自 webview 的消息
    webview.onDidReceiveMessage(message => {
      this.claudeClient.handleMessage(message);
    });
    
    logger.debug('[ChatViewProvider] Webview 已初始化');
  }

  private getHtml(webview: vscode.Webview): string {
    // 使用dist/media目录中的资源
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist/media', 'style.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist/media', 'main.js'));

    const csp = [
      `default-src 'none';`,
      `img-src ${webview.cspSource} https: data:;`,
      `style-src ${webview.cspSource};`,
      `font-src ${webview.cspSource};`,
      `script-src ${webview.cspSource};`,
      `connect-src ${webview.cspSource} https:;`,
    ].join(' ');

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="${csp}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Claudex Chat</title>
        <link href="${cssUri}" rel="stylesheet" />
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="${jsUri}"></script>
      </body>
    </html>`;
  }

  /**
   * 销毁视图提供器
   */
  dispose(): void {
    // 清理 Claude Client
    this.claudeClient.dispose();
    
    // 清理资源
    this.webviewView = undefined;
    
    logger.debug('[ChatViewProvider] 视图提供器已销毁');
  }
}
