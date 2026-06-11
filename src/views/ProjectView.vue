<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <section>
    <div class="page-head">
      <h1 class="page-head__title">Проект #{{ id }}</h1>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-head {
  padding: space(6) 0 space(5);

  &__title {
    font-size: $font-size-display;
  }
}
</style>
