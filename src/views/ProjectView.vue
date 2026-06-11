<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import TasksFilters from '@/components/tasks/TasksFilters.vue'
import TasksTable from '@/components/tasks/TasksTable.vue'
import ViewSwitcher, { type ProjectViewMode } from '@/components/tasks/ViewSwitcher.vue'
import KanbanBoard from '@/components/tasks/kanban/KanbanBoard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useFilters } from '@/composables/useFilters'
import { usePersistedState } from '@/composables/usePersistedState'
import { assigneesService } from '@/api/services/assignees.service'
import { useProjectsStore } from '@/stores/projects.store'
import { useTasksStore } from '@/stores/tasks.store'
import { TaskStatus, type Task } from '@/types'
import { PROJECT_STATUS_LABELS, pluralizeUk } from '@/utils/labels'

const props = defineProps<{ id: string }>()
const projectId = computed(() => Number(props.id))

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const assignees = ref<string[]>([])

onMounted(() => {
  if (!projectsStore.projects.length) void projectsStore.fetchProjects()
  void tasksStore.fetchTasks(projectId.value)
  assigneesService
    .list()
    .then((list) => {
      assignees.value = list
    })
    .catch(() => {
      // список виконавців не критичний — фільтр просто лишиться коротшим
    })
})

const project = computed(() => projectsStore.projectById(projectId.value))
const projectTasks = computed(() => tasksStore.tasksOfProject(projectId.value))

interface TasksFilterValues {
  assignee: string
  status: TaskStatus | 'all'
}

const { filters, filteredItems, isFiltered, resetFilters } = useFilters<Task, TasksFilterValues>(
  projectTasks,
  {
    initial: { assignee: 'all', status: 'all' },
    predicates: {
      assignee: (task, value) => {
        if (value === 'all') return true
        if (value === 'none') return task.assignee === null
        return task.assignee === value
      },
      status: (task, value) => value === 'all' || task.status === value,
    },
    persistKey: 'planer:tasks:filters',
  },
)

/** Обраний режим перегляду живе в localStorage (вимога ТЗ) */
const viewMode = usePersistedState<ProjectViewMode>('planer:project:view-mode', 'kanban')

const grouped = computed<Record<TaskStatus, Task[]>>(() => {
  const acc: Record<TaskStatus, Task[]> = {
    [TaskStatus.Todo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Done]: [],
  }
  for (const task of filteredItems.value) acc[task.status].push(task)
  return acc
})

const doneCount = computed(() => grouped.value[TaskStatus.Done].length)

const metaLabel = computed(() => {
  const total = projectTasks.value.length
  return `${total} ${pluralizeUk(total, ['завдання', 'завдання', 'завдань'])} · ${doneCount.value} виконано`
})

const notFound = computed(
  () => !project.value && !projectsStore.isLoading && projectsStore.status !== 'idle',
)

const taskFormOpen = ref(false)
const editingTask = ref<Task | null>(null)

function openCreateTask(): void {
  editingTask.value = null
  taskFormOpen.value = true
}

function openEditTask(task: Task): void {
  editingTask.value = task
  taskFormOpen.value = true
}
</script>

<template>
  <section>
    <template v-if="notFound">
      <div class="missing">
        <h1 class="missing__title">Проект не знайдено</h1>
        <p class="missing__text">Можливо, його видалили або посилання застаріло.</p>
        <RouterLink :to="{ name: 'projects' }" class="missing__link"
          >← До списку проектів</RouterLink
        >
      </div>
    </template>

    <template v-else>
      <RouterLink :to="{ name: 'projects' }" class="back">
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M8.5 3 4.5 7l4 4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Проекти
      </RouterLink>

      <div class="page-head">
        <div class="page-head__info">
          <div class="page-head__title-row">
            <h1 class="page-head__title">{{ project?.name ?? '…' }}</h1>
            <BaseBadge v-if="project" :tone="project.status">
              {{ PROJECT_STATUS_LABELS[project.status] }}
            </BaseBadge>
          </div>
          <p v-if="project?.description" class="page-head__description">
            {{ project.description }}
          </p>
          <p class="page-head__meta">{{ metaLabel }}</p>
        </div>
        <div class="page-head__actions">
          <ViewSwitcher v-model="viewMode" />
          <BaseButton @click="openCreateTask">
            <svg class="page-head__plus" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            Додати завдання
          </BaseButton>
        </div>
      </div>

      <TasksFilters
        v-model:assignee="filters.assignee"
        v-model:status="filters.status"
        :assignees="assignees"
        :filtered="isFiltered"
        @reset="resetFilters"
      />

      <Transition name="view" mode="out-in">
        <TasksTable
          v-if="viewMode === 'table'"
          :tasks="filteredItems"
          :loading="tasksStore.isLoading"
          :drag-enabled="!isFiltered"
          @edit="openEditTask"
        />
        <KanbanBoard v-else :grouped="grouped" :drag-enabled="!isFiltered" @edit="openEditTask" />
      </Transition>

      <TaskFormModal
        :open="taskFormOpen"
        :project-id="projectId"
        :task="editingTask"
        :assignees="assignees"
        @close="taskFormOpen = false"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.back {
  display: inline-flex;
  align-items: center;
  gap: space(1.5);
  margin-top: space(5);
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-ink-faint;
  border-radius: $radius-sm;
  transition: color $duration-fast $ease-out;
  @include focus-ring;

  svg {
    width: 13px;
    height: 13px;
  }

  &:hover {
    color: $color-ink;
  }
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: space(4);
  padding: space(3) 0 space(5);

  &__title-row {
    display: flex;
    align-items: center;
    gap: space(3);
  }

  &__title {
    font-size: $font-size-display;
  }

  &__description {
    margin-top: space(1.5);
    color: $color-ink-soft;
    max-width: 560px;
  }

  &__meta {
    margin-top: space(1.5);
    color: $color-ink-faint;
    font-size: $font-size-sm;
    font-variant-numeric: tabular-nums;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: space(3);
    flex: none;
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

.missing {
  padding: space(20) 0;
  text-align: center;

  &__title {
    font-size: $font-size-xl;
  }

  &__text {
    margin-top: space(2);
    color: $color-ink-faint;
  }

  &__link {
    display: inline-block;
    margin-top: space(4);
    font-weight: 600;
    color: $color-accent-strong;
  }
}

.view-enter-active,
.view-leave-active {
  transition:
    opacity $duration-fast $ease-out,
    transform $duration-fast $ease-out;
}

.view-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.995);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.995);
}
</style>
