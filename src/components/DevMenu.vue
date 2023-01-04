<template>
    <q-menu
      max-height="calc(96vh - 50px)"
      :anchor="anchor"
      :self="self"
    >
      <q-list
        class="text-body2"
        style="width: 240px"
      >
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
                <q-item-section side>
                  <q-icon name="fas fa-angle-right" />
                </q-item-section>
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

        <q-separator />

        <q-item class="text-grey-5">
          <q-item-section>
            <q-item-label>Version {{ $store.getters.appVersion }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $store.getters.appPlatform || "browser" }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getColor, setColor } from "../helper/color";

@Component
export default class DevMenu extends Vue {
  @Prop({ type: String, default: "bottom middle"}) readonly anchor!: string;
  @Prop({ type: String, default: "top middle"}) readonly self!: string;
  colorMenuKey = Math.random();

  get colors() {
    return ["primary", "classification", "intervention", "outcome"];
  }
  get colorNames() {
    return {
      primary: "Primärfarbe",
      classification: "Problemklassifikations-Farbe",
      intervention: "Interventions-Farbe",
      outcome: "Bewertungs-Farbe",
    } as { [key: string]: string };
  }
  get isVisible() {
    return this.$ccApi.isLoggedIn && !this.$store.direct.getters.isDemo && process.env.DEV;
  }
  getColor(name: string) {
    return getColor(name);
  }
  setColor(name: string, value: string) {
    setColor(name, value);
  }
  addSamplesToDB() {
    void this.$store.direct.dispatch.addSamplesToDB();
  }
  clearDB() {
    this.$q
      .dialog({
        title: "Möchtest du wirklich die Daten aller Klienten löschen?",
        message: "Diese Aktion kann nicht rückgängig gemacht werden.",
        ok: {
          label: this.$t("databaseClearAll"),
          color: "negative",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        void this.$store.direct.dispatch.clearDB();
        void this.$router.push({ name: "clientNoneSelected" });
      });
  }
}
</script>
