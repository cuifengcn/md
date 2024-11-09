<script setup lang="ts">
import { ref } from 'vue';
import AboutDialog from './AboutDialog.vue';
import * as h from './HelpDialog/index';
import HelpDIaliog from './HelpDialog/index.vue';

const aboutDialogVisible = ref(false);
const helpDialogVisible = ref(false);
const helpDialogTitle = ref(`帮助`);
const helpDialogContent = ref([`1. 帮助文档`]);
function openHelpDialog(title: string, content: string[]) {
  helpDialogTitle.value = title;
  helpDialogContent.value = content;
  helpDialogVisible.value = true;
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger> 帮助 </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="aboutDialogVisible = true">
        <el-icon class="mr-2 h-4 w-4" />
        <span>关于</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('标题', h.headingsHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>标题</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('列表', h.listHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>列表</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('粗体/斜体/删除线', h.strongHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>粗体/斜体/删除线</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('链接', h.linkHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>链接</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('分割线', h.seperateHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>分割线</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('引用', h.quoteHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>引用</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('代码块', h.codeBlockHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>代码块</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('公式块', h.formulaHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>公式块</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('容器块', h.containerHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>容器块</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('提示块', h.tipsHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>提示块</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('图片', h.imageHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>图片</span>
      </MenubarItem>
      <MenubarItem @click="openHelpDialog('表格', h.tableHelp)">
        <el-icon class="mr-2 h-4 w-4" />
        <span>表格</span>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <AboutDialog
    :visible="aboutDialogVisible"
    @close="aboutDialogVisible = false"
  />
  <HelpDIaliog
    :visible="helpDialogVisible"
    :title="helpDialogTitle"
    :content="helpDialogContent"
    @close="helpDialogVisible = false"
  />
</template>
