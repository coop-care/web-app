<template>
  <q-page class="window-width row justify-center">
    <div class="column">
      <div class="row">
        <q-card class="credentials bg-grey-2 shadow-1 q-mt-xl">
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("createAccount") }}</div>
          </q-card-section>

          <q-card-section v-if="isForm">
            <p
              v-if="errorMsg"
              class="text-negative q-mt-md"
            >{{ errorMsg }}</p>
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
          <q-card-section v-else-if="isSuccess">
            <p class="q-my-md"
            >{{ $t("confirmationMessage") }}</p>
          </q-card-section>

          <q-card-actions
            v-if="isForm"
            class="q-px-md q-pb-md"
          >
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              :label="$t('create')"
              @click="doRegister"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
.q-card.credentials
  width: 300px
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";

enum State {
  Form,
  Success
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
    this.$ccApi
      .registerUser(this.email, this.password)
      .then(() => (this.state = State.Success))
      .catch(err => {
        this.errorMsg = this.$t("errorMessage", {message: err.message}) as string;
      });
  }
}
</script>
