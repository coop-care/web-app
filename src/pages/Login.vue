<template>
  <q-page class="window-height window-width row justify-center items-center">
    <div class="column">
      <div v-if="errorMsg" class="row">
        <p class="text-red q-my-md">Error: {{ errorMsg }}</p>
      </div>
      <div class="row">
        <h5 class="text-h5 q-my-md">Welcome to Open Omaha</h5>
      </div>
      <div class="row">
        <q-card square bordered class="bg-grey-4 q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input square filled clearable v-model="email" type="email" label="email" />
              <q-input square filled clearable v-model="password" type="password" label="password" />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn unelevated color="primary" size="lg" class="full-width"
              label="Login" @click="doLogin"
            />
          </q-card-actions>
          <q-card-section class="text-center q-pa-none">
            <router-link :to="{ name: 'register' }">
              Not reigistered? Created an Account
            </router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
.q-card 
  width: 360px
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  StitchUser,
  UserPasswordCredential,
} from 'mongodb-stitch-browser-sdk';

@Component
export default class PageLogin extends Vue {
  email = '';
  password = '';

  errorMsg = '';

  doLogin() {
    // console.log('logging in...', this.email, this.password);
    const credential = new UserPasswordCredential(this.email, this.password);
    this.$stitch.auth
      .loginWithCredential(credential)
      .then((user) => {
        // console.log(`Logged in as user with id: ${user.id}`);
        this.$router.push({ name: 'index' });
      })
      .catch(err => { this.errorMsg = err.message });
    
  }
}
</script>
