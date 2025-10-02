import { reactive } from 'vue';

/**
 * 工具消息状态接口
 */
export interface ToolMessageState {
  toolUseId: string;
  toolUse?: {
    id: string;
    name: string;
    input: any;
  };
  toolResult?: {
    content: any;
    is_error?: boolean;
    tool_use_id: string;
  };
  permissionState: 'none' | 'pending' | 'allowed' | 'denied';
  executionState: 'waiting' | 'executing' | 'completed' | 'error';
  correlationId?: string; // 用于权限请求
}

/**
 * 全局工具消息状态存储
 */
export const toolMessages = reactive(new Map<string, ToolMessageState>());

/**
 * 创建或更新工具消息状态
 */
export function upsertToolMessage(toolUseId: string, data: Partial<ToolMessageState>) {
  const existing = toolMessages.get(toolUseId) || {
    toolUseId,
    permissionState: 'none' as const,
    executionState: 'waiting' as const
  };
  
  const updated = { ...existing, ...data };
  toolMessages.set(toolUseId, updated);
  
  return updated;
}

/**
 * 获取工具消息状态
 */
export function getToolMessage(toolUseId: string): ToolMessageState | undefined {
  return toolMessages.get(toolUseId);
}

/**
 * 更新工具使用信息
 */
export function setToolUse(toolUse: { id: string; name: string; input: any }) {
  return upsertToolMessage(toolUse.id, {
    toolUse,
    executionState: 'waiting'
  });
}

/**
 * 更新工具结果
 */
export function setToolResult(toolResult: { content: any; is_error?: boolean; tool_use_id: string }) {
  return upsertToolMessage(toolResult.tool_use_id, {
    toolResult,
    executionState: toolResult.is_error ? 'error' : 'completed'
  });
}

/**
 * 设置权限请求状态
 */
export function setPermissionRequest(toolUseId: string, correlationId: string) {
  return upsertToolMessage(toolUseId, {
    permissionState: 'pending',
    correlationId
  });
}

/**
 * 设置权限响应结果
 */
export function setPermissionResponse(toolUseId: string, allowed: boolean) {
  return upsertToolMessage(toolUseId, {
    permissionState: allowed ? 'allowed' : 'denied',
    executionState: allowed ? 'executing' : 'error'
  });
}

/**
 * 清理工具消息（可选，用于清理旧数据）
 */
export function clearOldToolMessages(maxAge: number = 300000) { // 5分钟
  const now = Date.now();
  for (const [toolUseId, state] of toolMessages.entries()) {
    // 如果工具消息已完成且超过指定时间，可以清理
    if (state.executionState === 'completed' || state.executionState === 'error') {
      // 这里可以根据实际需要实现清理逻辑
      // 目前暂时保留所有消息
    }
  }
}

/**
 * 通过 correlationId 查找 toolUseId
 */
export function findToolUseIdByCorrelationId(correlationId: string): string | undefined {
  for (const [toolUseId, state] of toolMessages.entries()) {
    if (state.correlationId === correlationId) {
      return toolUseId;
    }
  }
  return undefined;
}