<template>
  <div>
    <q-item class="q-mt-sm q-px-sm q-pb-none text-subtitle1 text-weight-bold">
      <q-item-section>
        <q-item-label class="ellipsis">{{ $t("de.compensationAgreement", 2) }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          icon="add"
          round
          outline
          size="10.5px"
          color="primary"
          @click.stop="add"
          :title="$t('de.addCompensationAgreement')"
          class="shadow-1"
        />
      </q-item-section>
    </q-item>
    <navigation-items
      :items="vereinbarungenOptions"
      type="splitview"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import BackofficeMixin, { BackofficeMixinInterface } from "src/mixins/BackofficeMixin";
import { Verguetungsvereinbarung } from "src/models/localized/de"
import NavigationItems from "components/NavigationItems.vue";
import { plainToInstance } from "class-transformer";

interface BackofficeCompensationAgreementList extends BackofficeMixinInterface {};

@Component({
  components: {
    NavigationItems
  },
  mixins: [BackofficeMixin],
  emits: ["did-route"]
})
class BackofficeCompensationAgreementList extends Vue {
  get vereinbarungen(): Verguetungsvereinbarung[] {
    return this.backoffice?.customValue<any[]>("de.verguetungsvereinbarungen")
      ?.map((plain: any) => plainToInstance(Verguetungsvereinbarung, plain)) || [];
  }
  get vereinbarungenOptions() {
    return this.vereinbarungen.map(item => ({
      label: item.label || this.$t("de.newVerguetungsvereinbarung"),
      caption: [item.verguetungsart, item.bundesland].filter(Boolean).join(", "),
      action: () => this.showVereinbarung(item.id),
      active: this.$route.name == "backofficeCompensationAgreement" 
        && item.id == this.$route.params.agreementId
    }))
  }

  add() {
    const vereinbarung = new Verguetungsvereinbarung();
    this.saveBackofficeCustomField("de.verguetungsvereinbarungen", this.vereinbarungen.concat(vereinbarung));
    this.showVereinbarung(vereinbarung.id, true)
  }
  showVereinbarung(agreementId: string, editMode = false) {
    const query =  editMode ? {edit: "1"} : undefined;
    void this.pushRoute("backofficeCompensationAgreement", {agreementId}, query);
    this.$emit("did-route");
  }
}

export default BackofficeCompensationAgreementList;
</script>
