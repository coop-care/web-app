<template>
  <q-btn
    icon="feedback"
    flat
    stretch
    style="max-width:44px"
    v-if="$ccApi.isLoggedIn"
  >
    <q-menu max-height="calc(96vh - 50px)">
      <q-list
        class="text-body2"
        style="width: 240px"
      >
        <q-item
          clickable
          v-close-popup
          @click="openMail()"
        >
          <q-item-section side>
            <q-icon name="feedback" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('feedback') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable>
          <q-item-section>Farbschema anpassen</q-item-section>
          <q-item-section side>
            <q-icon name="fas fa-angle-right" />
          </q-item-section>
          <q-menu
            :anchor="$q.screen.gt.xs ? 'top left' : ''"
            :self="$q.screen.gt.xs ? 'top right' : ''"
            fit
          >
            <q-list>
              <q-item
                v-for="color in colors"
                :key="color"
                clickable
                :class="'text-' + color"
                @click="colorMenuKey = Math.random()"
              >
                <q-item-section side>
                  <q-icon
                    name="fas fa-paint-brush"
                    :color="color"
                  />
                </q-item-section>
                <q-item-section>{{ colorNames[color] }}</q-item-section>
                <q-menu
                  :anchor="$q.screen.gt.xs ? 'top left' : ''"
                  :self="$q.screen.gt.xs ? 'top right' : ''"
                  fit
                >
                  <q-color
                    :key="colorMenuKey"
                    :value="getColor(color)"
                    @input="setColor(color, $event)"
                  />
                </q-menu>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-separator />

        <!-- <q-item-label header>{{ $t("databaseTestSettings") }}</q-item-label> -->
        <q-item
          clickable
          v-close-popup
          @click="addSamplesToDB"
        >
          <q-item-section>{{ $t("databaseInsertSamples") }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="clearDB"
          class="text-negative"
        >
          <q-item-section>{{ $t("databaseClearAll") }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { colors } from "quasar";

const { getBrand, setBrand } = colors;

@Component
export default class DevMenu extends Vue {
  colorMenuKey = Math.random();

  get colors() {
    return ["primary", "classification", "intervention", "outcome"];
  }
  get colorNames() {
    return {
      primary: "Primärfarbe",
      classification: "Problemklassifikations-Farbe",
      intervention: "Interventions-Farbe",
      outcome: "Bewertungs-Farbe"
    };
  }
  getColor(name: string) {
    return getBrand(name);
  }
  setColor(name: string, value: string) {
    setBrand(name, value);
  }
  openMail() {
    location.href =
      "mailto:feedback@coopcare.de?subject=CoopCare Feedback&body=" +
      encodeURIComponent("\n\n\n––––––––––––––––––––\n") +
      "Einige freiwillige technische Angaben, die uns beim Nachvollziehen des Feedbacks helfen:" +
      encodeURIComponent("\n\nBrowser: ") +
      this.$q.platform.userAgent +
      encodeURIComponent("\nRoute: ") +
      this.$router.currentRoute.path;
  }
  addSamplesToDB() {
    this.$store.direct.dispatch.addSamplesToDB();
  }
  clearDB() {
    this.$q
      .dialog({
        title:
          "Möchtest du wirklich die Daten <strong>aller</strong> Kunden löschen?",
        message: "Diese Aktion kann nicht rückgängig gemacht werden.",
        ok: {
          label: this.$t("databaseClearAll"),
          color: "negative",
          flat: true
        },
        cancel: true,
        persistent: true,
        html: true
      })
      .onOk(() => {
        this.$store.direct.dispatch.clearDB();
        this.$router.push({ name: "client" });
      });
  }
}
</script>
