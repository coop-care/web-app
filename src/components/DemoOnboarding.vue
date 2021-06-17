<template>
  <q-dialog ref="dialog" persistent>
    <q-card class="q-dialog-plugin" style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ $t("demoOnboardingTitle") }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section
        style="max-height: 50vh"
        class="scroll q-pb-none"
      >
        <p>{{ $t("demoOnboardingDifferencesIntro") }}</p>
        <ul>
          <li
            v-for="item in differencesList"
            :key="item"
          >{{ item }}</li>
        </ul>
        <i18n path="demoOnboardingBetaProgramMessage" tag="p">
          <a :href="'mailto:mail@coopcare.de?subject=' + $t('demoOnboardingBetaProgramEmailSubject') + '&body=' + $t('demoOnboardingBetaProgramEmailMessage')"
            >{{ $t("demoOnboardingBetaProgramTitle") }}</a>
        </i18n>
        <i18n path="demoOnboardingFeedbackMessage" tag="p">
          <a :href="'mailto:feedback@coopcare.de?subject=' + $t('demoOnboardingFeedbackEmailSubject')"
            >{{ $t("demoOnboardingFeedbackTitle") }}</a>
        </i18n>
      </q-card-section>

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
import { Vue, Component, Ref } from "vue-property-decorator";
import { QDialog } from "quasar";

@Component
export default class DemoOnboarding extends Vue {
  @Ref() readonly  dialog!: QDialog;

  get differencesList() {
    return (this.$t("demoOnboardingDifferencesList") as string).split("\n");
  }

  show() {
    this.dialog.show();
  }
  hide() {
    this.dialog.hide();
  }
  onOKClick() {
    void this.$store.direct.dispatch.saveCurrentUser(user => {
      user.isOnboardingCompleted = true;
    });
    this.$emit("ok");
    this.hide();
  }
}
</script>
