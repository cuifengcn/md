<script setup lang="ts">
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import ArticleItem from './ArticleItem.vue';

const store = useStore();

const { articles } = storeToRefs(store);
</script>

<template>
  <TransitionGroup
    tag="div"
    name="list"
    class="mb-[20px] flex flex-1 flex-col overflow-y-auto border-1 rounded"
  >
    <template v-for="item in articles" :key="item.id">
      <ArticleItem :article="item" />
    </template>
  </TransitionGroup>
  <!-- <div class="mb-[20px] flex flex-1 flex-col overflow-y-auto border-1 rounded">
    <template v-for="item in articles" :key="item.id">
      <ArticleItem :article="item" />
    </template>
  </div> -->
</template>

<style scoped lang="less">
.list-move, //* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
// .list-leave-active {
//   position: absolute;
// }
</style>
