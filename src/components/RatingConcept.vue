<template>
  <div class="row">
    <div class="col-12 pagecol">
      <div class="text-h6">{{ title }}</div>
      <div>{{ description }}</div>
    </div>
    <div class="col-12 col-sm-6 pagecol">
      <q-list dense>
        <q-item>
          <q-item-section avatar></q-item-section>
          <q-item-section>{{ scale[statusObservationData-1] }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>{{ $t('observation') }}</q-item-section>
          <q-item-section>
            <q-btn-toggle
              v-model="statusObservationData"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey"
              text-color="white"
              :options="options"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar></q-item-section>
          <q-item-section>{{ scale[statusExpectationData-1] }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>{{ $t('expectation') }}</q-item-section>
          <q-item-section>
            <q-btn-toggle
              v-model="statusExpectationData"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey"
              text-color="white"
              :options="options"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="col-12 col-sm-6 pagecol">
      <q-list dense>
        <q-item
          v-for="(item, index) in scale"
          v-bind:key="index"
        >
          <q-item-section avatar>{{ index+1 }}</q-item-section>
          <q-item-section>{{ item }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: {
    title: String,
    description: String,
    scale: Array
    // status: Number,
  }
})
export default class RatingConcept extends Vue {
  options = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 }
  ];
  statusObservationData = null;
  statusExpectationData = null;
}
</script>
