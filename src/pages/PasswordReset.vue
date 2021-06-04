<template>
  <q-page class="window-width row justify-center">
    <div class="column">
      <div class="row">

        <q-card
          v-if="isForm"
          class="credentials bg-grey-2 shadow-1 q-mt-xl"
        >
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("newPasswordTitle") }}</div>
          </q-card-section>
          <q-card-section>
            <p
              v-if="errorMsg"
              class="text-red q-mt-md"
            >{{ errorMsg }}</p>
            <q-form class="q-gutter-md">
              <q-input
                clearable
                v-model="password"
                type="password"
                :label="$t('newPassword')"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              :label="$t('save')"
              @click="resetPassword"
            />
          </q-card-actions>
        </q-card>

        <q-card 
          v-else-if="isSuccess"
          class="credentials bg-grey-2 shadow-1 q-mt-xl"
        >
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("newPasswordTitle") }}</div>
          </q-card-section>
          <q-card-section>
            <p class="q-mt-md text-center">{{ $t("passwordResetSuccessfulMessage") }}</p>
          </q-card-section>
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              :label="$t('gotoLoginButton')"
              @click="$router.push({ name: 'login' })"
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
export default class PagePasswordReset extends Vue {
  state = State.Form;
  errorMsg = "";
  password = "";

  get isForm() {
    return this.state === State.Form;
  }
  get isSuccess() {
    return this.state === State.Success;
  }

  resetPassword() {
    const token = String(this.$route.query.token);
    const tokenId = String(this.$route.query.tokenId);
    this.$ccApi
      .resetPassword(token, tokenId, this.password)
      .then(() => (this.state = State.Success))
      .catch(err => {
        this.errorMsg = this.$t("errorMessage", {message: err.message}) as string;
      });
  }
}
</script>
