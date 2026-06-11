<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTableSort } from '@/composables/useTableSort'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { TASK_STATUS_RANK, TaskStatus, type Task } from '@/types'
import { formatDayMonth, isOverdue } from '@/utils/date'
import { TASK_STATUS_LABELS } from '@/utils/labels'

const props = defineProps<{
  tasks: Task[]
  loading: boolean
  /** false, коли активні фільтри — індекси рядків не збігаються з порядком проекту */
  dragEnabled: boolean
}>()

interface Column {
  key: 'id' | 'title' | 'assignee' | 'status' | 'dueDate'
  label: string
  sortable: boolean
}

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: false },
  { key: 'title', label: 'Назва', sortable: false },
  { key: 'assignee', label: 'Виконавець', sortable: false },
  { key: 'status', label: 'Статус', sortable: true },
  { key: 'dueDate', label: 'Термін', sortable: true },
]

const { sortState, sortedItems, toggleSort, sortDirection, ariaSort } = useTableSort<Task>(
  () => props.tasks,
  {
    persistKey: 'planer:tasks:sort',
    comparators: {
      status: (a, b) => TASK_STATUS_RANK[a.status] - TASK_STATUS_RANK[b.status],
    },
  },
)

const { isResizing, startResize, getWidthStyle } = useColumnResize('tasks', {
  id: 64,
  title: 320,
  assignee: 190,
  status: 150,
  dueDate: 120,
})

const { onTableReorder, onDragStart, onDragEnd, isDragging } = useTaskDrag()

/** Перетягування можливе лише в «природному» порядку: без сортування і фільтрів */
const canDrag = computed(() => props.dragEnabled && sortState.value === null)

/** Локальна копія для SortableJS — джерело правди оновлюється через стор */
const localRows = ref<Task[]>([])

watch(
  sortedItems,
  (rows) => {
    localRows.value = [...rows]
  },
  { immediate: true },
)

function overdue(task: Task): boolean {
  return task.status !== TaskStatus.Done && isOverdue(task.dueDate)
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}
</script>

<template>
  <div class="table-card" :class="{ 'table-card--resizing': isResizing }">
    <table class="table" :class="{ 'table--dragging': isDragging }">
      <colgroup>
        <col class="table__handle-col" />
        <col v-for="column in columns" :key="column.key" :style="getWidthStyle(column.key)" />
      </colgroup>
      <thead>
        <tr>
          <th class="table__th" aria-label="Перетягування рядків" />
          <th
            v-for="column in columns"
            :key="column.key"
            :aria-sort="column.sortable ? ariaSort(column.key) : undefined"
            class="table__th"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="table__sort"
              @click="toggleSort(column.key)"
            >
              {{ column.label }}
              <svg
                class="table__arrow"
                :class="{
                  'table__arrow--asc': sortDirection(column.key) === 'asc',
                  'table__arrow--desc': sortDirection(column.key) === 'desc',
                }"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3-3 3 3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <span v-else class="table__label">{{ column.label }}</span>
            <span
              class="table__resize"
              role="separator"
              aria-orientation="vertical"
              :aria-label="`Змінити ширину колонки «${column.label}»`"
              @pointerdown="startResize(column.key, $event)"
            />
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr v-for="row in 4" :key="row">
          <td />
          <td><BaseSkeleton width="28px" /></td>
          <td><BaseSkeleton :width="`${50 + ((row * 23) % 35)}%`" /></td>
          <td><BaseSkeleton width="120px" /></td>
          <td><BaseSkeleton width="92px" height="22px" pill /></td>
          <td><BaseSkeleton width="56px" /></td>
        </tr>
      </tbody>
      <tbody v-else-if="!localRows.length">
        <tr>
          <td :colspan="columns.length + 1">
            <div class="table__empty">
              <p>Немає завдань за цими умовами</p>
            </div>
          </td>
        </tr>
      </tbody>
      <VueDraggable
        v-else
        v-model="localRows"
        tag="tbody"
        handle=".table__grip"
        ghost-class="row-ghost"
        :animation="200"
        :disabled="!canDrag"
        @start="onDragStart"
        @end="onDragEnd"
        @update="onTableReorder"
      >
        <tr
          v-for="task in localRows"
          :key="task.id"
          :data-task-id="task.id"
          class="table__row"
          :class="{ 'table__row--done': task.status === 'done' }"
        >
          <td class="table__handle">
            <span
              class="table__grip"
              :class="{ 'table__grip--disabled': !canDrag }"
              :title="
                canDrag
                  ? 'Перетягніть, щоб змінити порядок'
                  : 'Скиньте сортування й фільтри, щоб змінювати порядок'
              "
            >
              <svg viewBox="0 0 8 14" aria-hidden="true">
                <circle cx="2" cy="2.5" r="1.15" fill="currentColor" />
                <circle cx="6" cy="2.5" r="1.15" fill="currentColor" />
                <circle cx="2" cy="7" r="1.15" fill="currentColor" />
                <circle cx="6" cy="7" r="1.15" fill="currentColor" />
                <circle cx="2" cy="11.5" r="1.15" fill="currentColor" />
                <circle cx="6" cy="11.5" r="1.15" fill="currentColor" />
              </svg>
            </span>
          </td>
          <td class="table__id">#{{ task.id }}</td>
          <td class="table__title">{{ task.title }}</td>
          <td>
            <span v-if="task.assignee" class="table__assignee">
              <span class="table__avatar">{{ initials(task.assignee) }}</span>
              {{ task.assignee }}
            </span>
            <span v-else class="table__none">—</span>
          </td>
          <td>
            <BaseBadge :tone="task.status">{{ TASK_STATUS_LABELS[task.status] }}</BaseBadge>
          </td>
          <td class="table__due" :class="{ 'table__due--overdue': overdue(task) }">
            {{ formatDayMonth(task.dueDate) }}
          </td>
        </tr>
      </VueDraggable>
    </table>
  </div>
</template>

<style scoped lang="scss">
.table-card {
  @include card;
  border-radius: $radius-lg;
  overflow-x: auto;

  &--resizing {
    cursor: col-resize;
    user-select: none;
  }
}

.table {
  width: 100%;
  min-width: 760px;
  table-layout: fixed;
  border-collapse: collapse;

  &__handle-col {
    width: 36px;
  }

  &__th {
    position: relative;
    padding: 0;
    border-bottom: 1px solid $color-border;
    text-align: left;
  }

  &__label,
  &__sort {
    display: flex;
    align-items: center;
    gap: space(1);
    width: 100%;
    padding: space(3) space(3);
    font-size: $font-size-xs;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: $color-ink-faint;
  }

  &__sort {
    transition: color $duration-fast $ease-out;
    @include focus-ring;

    &:hover {
      color: $color-ink;
    }
  }

  &__arrow {
    width: 10px;
    height: 10px;
    opacity: 0;
    transition:
      opacity $duration-fast $ease-out,
      transform $duration-fast $ease-spring;

    &--asc {
      opacity: 1;
    }

    &--desc {
      opacity: 1;
      transform: rotate(180deg);
    }
  }

  &__sort:hover &__arrow {
    opacity: 0.6;

    &--asc,
    &--desc {
      opacity: 1;
    }
  }

  &__resize {
    position: absolute;
    top: 0;
    right: -4px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    z-index: 1;
    touch-action: none;

    &::after {
      content: '';
      position: absolute;
      top: 20%;
      bottom: 20%;
      left: 3px;
      width: 2px;
      border-radius: 1px;
      background: transparent;
      transition: background $duration-fast $ease-out;
    }

    &:hover::after {
      background: $color-accent;
    }
  }

  td {
    padding: space(2.5) space(3);
    border-bottom: 1px solid $color-border;
    font-size: $font-size-base;
    @include truncate;
  }

  tr:last-child td {
    border-bottom: none;
  }

  &__row {
    transition: background $duration-fast $ease-out;

    &:hover {
      background: rgba($color-surface-soft, 0.6);
    }

    &--done .table__title {
      text-decoration: line-through;
      opacity: 0.55;
    }
  }

  &--dragging &__row:hover {
    background: transparent;
  }

  &__handle {
    padding-right: 0;
  }

  &__grip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: $radius-sm;
    color: rgba(61, 54, 46, 0.22);
    cursor: grab;
    opacity: 0;
    transition:
      opacity $duration-fast $ease-out,
      color $duration-fast $ease-out;

    svg {
      width: 8px;
      height: 14px;
    }

    &--disabled {
      cursor: not-allowed;
    }
  }

  &__row:hover &__grip {
    opacity: 1;

    &:hover:not(&--disabled) {
      color: $color-ink-soft;
    }
  }

  &__id {
    color: $color-ink-faint;
    font-variant-numeric: tabular-nums;
  }

  &__title {
    font-weight: 500;
  }

  &__assignee {
    display: inline-flex;
    align-items: center;
    gap: space(2);
  }

  &__avatar {
    width: 20px;
    height: 20px;
    flex: none;
    border-radius: 50%;
    background: $color-surface-soft;
    color: $color-ink-soft;
    font-size: 9px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__none {
    color: $color-ink-faint;
  }

  &__due {
    color: $color-ink-soft;
    font-variant-numeric: tabular-nums;

    &--overdue {
      color: $color-danger;
      font-weight: 600;
    }
  }

  &__empty {
    padding: space(10) space(4);
    text-align: center;
    color: $color-ink-faint;
  }

  :deep(.row-ghost) {
    opacity: 0.4;
    background: rgba($color-accent, 0.06);

    td {
      border-bottom: 1.5px dashed rgba(61, 54, 46, 0.25);
    }
  }
}
</style>
