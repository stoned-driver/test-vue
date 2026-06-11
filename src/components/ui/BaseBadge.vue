<script setup lang="ts">
defineProps<{
  tone: 'todo' | 'in_progress' | 'done' | 'active' | 'archived'
}>()
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <span class="badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped lang="scss">
@use 'sass:map';

.badge {
  display: inline-flex;
  align-items: center;
  gap: space(1.5);
  padding: space(0.5) space(2);
  border-radius: $radius-pill;
  font-size: $font-size-sm;
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  @each $name, $pair in map.merge($task-status-colors, $project-status-colors) {
    &--#{$name} {
      background: map.get($pair, tint);
      color: map.get($pair, ink);

      .badge__dot {
        background: map.get($pair, dot);
      }
    }
  }
}
</style>
