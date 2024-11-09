<script setup lang="ts">
import { cn } from '@/lib/utils';
import { TabsIndicator, type TabsIndicatorProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  TabsIndicatorProps & { class?: HTMLAttributes[`class`] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <TabsIndicator
    :class="
      cn(
        'absolute bottom-0 left-0 h-[2px] w-[--radix-tabs-indicator-size] translate-x-[--radix-tabs-indicator-position] rounded-full px-8 transition-[width,transform] duration-300',
        props.class
      )
    "
    v-bind="delegatedProps"
  >
    <div class="h-full w-full bg-green" />
    <slot />
  </TabsIndicator>
</template>
