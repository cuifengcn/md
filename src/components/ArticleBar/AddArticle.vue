<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDisplayStore, useStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import Button from '../ui/button/Button.vue'

const store = useStore()
const displayStore = useDisplayStore()

const { isShowAddArticleDialog } = storeToRefs(displayStore)

const form = ref({
  name: ``,
})

function addArticle() {
  if (!form.value.name) {
    ElMessage.warning(`请输入名称`)
  }
  else {
    store.addArticle({
      title: form.value.name,
    })
    isShowAddArticleDialog.value = false
  }
}
function onUpdate(val: boolean) {
  if (!val) {
    isShowAddArticleDialog.value = false
  }
}
</script>

<template>
  <el-row class="h-15 w-full" align="middle">
    <Button
      variant="outline"
      class="w-full"
      @click="() => (isShowAddArticleDialog = true)">
      ＋新建文章
    </Button>
  </el-row>
  <Dialog :open="isShowAddArticleDialog" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新增文章</DialogTitle>
      </DialogHeader>
      <el-form
        class="mt-4"
        :model="form"
        @submit="(event: Event) => event.preventDefault()">
        <el-form-item label="名称">
          <el-input
            v-model="form.name"
            placeholder="输入文章名称"
            maxlength="50"
            show-word-limit
            autofocus
            @keyup.enter="addArticle" />
        </el-form-item>
      </el-form>
      <DialogFooter>
        <Button
          variant="outline"
          @click="() => (isShowAddArticleDialog = false)">
          取 消
        </Button>
        <Button @click="addArticle">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss"></style>
