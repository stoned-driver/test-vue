<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppToaster from '@/components/ui/AppToaster.vue'
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <RouterView />
    </main>
    <AppToaster />
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: space(6) space(6) space(12);
    flex: 1;
  }
}
</style>
