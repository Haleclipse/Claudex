// Todo 项目接口
export interface Todo {
  content: string
  status: 'pending' | 'in_progress' | 'completed'
  activeForm: string  // 改为必需字段，因为实际使用中都提供了这个字段
}

// 文件编辑信息接口
export interface FileEdit {
  name: string
  additions?: number
  deletions?: number
}