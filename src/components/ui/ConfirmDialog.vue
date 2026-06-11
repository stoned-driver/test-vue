<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
  }>(),
  { confirmLabel: 'Видалити' },
)

const emit = defineEmits<{ confirm: []; close: [] }>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <p class="confirm__message">{{ message }}</p>
    <footer class="confirm__actions">
      <BaseButton variant="ghost" type="button" @click="emit('close')">Скасувати</BaseButton>
      <BaseButton variant="danger" type="button" @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </footer>
  </BaseModal>
</template>

<style scoped lang="scss">
.confirm {
  &__message {
    color: $color-ink-soft;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: space(2);
    margin-top: space(6);
  }
}
</style>
