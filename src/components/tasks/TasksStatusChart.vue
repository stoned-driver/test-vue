<script setup lang="ts">
import { computed } from 'vue'
import { TASK_STATUSES, type TaskStatus } from '@/types'
import { TASK_STATUS_LABELS, pluralizeUk } from '@/utils/labels'

const props = defineProps<{
  distribution: Record<TaskStatus, number>
}>()

const RADIUS = 48
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Segment {
  status: TaskStatus
  value: number
  fraction: number
  offset: number
}

const total = computed(() =>
  TASK_STATUSES.reduce((sum, status) => sum + props.distribution[status], 0),
)

/** Сегменти пончика: частка + накопичений зсув, анімуються через CSS-переходи */
const segments = computed<Segment[]>(() => {
  let offset = 0
  return TASK_STATUSES.map((status) => {
    const value = props.distribution[status]
    const fraction = total.value > 0 ? value / total.value : 0
    const segment: Segment = { status, value, fraction, offset }
    offset += fraction
    return segment
  })
})

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}
</script>

<template>
  <section class="chart" aria-label="Розподіл завдань за статусами">
    <div class="chart__donut">
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <g transform="rotate(-90 60 60)">
          <circle cx="60" cy="60" :r="RADIUS" class="chart__track" />
          <circle
            v-for="segment in segments"
            :key="segment.status"
            cx="60"
            cy="60"
            :r="RADIUS"
            class="chart__arc"
            :class="`chart__arc--${segment.status}`"
            :stroke-dasharray="`${segment.fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`"
            :stroke-dashoffset="-segment.offset * CIRCUMFERENCE"
          />
        </g>
      </svg>
      <div class="chart__center">
        <strong class="chart__total">{{ total }}</strong>
        <span class="chart__total-label">{{
          pluralizeUk(total, ['завдання', 'завдання', 'завдань'])
        }}</span>
      </div>
    </div>

    <h2 class="chart__title">Завдання за статусами</h2>

    <ul class="chart__legend">
      <li v-for="segment in segments" :key="segment.status" class="chart__row">
        <span class="chart__dot" :class="`chart__dot--${segment.status}`" aria-hidden="true" />
        <span class="chart__label">{{ TASK_STATUS_LABELS[segment.status] }}</span>
        <span class="chart__value">{{ segment.value }}</span>
        <span class="chart__percent">{{ percent(segment.fraction) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:map';

.chart {
  @include card;
  border-radius: $radius-lg;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'donut title'
    'donut legend';
  column-gap: space(6);
  align-items: center;
  padding: space(4) space(5);
  margin-bottom: space(4);

  &__donut {
    grid-area: donut;
    position: relative;
    width: 116px;
    height: 116px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__track {
    fill: none;
    stroke: $color-surface-muted;
    stroke-width: 14;
  }

  &__arc {
    fill: none;
    stroke-width: 14;
    transition:
      stroke-dasharray $duration-slow $ease-out,
      stroke-dashoffset $duration-slow $ease-out;

    @each $name, $pair in $task-status-colors {
      &--#{$name} {
        stroke: map.get($pair, dot);
      }
    }
  }

  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__total {
    font-size: $font-size-xl;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &__total-label {
    font-size: $font-size-xs;
    color: $color-ink-faint;
  }

  &__title {
    grid-area: title;
    align-self: end;
    font-size: $font-size-md;
    font-weight: 700;
    letter-spacing: 0;
    margin-bottom: space(2);
  }

  &__legend {
    grid-area: legend;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: space(1.5);
    max-width: 360px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: space(2);
    font-size: $font-size-base;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;

    @each $name, $pair in $task-status-colors {
      &--#{$name} {
        background: map.get($pair, dot);
      }
    }
  }

  &__label {
    color: $color-ink-soft;
  }

  &__value {
    margin-left: auto;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__percent {
    width: 42px;
    text-align: right;
    color: $color-ink-faint;
    font-size: $font-size-sm;
    font-variant-numeric: tabular-nums;
  }

  @include below($breakpoint-md) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'title'
      'donut'
      'legend';
    row-gap: space(3);
    justify-items: center;
  }
}
</style>
