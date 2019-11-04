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
            >{{ $t("customers") }}</q-item-label>
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
        <q-item-label header>{{ $t("problems") }}</q-item-label>
        <q-item
          v-for="problem in customerProblems"
          v-bind:key="problem"
          class="row"
        >
          <div class="col">
            <q-item-label>{{ problem }}</q-item-label>
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
      />{{$i18n.availableLocales}}
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
  customerProblems: string[] = [];

  get terminology() {
    return this.$t("terminology");
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
    let problems: string[] = [];
    while (problems.length < numberOfProblems) {
      let problem = this.problems[
        Math.floor(Math.random() * this.problems.length)
      ];
      if (!problems.includes(problem)) {
        problems.push(problem);
      }
    }
    return problems;
  }

  newCustomer() {
    let customer = this.$t("newCustomer");
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
