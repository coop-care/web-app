<template>
  <q-timeline
    v-if="items.length"
    color="primary"
    :layout="$q.screen.gt.xs ? 'comfortable' : 'dense'"
  >
    <q-timeline-entry
      :subtitle="item.subtitle"
      v-for="(item, index) in items"
      v-bind:key="index"
      :color="item.color"
    >
      <template v-slot:title>
        <simplified-markdown
          :text="item.title"
          :class="'timeline-item-title text-' + item.color"
        />
      </template>
    </q-timeline-entry>
  </q-timeline>
  <div
    v-else
    class="text-body2 text-italic q-mt-lg"
  >{{$t("noClientHistoryEntries")}}</div>
</template>

<style lang="sass">
.timeline-item-title
  font-size: 1.15rem
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { DateTime } from "luxon";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  components: {
    SimplifiedMarkdown
  }
})
export default class ClientHistory extends Vue {
  get items() {
    const locale = this.$root.$i18n.locale;
    const format = (date: Date) =>
      date.toLocaleString(locale, DateTime.DATETIME_MED);
    return [
      {
        title: "Neues Problem ***Kreislauf*** aufgenommen",
        subtitle: format(new Date(2020, 5, 3, 10, 12)),
        color: "classification"
      },
      {
        title: "Aufnahmebewertung für ***Kreislauf***",
        subtitle: format(new Date(2020, 5, 3, 10, 19)),
        color: "outcome"
      },
      {
        title:
          "Intervention **Kompressionsstrümpfe** geplant für ***Kreislauf***",
        subtitle: format(new Date(2020, 5, 3, 10, 25)),
        color: "intervention"
      },
      {
        title:
          "Intervention **Unterstützungssystem** geplant für ***Kreislauf***",
        subtitle: format(new Date(2020, 5, 3, 10, 31)),
        color: "intervention"
      },
      {
        title: "Neues Problem ***Medikation*** aufgenommen",
        subtitle: format(new Date(2020, 5, 18, 9, 57)),
        color: "classification"
      },
      {
        title: "Aufnahmebewertung für ***Medikation***",
        subtitle: format(new Date(2020, 5, 18, 10, 1)),
        color: "outcome"
      },
      {
        title: "Zwischenbewertung für ***Kreislauf***",
        subtitle: format(new Date(2020, 5, 24, 8, 32)),
        color: "outcome"
      },
      {
        title:
          "Intervention ***Kompressionsstrümpfe*** beendet für ***Kreislauf***",
        subtitle: format(new Date(2020, 5, 24, 8, 35)),
        color: "intervention"
      }
    ];
  }
}
</script>
