<template>
  <q-btn
    icon="fas fa-wrench"
    flat
    stretch
    style="max-width:44px"
    v-if="isVisible"
  >
    <q-menu max-height="calc(96vh - 50px)">
      <q-list
        class="text-body2"
        style="width: 240px"
      >
        <q-item clickable>
          <q-item-section>Farbschema auswählen</q-item-section>
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
                v-for="(colorSet, index) in colorSets"
                :key="colorSet.name"
                clickable
                @click="setColorSet(index)"
              >
                <q-item-section>{{ colorSet.name }}</q-item-section>
                <q-item-section
                  side
                  style="flex-direction: row; align-items: center"
                >
                  <div
                    v-for="(color, index) in colorSet.colors.filter(
                      (_, index) => index < 4
                    )"
                    :key="colorSet.name + index"
                    :style="
                      'width: 1.2rem; height: 1.2rem; border-radius: .6rem; background-color: ' +
                        color
                    "
                  ></div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
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
import { getColor, setColor, setColorSet } from "../helper/color";

@Component
export default class DevMenu extends Vue {
  colorMenuKey = Math.random();

  get colors() {
    return ["primary", "classification", "intervention", "outcome"];
  }
  get colorSets() {
    return [
      {
        name: "default",
        colors: ["#009688", "#f44336", "#ff6f00", "#009688"],
      },
      {
        name: "omahasystem.nl",
        colors: ["#0BB5B7", "#E63E22", "#EF971B", "#0BB5B7"],
      },
      {
        name: "pastel 1",
        colors: ["#95afe8", "#f5ae7f", "#eb7cd6", "#c195ed"],
      },
      {
        name: "pastel 2",
        colors: ["#FFA5CF", "#8BB3FF", "#A8D070", "#F5B401"],
      },
      {
        name: "sunrise 1",
        colors: ["#eedddd", "#e07b7b", "#f9ddb0", "#706090"],
      },
      {
        name: "sunrise 2",
        colors: ["#101632", "#F1505D", "#FF805F", "#64475E"],
      },
      {
        name: "sunrise 3",
        colors: ["#423A6B", "#EF5C6C", "#F5BA6A", "#C2338F"],
      },
      {
        name: "sunrise 4",
        colors: ["#F5BA6A", "#C2338F", "#EF5C6C", "#423A6B"],
      },
      {
        name: "sunrise 5",
        colors: ["#FAC23D", "#EC007E", "#FE824B", "#541F89"],
      },
      {
        name: "sunrise 6 (cc)",
        colors: ["#fa9a94", "#ed6355", "#fda94f", "#6e5bba"],
      },
      {
        name: "sunrise 7",
        colors: ["#FE824B", "#EC007E", "#b310ad", "#541F89"],
      },
      {
        name: "sunrise 8",
        colors: ["#E3424C", "#E44A2D", "#E58A04", "#5F4BA6"],
      },
      {
        name: "sunrise 9 (cc)",
        colors: ["#842D73", "#EE316B", "#FFB137", "#842D73"],
      },
      {
        name: "sunrise 10 (cc)",
        colors: ["#9CC676", "#F36F8E", "#FFB643", "#513E79"],
      },
      {
        name: "sunrise 11",
        colors: ["#28406F", "#ed0251", "#ff9900", "#7E3781"],
      },
      {
        name: "sunrise 12 (sys)",
        colors: [
          "#960372",
          "#FF2C55",
          "#FF9500",
          "#AF52DE",
          "#ff3b30",
          "#28CD41",
        ],
      },
      {
        name: "intense 1",
        colors: ["#C92A3C", "#FF8F02", "#7BC039", "#7D49C3"],
      },
      {
        name: "intense 2",
        colors: ["#C92A3C", "#3A85D5", "#FF8F02", "#7BC039"],
      },
      {
        name: "cold",
        colors: ["#C64EA9", "#F30062", "#3A85D5", "#7D49C3"],
      },
      {
        name: "workly 1",
        colors: ["#7854f7", "#ff8400", "#ffca00", "#7ed321"], // #12a5ed, #f5325b
      },
      {
        name: "workly 2",
        colors: ["#7854f7", "#f5325b", "#12a5ed", "#7ed321"],
      },
      {
        name: "workly 3",
        colors: ["#7854f7", "#ff8400", "#12a5ed", "#7ed321"],
      },
      {
        name: "colors per se",
        colors: ["#e06ca4"],
      },
      // {
      //   name: "10",
      //   colors: ["", "", "", ""],
      // },
    ];
  }
  get colorNames() {
    return {
      primary: "Primärfarbe",
      classification: "Problemklassifikations-Farbe",
      intervention: "Interventions-Farbe",
      outcome: "Bewertungs-Farbe",
    };
  }
  get isVisible() {
    return this.$ccApi.isLoggedIn && process.env.BACKEND != "demo";
  }
  getColor(name: string) {
    return getColor(name);
  }
  setColor(name: string, value: string) {
    setColor(name, value);
  }
  setColorSet(index: number) {
    const colors = this.colorSets[index].colors;
    setColorSet(colors);
  }
  addSamplesToDB() {
    this.$store.direct.dispatch.addSamplesToDB();
  }
  clearDB() {
    this.$q
      .dialog({
        title:
          "Möchtest du wirklich die Daten <strong>aller</strong> Klienten löschen?",
        message: "Diese Aktion kann nicht rückgängig gemacht werden.",
        ok: {
          label: this.$t("databaseClearAll"),
          color: "negative",
          flat: true,
        },
        cancel: true,
        persistent: true,
        html: true,
      })
      .onOk(() => {
        this.$store.direct.dispatch.clearDB();
        this.$router.push({ name: "client" });
      });
  }
}
</script>
