export enum ProjectStatus {
  Active = 'active',
  Archived = 'archived',
}

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
}

/** Рядок таблиці проектів: сутність + реактивний лічильник завдань. */
export interface ProjectListItem extends Project {
  taskCount: number
}
