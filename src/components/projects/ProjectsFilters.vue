<script setup lang="ts">
import BaseSelect, { type SelectOption } from '@/components/ui/BaseSelect.vue'
import { ProjectStatus } from '@/types'
import { PROJECT_STATUS_LABELS } from '@/utils/labels'

defineProps<{ filtered: boolean }>()
const emit = defineEmits<{ reset: [] }>()

const search = defineModel<string>('search', { default: '' })
const status = defineModel<ProjectStatus | 'all'>('status', { default: 'all' })

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'Усі статуси' },
  ...Object.values(ProjectStatus).map((value) => ({
    value,
    label: PROJECT_STATUS_LABELS[value],
  })),
]
</script>

<template>
  <div class="filters">
    <span class="filters__search">
      <svg class="filters__icon" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <input
        v-model="search"
        type="search"
        class="filters__input"
        placeholder="Пошук за назвою…"
        aria-label="Пошук проектів за назвою"
      />
    </span>
    <BaseSelect
      v-model="status"
      :options="statusOptions"
      class="filters__status"
      aria-label="Фільтр за статусом"
    />
    <Transition name="fade">
      <button v-if="filtered" type="button" class="filters__reset" @click="emit('reset')">
        Скинути фільтри
      </button>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.filters {
  display: flex;
  align-items: center;
  gap: space(3);
  margin-bottom: space(4);

  &__search {
    position: relative;
    flex: 1;
    max-width: 320px;
    display: block;
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: space(3);
    width: 15px;
    height: 15px;
    transform: translateY(-50%);
    color: $color-ink-faint;
    pointer-events: none;
  }

  &__input {
    @include field-control;
    padding-left: space(8);
  }

  &__status {
    width: 180px;
  }

  &__reset {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-ink-soft;
    padding: space(1.5) space(2);
    border-radius: $radius-sm;
    transition: color $duration-fast $ease-out;
    @include focus-ring;

    &:hover {
      color: $color-accent-strong;
    }
  }

  @include below($breakpoint-md) {
    flex-wrap: wrap;

    &__search {
      max-width: none;
      flex-basis: 100%;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $duration-fast $ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
