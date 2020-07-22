<template>
  <q-page
    padding
    class="limit-page-width flex justify-center"
  >
    <div>
      <div class="col q-gutter-lg">
        <q-input
          v-model="signature"
          :label="$t('signatureMark')"
          :error="signature.trim().length < 2"
          :error-message="$t('signatureMarkHint')"
          :hint="$t('signatureMarkHint')"
          hide-bottom-space
          :autofocus="signature.trim().length < 2"
          maxlength="3"
          style="max-width: 300px"
        />
        <div class="row justify-end">
          <q-btn
            :disable="signature.trim().length < 2"
            :label="$t('done')"
            color="primary"
            rounded
            @click="done"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class UserSettingsPage extends Vue {
  get signature() {
    return this.$store.direct.getters.signature;
  }
  set signature(value) {
    const user = this.$store.direct.state.currentUser?.clone();
    if (user) {
      user.signature = value;
    }
    this.$store.direct.dispatch.saveUser(user);
  }
  done() {
    this.$router.push("/");
  }
}
</script>
