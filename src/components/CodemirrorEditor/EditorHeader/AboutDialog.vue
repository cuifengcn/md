<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

const links = [{ label: `GitHub 仓库`, url: `https://github.com/cuifengcn/md` }]

function onRedirect(url: string) {
  window.open(url, `_blank`)
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>关于</DialogTitle>
      </DialogHeader>
      <div class="text-center">
        <h3>更智能的 Markdown 编辑器</h3>
        <p>智能生成 | 多平台 | 自动发布</p>
      </div>
      <DialogFooter class="sm:justify-evenly">
        <Button
          v-for="link in links"
          :key="link.url"
          @click="onRedirect(link.url)">
          {{ link.label }}
        </Button>
        <el-link href="https://github.com/doocs/md" target="_blank">
          特别感谢
          md
          项目
        </el-link>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
