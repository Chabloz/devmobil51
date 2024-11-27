<script setup>
  import TheChatToolbar from './components/TheChatToolbar.vue';
  import TheChatForm from './components/TheChatForm.vue';
  import TheChatMessages from './components/TheChatMessages.vue';
  import { isConnecting, hasConnectionFailed } from './store/chat';

  // import {  useFetchApiCrud } from './composables/useFetchApiCrud';

  // const peopleCrud = useFetchApiCrud('people', import.meta.env.VITE_API_URL);
  // const {data, error, loading} = peopleCrud.read('67441f0521b773a54417345b');
  // const {data, error, loading} = peopleCrud.create({
  //   "name": "John Doe",
  //   "gender": "male",
  //   "birthDate": "2001-02-03T08:30:00.000Z"
  // });

  // const movieCrud = useFetchApiCrud('movies', import.meta.env.VITE_API_URL);
  // const {data: movies} = movieCrud.readAll();
  // movieCrud.create({
  //   "title": "The Shawshank Redemption",
  //   "rating": 8.5,
  //   "directorId": "d038e6fedc4cf8b5ace5a689"
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