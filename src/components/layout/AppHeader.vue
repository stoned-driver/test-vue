<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="{ name: 'projects' }" class="header__brand">
        <span class="header__dot" aria-hidden="true" />
        <span>Планер</span>
      </RouterLink>
      <span class="header__avatar" title="Dmytro Kosianchuk">ДК</span>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba($color-bg, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $color-border;

  &__inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: space(3) space(6);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: space(2);
    font-size: $font-size-md;
    font-weight: 700;
    letter-spacing: -0.01em;
    border-radius: $radius-sm;
    @include focus-ring;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $color-accent;
    transition: transform $duration-base $ease-spring;
  }

  &__brand:hover .header__dot {
    transform: scale(1.35);
  }

  &__avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: $color-surface-soft;
    color: $color-ink-soft;
    font-size: $font-size-xs;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
