<template>
  <q-page class="window-height window-width row justify-center">
    <div class="column">
      <div class="row">
        <q-card class="credentials bg-grey-2 shadow-1 q-mt-xl">
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("passwordResetTitle") }}</div>
          </q-card-section>
          <q-card-section>
            <p
              v-if="errorMsg"
              class="text-red q-mt-md"
            >{{ errorMsg }}</p>
            <q-form class="q-gutter-md">
              <q-input
                clearable
                v-model="email"
                type="email"
                :label="$t('email')"
              />
            </q-form>
            <p
              class="q-mt-lg q-mb-none"
            >
              <span
                v-if="isSuccess"
                class="text-weight-medium"
              >
                {{ $t("requestPasswordResetSuccessfulMessage") }}
              </span>
              <span v-else>
                {{ $t("requestPasswordResetHint") }}
              </span>
            </p>
          </q-card-section>
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              :flat="isSuccess"
              no-caps
              color="primary"
              class="full-width"
              :label="isSuccess ? $t('requestEmailAgainButton') : $t('requestEmailButton')"
              @click="sendResetPasswordEmail"
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
import { Vue, Component } from "vue-property-decorator";

enum State {
  Form,
  Success
}

@Component
export default class PageRequestPasswordReset extends Vue {
  state = State.Form;
  errorMsg = "";

  email = "";

  get isForm() {
    return this.state === State.Form;
  }
  get isSuccess() {
    return this.state === State.Success;
  }

  sendResetPasswordEmail() {
    this.$ccApi
      .sendResetPasswordEmail(this.email)
      .then(() => (this.state = State.Success))
      .catch(err => {
        this.errorMsg = this.$t("errorMessage", {message: err.message}) as string;
      });
  }
}
</script>
