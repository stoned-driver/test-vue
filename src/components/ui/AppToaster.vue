<script setup lang="ts">
import { useToastsStore } from '@/stores/toasts.store'

const toastsStore = useToastsStore()
</script>

<template>
  <Teleport to="body">
    <div class="toaster" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastsStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.kind}`"
          role="status"
        >
          <span class="toast__icon" aria-hidden="true">
            <svg v-if="toast.kind === 'success'" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15" />
              <path
                d="m4.4 7.2 1.8 1.8 3.4-3.9"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="toast.kind === 'error'" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15" />
              <path
                d="M7 3.8v3.8m0 2.4v.1"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15" />
              <path
                d="M7 6.4v3.4m0-5.8v.1"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <p class="toast__message">{{ toast.message }}</p>
          <button
            type="button"
            class="toast__close"
            aria-label="Закрити сповіщення"
            @click="toastsStore.dismiss(toast.id)"
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.toaster {
  position: fixed;
  right: space(5);
  bottom: space(5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: space(2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: space(2.5);
  max-width: 360px;
  padding: space(2.5) space(3);
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-pop;
  pointer-events: auto;

  &--success .toast__icon {
    color: $color-success;
  }

  &--error .toast__icon {
    color: $color-danger;
  }

  &--info .toast__icon {
    color: $color-accent-strong;
  }

  &__icon {
    flex: none;
    width: 18px;
    height: 18px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__message {
    font-size: $font-size-base;
    line-height: 1.4;
  }

  &__close {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: $color-ink-faint;
    transition:
      background $duration-fast $ease-out,
      color $duration-fast $ease-out;
    @include focus-ring;

    svg {
      width: 11px;
      height: 11px;
    }

    &:hover {
      background: $color-surface-soft;
      color: $color-ink;
    }
  }
}

.toast-enter-active {
  transition:
    transform $duration-base $ease-spring,
    opacity $duration-base $ease-out;
}

.toast-leave-active {
  transition:
    transform $duration-fast $ease-out,
    opacity $duration-fast $ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}

.toast-move {
  transition: transform $duration-base $ease-out;
}
</style>
