<script lang="ts">
/** Стек відкритих модалок (рівень модуля — спільний для всіх інстансів):
 *  Esc і скрол-лок мають працювати лише для верхньої модалки */
const modalStack: symbol[] = []

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const panel = ref<HTMLElement | null>(null)
const stackId = Symbol('modal')

let previouslyFocused: HTMLElement | null = null

function focusables(): HTMLElement[] {
  return panel.value ? [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)] : []
}

function isTopModal(): boolean {
  return modalStack[modalStack.length - 1] === stackId
}

function onKeydown(event: KeyboardEvent): void {
  if (!isTopModal()) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
    return
  }
  if (event.key === 'Tab') {
    const items = focusables()
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) return
    const active = document.activeElement
    if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

function openModal(): void {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  modalStack.push(stackId)
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown, true)
  void nextTick(() => {
    // спершу — перший елемент тіла модалки (поле форми), не кнопка «Закрити»
    const bodyFocusable = panel.value?.querySelector<HTMLElement>(
      `.modal__body :is(${FOCUSABLE_SELECTOR})`,
    )
    const target = bodyFocusable ?? focusables()[0] ?? panel.value
    target?.focus()
  })
}

function closeModal(): void {
  const index = modalStack.indexOf(stackId)
  if (index !== -1) modalStack.splice(index, 1)
  if (modalStack.length === 0) document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown, true)
  previouslyFocused?.focus()
  previouslyFocused = null
}

watch(
  () => props.open,
  (open) => {
    if (open) openModal()
    else closeModal()
  },
)

onBeforeUnmount(() => {
  if (props.open) closeModal()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('close')">
        <div
          ref="panel"
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
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
    outline: none;
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
