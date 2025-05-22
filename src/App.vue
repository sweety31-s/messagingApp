<script setup>
import { ref, provide } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'boot/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)

onAuthStateChanged(auth, user => {
  currentUser.value = user
  if (user) {
    router.push('/home')  // Redirect to home if the user is logged in
  } else {
    router.push('/')  // Stay on the login page if the user is not logged in
  }
})

provide('currentUser', currentUser)
</script>
<template>
  <router-view />
</template>