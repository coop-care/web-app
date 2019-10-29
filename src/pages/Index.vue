<template>
  <q-page class="row">
    <div class="col-12 col-sm-6 pagecol">
      <q-list>
        <q-item-label header>Kunden</q-item-label>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Emma B.</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Max Mustermann</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Beate Schönfeld</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Martina Musterfrau</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn round color="primary" icon="add" />
    </div>
    <div class="col-12 col-sm-6 pagecol">
      <div>Emma B.</div>
      <q-list>
        <q-item-label header>Probleme</q-item-label>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Mental health</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Personal care</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Medication Regimen</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn round color="primary" icon="add" />
      <div><q-btn color="primary" label="Neue Bewertung" /></div>
    </div>
  </q-page>
</template>

<script lang="ts">
// import Vue from 'vue'

// export default Vue.extend({
//   name: 'PageIndex',
// });
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class PageIndex extends Vue {}
</script>
