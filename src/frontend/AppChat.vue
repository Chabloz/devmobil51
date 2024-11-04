<script setup>
  import TheChatToolbar from './components/TheChatToolbar.vue';
  import TheChatForm from './components/TheChatForm.vue';
  import TheChatMessages from './components/TheChatMessages.vue';
  import { isConnecting, hasConnectionFailed } from './store/chat';

  // import { useFetchApi } from './composables/useFetchApi';
  
  
  // const { fetchApiToRef } = useFetchApi(import.meta.env.VITE_API_URL);
  // const {data: users, error, loading} = fetchApiToRef({
  //   url: 'user/1',
  //   method: 'DELETE',
  //   data: {id: 1}
  // });
  
</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated>
      <TheChatToolbar  />
    </q-header>

    <q-page-container>
      <q-item-label v-if="hasConnectionFailed" class="q-ma-md">
        <q-icon name="error" color="negative" />
        Connection failed
      </q-item-label>

      <q-spinner-facebook v-if="isConnecting"  class="q-ma-md" />

      <the-chat-messages v-if="!isConnecting && !hasConnectionFailed" />
    </q-page-container>

    <q-footer class="no-padding no-margin" v-if="!isConnecting && !hasConnectionFailed">
      <TheChatForm />     
    </q-footer>

  </q-layout>
</template>

<style scoped></style>