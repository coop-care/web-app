<template>
  <q-page class="">
    
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      header-nav
      animated
      flat
    >
      <q-step
        :name="1"
        :title="terminology.problemClassificationScheme.title"
        prefix="1"
        :done="step > 1"
        :header-nav="step > 1"
      >
        {{ terminology.problemClassificationScheme.title }}
      </q-step>

      <q-step
        :name="2"
        :title="terminology.problemRatingScale.title"
        prefix="2"
        :done="step > 2"
        :header-nav="step > 2"
      >
        {{ terminology.problemRatingScale.title }}
      </q-step>

      <q-step
        :name="3"
        :title="terminology.interventionScheme.title"
        prefix="3"
        icon="add_comment"
        :header-nav="step > 3"
      >
        {{ terminology.interventionScheme.title }}
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn v-if="step == 1" flat color="primary" to="/" label="Abbrechen" class="q-ml-sm" />
          <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Zurück" class="q-ml-sm" />
          <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 3 ? 'Fertig' : 'Weiter'" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue'
//@ts-ignore
import terminologyJson from '../data/terminology_DE.json'

let terminology = terminologyJson as unknown as Terminology

interface Titleable {
  title: string;
}
interface Describable {
  description: string;
}
interface TitleAndDescribable extends Titleable, Describable {}

interface Terminology extends Titleable {
  problemClassificationScheme: ProblemClassificationScheme;
  interventionScheme: InterventionScheme;
  problemRatingScale: ProblemRatingScale;
}
interface ProblemClassificationScheme extends Titleable {
  domains: Domain[];
  modifiers: {
    scope: TitleAndDescribable[];
    severity: TitleAndDescribable[];
  };
}
interface Domain extends TitleAndDescribable {
  problems: Problem[];
}
interface Problem extends TitleAndDescribable {
  signsAndSymptoms: Titleable;
}
interface InterventionScheme extends Titleable {
  categories: TitleAndDescribable[];
  targets: TitleAndDescribable[];
}
interface ProblemRatingScale extends Titleable {
  ratings: Rating[];
}
interface Rating extends TitleAndDescribable {
  scale: Titleable[];
}

export default Vue.extend({
  name: 'Problem',

  data () {
    return {
      step: 1
    }
  },

  computed: {
    terminology() {
      return terminology
    }
  }
})
</script>
