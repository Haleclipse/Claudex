// 全局类型声明

// 修复 @anthropic-ai/claude-agent-sdk SDK 中缺失的 Dict 类型
declare global {
  type Dict<T = any> = Record<string, T>;
}

export {};