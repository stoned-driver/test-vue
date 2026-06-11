<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import { useProjectsStore } from '@/stores/projects.store'
import { projectFormSchema } from '@/types/forms'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const projectsStore = useProjectsStore()

const { errors, handleSubmit, defineField, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(projectFormSchema),
  initialValues: { name: '', description: '' },
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')

const onSubmit = handleSubmit(async (values) => {
  const created = await projectsStore.createProject({
    name: values.name,
    description: values.description,
  })
  if (created) emit('close')
})

watch(
  () => props.open,
  (open) => {
    if (!open) resetForm()
  },
)
</script>

<template>
  <BaseModal :open="open" title="Новий проект" @close="emit('close')">
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
          {{ isSubmitting ? 'Зберігаємо…' : 'Створити проект' }}
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
