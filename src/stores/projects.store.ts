import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { toUserMessage } from '@/api/errors'
import { projectsService } from '@/api/services/projects.service'
import type { CreateProjectDto, Project, RequestStatus, UpdateProjectDto } from '@/types'
import { useTasksStore } from './tasks.store'
import { useToastsStore } from './toasts.store'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const status = ref<RequestStatus>('idle')

  const toasts = useToastsStore()

  const isLoading = computed(() => status.value === 'loading')
  const hasError = computed(() => status.value === 'error')

  function projectById(id: number): Project | undefined {
    return projects.value.find((project) => project.id === id)
  }

  async function fetchProjects(): Promise<void> {
    status.value = 'loading'
    try {
      projects.value = await projectsService.list()
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      toasts.error(toUserMessage(error))
    }
  }

  async function createProject(dto: CreateProjectDto): Promise<Project | null> {
    try {
      const created = await projectsService.create(dto)
      projects.value.push(created)
      toasts.success('Проект створено')
      return created
    } catch (error) {
      toasts.error(toUserMessage(error))
      return null
    }
  }

  async function updateProject(id: number, dto: UpdateProjectDto): Promise<boolean> {
    try {
      const updated = await projectsService.update(id, dto)
      projects.value = projects.value.map((project) => (project.id === id ? updated : project))
      toasts.success('Зміни збережено')
      return true
    } catch (error) {
      toasts.error(toUserMessage(error))
      return false
    }
  }

  /** Оптимістичне видалення зі снапшотом для відкату. */
  async function removeProject(id: number): Promise<boolean> {
    const snapshot = projects.value
    projects.value = projects.value.filter((project) => project.id !== id)
    try {
      await projectsService.remove(id)
      useTasksStore().dropProjectTasks(id)
      toasts.success('Проект видалено')
      return true
    } catch (error) {
      projects.value = snapshot
      toasts.error(toUserMessage(error))
      return false
    }
  }

  return {
    projects,
    status,
    isLoading,
    hasError,
    projectById,
    fetchProjects,
    createProject,
    updateProject,
    removeProject,
  }
})
