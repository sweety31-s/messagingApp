<template>
  <q-page class="row justify-center items-center">
    <q-card class="q-pa-md" style="min-width: 300px; max-width: 400px; width: 100%">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Password" type="password" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn @click="login" label="Login" color="primary" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from 'src/boot/firebase'

export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$store.commit('setAuthenticated', true)
        this.$router.push('/')
      } catch (err) {
        console.error('Login failed:', err.message)
        this.$q.notify({
          type: 'negative',
          message: 'Login failed: ' + err.message
        })
      }
    }
  }
}
</script>
