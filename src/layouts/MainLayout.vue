<template>
  <q-layout v-if="currentUser" view="lHr lpr fFf">
    <q-header bordered class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold">
          <span class="gt-sm">{{ $route.name }}</span>
        </q-toolbar-title>

        <!-- Toggleable search icon (mobile only) -->
        <q-btn flat round dense icon="search" class="lt-sm" @click="toggleMobileSearch" />

        <q-btn flat label="Logout" @click="logout" />

        <!-- Show current user -->
        <q-chip v-if="currentUser" color="white" text-color="primary" class="q-ml-sm gt-sm">
          {{ currentUser?.email }}
        </q-chip>
      </q-toolbar>

      <!-- Mobile Search input (toggleable) -->
      <q-slide-transition>
        <div v-show="mobileSearchOpen" class="lt-sm q-px-md q-pb-sm bg-primary">
          <q-input
            v-model="searchText"
            placeholder="Search here..."
            rounded
            dense
            outlined
            @keyup.enter="searchGoogle"
            class="bg-white text-black"
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
          <q-list v-if="searchText.length >= 2" separator class="bg-white text-black q-mt-sm rounded-borders">
            <q-item
              clickable
              v-ripple
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="searchGoogle(suggestion)"
            >
              <q-item-section>{{ suggestion }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-slide-transition>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="283">
      <q-icon class="q-pa-md" name="fa-solid fa-paper-plane" size="lg" color="primary" />
      <q-list>
        <q-item to="/home" clickable v-ripple exact>
          <q-item-section avatar><q-icon name="home" size="md" /></q-item-section>
          <q-item-section class="text-h6 text-weight-bold">Home</q-item-section>
        </q-item>
        <q-item to="/about" clickable v-ripple exact>
          <q-item-section avatar><q-icon name="help" size="md" /></q-item-section>
          <q-item-section class="text-h6 text-weight-bold">About</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Right Drawer (desktop search) -->
    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-input
        placeholder="Search here.."
        rounded
        outlined
        v-model="searchText"
        class="q-ma-md"
        dense
        @keyup.enter="searchGoogle"
      >
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input>

      <q-list v-if="searchText.length >= 2" separator>
        <q-item
          clickable
          v-ripple
          v-for="suggestion in searchSuggestions"
          :key="suggestion"
          @click="searchGoogle(suggestion)"
        >
          <q-item-section>{{ suggestion }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <!-- Login view for unauthenticated users -->
  <div v-else class="q-pa-lg flex flex-center">
    <q-card style="min-width: 300px;">
      <q-card-section><div class="text-h6">Login</div></q-card-section>
      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Password" type="password" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Login" color="primary" @click="login" />
        <q-btn flat label="Register" @click="register" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from 'src/boot/firebase'

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const mobileSearchOpen = ref(false)
const searchText = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const currentUser = inject('currentUser')

const searchSuggestions = computed(() => {
  if (!searchText.value) return []
  return [
    searchText.value,
    `What is ${searchText.value}`,
    `How to ${searchText.value}`,
    `${searchText.value} examples`,
    `${searchText.value} tutorial`
  ]
})

const searchGoogle = (query = searchText.value) => {
  if (!query) return
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  window.open(url, '_blank')
}

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    email.value = ''
    password.value = ''
    router.push('/home')
  } catch (err) {
    alert(err.message)
  }
}

const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (err) {
    alert(err.message)
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    email.value = ''
    password.value = ''
    router.replace('/')
  } catch (err) {
    alert(err.message)
  }
}

const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value)
const toggleMobileSearch = () => (mobileSearchOpen.value = !mobileSearchOpen.value)
</script>

<style lang="scss">
.header-icon {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>
