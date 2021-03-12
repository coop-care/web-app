
import { ObjectID } from "bson";
import { Vue, Component } from "vue-property-decorator";
import { Client, Intervention, RRuleSet } from "../models";

@Component
export default class InterventionMixin extends Vue {

  interventionDescription(intervention: Intervention) {
    return [this.$t(intervention.category.shortTitle), this.$t(intervention.target.title)]
      .filter(Boolean)
      .join(": ");
  }

  findContactName(contactId?: ObjectID, client?: Client) {
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
  }

  localizeRecurrenceRule(recurrenceRules?: RRuleSet, ruleIndex = -1) {
    return recurrenceRules?.toLocalizedText(
      this.$root.$i18n.locale,
      (this.$t("rrule") as unknown) as { [key: string]: string },
      {
        monthNames: this.$q.lang.date.months,
        dayNames: this.$q.lang.date.days,
        tokens: {}
      },
      ruleIndex
    ) || "";
  }

}
