<template>
  <div 
    ref="scrollableContainer"
    class="monaco-scrollable-element"
    role="presentation"
    @wheel="handleWheel"
    @mouseenter="showScrollbars"
    @mouseleave="hideScrollbars"
  >
    <!-- 内容容器 -->
    <div 
      ref="contentWrapper"
      class="scrollable-content-wrapper"
      :style="contentWrapperStyle"
    >
      <div 
        ref="contentContainer"
        class="scrollable-content-container"
        :style="contentContainerStyle"
      >
        <slot></slot>
      </div>
    </div>

    <!-- 垂直滚动条 -->
    <div
      v-show="showVerticalScrollbar"
      ref="verticalScrollbar"
      class="scrollbar vertical"
      :class="scrollbarClasses"
      role="presentation"
      aria-hidden="true"
      :style="verticalScrollbarStyle"
      @mousedown="startVerticalDrag"
    >
      <div 
        ref="verticalSlider"
        class="slider"
        :style="verticalSliderStyle"
      ></div>
    </div>

    <!-- 水平滚动条 -->
    <div
      v-show="showHorizontalScrollbar"
      ref="horizontalScrollbar" 
      class="scrollbar horizontal"
      :class="scrollbarClasses"
      role="presentation"
      aria-hidden="true"
      :style="horizontalScrollbarStyle"
      @mousedown="startHorizontalDrag"
    >
      <div 
        ref="horizontalSlider"
        class="slider"
        :style="horizontalSliderStyle"
      ></div>
    </div>

    <!-- 阴影效果 -->
    <div v-show="scrollTop > 0" class="shadow top"></div>
    <div v-show="scrollTop > 0" class="shadow top-left-corner top"></div>
    <div v-show="!isScrolledToBottom" class="shadow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type CSSProperties } from 'vue'

interface Props {
  height?: string | number
  width?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  width: '100%'
})

// DOM 引用
const scrollableContainer = ref<HTMLElement>()
const contentWrapper = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const verticalScrollbar = ref<HTMLElement>()
const verticalSlider = ref<HTMLElement>()
const horizontalScrollbar = ref<HTMLElement>()
const horizontalSlider = ref<HTMLElement>()

// 滚动状态
const scrollTop = ref(0)
const scrollLeft = ref(0)
const scrollHeight = ref(0)
const scrollWidth = ref(0)
const clientHeight = ref(0)
const clientWidth = ref(0)
const isScrollbarVisible = ref(false)
const scrollbarFadeTimer = ref<number>()

// 拖拽状态
const isDragging = ref(false)
const dragType = ref<'vertical' | 'horizontal' | null>(null)
const dragStartPos = ref(0)
const dragStartScroll = ref(0)

// 计算属性
const showVerticalScrollbar = computed(() => scrollHeight.value > clientHeight.value)
const showHorizontalScrollbar = computed(() => scrollWidth.value > clientWidth.value)

const isScrolledToBottom = computed(() => {
  return scrollTop.value >= scrollHeight.value - clientHeight.value - 1
})

const scrollbarClasses = computed(() => ({
  invisible: !isScrollbarVisible.value,
  fade: true,
  visible: isScrollbarVisible.value
}))

const contentWrapperStyle = computed((): CSSProperties => ({
  width: '100%',
  overflow: 'hidden',
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative'
}))

const contentContainerStyle = computed((): CSSProperties => ({
  display: 'inline-block',
  position: 'relative', 
  width: '100%',
  minHeight: '100%',
  transform: `translate3d(${-scrollLeft.value}px, ${-scrollTop.value}px, 0px)`,
  zIndex: 0,
  boxSizing: 'border-box'
}))

const verticalScrollbarStyle = computed((): CSSProperties => ({
  position: 'absolute',
  width: '6px',
  height: `${clientHeight.value}px`,
  right: '0px',
  top: '0px'
}))

const verticalSliderStyle = computed((): CSSProperties => {
  const ratio = clientHeight.value / scrollHeight.value
  const sliderHeight = Math.max(clientHeight.value * ratio, 20)
  const sliderTop = (scrollTop.value / (scrollHeight.value - clientHeight.value)) * (clientHeight.value - sliderHeight)
  
  return {
    position: 'absolute',
    top: `${sliderTop}px`,
    left: '0px',
    width: '6px',
    height: `${sliderHeight}px`,
    transform: 'translate3d(0px, 0px, 0px)'
  }
})

const horizontalScrollbarStyle = computed((): CSSProperties => ({
  position: 'absolute',
  width: `${clientWidth.value}px`,
  height: '10px',
  left: '0px',
  bottom: '0px'
}))

const horizontalSliderStyle = computed((): CSSProperties => {
  const ratio = clientWidth.value / scrollWidth.value
  const sliderWidth = Math.max(clientWidth.value * ratio, 20)
  const sliderLeft = (scrollLeft.value / (scrollWidth.value - clientWidth.value)) * (clientWidth.value - sliderWidth)
  
  return {
    position: 'absolute',
    top: '0px',
    left: `${sliderLeft}px`,
    height: '10px',
    width: `${sliderWidth}px`,
    transform: 'translate3d(0px, 0px, 0px)'
  }
})

// 更新尺寸信息
const updateDimensions = () => {
  if (!contentWrapper.value || !contentContainer.value) return
  
  const wrapperRect = contentWrapper.value.getBoundingClientRect()
  clientHeight.value = wrapperRect.height
  clientWidth.value = wrapperRect.width
  
  // 获取实际内容尺寸，考虑子元素
  let actualHeight = contentContainer.value.scrollHeight
  let actualWidth = contentContainer.value.scrollWidth
  
  // 如果容器内有子元素，检查子元素的尺寸
  const children = contentContainer.value.children
  if (children.length > 0) {
    let maxHeight = 0
    let maxWidth = 0
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      const childRect = child.getBoundingClientRect()
      const containerRect = contentContainer.value.getBoundingClientRect()
      
      // 计算子元素相对于容器的位置
      const childBottom = childRect.bottom - containerRect.top
      const childRight = childRect.right - containerRect.left
      
      maxHeight = Math.max(maxHeight, childBottom)
      maxWidth = Math.max(maxWidth, childRight)
    }
    
    actualHeight = Math.max(actualHeight, maxHeight)
    actualWidth = Math.max(actualWidth, maxWidth)
  }
  
  scrollHeight.value = actualHeight
  scrollWidth.value = actualWidth
}

// 显示滚动条
const showScrollbars = () => {
  isScrollbarVisible.value = true
  
  if (scrollbarFadeTimer.value) {
    clearTimeout(scrollbarFadeTimer.value)
  }
}

// 隐藏滚动条
const hideScrollbars = () => {
  if (!isDragging.value) {
    scrollbarFadeTimer.value = window.setTimeout(() => {
      isScrollbarVisible.value = false
    }, 800)
  }
}

// 滚轮处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const deltaY = event.deltaY
  const deltaX = event.deltaX
  
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    // 垂直滚动
    const newScrollTop = Math.max(0, Math.min(scrollHeight.value - clientHeight.value, scrollTop.value + deltaY))
    scrollTop.value = newScrollTop
  } else {
    // 水平滚动
    const newScrollLeft = Math.max(0, Math.min(scrollWidth.value - clientWidth.value, scrollLeft.value + deltaX))
    scrollLeft.value = newScrollLeft
  }
  
  showScrollbars()
}

// 垂直拖拽
const startVerticalDrag = (event: MouseEvent) => {
  event.preventDefault()
  isDragging.value = true
  dragType.value = 'vertical'
  dragStartPos.value = event.clientY
  dragStartScroll.value = scrollTop.value
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
}

// 水平拖拽
const startHorizontalDrag = (event: MouseEvent) => {
  event.preventDefault()
  isDragging.value = true
  dragType.value = 'horizontal'
  dragStartPos.value = event.clientX
  dragStartScroll.value = scrollLeft.value
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
}

// 处理拖拽
const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  if (dragType.value === 'vertical') {
    const deltaY = event.clientY - dragStartPos.value
    const ratio = deltaY / (clientHeight.value - (clientHeight.value * clientHeight.value / scrollHeight.value))
    const newScrollTop = Math.max(0, Math.min(scrollHeight.value - clientHeight.value, dragStartScroll.value + ratio * (scrollHeight.value - clientHeight.value)))
    scrollTop.value = newScrollTop
  } else if (dragType.value === 'horizontal') {
    const deltaX = event.clientX - dragStartPos.value
    const ratio = deltaX / (clientWidth.value - (clientWidth.value * clientWidth.value / scrollWidth.value))
    const newScrollLeft = Math.max(0, Math.min(scrollWidth.value - clientWidth.value, dragStartScroll.value + ratio * (scrollWidth.value - clientWidth.value)))
    scrollLeft.value = newScrollLeft
  }
}

// 结束拖拽
const endDrag = () => {
  isDragging.value = false
  dragType.value = null
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  
  hideScrollbars()
}

// 监听容器尺寸变化
const resizeObserver = new ResizeObserver(() => {
  nextTick(() => {
    updateDimensions()
  })
})

onMounted(() => {
  if (scrollableContainer.value) {
    resizeObserver.observe(scrollableContainer.value)
  }
  
  if (contentContainer.value) {
    resizeObserver.observe(contentContainer.value)
  }
  
  nextTick(() => {
    updateDimensions()
    
    // 监听内容变化
    if (contentContainer.value) {
      const mutationObserver = new MutationObserver(() => {
        nextTick(() => {
          updateDimensions()
        })
      })
      
      mutationObserver.observe(contentContainer.value, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })
      
      // 在组件卸载时断开连接
      onUnmounted(() => {
        mutationObserver.disconnect()
      })
    }
  })
})

onUnmounted(() => {
  resizeObserver.disconnect()
  
  if (scrollbarFadeTimer.value) {
    clearTimeout(scrollbarFadeTimer.value)
  }
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
})

// 暴露方法给父组件
const scrollTo = (top: number, left = 0) => {
  scrollTop.value = Math.max(0, Math.min(scrollHeight.value - clientHeight.value, top))
  scrollLeft.value = Math.max(0, Math.min(scrollWidth.value - clientWidth.value, left))
}

defineExpose({
  scrollTo
})
</script>

<style scoped>
.scrollable-content-wrapper {
  position: relative;
  max-height: 240px;
  height: auto;
}

.scrollable-content-container {
  transition: transform 0.1s ease-out;
  overflow: visible;
  box-sizing: border-box;
}
</style>
