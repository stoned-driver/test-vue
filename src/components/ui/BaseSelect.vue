<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

export interface SelectOption {
  value: string
  label: string
}

defineProps<{
  options: SelectOption[]
  label?: string
  error?: string
}>()

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">{{ label }}</label>
    <span class="field__wrap">
      <select
        :id="id"
        v-model="model"
        v-bind="$attrs"
        class="field__control"
        :class="{ 'field__control--invalid': Boolean(error) }"
        :aria-invalid="error ? true : undefined"
        :aria-errormessage="error ? `${id}-error` : undefined"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <svg class="field__chevron" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
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

  &__wrap {
    position: relative;
    display: block;
  }

  &__control {
    @include field-control;
    appearance: none;
    padding-right: space(8);
    cursor: pointer;

    &--invalid {
      @include field-control-invalid;
    }
  }

  &__chevron {
    position: absolute;
    top: 50%;
    right: space(3);
    width: 12px;
    height: 12px;
    transform: translateY(-50%);
    color: $color-ink-faint;
    pointer-events: none;
  }

  &__error {
    font-size: $font-size-sm;
    color: $color-danger;
  }
}
</style>
