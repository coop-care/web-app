<template>
  <div v-if="$store.direct.getters.isLocalAuth">
    <q-btn
      v-if="!isChangePassword"
      :label="$t('changePassword')"
      no-caps
      flat
      rounded
      color="primary"
      @click="isChangePassword = true"
    />
    <div v-else>
      <div class="row q-col-gutter-md">
        <q-input
          v-model="oldPassword"
          :label="$t('currentPassword')"
          class="col-12"
        />
        <q-input
          v-model="newPassword1"
          :label="$t('newPassword')"
          class="col-sm-6 col-12"
        />
        <q-input
          v-model="newPassword2"
          :label="$t('repeatNewPassword')"
          class="col-sm-6 col-12"
        />
      </div>
      <div v-if="errorMessagePassword" class="q-mt-md text-negative">{{ errorMessagePassword }}</div>
      <div class="q-mt-md row items-center">
        <q-btn
          :label="$t('changePassword')"
          no-caps
          unelevated
          rounded
          color="primary"
          class="q-mr-md"
          :disabled="!canChangePassword"
          @click="changePassword"
        />
        <q-btn
          :label="$t('cancel')"
          no-caps
          flat
          rounded
          color="primary"
          @click="endChangePasswordMode"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import LocalDatabaseApi from "src/api/local";
import { errorMessage } from "src/boot/i18n";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChangePasswordView",

  data() {
    return {
      oldPassword: "",
      newPassword1: "",
      newPassword2: "",
      isChangePassword: false,
      errorMessagePassword: "",
    }
  },

  computed: {
    canChangePassword(): boolean {
      return !!this.oldPassword && !!this.newPassword1 && this.newPassword1 == this.newPassword2;
    },
  },

  methods: {
    async changePassword() {
      if (this.canChangePassword) {
        try {
          await (this.$ccApi as LocalDatabaseApi).changePassword(this.oldPassword, this.newPassword1);
          this.endChangePasswordMode();
          this.$q.notify({
            type: "positive",
            message: this.$t("passwordChangeSuccessMessage"),
            progress: true,
            timeout: 2000
          });
        } catch(error) {
          this.errorMessagePassword = errorMessage(error);
        }
      }
    },

    endChangePasswordMode() {
      this.isChangePassword = false;
      this.oldPassword = "";
      this.newPassword1 = "";
      this.newPassword2 = "";
      this.errorMessagePassword = "";
    },
  },
});
</script>
