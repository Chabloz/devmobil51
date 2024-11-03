<script setup>
  import { ref, onUnmounted, nextTick} from 'vue';
  import { wsClient } from '../store/chat';
  import BaseChatMsg from './BaseChatMsg.vue';

  const allMsg = ref([]);

  function pushToChat(msg) {
    allMsg.value.push(msg);
    nextTick(() => window.scrollTo(0, document.body.scrollHeight));
  }

  wsClient.sub('chat', pushToChat);

  onUnmounted(() => wsClient.unsub('chat', pushToChat).catch(() => {}));
</script>

<template>
  <q-list padding class="column">
    <BaseChatMsg v-for="msg in allMsg" :key="msg.id" :msg="msg" />
  </q-list>
</template>

<style scoped></style>