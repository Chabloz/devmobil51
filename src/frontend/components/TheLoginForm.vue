<script setup>
  // https://static.eduid.ch/eduid.ch/images/logo.svg
  import { ref } from 'vue';
  import { csrfToken } from '../bootstrap.js';
  import { patterns } from 'quasar';
  const { testPattern } = patterns;

  const props = defineProps({
    error: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  });

  const name = defineModel('name');
  name.value = props.name;
  const password = defineModel('password');
  const isPwd = ref(true);

  function submit(evt) {
    evt.target.submit();
  }

  function reset() {
    name.value = '';
    password.value = '';
    isPwd.value = true;
  }

  const nameRules = [
    val => val && val.length > 1 || 'Username or email required',
    val => val.match(/^[a-z]+$/i) || testPattern.email(val) || 'Wrong username or email format'
  ];

</script>

<template>
  <q-form
    action="/login"
    method="post"
    @submit="submit"
    @reset="reset"
    autocomplete="off"
  >
    <input type="hidden" name="_token" :value="csrfToken">

    <q-banner v-if="error" class="text-white bg-red">
      {{ error }}
    </q-banner>

    <q-input
      filled
      v-model.trim="name"
      name="name"
      label="Username or email"
      hint="Your username or email address"
      lazy-rules="ondemand"
      :rules="nameRules"
    >
    </q-input>

    <q-input
      v-model="password"
      name="password"
      filled
      :type="isPwd ? 'password' : 'text'"
      hint="Your password"
      lazy-rules="ondemand"
      :rules="[ val => !!val || 'Password required']"
    >
      <template v-slot:append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>

    <div>
      <q-btn label="Sign in" type="submit" color="primary"/>
      <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
    </div>

    <q-separator />

    <div>
      <p class="text-subtitle">Or sign in with Edu-id</p>
      <a href="/eduid">
        <q-btn color="primary" icon="login" label="Edu-id" />
      </a>
    </div>
  </q-form>
</template>

<style scoped>

</style>