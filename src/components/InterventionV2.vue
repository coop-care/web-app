<template>
  <div
    class="intervention"
    v-if="record"
  >
    <div class="row q-col-gutter-lg">
      <div
        class="col-md-9 col-12"
        ref="interventionList"
      >
        <editable-intervention
          v-for="(intervention, index) in interventions"
          :key="intervention.id"
          :value="intervention"
          :isExpanded="index == editedIntervention"
          @didExpand="didExpand(index)"
          @didCollapse="didCollapse"
          @deleteIntervention="deleteIntervention(index)"
          class="editable-intervention"
        />
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
      </div>
      <div class="col-md-3 col-12 summary">
        <problem-summary
          :problemRecord="record"
          :params="$route.params"
          :isSummary="true"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { scroll } from "quasar";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";
import EditableIntervention from "./EditableIntervention.vue";
import ProblemSummary from "./ProblemSummary.vue";

const { setScrollPosition } = scroll;
const nameof = (name: keyof ProblemRecord) => name;

@Component({
  components: {
    EditableIntervention,
    ProblemSummary
  }
})
export default class InterventionView extends Vue {
  editedIntervention = -1;

  get interventions() {
    return this.record?.interventions || [];
  }
  set interventions(interventions) {
    const notInterventions =
      this.record?.reminders.filter(
        reminder => !(reminder instanceof Intervention)
      ) || [];
    const changes: any = {};
    changes[nameof("reminders")] = notInterventions.concat(interventions);
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
