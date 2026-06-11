<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectFormModal from '@/components/projects/ProjectFormModal.vue'
import ProjectsFilters from '@/components/projects/ProjectsFilters.vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useFilters } from '@/composables/useFilters'
import { useProjectsStore } from '@/stores/projects.store'
import { useTasksStore } from '@/stores/tasks.store'
import { ProjectStatus, type Project, type ProjectListItem } from '@/types'
import { pluralizeUk } from '@/utils/labels'

const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

onMounted(() => {
  void projectsStore.fetchProjects()
  void tasksStore.fetchTasks()
})

const listItems = computed<ProjectListItem[]>(() =>
  projectsStore.projects.map((project) => ({
    ...project,
    taskCount: tasksStore.countByProject.get(project.id) ?? 0,
  })),
)

interface ProjectsFilterValues {
  search: string
  status: ProjectStatus | 'all'
}

const { filters, filteredItems, isFiltered, resetFilters } = useFilters<
  ProjectListItem,
  ProjectsFilterValues
>(listItems, {
  initial: { search: '', status: 'all' },
  predicates: {
    search: (project, value) => project.name.toLowerCase().includes(value.trim().toLowerCase()),
    status: (project, value) => value === 'all' || project.status === value,
  },
  persistKey: 'planer:projects:filters',
})

const formOpen = ref(false)
const editingProject = ref<Project | null>(null)
const deletingProject = ref<Project | null>(null)

function openCreate(): void {
  editingProject.value = null
  formOpen.value = true
}

function openEdit(project: Project): void {
  editingProject.value = project
  formOpen.value = true
}

function toggleArchive(project: Project): void {
  void projectsStore.updateProject(project.id, {
    status: project.status === ProjectStatus.Active ? ProjectStatus.Archived : ProjectStatus.Active,
  })
}

async function confirmRemove(): Promise<void> {
  if (!deletingProject.value) return
  const id = deletingProject.value.id
  deletingProject.value = null
  await projectsStore.removeProject(id)
}

const metaLabel = computed(() => {
  const projectCount = projectsStore.projects.length
  const taskCount = tasksStore.tasks.length
  return [
    `${projectCount} ${pluralizeUk(projectCount, ['проект', 'проекти', 'проектів'])}`,
    `${taskCount} ${pluralizeUk(taskCount, ['завдання', 'завдання', 'завдань'])}`,
  ].join(' · ')
})

function openProject(id: number): void {
  void router.push({ name: 'project', params: { id } })
}
</script>

<template>
  <section>
    <div class="page-head">
      <div>
        <h1 class="page-head__title">Проекти</h1>
        <p class="page-head__meta">{{ metaLabel }}</p>
      </div>
      <BaseButton @click="openCreate">
        <svg class="page-head__plus" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M7 2v10M2 7h10"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        Додати проект
      </BaseButton>
    </div>

    <ProjectsFilters
      v-model:search="filters.search"
      v-model:status="filters.status"
      :filtered="isFiltered"
      @reset="resetFilters"
    />

    <ProjectsTable
      :items="filteredItems"
      :loading="projectsStore.isLoading"
      :filtered="isFiltered"
      @open="openProject"
      @create="openCreate"
      @reset="resetFilters"
      @edit="openEdit"
      @archive="toggleArchive"
      @remove="deletingProject = $event"
    />

    <ProjectFormModal :open="formOpen" :project="editingProject" @close="formOpen = false" />

    <ConfirmDialog
      :open="Boolean(deletingProject)"
      title="Видалити проект?"
      :message="`«${deletingProject?.name ?? ''}» і всі його завдання буде видалено назавжди.`"
      @confirm="confirmRemove"
      @close="deletingProject = null"
    />
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
    font-variant-numeric: tabular-nums;
  }

  &__plus {
    width: 13px;
    height: 13px;
  }

  @include below($breakpoint-md) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
