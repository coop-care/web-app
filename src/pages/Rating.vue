<template>
  <q-page padding>
    <div class="text-h5">Bewertung des Problems Mental health von Erika B.</div>
    <rating-concept
      title="Zustand"
      description="Zustand des Kunden in Bezug auf objektive und subjektive definierende Merkmale."
      :scale="[
        'Extreme Anzeichen oder Symptome',
        'Schwere Anzeichen oder Symptome',
        'Mäßige Anzeichen oder Symptome',
        'Minimale Anzeichen oder Symptome',
        'Keine Anzeichen oder Symptome',
      ]"
    />
    <rating-concept
      title="Wissen"
      description="Fähigkeit des Kunden, Informationen zu speichern und zu interpretieren."
      :scale="[
        'Keine Kenntnisse',
        'Minimale Kenntnisse',
        'Grundkenntnisse',
        'Angemessene Kenntnisse',
        'Überlegenes Wissen',
      ]"
    />
    <rating-concept
      title="Verhalten"
      description="Beobachtbare Reaktionen, Aktionen oder Aktivitäten des Kunden, die dem Anlass oder Zweck entsprechen."
      :scale="[
        'Nicht angemessenes Verhalten',
        'Selten angemessenes Verhalten',
        'Inkonsistentes angemessenes Verhalten',
        'In der Regel angemessenes Verhalten',
        'Durchgängig angemessenes Verhalten',
      ]"
    />
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RatingConcept from 'components/RatingConcept.vue';

@Component({
  components: {
    RatingConcept,
  },
})
export default class Rating extends Vue {
}
</script>
