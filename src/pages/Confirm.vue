<template>
  <q-page class="window-height window-width row justify-center items-center">
    <div class="column">
      <div v-if="isPending" class="row">
        <h5 class="text-h5 q-my-md">
          Confirmation in progress...
        </h5>
      </div>
      <div v-else-if="isConfirmed" class="row">
        <h5 class="text-h5 q-my-md">
          Your email has been confirmed.
          <router-link :to="{ name: 'login' }">
              Go to login
            </router-link>
        </h5>
      </div>
      <div v-else class="row">
        <h5 class="text-h5 q-my-md">
          An error has occured.<br>
          {{ errorMsg }}
        </h5>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  UserPasswordAuthProviderClient,
} from 'mongodb-stitch-browser-sdk';

enum State { Pending, Confirmed, Error }

@Component
export default class PageConfirm extends Vue {
  state = State.Pending;
  errorMsg = '';

  get isPending() { return this.state === State.Pending }
  get isConfirmed() { return this.state === State.Confirmed }

  mounted() {
    // console.log(this.$route);
    const token = String(this.$route.query.token);
    const tokenId = String(this.$route.query.tokenId);
    const epclient = this.$stitchApi.stitch.auth
      .getProviderClient(UserPasswordAuthProviderClient.factory);
    epclient.confirmUser(token, tokenId)
      .then(() => this.state = State.Confirmed)
      .catch(err => { this.state = State.Error; this.errorMsg = err.message });
  }
}
</script>