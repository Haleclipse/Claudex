<template>
  <div class="dropdown-separator"></div>
</template>

<style scoped>
.dropdown-separator {
  height: 1px;
  width: calc(100% + 0.25rem); /* 突破 menu-content 的 padding: 0.125rem */
  background: var(--vscode-commandCenter-inactiveBorder, var(--vscode-widget-border));
  opacity: 0.8;
  margin: 2px -0.125rem; /* 负边距对应 padding 值 */
  position: relative;
}
</style>