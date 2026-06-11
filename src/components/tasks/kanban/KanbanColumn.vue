<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { TaskDragEvent } from '@/composables/useTaskDrag'
import type { Task, TaskStatus } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/labels'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  status: TaskStatus
  tasks: Task[]
  dragEnabled: boolean
  dragging: boolean
}>()

const emit = defineEmits<{
  drop: [status: TaskStatus, event: TaskDragEvent]
  dragstart: []
  dragend: []
}>()

/**
 * Локальна копія для SortableJS: бібліотека мутує масив під час
 * перетягування, а джерело правди (стор) оновлюється подіями drop.
 */
const localTasks = ref<Task[]>([...props.tasks])

watch(
  () => props.tasks,
  (tasks) => {
    localTasks.value = [...tasks]
  },
)
</script>

<template>
  <section class="column" :class="[`column--${status}`, { 'column--target': dragging }]">
    <header class="column__head">
      <h2 class="column__title">{{ TASK_STATUS_LABELS[status] }}</h2>
      <span class="column__count">{{ tasks.length }}</span>
    </header>
    <VueDraggable
      v-model="localTasks"
      group="tasks"
      class="column__list"
      ghost-class="card-ghost"
      drag-class="card-drag"
      :animation="220"
      :disabled="!dragEnabled"
      @start="emit('dragstart')"
      @end="emit('dragend')"
      @add="emit('drop', status, $event)"
      @update="emit('drop', status, $event)"
    >
      <TaskCard
        v-for="task in localTasks"
        :key="task.id"
        :task="task"
        :data-task-id="task.id"
        class="column__card"
      />
    </VueDraggable>
    <p v-if="!tasks.length" class="column__empty">Перетягніть завдання сюди</p>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:map';

.column {
  position: relative;
  border-radius: $radius-lg;
  padding: space(2.5);
  display: flex;
  flex-direction: column;
  min-height: 280px;
  transition: box-shadow $duration-base $ease-out;

  @each $name, $pair in $task-status-colors {
    &--#{$name} {
      background: map.get($pair, tint);

      .column__title,
      .column__count {
        color: map.get($pair, ink);
      }
    }
  }

  &--target {
    box-shadow: inset 0 0 0 2px rgba($color-accent, 0.25);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: space(1) space(1.5) space(2.5);
  }

  &__title {
    font-size: $font-size-base;
    font-weight: 700;
    letter-spacing: 0;
  }

  &__count {
    background: rgba(255, 255, 255, 0.75);
    border-radius: $radius-pill;
    min-width: 24px;
    text-align: center;
    padding: space(0.5) space(2);
    font-size: $font-size-sm;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: space(2);
    flex: 1;
    border-radius: $radius-md;
  }

  &__card {
    touch-action: none;
  }

  &__empty {
    position: absolute;
    inset: 50% space(2) auto;
    transform: translateY(-50%);
    text-align: center;
    pointer-events: none;
    font-size: $font-size-sm;
    color: $color-ink-faint;
    opacity: 0.8;
  }

  :deep(.card-ghost) {
    opacity: 0.35;
    background: transparent;
    border: 1.5px dashed rgba(61, 54, 46, 0.3);
    box-shadow: none;

    > * {
      opacity: 0;
    }
  }

  :deep(.card-drag) {
    transform: rotate(3deg) scale(1.02);
    box-shadow: $shadow-lifted;
    cursor: grabbing;
    opacity: 1 !important;
  }
}
</style>
