<template>
  <q-page class="row">
    <q-drawer
      v-model="customerDrawer"
      content-class="bg-grey-2"
    >
      <q-list dense>
        <q-item>
          <q-item-section>
            <q-item-label
              style="padding-left:0;"
              header
            >Kunden</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="add"
              round
              size="sm"
              color="primary"
            />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-for="name in customers"
          :key="name"
        >
          <q-item-section>
            <q-item-label style="padding-left:20px;">{{ name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="col q-pa-xl">
      <h2 class="q-mt-md">Emma B.</h2>
      <q-list>
        <q-item-label header>Probleme</q-item-label>
        <q-item
          clickable
          v-for="problem in problems"
          v-bind:key="problem"
        >
          <q-item-section>
            <q-item-label>{{ problem }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-btn
              label="Neue Bewertung"
              to="/rating"
              color="primary"
              flat
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn
        icon="add"
        color="primary"
        label="Problem aufnehmen"
        to="/problem/new"
        outline
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class PageIndex extends Vue {
  customerDrawer = true;
  customers = [
    "Annegret Krause",
    "Hans Schmidt",
    "Emma B.",
    "Max Mustermann",
    "Beate Schönfeld",
    "Martina Musterfrau"
  ].sort();
  problems = ["Psychische Gesundheit", "Körperpflege", "Medikamenteneinnahme"];
}
</script>
