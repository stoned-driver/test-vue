<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label?: string
  error?: string
}>()

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      class="field__control"
      :class="{ 'field__control--invalid': Boolean(error) }"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
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
