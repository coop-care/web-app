<template>
  <q-page class="window-height window-width row justify-center">
    <div v-if="isForm" class="column">
      <div class="row">
        <q-card class="credentials bg-grey-2 shadow-1 q-mt-xl">
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("createAccount") }}</div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                clearable
                v-model="email"
                type="email"
                :label="$t('email')"
              />
              <q-input
                clearable
                v-model="password"
                type="password"
                :label="$t('password')"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              color="primary"
              class="full-width"
              :label="$t('create')"
              @click="doRegister"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <div v-else class="column">
      <div v-if="isSuccess" class="row">
        <h5 class="text-h5 q-my-md">
          {{ $t("confirmationMessage") }}
        </h5>
      </div>
      <div v-else class="row">
        <h5 class="text-h5 q-my-md">
          An error has occured:<br />
          {{ errorMsg }}
        </h5>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
.q-card.credentials
  width: 300px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { UserPasswordAuthProviderClient } from "mongodb-stitch-browser-sdk";

enum State {
  Form,
  Success,
  Error
}

@Component
export default class PageLogin extends Vue {
  state = State.Form;
  errorMsg = "";

  email = "";
  password = "";

  get isForm() {
    return this.state === State.Form;
  }
  get isSuccess() {
    return this.state === State.Success;
  }

  doRegister() {
    const epclient = this.$stitchApi.stitch.auth.getProviderClient(
      UserPasswordAuthProviderClient.factory
    );
    epclient
      .registerWithEmail(this.email, this.password)
      .then(() => (this.state = State.Success))
      .catch(err => {
        this.state = State.Error;
        this.errorMsg = err.message;
      });
  }
}
</script>
