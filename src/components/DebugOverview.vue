<template>
    <div v-if="client">
        <h4>Overview for {{ client.name }}</h4>
        Problems:
        <ul>
          <li v-for="problem in problems">{{ problem }}</li>
        </ul>
    </div>
    <div v-else><h4>Please select a client</h4></div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from "vue-class-component";
import { Prop, Watch } from 'vue-property-decorator';
import * as Api from "ts-api-client";

@Component
export default class DebugOverview extends Vue {
  // api = new Api.DefaultApi();
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


}
</script>