<template>
  <q-dialog
    ref="dialog"
    persistent
  >
    <q-card
      class="q-dialog-plugin"
      style="width: 600px"
    >
      <q-card-section>
        <div class="text-h6">{{ $t('demoOnboardingTitle') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section
        style="max-height: 50vh"
        class="scroll q-pb-none"
        v-html="$t('demoOnboardingMessage')"
      />

      <q-card-actions vertical>
        <q-btn
          :label="$t('onboardingDoneButton')"
          color="primary"
          no-caps
          unelevated
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QDialog } from "quasar";

@Component
export default class DemoOnboarding extends Vue {
  $refs!: { dialog: QDialog };

  show() {
    this.$refs.dialog.show();
  }
  hide() {
    this.$refs.dialog.hide();
  }
  onOKClick() {
    const user = this.$store.direct.state.currentUser?.clone();
    if (user) {
      user.isOnboardingCompleted = true;
      this.$store.direct.dispatch.saveUser(user);
    }
    this.$emit("ok");
    this.hide();
  }
}
</script>
