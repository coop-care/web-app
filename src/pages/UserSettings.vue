<template>
  <q-page
    class="limit-page-width width-sm page-padding"
  >
    <pull-to-refresh>
      <div v-if="user">
        <div class="section-heading q-mt-none">{{ $t("personalUserDetails") }}</div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="firstName"
            :label="$t('firstName')"
            :autofocus="firstName.trim().length == 0"
            @change="save"
            class="col-sm-6 col-12"
          />
          <q-input
            v-model="lastName"
            :label="$t('lastName')"
            @change="save"
            class="col-sm-6 col-12"
          />
          <q-input
            v-model="signature"
            :label="$t('signatureMark')"
            :error="signature.trim().length < 2"
            :error-message="$t('signatureMarkHint')"
            :hint="$t('signatureMarkHint')"
            hide-bottom-space
            maxlength="3"
            class="col-sm-6 col-12"
          />
        </div>
        <div class="section-heading">{{ $t("appSettings") }}</div>
        <div class="col q-col-gutter-md">
          <q-select
            v-model="locale"
            :label="$t('appLanguageSetting')"
            :options="localeOptions"
            emit-value
            map-options
          />
          <q-select
            v-model="colorScheme"
            :label="$t('colorScheme')"
            :options="colorOptions"
            emit-value
            map-options
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section>{{ scope.opt.label }}</q-item-section>
                <q-item-section
                  side
                  class="color-bullets"
                >
                  <div
                    v-for="(color, index) in scope.opt.value || scope.opt.colors"
                    :key="scope.opt.label + index"
                    :style="'background-color: ' + color"
                  ></div>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                class="color-bullets-selected"
              >
                <q-item-section>{{ scope.opt.label }}</q-item-section>
                <q-item-section
                  side
                  class="color-bullets"
                >
                  <div
                    v-for="(color, index) in scope.opt.value || scope.opt.colors"
                    :key="scope.opt.label + index + 'selected'"
                    :style="'background-color: ' + color"
                  ></div>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="row justify-end q-mt-xl">
          <q-btn
            :disable="signature.trim().length < 2"
            :label="$t('done')"
            color="primary"
            rounded
            @click="done"
          />
        </div>
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<style lang="sass">
.color-bullets
  flex-direction: row
  align-items: center !important
  > div
    width: 1.4rem
    height: 1.4rem
    border-radius: .7rem
  > :nth-child(5)
    margin-left: .7rem
  > :nth-child(n + 5)
    width: .7rem
    height: .7rem
    border-radius: .35rem
    display: none
.color-bullets-selected
  width: 100%
  min-height: inherit
  padding: 0
</style>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { User } from "../models";
import { defaultColors, setColorSet } from "../helper/color";
import PullToRefresh from "components/PullToRefresh.vue";

@Component({
  components: {
    PullToRefresh
  }
})
export default class UserSettingsPage extends Vue {
  @Watch("canSuggestSignature")
  onCanSuggestSignatureChanged(value: boolean) {
    if (value) {
      this.signature = this.firstName[0] + this.lastName[0];
    }
  }

  get firstName() {
    return this.user.firstName;
  }
  set firstName(value) {
    void this.$store.direct.commit.updateCurrentUser(user => {
      user.firstName = value;
    });
  }
  get lastName() {
    return this.user.lastName;
  }
  set lastName(value) {
    void this.$store.direct.commit.updateCurrentUser(user => {
      user.lastName = value;
    });
  }
  get signature() {
    return this.user.signature || "";
  }
  set signature(value) {
    if (value && !this.allSignatures.includes(value)) {
      void this.$store.direct.commit.updateCurrentUser(user => {
        user.signature = value;
      });
    }
  }
  get locale() {
    return this.user.locale;
  }
  set locale(value) {
    void this.$store.direct.dispatch.saveCurrentUser(user => {
      user.locale = value;
    });
  }
  get colorScheme() {
    return this.user?.colorScheme || null;
  }
  set colorScheme(value) {
    void this.$store.direct.dispatch.saveCurrentUser(user => {
      user.colorScheme = value || undefined;
      setColorSet(value || defaultColors);
    });
  }

  get user() {
    return this.$store.direct.state.currentUser || new User("", "");
  }
  get isFirstContact() {
    return !this.signature.trim();
  }
  get canSuggestSignature() {
    return !this.user.signature && this.firstName && this.lastName;
  }
  get allSignatures() {
    return Object.values(this.$store.direct.state.teamMembers).map(member => member.signature);
  }
  get localeOptions() {
    return this.$root.$i18n.availableLocales.map(locale => {
      return {
        label: this.$t(locale),
        value: locale
      }
    })
  }
  get colorOptions() {
    return [
      {
        label: "Sunrise (" +  this.$t("default") + ")",
        value: null,
        colors: defaultColors
      },
      {
        label: "Classic Scheme",
        value: ["#0BB5B7", "#E63E22", "#EF971B", "#0BB5B7", defaultColors[4], defaultColors[5]],
      },
      {
        label: "Cold Pink",
        value: ["#C64EA9", "#F30062", "#3A85D5", "#7D49C3", defaultColors[4], defaultColors[5]],
      },
    ]
  }

  save() {
    void this.$store.direct.dispatch.saveCurrentUser(() => 0);
  }
  done() {
    void this.$router.push("/");
  }

  beforeDestroy() {
    this.save();
  }
}
</script>
