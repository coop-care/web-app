<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          <q-btn
            size="lg"
            dense
            no-caps
            flat
            label="„CoopCare”"
            :ripple="false"
            to="/"
          />
        </q-toolbar-title>

        <div>Entwurf</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item dense>
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
              outline
              size="xs"
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

        <q-separator spaced />

        <q-item-label header>
          Einstellungen
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class MyLayout extends Vue {
  leftDrawerOpen = false;
  customers = ["Annegret Krause", "Hans Schmidt"];
}
</script>
