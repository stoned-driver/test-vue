<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    pill?: boolean
  }>(),
  { width: '100%', height: '14px', pill: false },
)
</script>

<template>
  <span
    class="skeleton"
    :class="{ 'skeleton--pill': pill }"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.skeleton {
  display: inline-block;
  background: $color-surface-muted;
  border-radius: $radius-sm;
  animation: skeleton-pulse 1.4s $ease-out infinite;

  &--pill {
    border-radius: $radius-pill;
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}
</style>
