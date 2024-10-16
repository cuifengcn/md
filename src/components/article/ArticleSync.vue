<script setup lang="ts">
import type { PostArticleAccount } from '@/types'
import { defineModel, onMounted, ref } from 'vue'

const selectedAccounts = defineModel<PostArticleAccount[]>({
  default: [],
})

const extensionInstalled = ref(false)
const allAccounts = ref<PostArticleAccount[]>([])

function getAccounts() {
  window.$syncer?.getAccounts((resp: PostArticleAccount[]) => {
    allAccounts.value = resp
  })
}

onMounted(() => {
  extensionInstalled.value = typeof window.$syncer != `undefined`
  getAccounts()
})
</script>

<template>
  <div v-if="extensionInstalled">
    <div class="mb-2 text-sm font-bold">
      账号
    </div>
    <el-checkbox-group
      v-model="selectedAccounts"
      class="max-h-[500px] overflow-y-auto">
      <div class="flex flex-col">
        <template v-for="account in allAccounts" :key="account.uid">
          <el-checkbox :label="account.displayName" :value="account">
            <template #default>
              <el-row align="middle" class="gap-2">
                <img
                  v-if="account.icon"
                  :src="account.icon ? account.icon : ''"
                  class="icon h-[20px]"
                  height="20" />
                <el-icon v-else>
                  <ElIconUserFilled />
                </el-icon>
                {{ account.title }} -
                {{ account.displayName ? account.displayName : account.home }}
              </el-row>
            </template>
          </el-checkbox>
        </template>
      </div>
    </el-checkbox-group>
  </div>
  <el-card v-else class="text-sm">
    未检测到插件<br />
    请安装
    <el-link
      href="https://www.wechatsync.com/?utm_source=syncicon#install"
      target="_blank">
      文章同步助手Chrome
    </el-link>
    插件
  </el-card>
</template>

<style scoped lang="less"></style>
