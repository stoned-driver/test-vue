<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)
</script>

<template>
  <button :type="type" :disabled="disabled" class="button" :class="`button--${variant}`">
    <slot />
  </button>
</template>

<style scoped lang="scss">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: space(1.5);
  padding: space(2) space(4);
  border-radius: $radius-pill;
  font-size: $font-size-base;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  transition:
    background $duration-fast $ease-out,
    color $duration-fast $ease-out,
    transform $duration-fast $ease-spring,
    box-shadow $duration-fast $ease-out;
  @include focus-ring;

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--primary {
    background: $color-accent;
    color: $color-on-accent;
    box-shadow: 0 1px 2px rgba(242, 85, 74, 0.35);

    &:hover:not(:disabled) {
      background: $color-accent-strong;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-ink-soft;
    border: 1px solid $color-border-strong;

    &:hover:not(:disabled) {
      background: $color-surface-soft;
      color: $color-ink;
    }
  }

  &--danger {
    background: rgba($color-danger, 0.1);
    color: $color-danger;

    &:hover:not(:disabled) {
      background: rgba($color-danger, 0.16);
    }
  }
}
</style>
