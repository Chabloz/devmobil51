<script setup>
  import { ref } from 'vue';
  import { wsClient } from '../store/chat';

  const msg = defineModel('msg');
  const inputMsg = ref(null);

  function submit() {
    if (!msg.value) return
    wsClient.pub('chat', msg.value);
    msg.value = '';
    inputMsg.value.focus();
  }
</script>

<template>
  <q-form @submit="submit" class="row justify-start">
    <q-input
      ref="inputMsg"
      filled
      square
      maxlength="255"
      v-model.trim="msg"
      label="Message"
      bg-color="secondary"
      color="primary"
      class="col"
    />
  </q-form>
</template>

<style scoped>

</style>