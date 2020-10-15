<template>
  <q-timeline-entry
    :color="color"
    :icon="icon"
    class="cursor-pointer change-record"
    @click="isExpanded = !isExpanded"
  >
    <template v-slot:title>
      <q-expansion-item
        v-model="isExpanded"
        dense
        switch-toggle-side
        expand-icon-toggle
        :expand-icon-class="'expand-icon text-' + color"
      >
        <template v-slot:header>
          <simplified-markdown
            :text="title"
            :class="'title text-' + color"
          />
        </template>
        <table
          v-if="isExpanded"
          class="text-body2"
        >
          <tbody>
            <tr
              v-for="property in details"
              :key="property.key"
            >
              <td class="text-no-wrap text-caption text-weight-medium text-right vertical-top">
                {{ property.key }}:
              </td>
              <td class="vertical-top">{{ property.newValue }}</td>
              <td
                v-if="property.oldValue"
                class="q-ml-md vertical-top"
              >
                <span class="text-caption text-weight-medium">{{ $t("previously") }}:</span>
                <span class="text-italic"> {{ property.oldValue }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </q-expansion-item>
    </template>
    <template v-slot:subtitle>
      <div>{{ date }}</div>
      <div>{{ username }}</div>
    </template>
  </q-timeline-entry>
</template>

<style lang="sass">
.change-record
  .title
    font-size: 1rem
  .q-timeline__content
    padding: 0 0 4px
  .q-item
    padding-left: 0
    padding-right: 0
  .expand-icon
    justify-content: flex-start
    min-width: inherit
    padding-left: 8px
    padding-right: 4px
    margin-top: -1px
.q-timeline--comfortable .change-record
  .q-timeline__title table
    margin-left: 40px
.q-timeline--dense .change-record
  margin-left: 8px
  .q-timeline__subtitle div
    display: inline
    &:first-of-type::after
      content: " – "
  .expand-icon
    padding-left: 0
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { DateTime } from "luxon";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";
import { Intervention, ChangeRecord, Problem, RRuleSet } from "../models";

@Component({
  components: {
    SimplifiedMarkdown,
  },
})
export default class ClientHistoryEntry extends Vue {
  @Prop({ type: Object, required: true }) readonly changeRecord!: ChangeRecord;

  isExpanded = false;

  get title() {
    const type = this.changeRecord.type;
    const problemTitle = this.record
      ? this.$t(this.record?.problem.title)
      : this.$t("unspecifiedProblem");
    const interventionId: string = type.startsWith("Intervention")
      ? this.changeRecord.newValues.id || ""
      : "";
    const intervention = this.client?.findReminder(interventionId) as
      | Intervention
      | undefined;
    return this.$t(type + "Title", {
      problem: problemTitle,
      intervention: intervention?.details,
    });
  }
  get date() {
    const locale = this.$root.$i18n.locale;
    return this.changeRecord.createdAt.toLocaleString(
      locale,
      DateTime.DATETIME_MED
    );
  }
  get username() {
    return this.changeRecord.username;
  }
  get color() {
    return (
      (/(intervention)|(classification)|(outcome)/.exec(this.changeRecord.type
        .toLowerCase()
        .replace("problem", "classification")) || [])[0] ||
      "primary"
    );
  }
  get icon() {
    const type = this.changeRecord.type;
    if (
      ["ProblemCreated", "InterventionStarted", "OutcomeRated"].includes(type)
    ) {
      return "add";
    } else if (["ProblemModified", "InterventionModified"].includes(type)) {
      return "edit";
    } else if (["ProblemResolved", "InterventionEnded"].includes(type)) {
      return "clear";
    } else {
      return "";
    }
  }
  get details() {
    const type = this.changeRecord.type;
    const newValues = this.changeRecord.newValues;
    const oldValues = this.changeRecord.oldValues || {};

    return Object.keys(newValues)
      .map((key) => {
        const newValue = newValues[key];
        const oldValue = oldValues[key];

        if (key == "details") {
          if (type.startsWith("Problem")) {
            key = "problem.details";
          } else if (type.startsWith("Intervention")) {
            key = "intervention.details";
          }
        }

        const localizableKey = this.localizableKeys[key];
        return {
          key: localizableKey ? this.$t(localizableKey) : key,
          newValue: this.formattedValue(key, newValue, newValues),
          oldValue: this.formattedValue(key, oldValue, oldValues),
        };
      })
      .filter((item) => item.newValue);
  }
  get localizableKeys(): Record<string, string> {
    return {
      scopeCode: "scopeTitle",
      severityCode: "severityTitle",
      signsAndSymptomsCodes: "signsAndSymptoms",
      isHighPriority: "highPriority.title",
      "problem.details": "notice",
      priorityDetails: "lowPriorityReasonLabel",
      knowledge: "terminology.problemRatingScale.ratings[0].title",
      behaviour: "terminology.problemRatingScale.ratings[1].title",
      status: "terminology.problemRatingScale.ratings[2].title",
      personRatedInPlaceOfOwner: "personRatedInPlaceOfOwnerTitle",
      recurrenceRules: "reminderTitle",
      categoryCode: "category",
      targetCode: "interventionTargetTitle",
      "intervention.details": "description",
    };
  }
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.client?.findProblemRecord(this.changeRecord.problemId);
  }

  formattedValue(key: string, value: any, values: Record<string, any>) {
    if (value == undefined) {
      return;
    } else if (key == "scopeCode") {
      const problem = new Problem();
      problem[key] = value;
      return this.$t(problem.scope.title).toString();
    } else if (key == "severityCode") {
      const problem = new Problem();
      problem[key] = value;
      return this.$t(problem.severity.title).toString();
    } else if (key == "signsAndSymptomsCodes") {
      if (this.record) {
        const problem = new Problem();
        problem.code = this.record.problem.code;
        problem.severityCode = values.severityCode;
        problem.details = values.details;
        problem[key] = value;
        const otherSignAndSymptom = problem.otherSignAndSymptom
          ? ": " + problem.otherSignAndSymptom
          : "";
        return (
          problem.signsAndSymptoms
            .map((item) => this.$t(item.title).toString())
            .join(", ") + otherSignAndSymptom
        );
      } else {
        return undefined;
      }
    } else if (key == "isHighPriority") {
      return value ? this.$t("yes") : this.$t("no");
    } else if (key == "problem.details") {
      const problem = new Problem();
      problem.severityCode = values.severityCode;
      problem.details = value;
      return problem.severityDetails;
    } else if (key == "priorityDetails") {
      return value;
    } else if (key == "knowledge" || key == "behaviour" || key == "status") {
      if (value) {
        const indexForKey = { knowledge: 0, behaviour: 1, status: 2 };
        const texts: string[] = [];
        if (value.comment) {
          texts.push(this.$t("quotedText", { quote: value.comment }) as string);
        }
        if (value.observation) {
          const rating = this.$t(
            "terminology.problemRatingScale.ratings[" +
              indexForKey[key] +
              "].scale[" +
              (value.observation - 1) +
              "].title"
          ) as string;
          texts.push((this.$t("observedRating") as string) + ": " + rating);
        }
        if (value.expectation) {
          const rating = this.$t(
            "terminology.problemRatingScale.ratings[" +
              indexForKey[key] +
              "].scale[" +
              (value.expectation - 1) +
              "].title"
          );
          texts.push(this.$t("expectedRating") + ": " + rating);
        }
        return texts.join(", ");
      } else {
        return value;
      }
    } else if (key == "personRatedInPlaceOfOwner") {
      return value;
    } else if (key == "recurrenceRules") {
      return value
        ? RRuleSet.fromJSON(value)?.toLocalizedText(
            this.$root.$i18n.locale,
            (this.$t("rrule") as unknown) as Record<string, string>,
            {
              monthNames: this.$q.lang.date.months,
              dayNames: this.$q.lang.date.days,
              tokens: {},
            }
          )
        : value;
    } else if (key == "categoryCode") {
      const intervention = new Intervention();
      intervention[key] = value;
      return this.$t(intervention.category.title).toString();
    } else if (key == "targetCode") {
      const intervention = new Intervention();
      intervention[key] = value;
      return this.$t(intervention.target.title).toString();
    } else if (key == "intervention.details") {
      return value;
    } else {
      return undefined;
    }
  }
}
</script>
