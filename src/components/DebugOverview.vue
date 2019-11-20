<template>
    <div v-if="client">
        <h4>Overview for {{ client.name }}</h4>
        <h5>Problems:</h5>
        <div v-for="problem in problems">
          <!-- {{ problem.apiProblem }} -->
          <h6>
            {{ problem.title }} ({{ problem.domainModifier }}, {{ problem.typeModifier }})
          </h6>
          <div>Symptoms:</div>
          <ul>
            <li v-for="symptom in problem.symptoms">
              {{ symptom.title }}
            </li>
          </ul>
          <div>Interventions:</div>
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
          <div>Ratings:</div>
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
import { Problem } from "../helper/model"
import _ from "lodash";
import { Intervention } from 'ts-api-client';

// Problem.omahaq = 

@Component
export default class DebugOverview extends Vue {
  // problems: Api.ProblemClassification[] = [];
  problems: Problem[] = [];

  @Prop() client: Api.Client | undefined;

  @Watch('client')
  onClientChanged(val: Api.Client, oldVal: Api.Client) {
    if (this.client) {
      this.$api.appGetClientProblems({ clientId: this.client.id! })
        .then((r) => {
          console.log("client problems:", r)
          this.problems = r.map(apiProblem => this.$omaha.newProblem(apiProblem));
        })
        .catch((e) => {
          console.log("client problem err:", e)
        });
    } else {
      this.problems = [];
      // this.$api.appGetClients();
    }
  }

  categories(interventions: Intervention[]) { 
    return _.groupBy(interventions, i => i.categoryId)
  }

}
</script>