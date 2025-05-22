<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            bottom-slots
            v-model="newMessageContent"
            class="new-message"
            placeholder="What's happening?"
            counter
            maxlength="240"
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
              </q-avatar>
            </template>
            <template v-slot:append>
              <q-btn flat icon="attach_file" @click="triggerFileInput" />
            </template>
          </q-input>

          <!-- Show image preview -->
          <div v-if="imagePreviewUrl" class="q-mt-sm">
            <img :src="imagePreviewUrl" style="max-width: 150px; max-height: 150px;" />
          </div>
          <!-- Hidden file input -->
          <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewMessage"
            :disable="!newMessageContent"
            class="q-mb-lg"
            unelevated
            rounded
            color="primary"
            label="Submit"
            no-caps
          />
        </div>
      </div>

      <q-separator class="divider" size="10px" color="grey-2" />

      <q-list separator>
        <transition-group appear enter-active-class="animated fadeIn slow" leave-active-class="animated fadeOut slow">
          <q-item v-for="message in messages" :key="message.id" class="q-py-md">
            <q-item-section avatar top>
              <q-avatar size="xl">
                <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                <strong>Sweety</strong>
                <span class="text-grey-7"> @{{ message.user?.username || 'Sweety' }} <br class="lt-md" /> • {{ relativeDate(message.date) }}</span>
              </q-item-label>
              <q-item-label class="message-content">
                {{ message.content }}
                <div v-if="message.imageUrl" class="q-mt-sm">
                  <img :src="message.imageUrl" style="max-width: 250px; border-radius: 10px;" />
                </div>
              </q-item-label>

              <div class="message-icons row justify-between q-mt-sm">
                <q-btn color="grey" icon="far fa-comment" size="sm" flat round />
                <q-btn color="grey" icon="fas fa-retweet" size="sm" flat round />
                <q-btn
                  @click="toggleLiked(message)"
                  :color="message.liked ? 'pink' : 'grey'"
                  :icon="message.liked ? 'fas fa-heart' : 'far fa-heart'"
                  size="sm"
                  flat
                  round
                />
                <q-btn @click="deleteMessage(message.id)" color="grey" icon="fas fa-trash" size="sm" flat round />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { formatDistance } from 'date-fns';
import db from 'boot/firebase';
import axios from 'axios';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

defineOptions({
  name: 'PageHome'
});

// Reactive state
const newMessageContent = ref('');
const messages = ref([]);
const fileInput = ref(null);
const selectedFile = ref(null);
const imagePreviewUrl = ref(null);


// File input trigger
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle file selection
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};

// Upload image to Pinata and return URL
const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      }
    );

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading image to Pinata: ', error);
    throw new Error('Image upload failed');
  }
};

// Add new message
const addNewMessage = async () => {
  if (!newMessageContent.value.trim()) return;

  let imageUrl = null;

  if (selectedFile.value) {
    imageUrl = await uploadToPinata(selectedFile.value);
  }

  const newMessage = {
    content: newMessageContent.value,
    date: Date.now(),
    liked: false,
    imageUrl
  };

  addDoc(collection(db, 'messages'), newMessage)
    .then(() => {
      newMessageContent.value = '';
      selectedFile.value = null;
      imagePreviewUrl.value = null;
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
};

// Delete message
const deleteMessage = (messageId) => {
  const messageDoc = doc(db, 'messages', messageId);
  deleteDoc(messageDoc).catch(console.error);
};

// Like toggle
const toggleLiked = (message) => {
  const messageDoc = doc(db, 'messages', message.id);
  updateDoc(messageDoc, {
    liked: !message.liked
  }).catch(console.error);
};

// Format timestamp
const relativeDate = (timestamp) => formatDistance(new Date(timestamp), new Date());

// Realtime message listener
onMounted(() => {
  const q = query(collection(db, 'messages'), orderBy('date'));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const msgChange = { id: change.doc.id, ...change.doc.data() };

      if (change.type === 'added' && !messages.value.find(m => m.id === msgChange.id)) {
        messages.value.unshift(msgChange);
      }
      if (change.type === 'modified') {
        const index = messages.value.findIndex(m => m.id === msgChange.id);
        if (index !== -1) messages.value[index] = msgChange;
      }
      if (change.type === 'removed') {
        messages.value = messages.value.filter(m => m.id !== msgChange.id);
      }
    });
  });
});
</script>

<style>
.new-message {
  textarea {
    font-size: 19px;
    line-height: 1.4 !important;
  }
}
.divider {
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: $grey-4;
}
.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}
.message-icons {
  margin-left: -5px;
}
</style>
