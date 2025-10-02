// 通用的下拉菜单项数据接口
export interface DropdownItemData {
  id: string
  label?: string        // 显示文本
  name?: string         // 备用显示文本
  detail?: string       // 辅助信息（如文件路径、描述等）
  icon?: string         // 左侧图标CSS类
  rightIcon?: string    // 右侧图标CSS类（如箭头）
  checked?: boolean     // 是否选中
  disabled?: boolean    // 是否禁用
  type?: string         // 项目类型（供业务逻辑使用）
  data?: any           // 附加数据
  [key: string]: any   // 允许扩展字段
}

// Dropdown 组件的项目类型
export interface DropdownItem {
  id: string
  label: string
  name?: string
  detail?: string
  icon?: string
  rightIcon?: string
  checked?: boolean
  disabled?: boolean
  type?: string
  data?: any
}

// 扩展类型：分隔符和节标题
export interface DropdownSeparator {
  type: 'separator'
  id: string
}

export interface DropdownSectionHeader {
  type: 'section-header'
  id: string
  text?: string
}

// 联合类型：包含所有可能的下拉项类型
export type DropdownItemType = DropdownItemData | DropdownSeparator | DropdownSectionHeader

// 导出所有类型
export type { DropdownItemData as DropdownItemDataType }