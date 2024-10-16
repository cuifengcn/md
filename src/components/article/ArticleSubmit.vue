<script setup lang="ts">
import type { PostArticleAccount } from '@/types'
import { useDisplayStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { Dialog, DialogContent } from '../ui/dialog'

const props = defineProps({
  form: Object as () => {
    title?: string
    desc?: string
    thumb?: string
    content?: string
  },
  selectedAccounts: {
    type: Array as () => PostArticleAccount[],
    default: () => [],
  },
})
const displayStore = useDisplayStore()
const { isShowArticleSubmitDialog } = storeToRefs(displayStore)

const submitting = ref(false)
const taskStatus = ref()

function post() {
  if (!props.form)
    return
  if (props.selectedAccounts.length === 0)
    return

  window.$syncer?.addTask(
    {
      post: {
        title: props.form.title,
        content: props.form.content,
        markdown: props.form.content,
        thumb: props.form.thumb,
        desc: props.form.desc,
      },
      accounts: props.selectedAccounts,
    },
    (newStatus) => {
      taskStatus.value = newStatus
    },
    () => {
      submitting.value = false
    },
  )

  submitting.value = true
}

watch(isShowArticleSubmitDialog, (val) => {
  if (val) {
    post()
  }
})

function onUpdate(val: boolean) {
  if (!val) {
    // if (submitting.value) return;
    displayStore.isShowArticleSubmitDialog = false
  }
}
</script>

<template>
  <Dialog :open="isShowArticleSubmitDialog" @update:open="onUpdate">
    <DialogContent>
      <DialogTitle>提交发布任务</DialogTitle>
      <div v-if="!taskStatus?.accounts">
        等待发布..
      </div>
      <div v-else class="max-h-[600px] overflow-y-scroll">
        <div
          v-for="account in taskStatus?.accounts"
          :key="account.uid"
          class="account-item taskStatus">
          <el-row align="middle" class="mb-2 gap-2">
            <img
              v-if="account.icon"
              :src="account.icon ? account.icon : ''"
              class="icon h-[20px]" />
            <el-icon v-else>
              <ElIconUserFilled />
            </el-icon>
            {{ account.title }} -
            {{ account.displayName ? account.displayName : account.home }}
          </el-row>
          <span style="margin-left: 15px" :class="`${account.status} message`">
            <template v-if="account.status === 'uploading'">
              {{ account.msg || '发布中' }}
            </template>

            <template v-if="account.status === 'failed'">
              同步失败, 错误内容：{{ account.error }}
            </template>

            <template v-if="account.status === 'done' && account.editResp">
              同步成功
              <el-link
                v-if="account.type !== 'wordpress' && account.editResp"
                :href="account.editResp.draftLink"
                style="margin-left: 5px"
                referrerPolicy="no-referrer"
                target="_blank">查看草稿</el-link>
            </template>
          </span>
          <el-divider />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="less"></style>
