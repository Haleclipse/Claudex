/**
 * 工具错误解析工具
 */

/**
 * 解析工具执行错误内容
 * 从 tool_result 中提取错误信息
 *
 * @param toolResult - 工具执行结果
 * @returns 解析后的错误文本，如果无错误则返回 null
 */
export function parseToolError(toolResult: any): string | null {
  if (!toolResult?.is_error || !toolResult?.content) return null;

  // 如果 content 是字符串，尝试解析 <tool_use_error> 标签
  if (typeof toolResult.content === 'string') {
    const match = toolResult.content.match(/<tool_use_error>(.*?)<\/tool_use_error>/s);
    return match ? match[1].trim() : toolResult.content;
  }

  // 如果 content 是其他格式，直接返回
  return String(toolResult.content);
}

/**
 * 检查工具结果是否包含错误
 *
 * @param toolResult - 工具执行结果
 * @returns 是否有错误
 */
export function hasToolError(toolResult: any): boolean {
  return !!toolResult?.is_error;
}
