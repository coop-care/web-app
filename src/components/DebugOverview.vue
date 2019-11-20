<template>
    <div v-if="client">
        <h4>Overview for {{ client.name }}</h4>
        <h5>{{ $tc('problem', 2) }}:</h5>
        <div v-for="problem in problems">
          <!-- {{ problem }} -->
          <h6>
            {{ $omaha.problemTitle(problem.problemId) }}
            ({{ problem.domainModifier }}, {{ problem.typeModifier }})
          </h6>
          <div>{{ $tc('signsAndSymptoms', 2) }}:</div>
          <ul>
            <li v-for="symptomId in problem.symptoms">
              {{ $omaha.symptomTitle(symptomId) }}
            </li>
          </ul>
          <div>{{ $tc('intervention', 2) }}:</div>
          <!-- <div>{{ categories(problem.interventions) }}</div> -->
          <ul>
            <li v-for="(cats, catId) in categories(problem.interventions)">
              <!-- {{ cats }}  -->
              {{ $omaha.categoryTitle(catId) }}
              <ul>
                <li v-for="intervention in cats">
                  <!-- {{ intervention }}  -->
                  {{ $omaha.targetTitle(intervention.targetId) }}
                  ({{ intervention.description }})
                </li>
              </ul>
            </li>
          </ul>
          <div>{{ $tc('rating', 2) }}:</div>
          <ul>
            <li v-for="rating in problem.ratings">
              <div>created: {{ rating.created }}</div>
              {{ rating }}
            </li>
          </ul>
        </div>
    </div>
    <div v-else>
      <h4>Please select a client</h4>
      <!-- {{ $omaha }} -->
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from "vue-class-component";
import { Prop, Watch } from 'vue-property-decorator';
import * as Api from "ts-api-client";
import _ from "lodash";
import { Intervention } from 'ts-api-client';
import { OmahaQ, getOmaha } from "../helper/model"

@Component
export default class DebugOverview extends Vue {
  problems: Api.ProblemClassification[] = [];

  @Prop() client: Api.Client | undefined;

  @Watch('client')
  onClientChanged(val: Api.Client, oldVal: Api.Client) {
    if (this.client) {
      this.$api.appGetClientProblems({ clientId: this.client.id! })
        .then((r) => {
          console.log("client problems:", r)
          this.problems = r;
        })
        .catch((e) => {
          console.log("client problem err:", e)
        });
    } else {
      this.problems = [];
      // this.$api.appGetClients();
    }
  }

  @Watch('$root.$i18n.locale')
  lChange(val: string) {
    console.log("locale changed to:", val);
    getOmaha(val)
      .then((r) => {
        console.log("omaha:", r);
        Vue.prototype.$omaha = new OmahaQ(r);
        this.$forceUpdate();
      })
      .catch((e) => {
        console.log("omaha err:", e)
      });
  }

  categories(interventions: Intervention[]) { 
    return _.groupBy(interventions, i => i.categoryId)
  }

}
</script>