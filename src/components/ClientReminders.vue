<template>
  <div v-touch-swipe.mouse.horizontal="swipeTasks">
    <div class="row">
      <div>
        <div class="text-h6">{{ formattedDate({weekday: "long" }) }} {{ isToday ? $t("isTodayHint") : "" }}</div>
        <div class="text-body2">{{ formattedDate({year: "numeric", month: "long", day: "numeric" }) }}</div>
      </div>
      <div class="q-mt-xs q-ml-sm">
        <q-btn
          icon="add"
          round
          outline
          class="shadow-1 on-right"
          color="intervention"
          :title="$t('addTask')"
          size="12px"
        />
        <q-btn
          icon="event"
          round
          outline
          class="shadow-1 on-right"
          color="intervention"
          size="12px"
        >
          <q-popup-proxy
            ref="dateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="selectedDateString"
              @input="$refs.dateProxy.hide()"
              :events="[]"
              event-color="intervention"
              mask="YYYY-MM-DDTHH:mm:ss.sssZ"
              today-btn
            />
          </q-popup-proxy>
        </q-btn>
      </div>
    </div>
    <div
      v-for="(visit, index) in tasks"
      v-bind:key="index"
    >
      <div class="text-subtitle1 text-weight-bold q-mt-lg">{{ visit.time }}</div>
      <searchable-option-list
        color="intervention"
        :options="visit.tasks"
        allowMultipleSelection
        v-model="foo"
        dense
      />
    </div>
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date, uid } from "quasar";
import SearchableOptionList from "./SearchableOptionList.vue";

@Component({ components: { SearchableOptionList } })
export default class ClientReminders extends Vue {
  selectedDate = new Date();
  foo = [];

  get selectedDateString() {
    return this.selectedDate.toISOString();
  }
  set selectedDateString(value: string) {
    this.selectedDate = new Date(value);
  }
  get tasks() {
    return [
      {
        time: this.$t("anytimeTitle"),
        tasks: [this.makeTask("Arzttermin", "02", "10")]
      },
      {
        time: "09:00",
        tasks: [
          this.makeTask("Stützstrümpfe anlegen", "01", "63"),
          this.makeTask("Medikamente richten", "01", "34"),
          this.makeTask("Große Körperpflege", "01", "41")
        ]
      },
      {
        time: "20:30",
        tasks: [this.makeTask("Stützstrümpfe abnehmen", "01", "63")]
      }
    ];
  }
  get isToday() {
    return date.isSameDate(this.selectedDate, new Date(), "day");
  }

  formattedDate(options: any) {
    return this.selectedDate.toLocaleDateString(
      this.$root.$i18n.locale,
      options
    );
  }
  makeTask(title: string, category: string, target: string) {
    return {
      title: title,
      description:
        this.$t("terminology.categoryByCode." + category + ".title") +
        ": " +
        this.$t("terminology.targetByCode." + target + ".title"),
      code: uid()
    };
  }
  swipeTasks({ direction }: any) {
    if (direction == "left") {
      this.selectedDate = date.addToDate(this.selectedDate, { days: 1 });
    } else if (direction == "right") {
      this.selectedDate = date.subtractFromDate(this.selectedDate, { days: 1 });
    }
  }
}
</script>
