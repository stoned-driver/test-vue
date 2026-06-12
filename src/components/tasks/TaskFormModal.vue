<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect, { type SelectOption } from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useProjectsStore } from '@/stores/projects.store'
import { useTasksStore } from '@/stores/tasks.store'
import { TASK_STATUSES, TaskStatus, type Task } from '@/types'
import { createTaskFormSchema } from '@/types/forms'
import { todayIso } from '@/utils/date'
import { TASK_STATUS_LABELS } from '@/utils/labels'

const props = defineProps<{
  open: boolean
  projectId: number
  task?: Task | null
  assignees: string[]
}>()

const emit = defineEmits<{ close: [] }>()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const isEdit = computed(() => Boolean(props.task))
const confirmOpen = ref(false)

/** При редагуванні дозволяємо лишити початкову (навіть минулу) дату */
const minDueDate = computed(() => {
  const today = todayIso()
  if (props.task && props.task.dueDate < today) return props.task.dueDate
  return today
})

const validationSchema = computed(() => toTypedSchema(createTaskFormSchema(minDueDate.value)))

const { errors, handleSubmit, defineField, resetForm, setValues, isSubmitting } = useForm({
  validationSchema,
})

const [title, titleAttrs] = defineField('title')
const [projectField, projectFieldAttrs] = defineField('projectId')
const [status, statusAttrs] = defineField('status')
const [dueDate, dueDateAttrs] = defineField('dueDate')
const [assignee, assigneeAttrs] = defineField('assignee')

const projectOptions = computed<SelectOption[]>(() =>
  projectsStore.projects.map((project) => ({
    value: String(project.id),
    label: project.name,
  })),
)

const statusOptions: SelectOption[] = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
}))

const assigneeOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Без виконавця' },
  ...props.assignees.map((name) => ({ value: name, label: name })),
])

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.task) {
      setValues({
        title: props.task.title,
        projectId: String(props.task.projectId),
        status: props.task.status,
        dueDate: props.task.dueDate,
        assignee: props.task.assignee ?? '',
      })
    } else {
      resetForm({
        values: {
          title: '',
          projectId: String(props.projectId),
          status: TaskStatus.Todo,
          dueDate: todayIso(),
          assignee: '',
        },
      })
    }
  },
)

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    title: values.title,
    status: values.status,
    dueDate: values.dueDate,
    assignee: values.assignee.length > 0 ? values.assignee : null,
  }
  const ok = props.task
    ? await tasksStore.updateTask(props.task.id, payload)
    : await tasksStore.createTask({ ...payload, projectId: Number(values.projectId) })
  if (ok) emit('close')
})

async function removeTask(): Promise<void> {
  if (!props.task) return
  confirmOpen.value = false
  const ok = await tasksStore.removeTask(props.task.id)
  if (ok) emit('close')
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Редагувати завдання' : 'Нове завдання'"
    @close="emit('close')"
  >
    <form class="form" novalidate @submit.prevent="onSubmit">
      <BaseInput
        v-model="title"
        v-bind="titleAttrs"
        label="Назва завдання"
        placeholder="Що потрібно зробити?"
        :error="errors.title"
        autofocus
      />
      <BaseSelect
        v-model="projectField"
        v-bind="projectFieldAttrs"
        label="Проект"
        :options="projectOptions"
        :error="errors.projectId"
        :disabled="isEdit"
      />
      <div class="form__row">
        <BaseSelect
          v-model="status"
          v-bind="statusAttrs"
          label="Статус"
          :options="statusOptions"
          :error="errors.status"
        />
        <BaseInput
          v-model="dueDate"
          v-bind="dueDateAttrs"
          label="Термін виконання"
          type="date"
          :min="minDueDate"
          :error="errors.dueDate"
        />
      </div>
      <BaseSelect
        v-model="assignee"
        v-bind="assigneeAttrs"
        label="Виконавець (необовʼязково)"
        :options="assigneeOptions"
        :error="errors.assignee"
      />
      <footer class="form__actions">
        <BaseButton
          v-if="isEdit"
          variant="danger"
          type="button"
          class="form__delete"
          @click="confirmOpen = true"
        >
          Видалити
        </BaseButton>
        <BaseButton variant="ghost" type="button" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Зберігаємо…' : isEdit ? 'Зберегти' : 'Створити завдання' }}
        </BaseButton>
      </footer>
    </form>
  </BaseModal>

  <ConfirmDialog
    :open="confirmOpen"
    title="Видалити завдання?"
    :message="`«${task?.title ?? ''}» буде видалено назавжди.`"
    @confirm="removeTask"
    @close="confirmOpen = false"
  />
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: space(4);

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: space(3);

    @include below($breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: space(2);
    margin-top: space(2);
  }

  &__delete {
    margin-right: auto;
  }
}
</style>
