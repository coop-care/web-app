<template>
  <q-page class="window-width row justify-center">
    <div class="column">
      <div class="row">
        <q-card class="credentials bg-grey-2 shadow-1 q-mt-xl">
          <q-card-section>
            <div class="text-h5 text-center">
              <div v-if="isPending">{{ $t("confirmationInProgress") }}</div>
              <div v-else-if="isConfirmed">{{ $t("didConfirmEmailAddress") }}</div>
              <div v-else>
                <div>{{ $t("confirmationInProgress") }}</div>
                <div class="q-mt-md text-body1 text-negative">{{ errorMsg }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions
            v-if="isConfirmed"
            class="q-px-md q-pb-md"
          >
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              :label="$t('goToLogin')"
              :to="{ name: 'login' }"
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
  min-height: 150px
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

enum State {
  Pending,
  Confirmed,
  Error
}

@Component
export default class PageConfirm extends Vue {
  state = State.Pending;
  errorMsg = "";

  get isPending() {
    return this.state === State.Pending;
  }
  get isConfirmed() {
    return this.state === State.Confirmed;
  }

  mounted() {
    const token = String(this.$route.query.token);
    const tokenId = String(this.$route.query.tokenId);
    this.$ccApi
      .confirmUser(token, tokenId)
      .then(() => (this.state = State.Confirmed))
      .catch(err => {
        this.state = State.Error;
        this.errorMsg = this.$t("errorMessage", {message: err.message}) as string;
      });
  }
}
</script>