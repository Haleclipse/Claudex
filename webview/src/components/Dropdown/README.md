# Dropdown 组件系统

这是一个遵循**容器与内容分离**设计原则的通用Dropdown组件系统。

## 🎯 设计理念

### 核心原则
- **Dropdown**: 纯粹的容器组件，负责定位、显示/隐藏逻辑
- **DropdownItem**: 通用的数据驱动组件，通过接口适配不同业务需求
- **业务逻辑**: 完全在使用方（如ChatInputBox）中实现

### 通用性优势
- ✅ 可复用于任何下拉场景（菜单、选择器、自动完成等）
- ✅ 通过数据接口驱动，无硬编码业务逻辑
- ✅ 支持自定义图标、样式、行为
- ✅ 类型安全的TypeScript接口

## 📋 数据接口

### DropdownItemData
```typescript
interface DropdownItemData {
  id: string           // 唯一标识
  label?: string       // 主要显示文本
  name?: string        // 备用显示文本
  detail?: string      // 辅助信息（如路径、描述）
  icon?: string        // 左侧图标CSS类
  rightIcon?: string   // 右侧图标CSS类
  checked?: boolean    // 选中状态
  disabled?: boolean   // 禁用状态
  type?: string        // 业务类型标识
  data?: any          // 附加业务数据
  [key: string]: any  // 扩展字段
}
```

## 🔧 使用示例

### 基础使用
```vue
<template>
  <Dropdown 
    :is-visible="showDropdown"
    :position="dropdownPosition"
    @close="hideDropdown"
  >
    <template #content>
      <DropdownItem 
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :index="index"
        @click="handleSelect"
      />
    </template>
  </Dropdown>
</template>
```

### 自定义图标
```vue
<DropdownItem :item="item" :index="index">
  <template #icon="{ item }">
    <FileIcon v-if="item.type === 'file'" :file-name="item.name" />
    <i v-else :class="item.icon"></i>
  </template>
</DropdownItem>
```

### 业务数据示例
```typescript
const contextItems: DropdownItemData[] = [
  {
    id: 'file-1',
    label: 'main.ts',
    detail: 'src/main.ts',
    type: 'file',
    data: { path: '/project/src/main.ts' }
  },
  {
    id: 'option-1', 
    label: 'Settings',
    icon: 'codicon-settings',
    rightIcon: 'codicon-chevron-right',
    type: 'submenu',
    data: { category: 'settings' }
  }
]
```

## 🏗️ 组件架构

```
Dropdown (容器)
├── ScrollableElement (滚动)
│   └── 业务内容 (slot)
│       ├── DropdownItem (通用项)
│       ├── DropdownSeparator (分隔符)
│       └── 自定义内容
└── Footer (底部信息)
```

## 🎨 样式系统

- 使用全局CSS变量确保一致性
- 支持VSCode主题适配
- Monaco编辑器风格的滚动条
- 响应式设计

## 📝 最佳实践

1. **数据驱动**: 所有显示逻辑通过data接口控制
2. **类型安全**: 使用TypeScript接口确保类型检查
3. **业务分离**: 业务逻辑在使用方实现，组件保持通用
4. **扩展性**: 通过slot和data字段支持自定义需求

## 🔄 迁移指南

从硬编码版本迁移到通用版本:

1. 将业务数据移到使用方
2. 使用`DropdownItemData`接口重新定义数据
3. 在事件处理中使用`item.type`和`item.data`进行业务判断
4. 通过slot自定义特殊显示需求

这种设计确保了Dropdown组件的高复用性和维护性，同时保持了强大的扩展能力。