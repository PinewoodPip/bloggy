<template>
  <Modal>
    <template #headerTitle>
      <h2>{{ isEditing ? "Edit user" : "Create user" }}</h2>
    </template>

    <template #form>
      <!-- TODO avatar -->
      <AvatarIcon class="size-24 mx-auto"/>

      <!-- Form fields -->
      <!-- Username -->
      <FormGroupInputField v-model="username" placeholder="username" icon="i-heroicons-user" label="Username" help="Should be 8+ characters long" />
      <!-- Password -->
      <FormGroupInputField v-model="password" type="password" placeholder="" icon="i-heroicons-hashtag" :label="isEditing ? 'New password' : 'Password'" help="Should be 8+ characters, with at least 1 digit and special character" :error="passwordError" :required="!isEditing" />

      <!-- Password confirmation -->
      <FormGroupInputField v-model="passwordConfirmation" type="password" placeholder="" icon="i-heroicons-hashtag" label="Repeat password" :error="passwordConfirmationError" :required="!isEditing" />

      <!-- Following fields are valid for editor accounts only -->
      <!-- Display name -->
      <FormGroupInputField v-if="!isEditingAdmin" v-model="displayName" label="Display name" placeholder="Mr. User" icon="i-heroicons-user" required />
      <!-- Contact email -->
      <FormGroupInputField v-if="!isEditingAdmin" v-model="contactEmail" type="email" placeholder="example@example.com" icon="i-heroicons-envelope" label="Contact e-mail" :error="emailError" />
      <!-- Biography -->
      <UFormGroup v-if="!isEditingAdmin" label="Biography">
        <TextArea v-model="biography" />
      </UFormGroup>
    </template>

    <template #footer>
      <IconButton icon="i-heroicons-user-plus" class="btn-smp btn-primary" @click="confirm" :disabled="!canSubmit || createUserIsPending">
        <span>
          <!-- Show loading spinner while posting -->
          <span v-if="createUserIsPending || updateUserIsPending" class="loading loading-spinner"/>
          <span v-else>{{ isEditing ? "Apply changes" : "Create account" }}</span>
        </span>
      </IconButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'

const userService = useUserService()
const responseToast = useResponseToast()

const MINIMUM_PASSWORD_LENGTH = 8 // Should be same as in backend

const props = defineProps<{
  userToEdit?: User,
}>()

const emit = defineEmits<{
  create: [user: User],
  update: [user: User],
  close: [],
}>()

const username = ref("")
const password = ref("")
const passwordConfirmation = ref("")
const displayName = ref("")
const contactEmail = ref("")
const biography = ref("")

/** Sends a POST/PATCH to create/update the user */
function confirm() {
  if (props.userToEdit) {
    const oldData = props.userToEdit

    // Check if email should be nulled
    let newEmail: string|undefined|null = contactEmail.value !== oldData.contact_email ? contactEmail.value : undefined
    if (newEmail === "" && oldData.contact_email) {
      newEmail = null
    }

    // Only pass the fields that actually changed
    requestUpdateAccount({
      username: username.value !== oldData.username ? username.value : undefined,
      password: password.value !== "" ? password.value : undefined,
      display_name: displayName.value !== oldData.display_name ? displayName.value : undefined,
      contact_email: newEmail,
      biography: biography.value !== oldData.biography ? biography.value : undefined,
    })
  } else {
    requestCreateAccount({
      username: username.value,
      password: password.value,
      display_name: displayName.value,
      contact_email: contactEmail.value !== "" ? contactEmail.value : undefined,
      biography: biography.value !== "" ? biography.value : undefined,
    })
  }
}

function resetFields() {
  const user = props.userToEdit
  // Set fields to the user's current values
  if (user) {
    username.value = user.username
    displayName.value = user.display_name ?? ''
    password.value = ''
    passwordConfirmation.value = ''
    contactEmail.value = user.contact_email ?? ''
    biography.value = user.biography ?? ''
  } else {
    username.value = ''
    displayName.value = ''
    password.value = ''
    passwordConfirmation.value = ''
    contactEmail.value = ''
    biography.value = ''
  }
}

// Initialize fields for editing users
onMounted(() => {
  if (props.userToEdit) {
    resetFields()
  }
})

// Reset fields when user to edit prop changes
watch(() => props.userToEdit, (newUser) => {
  resetFields()
});

/** Whether the form is valid and can be submitted. */
const canSubmit = computed(() => {
  return username.value !== "" && passwordError.value == "" && passwordConfirmationError.value === "" && (isEditingAdmin.value || displayName.value !== "") && emailError.value === ""
})

/** Checks whether the password field is valid according to backend requirements. */
const passwordIsValid = computed(() => {
  const pw = password.value
  return (isEditing.value && pw === "") || (pw.length >= MINIMUM_PASSWORD_LENGTH && pw.search("\d") !== -1 && pw.search("[^\d\w]") !== -1) // Must have enough characters, at least one digit and at least one special character. In edit mode, the password field can be left empty to indicate the password is not being changed.
})

/** Error label for password field */
const passwordError = computed(() => {
  return (passwordIsValid.value || password.value === "") ? "" : "Should be 8+ characters, with at least 1 digit and special character" // TODO show only info on the aspects that fail
})

/** Error label for password confirmation field. */
const passwordConfirmationError = computed(() => {
  const passwordsMatch = password.value === passwordConfirmation.value
  return (passwordsMatch || password.value === "" || passwordConfirmation.value === "") ? "" : "Passwords do not match"
})

const emailError = computed(() => {
  // E-mail requirements are intentionally very lax
  // TODO domain does have a 2+ len req, double-check it
  return (contactEmail.value !== "" && contactEmail.value.search("@.+\\..+") === -1) ? "Invalid e-mail format" : ""
})

/** Whether the form is editing an existing user. */
const isEditing = computed(() => {
  return props.userToEdit !== undefined
})

const isEditingAdmin = computed(() => {
  return isEditing.value && props.userToEdit?.role === 'admin'
})

/** Query for creating users */
const { isPending: createUserIsPending, mutate: requestCreateAccount } = useMutation({
  mutationFn: (newUser: UserCreationRequest) => {
    return userService.createUser(newUser)
  },
  onSuccess: (user) => {
    emit("create", user)
  },
  onError: (err) => {
    responseToast.showError('Failed to create user', err)
  }
})

/** Query for updating a user */
const { isPending: updateUserIsPending, mutate: requestUpdateAccount } = useMutation({
  mutationFn: (newUser: UserUpdateRequest) => {
    if (!props.userToEdit) {
      throw "Tried to update account while not editing one"
    }
    return userService.updateUser(props.userToEdit.username, newUser)
  },
  onSuccess: (user) => {
    emit("update", user)
  },
  onError: (err) => {
    responseToast.showError('Failed to update user', err)
  }
})

defineShortcuts({
  // Enter key submits the form
  enter: {
    usingInput: true,
    whenever: [canSubmit],
    handler: () => {
      confirm()
    },
  }
})

</script>