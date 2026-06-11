<script setup lang="ts">
import { computed } from 'vue'
import { TaskStatus, type Task } from '@/types'
import { formatDayMonth, isOverdue } from '@/utils/date'

const props = defineProps<{ task: Task }>()

const overdue = computed(
  () => props.task.status !== TaskStatus.Done && isOverdue(props.task.dueDate),
)

const initials = computed(() => {
  if (!props.task.assignee) return null
  return props.task.assignee
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
})
</script>

<template>
  <article class="card" :class="{ 'card--done': task.status === 'done' }">
    <h3 class="card__title">{{ task.title }}</h3>
    <div class="card__meta">
      <span class="card__id">#{{ task.id }}</span>
      <span class="card__due" :class="{ 'card__due--overdue': overdue }">
        {{ formatDayMonth(task.dueDate) }}
      </span>
      <span v-if="initials" class="card__avatar" :title="task.assignee ?? undefined">
        {{ initials }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.card {
  background: $color-surface;
  border: 1px solid rgba(61, 54, 46, 0.05);
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  padding: space(2.5) space(3);
  cursor: grab;
  transition:
    box-shadow $duration-fast $ease-out,
    transform $duration-fast $ease-out;

  &:hover {
    box-shadow: 0 3px 8px rgba(61, 54, 46, 0.09);
  }

  &--done .card__title {
    text-decoration: line-through;
    opacity: 0.55;
  }

  &__title {
    font-size: $font-size-base;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: space(2);
    margin-top: space(2);
    font-size: $font-size-xs;
    color: $color-ink-faint;
    font-variant-numeric: tabular-nums;
  }

  &__due {
    &--overdue {
      color: $color-danger;
      font-weight: 600;
    }
  }

  &__avatar {
    margin-left: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: $color-surface-soft;
    color: $color-ink-soft;
    font-size: 8.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
