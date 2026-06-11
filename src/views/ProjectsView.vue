<template>
  <section>
    <div class="page-head">
      <div>
        <h1 class="page-head__title">Проекти</h1>
        <p class="page-head__meta">Усі проекти команди в одному місці</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: space(4);
  padding: space(6) 0 space(5);

  &__title {
    font-size: $font-size-display;
  }

  &__meta {
    margin-top: space(1);
    color: $color-ink-faint;
    font-size: $font-size-sm;
  }
}
</style>
