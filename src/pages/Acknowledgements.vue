<template>
  <q-page
    padding
    class="limit-page-width width-xs"
  >
    <div class="q-mt-md q-mb-lg text-body2">
      <div class="text-h4 text-weight-medium q-mb-lg">{{ $t("acknowledgements") }} ❤️</div>
      <div>{{ $t("acknowledgementsIntro") }}</div>
    </div>
    <div class="q-mb-lg text-body2">
      <div class="text-h5 text-weight-medium q-mb-xs">{{ $t("omahaSystem") }}</div>
      <div class="q-mb-md">{{ $t("acknowledgementsOmahaSystemIntro") }}</div>
      <div>{{ $t("acknowledgementsOmahaSystemPublicDomain") }}</div>
      <q-markdown
        class="q-mb-md" 
        :src="$t('acknowledgementsOmahaSystemReference') + ' ' + $t('omahaSystemBookReference')"
      />
      <div v-if="guidelineItems.length > 0">{{ $t("acknowledgementsOmahaSystemDependencies") }}</div>
      <acknowledgement-dependency
        v-for="(item, index) in guidelineItems"
        :key="index"
        group="omahasystemguidelines"
        :item="item"
      />
    </div>
    <div class="text-body2">
      <div class="text-h5 text-weight-medium q-mb-sm">{{ $t("ossComponents") }}</div>
      <div class="q-mb-md">{{ $t("acknowledgementsOpenSourceIntro", {count: ossLicenses.length}) }}</div>
    </div>
    <div class="q-mb-xl">
      <acknowledgement-dependency
        v-for="(item, index) in ossItems"
        :key="index"
        group="oss-licenses"
        :item="item"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import SimplifiedMarkdown from "components/SimplifiedMarkdown.vue";
import AcknowledgementDependency, { FormattedDependency } from "components/AcknowledgementDependency.vue";
import { Guideline } from "src/models/guideline";
import { TerminologyWithMaps } from "src/helper/terminology";
import { locale } from "src/boot/i18n";

type OSSDependency = {
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  license: string;
  licenseText: string;
  name: string;
  repository?: string;
  homepage?: string;
};

@Component({
  components: {
    SimplifiedMarkdown,
    AcknowledgementDependency
  }
})
export default class AcknowledgementsPage extends Vue {
  ossLicenses: OSSDependency[] = [];

  get guidelines() {
    return Object.values(this.$store.direct.state.guidelines)
      .concat(this.diagnosisDependency);
  }
  get diagnosisDependency() {
    if (Object.keys(this.$tm("diagnosisNames")).length > 0) {
      if (locale.value == "de-DE" ) {
        return {
          "schema": 1,
          "id": "",
          "locale": "",
          "versionDate": new Date(),
          "title": "Probleme der Klienten, die häufig mit ausgewählten Erkrankungen, medizinischen Diagnosen und Behandlungen einhergehen (Appendix C)",
          "description": "",
          "copyright": "Kein Teil dieser Veröffentlichung darf ohne schriftliche Genehmigung des Herausgebers Health Connection Press in irgendeiner Form oder mit irgendwelchen Mitteln, elektronisch oder mechanisch, einschließlich Fotokopien, Aufzeichnungen oder Informationsspeicher- und -abrufsystemen, vervielfältigt oder übertragen werden.",
          "url": "http://www.healthconnectionspress.com",
          "population": "",
          "diseasesOrCondition": "",
          "practiceSetting": "",
          "levelsOfPractice": "",
          "revisionDate": undefined,
          "encodedDate": undefined,
          "encodedBy": "Karen S. Martin",
          "translatedBy": "Michael Kamphausen",
          "contributors": "",
          "organizations": "",
          "sources": "Mit Genehmigung reproduziert und übersetzt: \n    Martin KS. (2005). \n    The Omaha System: A Key to Practice, Documentation, and Information Management (Reprinted 2nd ed.). \n    Omaha, NE: Health Connections Press.",
          "problems": {}
        };
      } else {
        return {
          "schema": 1,
          "id": "",
          "locale": "",
          "versionDate": new Date(),
          "title": "Client Problems Frequently Associated with Selected Conditions, Medical Diagnoses, and Treatments (Appendix C)",
          "description": "",
          "copyright": "No part of this publication may be reproduced or transmitted in any form or by any means, electronic or mechanical, including photocopying, recording, or any information storage and retrieval system, without permission in writing from the publisher, Health Connection Press.",
          "url": "http://www.healthconnectionspress.com",
          "population": "",
          "diseasesOrCondition": "",
          "practiceSetting": "",
          "levelsOfPractice": "",
          "revisionDate": undefined,
          "encodedDate": undefined,
          "encodedBy": "Karen S. Martin",
          "translatedBy": "",
          "contributors": "",
          "organizations": "",
          "sources": "Reprinted and translated with permission: \n    Martin KS. (2005). \n    The Omaha System: A Key to Practice, Documentation, and Information Management (Reprinted 2nd ed.). \n    Omaha, NE: Health Connections Press.",
          "problems": {}
        };
      }
    } else {
      return [];
    }
  }
  get guidelineItems(): FormattedDependency[] {
    return this.guidelines.map(guideline => ({
      label: guideline.title,
      caption: guideline.encodedBy,
      url: guideline.url,
      license: guideline.copyright
        ? this.$t("protectedByCopyright")
        : guideline.license || this.$t("unknownLicense"),
      licenseCaption: guideline.copyright || !guideline.license
        ? undefined
        : this.$t("license"),
      content: [{
          label: this.$t("description"),
          value: guideline.description
        },{
          label: this.$t("OmahaSystemProblems"),
          value: this.affectedProblems(guideline)
        },{
          label: this.$t("population"),
          value: guideline.population
        },{
          label: this.$t("diseasesOrCondition"),
          value: guideline.diseasesOrCondition
        },{
          label: this.$t("practiceSetting"),
          value: guideline.practiceSetting
        },{
          label: this.$t("levelsOfPractice"),
          value: guideline.levelsOfPractice
        },{
          label: this.$t("guidelineRevisionDate"),
          value: guideline.revisionDate?.constructor.name == "Date"
            ? this.$d(guideline.revisionDate, "DateShort")
            : undefined
        },{
          label: this.$t("encodedBy"),
          value: guideline.encodedBy
        },{
          label: this.$t("encodedDate"),
          value: guideline.encodedDate?.constructor.name == "Date"
            ? this.$d(guideline.encodedDate, "DateShort")
            : undefined
        },{
          label: this.$t("contributors"),
          value: guideline.contributors?.replace(/\n/g, "")
        },{
          label: this.$t("organizations"),
          value: guideline.organizations
        },{
          label: this.$t("sources"),
          value: guideline.sources
        },{
          label: this.$t("translation"),
          value: guideline.translatedBy
        },{
          label: this.$t("translationDate"),
          value: guideline.translationDate?.constructor.name == "Date" 
            ? this.$d(guideline.translationDate, "DateShort")
            : undefined
        },{
          label: this.$t("copyright"),
          value: guideline.copyright
        },{
          label: this.$t("license"),
          value: guideline.licenseText
        }]
        .filter(item => !!item.value)
    }))
  }
  get ossItems() {
    return this.ossLicenses.map(item => ({
      label: item.name,
      caption: item.author.name,
      url: item.homepage,
      repository: item.repository,
      captionEmail: item.author.email,
      captionUrl: item.author.url,
      license: item.license,
      licenseCaption: this.$t("license"),
      content: [{
        label: this.$t("license"),
        value: item.licenseText
      }],
    }))
  }
  get terminology() {
    return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
  }

  affectedProblems(guideline: Guideline) {
    const problemCodes = Object.keys(guideline.problems);

    if (problemCodes.length < 42) {
      return problemCodes
        .map(code => this.terminology.problemByCode[code]?.title)
        .join(", ");
    } else {
      return this.$t("all");
    }
  }

  async fetchLicenses() {
    this.ossLicenses = (await fetch("oss-licenses.json")
      .then(async response => {
        if (response.ok) {
            return response.text().then(text => JSON.parse(text));
        } else {
            return [];
        }
      }))
      .sort((a: OSSDependency, b: OSSDependency) => a.name.localeCompare(b.name));
  }

  mounted() {
    void this.fetchLicenses();
  }
}
</script>
