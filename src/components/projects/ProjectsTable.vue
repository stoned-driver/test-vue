<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTableSort } from '@/composables/useTableSort'
import { ProjectStatus, type ProjectListItem } from '@/types'
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
  edit: [project: ProjectListItem]
  archive: [project: ProjectListItem]
  remove: [project: ProjectListItem]
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

const { isResizing, startResize, nudgeWidth, getWidthStyle } = useColumnResize('projects', {
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
        <col class="table__actions-col" />
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
              tabindex="0"
              :aria-label="`Змінити ширину колонки «${column.label}»`"
              @pointerdown="startResize(column.key, $event)"
              @keydown.left.prevent="nudgeWidth(column.key, -16)"
              @keydown.right.prevent="nudgeWidth(column.key, 16)"
            />
          </th>
          <th class="table__th" aria-label="Дії" />
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
            <td />
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
            <td class="table__actions" @click.stop>
              <button
                type="button"
                class="table__action"
                :aria-label="`Редагувати «${project.name}»`"
                title="Редагувати"
                @click="emit('edit', project)"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="m9.6 2.2 2.2 2.2-6.8 6.8-2.6.4.4-2.6 6.8-6.8Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="table__action"
                :aria-label="
                  project.status === ProjectStatus.Active
                    ? `Архівувати «${project.name}»`
                    : `Відновити «${project.name}»`
                "
                :title="project.status === ProjectStatus.Active ? 'Архівувати' : 'Відновити'"
                @click="emit('archive', project)"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M2 4h10M3 4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4M5.5 7h3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="table__action table__action--danger"
                :aria-label="`Видалити «${project.name}»`"
                title="Видалити"
                @click="emit('remove', project)"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M2.5 4h9M5 4V2.8h4V4m-6.2 0 .5 7.4a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8l.5-7.4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </template>
        <tr v-else>
          <td :colspan="columns.length + 1">
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
  min-width: 760px;
  table-layout: fixed;
  border-collapse: collapse;

  &__actions-col {
    width: 108px;
  }

  &__actions {
    text-align: right;
    white-space: nowrap;
    cursor: default;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: $radius-sm;
    color: $color-ink-faint;
    opacity: 0;
    transition:
      opacity $duration-fast $ease-out,
      background $duration-fast $ease-out,
      color $duration-fast $ease-out;
    @include focus-ring;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $color-surface-soft;
      color: $color-ink;
    }

    &--danger:hover {
      background: rgba($color-danger, 0.1);
      color: $color-danger;
    }

    &:focus-visible {
      opacity: 1;
    }
  }

  &__row:hover &__action {
    opacity: 1;
  }

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

    &:focus-visible {
      outline: none;
    }

    &:hover::after,
    &:focus-visible::after {
      background: $color-accent-strong;
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
