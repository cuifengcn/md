<script setup lang="ts">
import type { TabsRootEmits, TabsRootProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { TabsRoot, useForwardPropsEmits } from 'radix-vue';

const props = defineProps<
  TabsRootProps & { class?: HTMLAttributes[`class`] }
>();
const emits = defineEmits<TabsRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <TabsRoot :class="cn('flex flex-col w-full', props.class)" v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
