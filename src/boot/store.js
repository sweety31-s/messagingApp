// src/boot/store.js
import store from '../store'; // import the store

export default ({ app }) => {
  app.use(store); // Make sure the store is used
};