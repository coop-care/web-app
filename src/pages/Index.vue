<template>
  <q-page>
    <q-drawer
      v-model="customerDrawer"
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label
              class="q-pl-none"
              header
            >{{ $tc("customer", 2) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="add"
              round
              size="sm"
              color="primary"
              @click="newCustomer"
            />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-for="(name, index) in customers"
          :key="index"
          v-ripple
          :active="customerSelected === name"
          @click="onCustomerChanged(name)"
        >
          <q-item-section>
            <q-item-label class="q-pl-md">{{ name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="customer-overview q-pa-xl">
      <h2 class="q-mt-sm q-mb-md q-py-sm cursor-pointer">{{ customerSelected }}
        <q-popup-edit
          v-model="customerSelected"
          @save="updateCustomerName"
        >
          <q-input
            v-model="customerSelected"
            dense
            autofocus
          />
        </q-popup-edit>
      </h2>
      <q-list>
        <q-item-label header>{{ $tc("problem", 2) }}</q-item-label>
        <q-item
          v-for="problemIndex in customerProblems"
          v-bind:key="problemIndex"
          class="row"
        >
          <div class="col">
            <q-item-label>{{ problems[problemIndex] }}</q-item-label>
          </div>
          <div class="col">
            <q-btn
              :label="$t('newRating')"
              to="/rating"
              color="primary"
              flat
            />
          </div>
        </q-item>
      </q-list>
      <q-btn
        icon="add"
        color="primary"
        :label="$t('recordProblem')"
        to="/problem/new"
        outline
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<style lang="sass">
.customer-overview
  @media (max-width: $breakpoint-xs-max)
    padding: 15px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Terminology } from "../helper/terminology";

@Component
export default class PageIndex extends Vue {
  customerDrawer = !this.$q.platform.is.mobile;
  customers = [
    "Annegret Krause",
    "Hans Schmidt",
    "Emma B.",
    "Max Mustermann",
    "Beate Schönfeld",
    "Martina Musterfrau"
  ].sort();
  customerSelected = this.customers[0];
  customerProblems: number[] = [];

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get problems() {
    return this.terminology.problemClassificationScheme.domains
      .map(domain => {
        return domain.problems.map(item => item.title);
      })
      .reduce((prev, current) => {
        return prev.concat(current);
      }, []);
  }

  mounted() {
    this.customerProblems = this.randomProblems();
  }

  randomProblems() {
    let min = 1;
    let max = 3;
    let numberOfProblems = Math.floor(Math.random() * (max - min + 1)) + min;
    let problems: number[] = [];
    while (problems.length < numberOfProblems) {
      let problemIndex = Math.floor(Math.random() * this.problems.length);
      if (!problems.includes(problemIndex)) {
        problems.push(problemIndex);
      }
    }
    return problems;
  }

  newCustomer() {
    let customer = this.$t("newCustomer") as string;
    this.customers.push(customer);
    this.onCustomerChanged(customer);
  }

  onCustomerChanged(name: string) {
    this.customerSelected = name;
    this.customerProblems = this.randomProblems();
  }

  updateCustomerName(value: string, oldValue: string) {
    let index = this.customers.indexOf(oldValue);
    this.customers[index] = value;
    this.customers.sort();
  }
}
</script>
