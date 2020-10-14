<template>
  <q-page class="window-height window-width row justify-center">
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
              class="text-center full-width q-mt-sm"
              :label="$t('notRegistered') + ' ' + $t('createAccount')"
              :to="{ name: 'register' }"
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
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class PageLogin extends Vue {
  email = "";
  password = "";

  errorMsg = "";

  doLogin() {
    this.$store.direct.dispatch
      .login({ email: this.email, password: this.password })
      .then(() => {
        void this.$router.push({ name: "client" });
      })
      .catch(err => {
        this.errorMsg = err.message;
      });
  }
}
</script>
