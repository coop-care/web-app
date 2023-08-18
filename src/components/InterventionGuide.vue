<template>
  <div>
    <q-tabs
      v-model="currentCategory"
      no-caps
      indicator-color="intervention"
      active-color="white"
      class="text-intervention guide-tabbar"
      align="center"
      right-icon=" "
      left-icon=" "
      dense
    >
      <q-tab
        v-for="(categoryItem, index) in categories"
        v-bind:key="index"
        :name="categoryItem.code"
        :label="$q.screen.gt.xs ? categoryItem.title : ''"
        :icon="categoryItem.icon"
      >
        <q-badge
          :color="currentCategory == categoryItem.code ? 'white' : 'intervention'"
          :text-color="currentCategory == categoryItem.code ? 'intervention' : 'white'"
          floating
          rounded
          :label="interventionCountByCategory[categoryItem.code]"
          v-if="interventionCountByCategory[categoryItem.code]"
          class="text-weight-bold"
        />
      </q-tab>
    </q-tabs>
    <q-tab-panels
      v-model="currentCategory" 
      animated
    >
      <q-tab-panel
        v-for="(categoryItem, index) in categories"
        :key="index"
        :name="categoryItem.code"
        class="guide-content q-px-none"
      >
        <text-with-tooltip
          :text="$t('suggestedInterventionsForCategory', {category: categoryItem.title}) + ':'"
          :tooltip="categoryItem.description"
          class="text-center text-caption guide-category"
          icon-class="text-grey-7"
        />
        <div class="row justify-end">
          <q-btn
            :label="$t(canExpandAll ? 'expandAll' : 'collapseAll')"
            :icon="canExpandAll ? 'unfold_more' : 'unfold_less'"
            dense
            flat
            no-caps
            rounded
            color="intervention"
            :class="['q-px-md', $q.screen.lt.sm ? 'q-mt-xs' : '']"
            @click="toggleAllTargets"
          />
        </div>
        <div class="column-2">
          <q-expansion-item
            v-for="(targetItem, index) in guideTargetsByCategory[categoryItem.code]"
            :key="targetItem.code"
            :model-value="!collapsedTargets.has(targetCode(categoryItem, targetItem))"
            @update:model-value="toggleTargetExpanded($event, targetCode(categoryItem, targetItem))"
            switch-toggle-side
            dense
            dense-toggle
            header-class="q-pl-none q-pr-sm text-subtitle2 text-weight-bold"
            :class="[Math.ceil(guideTargetsByCategory[categoryItem.code].length / 2) == index + 1 ? 'column-break' : '']"
          >
            <template v-slot:header>
              <q-item-section>
                <text-with-tooltip 
                  :text="targetItem.title"
                  :tooltip="targetItem.description"
                  icon-class="text-grey-7"
                  class="first-letter-capitalize cursor-pointer"
                  top
                >
                <q-badge
                  color="intervention"
                  text-color="white"
                  rounded
                  :label="interventionCountByTarget[targetCode(categoryItem, targetItem)]"
                  v-if="collapsedTargets.has(targetCode(categoryItem, targetItem)) && interventionCountByTarget[targetCode(categoryItem, targetItem)]"
                  class="q-ml-xs text-weight-bold"
                />
                </text-with-tooltip>
              </q-item-section>
            </template>
            <q-option-group
              :model-value="selectedInterventions.concat(preselectedInterventions)"
              @update:model-value="selectedInterventions = $event.filter(code => !preselectedInterventions.includes(code))"
              :options="makeOptions(categoryItem, targetItem)"
              color="intervention"
              type="checkbox"
              class="q-pb-sm"
            />
          </q-expansion-item>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="q-mt-lg row justify-center">
      <q-btn
        @click="addInterventions"
        color="primary"
        rounded
        unelevated
        no-caps
        :label="$t('addSuggestedInterventions', selectedInterventions.length)"
        class="done-button"
      />
    </div>
  </div>
</template>

<style lang="sass">
.guide-tabbar
  border-bottom: 1px solid
  .q-tab
    transition: color 500ms
  .q-tab__label
    white-space: normal
    line-height: 1rem
  .q-tab__content
    z-index: 1
  .q-tab__indicator
    height: 100%
    border-top-left-radius: 10px
    border-top-right-radius: 10px
.guide-content
  .guide-category
    margin-top: -12px
    .text-bold
      @media (min-width: $breakpoint-xs-max)
        font-weight: normal
      @media (max-width: $breakpoint-xs-max)
        color: var(--q-intervention)
  .column-2
    @media screen and (max-width: 760px)
      column-count: 1
    .q-expansion-item
      break-inside: avoid-column
      .q-item__section--avatar
        padding-right: 4px
        align-items: flex-start
        min-width: auto
      .q-expansion-item__content
        padding-left: 26px
    .q-checkbox
      line-height: 1.1rem
      .q-checkbox__inner
        height: 32px
        width: 32px
        min-width: 32px
        margin-right: 4px
        .q-checkbox__bg
          left: 15%
          top: 15%
          width: 70%
          height: 70%

</style>

<script setup lang="ts">
import { Intervention } from "src/models";
import { computed, ref } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { HasTitleDescriptionCode, TerminologyWithMaps } from "src/helper/terminology";
import TextWithTooltip from "src/components/TextWithTooltip.vue";
import { useStore } from "src/store";
import { interventionSuggestions } from "src/models/guideline";

const emit = defineEmits(["update:model-value", "done"]);

const props = defineProps({
  modelValue: {
    type: Array as PropType<Intervention[]>,
    default: [] as Intervention[],
  },
  problemCode: {
    type: String,
    default: "",
  }
});

const { tm } = useI18n();
const store = useStore()

const currentCategory = ref("01");
const selectedInterventions = ref([] as string[]);
const collapsedTargets = ref(new Set<string>());


const terminology = computed(() => 
  ((tm("terminology") as unknown) as TerminologyWithMaps));

const guide = computed(() => 
  interventionSuggestions(store.direct.state.guidelines, props.problemCode) || {});

const categories = computed(() => 
  terminology.value.interventionScheme.categories);

const targets = computed(() => 
  terminology.value.interventionScheme.targets);

const allInterventions = computed(() => 
  selectedInterventions.value.concat(preselectedInterventions.value));

const interventionCountByCategory = computed(() => 
  allInterventions.value.reduce((result, item) => {
      const code = item.split(".").at(1) ?? "";
      result[code] = result[code] ?? 0;
      result[code] += 1;
      return result;
    }, {} as Record<string, number>));

const interventionCountByTarget = computed(() => 
  allInterventions.value.reduce((result, item) => {
      const code = item.split(".").slice(1, 3).join(".");
      result[code] = result[code] ?? 0;
      result[code] += 1;
      return result;
    }, {} as Record<string, number>));

const guideTargetsByCategory = computed(() => 
  Object.entries(guide.value).reduce((result, [categoryCode, items]) => {
    result[categoryCode] = Object.keys(items)
      .map(targetCode => targets.value.find(({code}) => code == targetCode)) as HasTitleDescriptionCode[];
    return result;
  }, {} as Record<string, HasTitleDescriptionCode[]>)
);

const preselectedInterventions = computed(() => 
  props.modelValue
    .filter(intervention => intervention.guideId && intervention.detailsCode && intervention.categoryCode && intervention.targetCode)
    .map(intervention => {
      const {guideId, categoryCode, targetCode, detailsCode} = intervention;
      return [guideId, categoryCode, targetCode, detailsCode].join(".")
    })
);

const guideTargetCodes = computed(() => 
  Object.entries(guide.value).flatMap(([categoryCode, items]) => 
    Object.keys(items).map(targetCode => categoryCode + "." + targetCode)
  )
);

const canExpandAll = computed(() => collapsedTargets.value.size > 0);


const targetCode = (categoryItem: HasTitleDescriptionCode, targetItem: HasTitleDescriptionCode) =>
  categoryItem.code + "." + targetItem.code;

const makeOptions = (categoryItem: HasTitleDescriptionCode, targetItem: HasTitleDescriptionCode) => 
  Object.entries(guide.value[categoryItem.code][targetItem.code])
    .map(([guideIdAndDetailsCode, label]) => {
      const [guideId, detailsCode] = guideIdAndDetailsCode.split(".");
      const value = [guideId, categoryItem.code, targetItem.code, detailsCode].join(".");
      return {label, value, disable: preselectedInterventions.value.includes(value)}
    });

const toggleTargetExpanded = (expanded: boolean, code: string) => {
  if (expanded) {
    collapsedTargets.value.delete(code);
  } else {
    collapsedTargets.value.add(code);
  }
}

const toggleAllTargets = () => {
  if (canExpandAll.value) {
    collapsedTargets.value.clear();
  } else {
    collapsedTargets.value = new Set(guideTargetCodes.value); // guideTargetCodes needs to be cloned
  }
}

const addInterventions = () => {
  if (selectedInterventions.value.length > 0) {
    const interventions = selectedInterventions.value.map(code => {
      const [guideId, categoryCode, targetCode, detailsCode] = code.split(".");
      const details = guide.value[categoryCode][targetCode][guideId + "." + detailsCode];
      const intervention = new Intervention();
      Object.assign(intervention, {guideId, categoryCode, targetCode, detailsCode, details});
      return intervention;
    })
    emit("update:model-value", props.modelValue.concat(interventions));
  }

  emit("done");
}

</script>