<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTableSort } from '@/composables/useTableSort'
import type { ProjectListItem } from '@/types'
import { formatDate } from '@/utils/date'
import { PROJECT_STATUS_LABELS } from '@/utils/labels'

const props = defineProps<{
  items: ProjectListItem[]
  loading: boolean
  filtered: boolean
}>()

const emit = defineEmits<{
  open: [id: number]
  create: []
  reset: []
}>()

interface Column {
  key: keyof ProjectListItem & string
  label: string
}

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Назва' },
  { key: 'taskCount', label: 'Завдання' },
  { key: 'status', label: 'Статус' },
  { key: 'createdAt', label: 'Створено' },
]

const { sortedItems, toggleSort, sortDirection, ariaSort } = useTableSort<ProjectListItem>(
  () => props.items,
  {
    initial: { key: 'createdAt', direction: 'desc' },
    persistKey: 'planer:projects:sort',
  },
)

const { isResizing, startResize, getWidthStyle } = useColumnResize('projects', {
  id: 72,
  name: 340,
  taskCount: 130,
  status: 140,
  createdAt: 160,
})
</script>

<template>
  <div class="table-card" :class="{ 'table-card--resizing': isResizing }">
    <table class="table">
      <colgroup>
        <col v-for="column in columns" :key="column.key" :style="getWidthStyle(column.key)" />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :aria-sort="ariaSort(column.key)"
            class="table__th"
          >
            <button type="button" class="table__sort" @click="toggleSort(column.key)">
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
      <tbody>
        <template v-if="loading">
          <tr v-for="row in 5" :key="row" class="table__row table__row--skeleton">
            <td><BaseSkeleton width="28px" /></td>
            <td><BaseSkeleton :width="`${55 + ((row * 17) % 30)}%`" /></td>
            <td><BaseSkeleton width="36px" /></td>
            <td><BaseSkeleton width="86px" height="22px" pill /></td>
            <td><BaseSkeleton width="92px" /></td>
          </tr>
        </template>
        <template v-else-if="sortedItems.length">
          <tr
            v-for="project in sortedItems"
            :key="project.id"
            class="table__row"
            tabindex="0"
            @click="emit('open', project.id)"
            @keydown.enter="emit('open', project.id)"
          >
            <td class="table__id">#{{ project.id }}</td>
            <td class="table__name">{{ project.name }}</td>
            <td>
              <span class="table__count">{{ project.taskCount }}</span>
            </td>
            <td>
              <BaseBadge :tone="project.status">
                {{ PROJECT_STATUS_LABELS[project.status] }}
              </BaseBadge>
            </td>
            <td class="table__date">{{ formatDate(project.createdAt) }}</td>
          </tr>
        </template>
        <tr v-else>
          <td :colspan="columns.length">
            <div class="table__empty">
              <p class="table__empty-title">
                {{ filtered ? 'Нічого не знайдено' : 'Поки що немає проектів' }}
              </p>
              <button
                v-if="filtered"
                type="button"
                class="table__empty-action"
                @click="emit('reset')"
              >
                Скинути фільтри
              </button>
              <button v-else type="button" class="table__empty-action" @click="emit('create')">
                Створити перший проект
              </button>
            </div>
          </td>
        </tr>
      </tbody>
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
  min-width: 720px;
  table-layout: fixed;
  border-collapse: collapse;

  &__th {
    position: relative;
    padding: 0;
    border-bottom: 1px solid $color-border;
    text-align: left;
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: space(1);
    width: 100%;
    padding: space(3) space(4);
    font-size: $font-size-xs;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: $color-ink-faint;
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
    padding: space(3) space(4);
    border-bottom: 1px solid $color-border;
    font-size: $font-size-base;
    @include truncate;
  }

  tr:last-child td {
    border-bottom: none;
  }

  &__row {
    cursor: pointer;
    transition: background $duration-fast $ease-out;

    &:hover:not(&--skeleton) {
      background: rgba($color-surface-soft, 0.6);
    }

    @include focus-ring;
  }

  &__id {
    color: $color-ink-faint;
    font-variant-numeric: tabular-nums;
  }

  &__name {
    font-weight: 600;
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    padding: space(0.5) space(2);
    border-radius: $radius-pill;
    background: $color-surface-soft;
    color: $color-ink-soft;
    font-size: $font-size-sm;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__date {
    color: $color-ink-soft;
    font-variant-numeric: tabular-nums;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: space(2);
    padding: space(10) space(4);
    text-align: center;
  }

  &__empty-title {
    color: $color-ink-faint;
  }

  &__empty-action {
    font-weight: 600;
    color: $color-accent-strong;
    border-radius: $radius-sm;
    padding: space(1) space(2);
    transition: opacity $duration-fast $ease-out;
    @include focus-ring;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
