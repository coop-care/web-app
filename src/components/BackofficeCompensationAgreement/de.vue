<template>
  <div v-if="vereinbarung">
    <div class="text-h5 text-center q-mb-lg">{{ vereinbarung.label || $t("de.newVerguetungsvereinbarung") }}</div>
    <div class="row items-center q-gutter-x-md">
      <q-select
        :label="$t('de.leistungsbereich')"
        :model-value="vereinbarung.leistungsbereich"
        @update:model-value="saveVereinbarung({leistungsbereich: $event})"
        class="col"
        style="min-width: 200px"
      />
      <q-select
        :label="$t('de.bundesland')"
        :model-value="vereinbarung.bundesland"
        @update:model-value="saveVereinbarung({bundesland: $event})"
        class="col"
        style="min-width: 200px"
      />
    </div>
    <q-select
      :label="$t('de.kassenverband', 2)"
      :model-value="vereinbarung.kassenverband"
      @update:model-value="saveVereinbarung({kassenverband: $event})"
    />
    <div class="row items-center q-gutter-x-md">
      <q-input
        :label="$t('de.tarifkennzeichen')"
        :model-value="vereinbarung.tarifkennzeichen"
        @update:model-value="saveVereinbarung({tarifkennzeichen: $event}, false)"
        class="col"
        style="min-width: 200px"
      />
      <q-select
        :label="$t('de.verguetungsart')"
        :model-value="vereinbarung.verguetungsart"
        @update:model-value="saveVereinbarung({verguetungsart: $event})"
        class="col"
        style="min-width: 200px"
      />
    </div>

    <div class="text-h6 q-mt-xl">{{ $t("de.leistungen") }}</div>

    <div v-if="vereinbarung.verguetungsart == '01'">
      <div class="text-h6 q-mt-xl">{{ $t("de.zuschlaegeAbzuege") }}</div>
      <div class="text-caption">{{ $t("featureNotYetSupported") }}</div>
    </div>

    <div class="q-mt-xl">
      <q-btn
        :label="$t('de.deleteVerguetungsvereinbarung')"
        outline
        rounded
        no-caps
        color="negative"
        @click="deleteVereinbarung"
      />
    </div>
  </div>
  <div
    v-else
    :class="['q-pt-xs q-pb-md text-center text-body1 text-grey-7 text-italic', $q.screen.gt.xs ? 'q-px-md' : 'q-px-xs']"
  >
    {{ $t("dataNotFound") }}
  </div>
</template>

<script lang="ts">
import { plainToInstance } from "class-transformer";
import { Verguetungsvereinbarung } from "src/models/localized/de";
import { Component, Vue } from "vue-facing-decorator";
import BackofficeMixin, { BackofficeMixinInterface } from "../../mixins/BackofficeMixin";

interface BackofficeCompensationAgreement extends BackofficeMixinInterface {};

@Component({
  mixins: [BackofficeMixin]
})
class BackofficeCompensationAgreement extends Vue {

  get vereinbarungen(): Verguetungsvereinbarung[] {
    return this.backoffice?.customValue("de.verguetungsvereinbarungen") || [];
  }
  get vereinbarung(): Verguetungsvereinbarung | undefined {
    return plainToInstance(Verguetungsvereinbarung,
      this.vereinbarungen.find((item: { id: string; }) => item.id == this.$route.params.agreementId)
    );
  }

  saveVereinbarung(changes: Partial<Verguetungsvereinbarung>, immediately = true) {
    if (!this.vereinbarung || !this.backoffice) {
      return;
    }
    console.log(this.vereinbarung, changes);

    void this.$store.direct.commit.updateObject({
      target: this.vereinbarung,
      changes
    });
    immediately ? void this.saveBackoffice() : void this.saveBackofficeDelayed();
  }
  deleteVereinbarung() {
    const vereinbarung = this.vereinbarung;

    if (vereinbarung && this.isBackofficeAdmin) {
        this.$q.dialog({
          title: this.$t("confirmDeletionTitle") as string,
          persistent: true,
          ok: {
            label: this.$t("delete"),
            rounded: true,
            flat: true,
            noCaps: true,
            color: "negative"
          },
          cancel: {
            rounded: true,
            flat: true,
            noCaps: true
          }
        }).onOk(() => {
          void this.saveBackofficeCustomField(
            "de.verguetungsvereinbarungen",
            this.vereinbarungen.filter(item => item.id != vereinbarung.id)
          );
        });
    }
  }
}

export default BackofficeCompensationAgreement;
</script>
