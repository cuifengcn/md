<script setup lang="ts">
import { cn } from '@/lib/utils';
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes[`class`] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    :class="
      cn(
        'px-5 h-[45px] flex-1 flex items-center justify-center text-[14px] leading-none text-mauve11 select-none  rounded-tl-md  hover:text-green data-[state=active]:text-green outline-none cursor-pointer focus:outline-none focus:none',
        props.class
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </TabsTrigger>
</template>
