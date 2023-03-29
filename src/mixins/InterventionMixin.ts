
import { defineComponent } from "vue";
import { ObjectId } from "bson";
import { Client, Intervention, RRuleSet } from "../models";

export interface InterventionMixinInterface {
  interventionDescription(intervention: Intervention): string;
  findContactName(contactId?: ObjectId, client?: Client): string | undefined;
  localizeRecurrenceRule(recurrenceRules?: RRuleSet, ruleIndex?: number): string;
};

export default defineComponent({
  methods: {
    interventionDescription(intervention: Intervention) {
      return [intervention.category.shortTitle, intervention.target.title]
        .filter(Boolean)
        .map(value => this.$t(value))
        .join(": ");
    },

    findContactName(contactId?: ObjectId, client?: Client) {
      if (contactId) {
        const contact = client?.findContact(contactId);

        if (contact) {
          return contact.name || this.$t("withoutNames") as string;
        } else {
          return this.$t("deletedContact") as string;
        }
      } else {
        return undefined;
      }
    },

    localizeRecurrenceRule(recurrenceRules?: RRuleSet, ruleIndex = -1) {
      return recurrenceRules?.toLocalizedText(
        this.$i18n.locale,
        this.$tm("rrule") as Record<string, string>,
        {
          monthNames: this.$q.lang.date.months,
          dayNames: this.$q.lang.date.days,
          tokens: {}
        },
        ruleIndex
      ) || "";
    }
  }
});
