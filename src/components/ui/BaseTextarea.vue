<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    label?: string
    error?: string
    rows?: number
  }>(),
  { rows: 3 },
)

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">{{ label }}</label>
    <textarea
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :rows="rows"
      class="field__control"
      :class="{ 'field__control--invalid': Boolean(error) }"
      :aria-invalid="error ? true : undefined"
      :aria-errormessage="error ? `${id}-error` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: space(1.5);

  &__label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-ink-soft;
  }

  &__control {
    @include field-control;
    resize: vertical;
    min-height: 72px;

    &--invalid {
      @include field-control-invalid;
    }
  }

  &__error {
    font-size: $font-size-sm;
    color: $color-danger;
  }
}
</style>
