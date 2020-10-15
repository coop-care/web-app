<template>
  <problem-summary-container class="intervention">
    <div ref="interventionList">
      <editable-intervention
        v-for="(intervention, index) in interventions"
        :key="intervention.id"
        :value="intervention"
        :isExpanded="index == editedIntervention"
        @did-expand="didExpand(index)"
        @did-collapse="didCollapse"
        @delete-intervention="deleteIntervention(index)"
        class="editable-intervention"
      />
    </div>
    <div class="column items-center">
      <div
        v-if="!interventions.length"
        class="text-body2 text-center"
      >{{ $t("noPlannedInterventions") }}</div>
      <q-btn
        icon="add"
        color="intervention"
        :label="$t('addIntervention')"
        rounded
        outline
        class="shadow-1 q-mt-md"
        @click="addIntervention"
        size="12.5px"
      />
    </div>
  </problem-summary-container>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { scroll } from "quasar";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";
import EditableIntervention from "./EditableInterventionV2.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";

const { setScrollPosition } = scroll;

@Component({
  components: {
    EditableIntervention,
    ProblemSummaryContainer
  }
})
export default class InterventionView extends Vue {
  editedIntervention = -1;

  get interventions() {
    return this.record?.interventions || [];
  }
  set interventions(interventions) {
    const changes: any = {};
    const key: keyof ProblemRecord = "interventions";
    changes[key] = interventions;
    this.$store.direct.commit.updateObject({
      target: this.record,
      changes: changes
    });
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  addIntervention() {
    const keepPosition = this.editedIntervention < 0;
    this.interventions = this.interventions.concat([new Intervention()]);
    this.editedIntervention = this.interventions.length - 1;
    this.adjustScrollPosition(keepPosition);
  }
  deleteIntervention(atIndex: number) {
    this.interventions = this.interventions.filter(
      (item, index) => index != atIndex
    );
    if (this.editedIntervention == atIndex) {
      this.editedIntervention = -1;
    }
  }
  didExpand(index: number) {
    const keepPosition =
      this.editedIntervention < 0 || index < this.editedIntervention;
    this.editedIntervention = index;
    this.adjustScrollPosition(keepPosition);
  }
  didCollapse() {
    this.editedIntervention = -1;
  }
  adjustScrollPosition(keepPosition: boolean) {
    if (keepPosition) {
      this.keepScrollPosition();
    } else {
      setTimeout(this.scroll, 0);
    }
  }
  keepScrollPosition() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    setTimeout(() => window.scrollTo(scrollX, scrollY), 0);
  }
  scroll() {
    const interventionList = this.$refs.interventionList as HTMLElement;
    const offsetParent = interventionList.offsetParent as HTMLElement;
    const firstItem = interventionList.firstChild as HTMLElement;
    const firstItemHeader = firstItem?.querySelector(".q-item") as HTMLElement;
    const offsetTop =
      (offsetParent?.offsetTop || 0) + (firstItem?.offsetTop || 0);
    const headerHeight = firstItemHeader?.offsetHeight || 0;
    const offset = offsetTop + headerHeight * this.editedIntervention;
    const duration = 250;
    setScrollPosition(window, offset, duration);
  }
}
</script>
