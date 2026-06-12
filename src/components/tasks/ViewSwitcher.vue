<script setup lang="ts">
export type ProjectViewMode = 'table' | 'kanban'

const model = defineModel<ProjectViewMode>({ required: true })

const modes: { value: ProjectViewMode; label: string }[] = [
  { value: 'table', label: 'Таблиця' },
  { value: 'kanban', label: 'Канбан' },
]
</script>

<template>
  <div class="switcher" role="group" aria-label="Режим перегляду завдань">
    <button
      v-for="mode in modes"
      :key="mode.value"
      type="button"
      class="switcher__option"
      :class="{ 'switcher__option--active': model === mode.value }"
      :aria-pressed="model === mode.value"
      @click="model = mode.value"
    >
      <svg v-if="mode.value === 'table'" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M2 4h10M2 7h10M2 10h10"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else viewBox="0 0 14 14" aria-hidden="true">
        <rect x="2" y="2" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="6.5" y="2" width="3" height="7" rx="1" fill="currentColor" />
        <rect x="11" y="2" width="1.5" height="5" rx="0.75" fill="currentColor" />
      </svg>
      {{ mode.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.switcher {
  display: inline-flex;
  padding: 3px;
  background: $color-surface-muted;
  border-radius: $radius-pill;

  &__option {
    display: inline-flex;
    align-items: center;
    gap: space(1.5);
    padding: space(1.5) space(3);
    border-radius: $radius-pill;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-ink-faint;
    transition:
      background $duration-base $ease-spring,
      color $duration-fast $ease-out,
      box-shadow $duration-fast $ease-out;
    @include focus-ring;

    svg {
      width: 13px;
      height: 13px;
    }

    &--active {
      background: $color-surface;
      color: $color-ink;
      box-shadow: 0 1px 2px rgba(61, 54, 46, 0.1);
    }
  }
}
</style>
