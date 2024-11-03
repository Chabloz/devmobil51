<script setup>
  import { onUnmounted, watch, ref, nextTick } from 'vue';
  import TheChatToolbar from './components/TheChatToolbar.vue';
  import TheChatForm from './components/TheChatForm.vue';
  import BaseChatMsg from './components/BaseChatMsg.vue';
  import { wsClient, isConnecting, hasConnectionFailed } from './store/chat';

  const allMsg = ref([]);

  function pushToChat(msg) {
    allMsg.value.push(msg);
    nextTick(() => window.scrollTo(0, document.body.scrollHeight));
  }

  watch(isConnecting, (isConnected) => {
    if (!isConnected) return;
    wsClient.sub('chat', pushToChat);
  });

  onUnmounted(() => wsClient.unsub('chat', pushToChat));
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

      <q-spinner-facebook v-if="isConnecting"  class="q-ma-md"/>

      <q-list padding class="column" v-if="!isConnecting && !hasConnectionFailed">
        <BaseChatMsg v-for="msg in allMsg" :key="msg.id" :msg="msg" />
      </q-list>
    </q-page-container>

    <q-footer class="no-padding no-margin" v-if="!isConnecting && !hasConnectionFailed">
      <TheChatForm />
    </q-footer>

  </q-layout>
</template>

<style scoped></style>