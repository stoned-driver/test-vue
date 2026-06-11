<script setup lang="ts">
import { useTaskDrag } from '@/composables/useTaskDrag'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types'
import KanbanColumn from './KanbanColumn.vue'

defineProps<{
  grouped: Record<TaskStatus, Task[]>
  dragEnabled: boolean
}>()

const emit = defineEmits<{ edit: [task: Task] }>()

const { isDragging, onDragStart, onDragEnd, onBoardDrop } = useTaskDrag()
</script>

<template>
  <div class="board">
    <KanbanColumn
      v-for="status in TASK_STATUSES"
      :key="status"
      :status="status"
      :tasks="grouped[status]"
      :drag-enabled="dragEnabled"
      :dragging="isDragging"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @drop="onBoardDrop"
      @edit="emit('edit', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: space(3);
  align-items: start;

  @include below($breakpoint-md) {
    grid-template-columns: 1fr;
  }
}
</style>
