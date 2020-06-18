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
    return this.$store.direct.state.signature;
  }
  set signature(value) {
    this.$store.direct.commit.setSignature({ signature: value });
  }
  done() {
    this.$router.push("/");
  }
}
</script>
