<script setup lang="ts">
import ArticleSubmit from '@/components/article/ArticleSubmit.vue'
import ArticleSync from '@/components/article/ArticleSync.vue'
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

interface Form {
  title?: string
  desc?: string
  thumb?: string
  content?: string
  auto?: {
    title?: string
    desc?: string
    thumb?: string
    content?: string
  }
}

const store = useStore()
const displayStore = useDisplayStore()
const { output } = storeToRefs(store)

const dialogVisible = ref(false)

const form = ref<Form>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  auto: {},
})

const selectedAccounts = ref([])

function prePost() {
  let auto = {}
  try {
    auto = {
      thumb: document.querySelector<HTMLImageElement>(`#output img`)?.src || ``,
      title:
        [1, 2, 3, 4, 5, 6]
          .map(h => document.querySelector(`#output h${h}`)!)
          // eslint-disable-next-line antfu/consistent-chaining
          .filter(h => h)[0].textContent || ``,
      desc: document.querySelector(`#output p`)!.textContent || ``,
      content: output.value,
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  form.value = {
    ...auto,
    auto,
  }
  dialogVisible.value = true
}

function post() {
  if (!form.value.title) {
    ElMessage.warning(`请输入标题`)
    return
  }
  if (!form.value.desc) {
    ElMessage.warning(`请输入描述`)
    return
  }
  if (!form.value.content) {
    ElMessage.warning(`文章内容为空`)
    return
  }
  if (!window.$syncer) {
    ElMessage.warning(`请先安装插件`)
    return
  }
  displayStore.isShowArticleSubmitDialog = true
  dialogVisible.value = false
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}
</script>

<template>
  <Button variant="outline" @click="prePost">
    发布
  </Button>
  <ArticleSubmit :form="form" :selected-accounts="selectedAccounts" />

  <Dialog :open="dialogVisible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>发布</DialogTitle>
      </DialogHeader>
      <el-alert
        title="注：此功能由第三方浏览器插件支持，本平台不保证安全性。"
        type="info"
        show-icon />
      <el-form class="postInfo" label-width="50" :model="form">
        <el-form-item label="封面">
          <el-input v-model="form.thumb" placeholder="自动提取第一张图" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="自动提取第一个标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="4"
            placeholder="自动提取第一个段落" />
        </el-form-item>
      </el-form>
      <ArticleSync v-model="selectedAccounts" :form="form" />

      <DialogFooter>
        <Button variant="outline" @click="dialogVisible = false">
          取 消
        </Button>
        <Button @click="post">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
