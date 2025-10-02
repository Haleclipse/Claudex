// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { logger } from './utils/logger';
import { ChatViewProvider } from './panels/chatViewProvider';
import { ClaudeClient } from './services/claude/client';
import { LogServiceImpl, ConsoleLog, LogLevel } from './services/log/logService';
import { ClaudeAgentManager } from './services/claude/claude';
import { ClaudeCodeSessionService, IClaudeCodeSessionService } from './services/claude/session';
import { InstantiationService, ServiceCollection, IInstantiationService } from './services/common/services';
import { FileSystemService, IFileSystemService } from './services/filesystem/fileSystemService';
import { WorkspaceService, IWorkspaceService } from './services/workspace/workspaceService';
import { EnvService, IEnvService, NativeEnvService, INativeEnvService } from './services/env/envService';
import { ILogService } from './services/log/logService';
import { ConfigurationService, IConfigurationService } from './services/configuration/configurationService';
import { ToolsService, IToolsService } from './services/tools/toolsService';

// Global instances
let claudeClient: ClaudeClient;

// Global flag to track initialization state
let isInitialized = false;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  logger.info('扩展已激活');

  // 立即设置上下文变量；后续初始化保持非阻塞
  updateWorkspaceContext();

  // 监听工作区文件夹变化（按需初始化）
  const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    updateWorkspaceContext();
    if (hasWorkspaceFolder() && !isInitialized) {
      // 后台触发初始化，避免阻塞激活流程
      void initializeServices(context);
    }
  });

  context.subscriptions.push(workspaceFoldersChangeListener);

  // 初始有工作区时立即在后台初始化（无需 setTimeout）
  if (hasWorkspaceFolder() && !isInitialized) {
    void initializeServices(context);
  }
}

function hasWorkspaceFolder(): boolean {
  return !!(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0);
}

function updateWorkspaceContext(): void {
  const hasFolder = hasWorkspaceFolder();
  vscode.commands.executeCommand('setContext', 'claudex.hasWorkspaceFolder', hasFolder);
  logger.info(`工作区状态更新: ${hasFolder ? '有' : '无'}工作区文件夹`);
}

async function initializeServices(context: vscode.ExtensionContext): Promise<void> {
  if (isInitialized) {
    logger.info('服务已初始化，跳过重复初始化');
    return;
  }

  if (!hasWorkspaceFolder()) {
    logger.info('没有工作区文件夹，跳过服务初始化');
    return;
  }

  logger.info('开始初始化 Claudex 服务...');
  isInitialized = true;

  try {
    // 创建日志服务
    const logService = new LogServiceImpl([
      new ConsoleLog('[Claudex] ', LogLevel.Debug)
    ]);

  // 创建文件系统服务
  const fileSystemService = new FileSystemService();

  // 创建工作区服务
  const workspaceService = new WorkspaceService(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);

  // 创建环境服务
  const envService = new EnvService(context.extensionPath);
  const nativeEnvService = new NativeEnvService();

  // 创建配置服务
  const configService = new ConfigurationService();

  // 创建工具服务
  const toolsService = new ToolsService(logService);

  // 创建会话服务
  const sessionService = new ClaudeCodeSessionService(
    fileSystemService,
    logService,
    workspaceService,
    nativeEnvService
  );

  // 创建服务集合和实例化服务
  const serviceCollection = new ServiceCollection();
  serviceCollection.set(ILogService, logService);
  serviceCollection.set(IFileSystemService, fileSystemService);
  serviceCollection.set(IWorkspaceService, workspaceService);
  serviceCollection.set(IEnvService, envService);
  serviceCollection.set(INativeEnvService, nativeEnvService);
  serviceCollection.set(IConfigurationService, configService);
  serviceCollection.set(IToolsService, toolsService);
  serviceCollection.set(IClaudeCodeSessionService, sessionService);

  const instantiationService = new InstantiationService(serviceCollection);

  // 将实例化服务注册到自己的服务集合中
  serviceCollection.set(IInstantiationService, instantiationService);

  // 创建 Claude Agent Manager
  const claudeAgent = new ClaudeAgentManager(logService, instantiationService);

  // 创建 Claude Client
  claudeClient = new ClaudeClient(sessionService, claudeAgent, logService);

  // Register auxiliary bar view provider
  const viewProvider = new ChatViewProvider(
    context.extensionUri,
    claudeClient
  );
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('claudex', viewProvider));

  // Command opens auxiliary bar and focuses our chat view
  const openChat = vscode.commands.registerCommand('claudex.openChat', async () => {
    await vscode.commands.executeCommand('workbench.view.extension.claudex');
  });
  context.subscriptions.push(openChat);

  // TODO: 重新实现这些命令
  /*
  // Settings button command (appears in view title via menus.view/title)
  const openSettings = vscode.commands.registerCommand('claudex.openSettings', async () => {
    await showSettingsMenu(configManager);
  });
  context.subscriptions.push(openSettings);

  // API Key 管理命令
  const setApiKey = vscode.commands.registerCommand('claudex.setApiKey', async () => {
    await promptForApiKey(configManager);
  });
  context.subscriptions.push(setApiKey);

  const clearApiKeyCmd = vscode.commands.registerCommand('claudex.clearApiKey', async () => {
    await clearApiKeyFromStorage(configManager);
  });
  context.subscriptions.push(clearApiKeyCmd);

  // 权限模式切换命令
  const changePermissionMode = vscode.commands.registerCommand('claudex.changePermissionMode', async () => {
    await promptForPermissionMode(configManager);
  });
  context.subscriptions.push(changePermissionMode);

  // 历史会话恢复
  const resumeFromHistory = vscode.commands.registerCommand('claudex.resumeFromHistory', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showWarningMessage('请先打开一个工作区文件夹');
      return;
    }

    try {
      const sessions = await sessionService.getAllSessions({ isCancellationRequested: false, onCancellationRequested: () => ({ dispose: () => {} }) } as any);
      if (!sessions.length) {
        vscode.window.showInformationMessage('未发现历史对话记录');
        return;
      }

      const pick = await vscode.window.showQuickPick(
        sessions.slice(0, 50).map(s => ({
          label: s.label,
          description: `会话 ID: ${s.id}`,
          detail: `${s.timestamp.toLocaleString()} - ${s.messages.length} 条消息`,
          sessionId: s.id
        })),
        { placeHolder: '选择要恢复的历史会话（最近修改在前）' }
      );

      if (!pick) {
        return;
      }

      await context.workspaceState.update('claudex.pendingResumeSessionId', pick.sessionId);
      logger.info('已设置待恢复会话:', pick.sessionId);
      vscode.window.showInformationMessage(`已设置恢复会话：${pick.label}，下次对话将自动衔接。`);
    } catch (error) {
      logger.error('获取历史会话失败:', error);
      vscode.window.showErrorMessage('获取历史会话失败');
    }
  });
  context.subscriptions.push(resumeFromHistory);
  */

    logger.info('Claudex 服务初始化完成');
  } catch (error) {
    logger.error('Claudex 服务初始化失败:', error);
    isInitialized = false; // 重置状态，允许重试
    vscode.window.showErrorMessage(`Claudex 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/*
// Settings menu
async function showSettingsMenu(configManager: ConfigManager) {
  const configInfo = await configManager.getConfigInfo();

  const items = [
    {
      label: '$(key) 设置 API Key',
      detail: configInfo.hasApiKey ? '已配置' : '未配置',
      action: 'setApiKey'
    },
    {
      label: '$(settings-gear) 权限模式',
      detail: `当前: ${configInfo.permissionMode}`,
      action: 'permissionMode'
    },
    {
      label: '$(symbol-color) 模型设置',
      detail: `当前: ${configInfo.model}`,
      action: 'model'
    }
  ];

  if (configInfo.hasApiKey) {
    items.push({
      label: '$(trash) 清除 API Key',
      detail: '从 SecretStorage 中删除',
      action: 'clearApiKey'
    });
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: '选择配置项',
    ignoreFocusOut: true
  });

  if (!selected) { return; }

  switch (selected.action) {
    case 'setApiKey':
      await promptForApiKey(configManager);
      break;
    case 'permissionMode':
      await promptForPermissionMode(configManager);
      break;
    case 'model':
      await promptForModel(configManager);
      break;
    case 'clearApiKey':
      await clearApiKeyFromStorage(configManager);
      break;
  }
}

// Prompt for API Key
async function promptForApiKey(configManager: ConfigManager) {
  const apiKey = await vscode.window.showInputBox({
    prompt: '请输入 Anthropic API Key',
    password: true,
    placeHolder: 'sk-ant-...',
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value) { return '请输入 API Key'; }
      // 简单的格式验证
      if (!/^sk-ant-[a-zA-Z0-9_-]+$/.test(value)) {
        return 'API Key 格式不正确，应该以 sk-ant- 开头';
      }
      return null;
    }
  });

  if (apiKey) {
    try {
      await configManager.setApiKey(apiKey);
      vscode.window.showInformationMessage('API Key 已保存到 SecretStorage');
    } catch (error) {
      vscode.window.showErrorMessage(`保存 API Key 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Clear API Key
async function clearApiKeyFromStorage(configManager: ConfigManager) {
  const result = await vscode.window.showWarningMessage(
    '确认要删除保存的 API Key 吗？',
    '删除', '取消'
  );

  if (result === '删除') {
    try {
      // 通过重置客户端来清除 API Key
      configManager.clearApiKey();
      configManager.reset();
      vscode.window.showInformationMessage('API Key 已清除');
    } catch (error) {
      vscode.window.showErrorMessage(`清除 API Key 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Prompt for permission mode
async function promptForPermissionMode(configManager: ConfigManager) {
  const modes = [
    { label: 'Default', detail: '默认权限（需要用户确认）', value: 'default' },
    { label: 'Accept Edits', detail: '自动接受编辑操作', value: 'acceptEdits' },
    { label: 'Bypass Permissions', detail: '绕过权限检查', value: 'bypassPermissions' },
    { label: 'Plan', detail: '计划模式（只生成计划不执行）', value: 'plan' }
  ];

  const selected = await vscode.window.showQuickPick(modes, {
    placeHolder: '选择权限模式',
    ignoreFocusOut: true
  });

  if (selected) {
    try {
      await configManager.setPermissionMode(selected.value as any);
      vscode.window.showInformationMessage(`权限模式已更新为: ${selected.label}`);
    } catch (error) {
      vscode.window.showErrorMessage(`更新权限模式失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Prompt for model
async function promptForModel(configManager: ConfigManager) {
  const models = [
    { label: 'Claude 4 Sonnet', detail: '平衡性能模型', value: 'claude-4-sonnet' },
    { label: 'Claude 4.1 Opus', detail: '最新最强模型', value: 'claude-4.1-opus' }
  ];

  const selected = await vscode.window.showQuickPick(models, {
    placeHolder: '选择 Claude 模型',
    ignoreFocusOut: true
  });

  if (selected) {
    try {
      await configManager.setModel(selected.value);
      vscode.window.showInformationMessage(`模型已更新为: ${selected.label}`);
    } catch (error) {
      vscode.window.showErrorMessage(`更新模型失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (configManager) {
    configManager.reset();
  }
  if (permissionHandler) {
    permissionHandler.dispose();
  }

  logger.info('扩展已停用');
}
*/
