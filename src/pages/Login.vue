<template>
  <q-page class="window-width row justify-center">
    <div class="column">
      <div class="row">
        <q-card class="credentials bg-grey-2 shadow-1 q-mt-xl">
          <q-card-section>
            <div class="text-h5 text-center">{{ $t("welcome") }}!</div>
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
              <q-input
                clearable
                v-model="password"
                type="password"
                :label="$t('password')"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              :label="$t('login')"
              @click="doLogin"
            />
            <q-btn
              flat
              dense
              no-caps
              size="md"
              color="primary"
              class="text-center full-width q-mt-lg"
              :label="$t('forgotPassword')"
              :to="{ name: 'requestPasswordReset' }"
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

@Component
export default class PageLogin extends Vue {
  email = "";
  password = "";
  errorMsg = "";

  doLogin() {
    this.$store.direct.dispatch
      .login({ email: this.email, password: this.password, locale: this.$root.$i18n.locale })
      .then(() => {
        void this.$router.push({ name: "clientNoneSelected" });
      })
      .catch(err => {
        this.errorMsg = this.$t("errorMessage", {message: err.message}) as string;
      });
  }
}
</script>
