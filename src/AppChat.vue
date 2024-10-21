<script setup>
  import { onUnmounted, ref, nextTick } from 'vue';
  import TheChatToolbar from './components/TheChatToolbar.vue';
  import TheChatForm from './components/TheChatForm.vue';
  import BaseChatMsg from './components/BaseChatMsg.vue';
  import wsClient from './store/chat';

  const allMsg = ref([]);

  function pushToChat(msg) {
    allMsg.value.push(msg);
    nextTick(() => window.scrollTo(0, document.body.scrollHeight));
  }

  wsClient.sub('chat', pushToChat);
  onUnmounted(() => wsClient.unsub('chat', pushToChat));
</script>

<template>
  <q-layout>

    <q-header elevated>
      <TheChatToolbar  />
    </q-header>

    <q-page-container>
      <q-list padding class="column">
        <BaseChatMsg v-for="msg in allMsg" :key="msg.id" :msg="msg" />
      </q-list>
    </q-page-container>

    <q-footer class="no-padding no-margin">
      <TheChatForm />
    </q-footer>

  </q-layout>
</template>

<style scoped></style>