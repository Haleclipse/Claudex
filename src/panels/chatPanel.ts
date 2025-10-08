import * as vscode from 'vscode';

export class ChatPanel {
  private static currentPanel: ChatPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private activeRequests = new Map<string, NodeJS.Timeout>();
  private accum = new Map<string, string>();

  static show(extensionUri: vscode.Uri) {
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel.panel.reveal(vscode.ViewColumn.Two);
      return;
    }
    ChatPanel.currentPanel = new ChatPanel(extensionUri);
  }

  private constructor(private readonly extensionUri: vscode.Uri) {
    this.panel = vscode.window.createWebviewPanel(
      'claudex',
      'Claudex',
      { viewColumn: vscode.ViewColumn.Two, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist/media')],
      },
    );

    this.panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'resources', 'activity-icon.svg');
    this.panel.webview.html = this.getHtml(this.panel.webview);

    this.panel.webview.onDidReceiveMessage(this.onMessage, this, this.disposables);
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  private getHtml(webview: vscode.Webview): string {
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

  private async onMessage(message: any) {
    switch (message?.type) {
      case 'ui/ready': {
        this.post({ type: 'init', payload: { version: 1, capabilities: ['chat'] } });
        break;
      }
      case 'chat/request': {
        const text: string = message?.payload?.text ?? '';
        const requestId: string = message?.payload?.requestId ?? String(Date.now());
        // Simulate streaming response
        const simulated = `Thanks for your message!\nYou said: "${text}"\nThis is a simulated streaming reply.`;
        this.accum.set(requestId, '');
        let i = 0;
        const tick = () => {
          if (i >= simulated.length) {
            clearInterval(timer);
            this.activeRequests.delete(requestId);
            const finalText = this.accum.get(requestId) ?? '';
            this.post({ type: 'chat/done', payload: { requestId, text: finalText } });
            this.accum.delete(requestId);
            return;
          }
          const chunk = simulated[i];
          i += 1;
          const current = (this.accum.get(requestId) ?? '') + chunk;
          this.accum.set(requestId, current);
          this.post({ type: 'chat/progress', payload: { requestId, delta: chunk } });
        };
        const timer = setInterval(tick, 15);
        this.activeRequests.set(requestId, timer);
        break;
      }
      case 'chat/cancel': {
        const requestId: string = message?.payload?.requestId;
        const timer = this.activeRequests.get(requestId);
        if (timer) {
          clearInterval(timer);
          this.activeRequests.delete(requestId);
          this.accum.delete(requestId);
          this.post({ type: 'chat/error', payload: { requestId, message: 'Cancelled' } });
        }
        break;
      }
    }
  }

  private post(msg: any) {
    this.panel.webview.postMessage(msg);
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      try { d?.dispose(); } catch {}
    }
  }
}
