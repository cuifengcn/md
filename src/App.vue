<script setup lang="ts">
import ArticleBar from '@/components/ArticleBar/index.vue'
import CodemirrorEditor from '@/views/CodemirrorEditor.vue'
import { onMounted } from 'vue'

function setVarStyle(key: string, value: any, dom = document.documentElement) {
  dom.style.setProperty(key, value)
}
/* --el-color-primary: #1fc372;
    --el-color-primary-light-3: #5ec491;
    --el-color-primary-light-5: #7dc29f;
    --el-color-primary-light-7: #97c0ab;
    --el-color-primary-light-8: #a5beb1;
    --el-color-primary-light-9: #b2beb8;
    --el-color-primary-dark-2: #1db368; */

onMounted(() => {
  setVarStyle(`--el-color-primary`, `#1fc372`)
  setVarStyle(`--el-color-primary-light-3`, `#5ec491`)
  setVarStyle(`--el-color-primary-light-5`, `#7dc29f`)
  setVarStyle(`--el-color-primary-light-7`, `#97c0ab`)
  setVarStyle(`--el-color-primary-light-8`, `#a5beb1`)
  setVarStyle(`--el-color-primary-light-9`, `#b2beb8`)
  setVarStyle(`--el-color-primary-dark-2`, `#1db368`)
})
</script>

<template>
  <el-config-provider>
    <el-row class="h-screen w-screen">
      <el-col :span="3">
        <ArticleBar />
      </el-col>
      <el-col :span="21">
        <CodemirrorEditor />
      </el-col>
    </el-row>
  </el-config-provider>
</template>

<style lang="less">
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

// 抵消下拉菜单开启时带来的样式
body {
  pointer-events: initial !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
}

/* CSS-hints */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow-y: auto;
  margin: 0;
  padding: 2px;
  border-radius: 4px;
  max-height: 20em;
  min-width: 200px;
  font-size: 12px;
  font-family: monospace;

  color: #333333;
  background-color: #ffffff;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.CodeMirror-hint {
  margin-top: 10px;
  padding: 4px 6px;
  border-radius: 2px;
  white-space: pre;
  color: #000000;
  cursor: pointer;

  &:first-of-type {
    margin-top: 0;
  }
  &:hover {
    background: #f0f0f0;
  }
}

// 修复分栏线负数 margin 导致的轴向滚动条
.el-dropdown-menu__item--divided:before {
  margin: 0;
}

// 修复颜色选择器下拉箭头位置
.el-icon.el-color-picker__icon.is-icon-arrow-down {
  position: absolute;
}
</style>
