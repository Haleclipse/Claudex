// 消息队列类型定义

export interface QueuedMessage {
  id: string
  content: string
  timestamp: number
}

export interface MessageQueueState {
  queuedMessages: QueuedMessage[]
}