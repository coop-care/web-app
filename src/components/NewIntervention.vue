<template>
  <div
    class="intervention"
    v-if="record"
  >
    <div class="row q-col-gutter-lg">
      <div class="col-md-9 col-12">
        <h6 class="counter">{{ $t("selectInterventionCategory") }}</h6>
        <searchable-option-list
          color="intervention"
          :options="terminology.interventionScheme.categories"
          v-model="categoryCode"
        />

        <h6 class="counter">{{ $t("selectInterventionTarget") }}</h6>
        <div v-if="true">
          <i18n
            path="frequentInterventionTargetsForProblem"
            tag="div"
            class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm"
          >
            <template v-slot:problem>
              <span class="text-weight-bold">{{ $t(record.problem.title) }}</span>
            </template>
          </i18n>
          <searchable-option-list
            color="intervention"
            :options="terminology.interventionScheme.targets.concat([]).slice(0, 5)"
            v-model="targetCode"
          />
          <q-expansion-item
            :label="$t('otherInterventionTargetSelection')"
            header-class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm q-px-none dense-avatar"
            switch-toggle-side
            :default-opened="false"
          >
            <searchable-option-list
              color="intervention"
              :searchInputLabel="$t('findTargets')"
              :options="terminology.interventionScheme.targets"
              v-model="targetCode"
            />
          </q-expansion-item>
        </div>
        <div v-else>
          <searchable-option-list
            color="intervention"
            :searchInputLabel="$t('findTargets')"
            :options="terminology.interventionScheme.targets"
            v-model="targetCode"
          />
        </div>

        <h6 class="counter">{{ $t("describeClientSpecificIntervention") }}</h6>
        <q-input
          :model="details"
          :label="$t('clientSpecificInterventions')"
          autogrow
          color="intervention"
          debounce="50"
          :hint="$t('clientSpecificInterventionsHint')"
          filled
          dense
        />

        <h6 class="counter">{{ $t("planReminder") }}</h6>
        <div class="row q-col-gutter-lg q-mb-lg items-start">
          <q-input
            type="datetime"
            mask="datetime"
            v-model="startdate"
            :label="$t('addReminderTime')"
            color="intervention"
            class="col-md-4 col-sm-6 col-12"
          >
            <template v-slot:prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                color="intervention"
              >
                <q-popup-proxy
                  ref="startdateDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="startdate"
                    mask="YYYY-MM-DD HH:mm"
                    color="intervention"
                    @input="$refs.startdateDateProxy.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon
                v-if="startdate"
                name="cancel"
                @click.stop="startdate = null"
                class="cursor-pointer"
              />
              <q-icon
                name="access_time"
                class="cursor-pointer"
                color="intervention"
              >
                <q-popup-proxy
                  ref="startdateTimeProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="startdate"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                    color="intervention"
                    @input="$refs.startdateTimeProxy.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <edit-reminder
            v-if="startdate"
            class="col-md-8 col-sm-6 col-12"
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
import { Terminology } from "../helper/terminology";
import ProblemSummary from "../components/ProblemSummary.vue";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import EditReminder from "../components/EditReminder.vue";

@Component({
  components: {
    ProblemSummary,
    SearchableOptionList,
    EditReminder
  }
})
export default class Intervention extends Vue {
  categoryCode = "";
  targetCode = "";
  details = "";
  startdate = null;

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
  }
}
</script>