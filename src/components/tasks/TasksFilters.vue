<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect, { type SelectOption } from '@/components/ui/BaseSelect.vue'
import { TaskStatus } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/labels'

const props = defineProps<{
  assignees: string[]
  filtered: boolean
}>()

const emit = defineEmits<{ reset: [] }>()

const assignee = defineModel<string>('assignee', { default: 'all' })
const status = defineModel<TaskStatus | 'all'>('status', { default: 'all' })

const assigneeOptions = computed<SelectOption[]>(() => [
  { value: 'all', label: 'Усі виконавці' },
  { value: 'none', label: 'Без виконавця' },
  ...props.assignees.map((name) => ({ value: name, label: name })),
])

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'Усі статуси' },
  ...Object.values(TaskStatus).map((value) => ({ value, label: TASK_STATUS_LABELS[value] })),
]
</script>

<template>
  <div class="filters">
    <BaseSelect
      v-model="assignee"
      :options="assigneeOptions"
      class="filters__select"
      aria-label="Фільтр за виконавцем"
    />
    <BaseSelect
      v-model="status"
      :options="statusOptions"
      class="filters__select"
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

  &__select {
    width: 200px;
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

    &__select {
      width: calc(50% - #{space(1.5)});
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
