<script setup>
  import { shortFrCH as formatDate } from '../utils/date.js';
  const props = defineProps({
    msg: Object
  });
</script>

<template>
  <q-item dense>
    <q-item-section avatar top>
      {{ formatDate(msg.timestamp) }}
      {{ msg.username }} :
    </q-item-section>
    <q-item-section top>
      {{ msg.msg }}
    </q-item-section>
  </q-item>
</template>

<style scoped>

</style>