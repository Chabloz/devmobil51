<script setup>
  import { ref } from 'vue';
  const users = ref([]);
</script>

<template>
  <q-toolbar>
    <q-toolbar-title>
      IM - Chat
    </q-toolbar-title>
    <!-- <q-btn-dropdown color="secondary" icon="people"  label="Online users" size="sm" class="q-mr-sm">
      <q-list>
        <q-item v-for="user in users" :key="user.id" dense>
          <q-item-section>
            <q-item-label>
              {{ user.name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <a href="/logout">
      <q-btn label="Logout" icon="logout" color="secondary" size="sm" />
    </a> -->
  </q-toolbar>
</template>

<style scoped>

</style>