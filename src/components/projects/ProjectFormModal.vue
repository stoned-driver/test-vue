<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import { useProjectsStore } from '@/stores/projects.store'
import type { Project } from '@/types'
import { projectFormSchema } from '@/types/forms'

const props = defineProps<{
  open: boolean
  /** null — створення, інакше — редагування */
  project?: Project | null
}>()

const emit = defineEmits<{ close: [] }>()

const projectsStore = useProjectsStore()
const isEdit = computed(() => Boolean(props.project))

const { errors, handleSubmit, defineField, resetForm, setValues, isSubmitting } = useForm({
  validationSchema: toTypedSchema(projectFormSchema),
  initialValues: { name: '', description: '' },
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.project) {
      setValues({ name: props.project.name, description: props.project.description })
    } else {
      resetForm({ values: { name: '', description: '' } })
    }
  },
)

const onSubmit = handleSubmit(async (values) => {
  const ok = props.project
    ? await projectsStore.updateProject(props.project.id, {
        name: values.name,
        description: values.description,
      })
    : await projectsStore.createProject({ name: values.name, description: values.description })
  if (ok) emit('close')
})
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Редагувати проект' : 'Новий проект'"
    @close="emit('close')"
  >
    <form class="form" novalidate @submit.prevent="onSubmit">
      <BaseInput
        v-model="name"
        v-bind="nameAttrs"
        label="Назва проекту"
        placeholder="Напр., Редизайн вебсайту"
        :error="errors.name"
        autofocus
      />
      <BaseTextarea
        v-model="description"
        v-bind="descriptionAttrs"
        label="Опис (необовʼязково)"
        placeholder="Коротко про мету проекту"
        :error="errors.description"
        :rows="3"
      />
      <footer class="form__actions">
        <BaseButton variant="ghost" type="button" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Зберігаємо…' : isEdit ? 'Зберегти' : 'Створити проект' }}
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: space(4);

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: space(2);
    margin-top: space(2);
  }
}
</style>
