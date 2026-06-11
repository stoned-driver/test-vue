<script setup lang="ts">
import { onBeforeUnmount, useId, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{ close: [] }>()

const titleId = useId()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('close')">
        <div class="modal__panel" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <header class="modal__head">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <button class="modal__close" type="button" aria-label="Закрити" @click="emit('close')">
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M3 3l8 8M11 3l-8 8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: space(6);
  background: rgba(61, 54, 46, 0.35);
  backdrop-filter: blur(6px);

  &__panel {
    width: min(480px, 100%);
    background: $color-surface;
    border-radius: $radius-lg;
    box-shadow: $shadow-pop;
    padding: space(6);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: space(5);
  }

  &__title {
    font-size: $font-size-lg;
  }

  &__close {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: $color-ink-faint;
    transition:
      background $duration-fast $ease-out,
      color $duration-fast $ease-out;
    @include focus-ring;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $color-surface-soft;
      color: $color-ink;
    }
  }
}

.modal-enter-active {
  transition: opacity $duration-base $ease-out;

  .modal__panel {
    transition:
      transform $duration-base $ease-spring,
      opacity $duration-base $ease-out;
  }
}

.modal-leave-active {
  transition: opacity $duration-fast $ease-out;

  .modal__panel {
    transition:
      transform $duration-fast $ease-out,
      opacity $duration-fast $ease-out;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__panel {
    transform: translateY(10px) scale(0.96);
    opacity: 0;
  }
}
</style>
