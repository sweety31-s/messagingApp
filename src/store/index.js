// src/store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    isAuthenticated: false, // Default to false, update after successful login
  },
  mutations: {
    setAuthenticated(state, status) {
      state.isAuthenticated = status; // Set the authentication status
    },
  },
});

export default store;
