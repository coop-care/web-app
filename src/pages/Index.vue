<template>
  <q-page>
    <q-drawer
      v-model="customerDrawer"
      content-class="bg-grey-2"
      show-if-above
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
              @click="addingCustomer = true"
              :title="$t('newCustomer')"
            />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-for="customer in sortedCustomers"
          :key="customer.id"
          v-ripple
          :active="isSelected(customer)"
          active-class="text-intervention"
          @click="selectCustomer(customer); closeDrawerIfNeeded();"
        >
          <q-item-section>
            <q-item-label class="q-pl-md">{{ customer.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div
      class="customer-overview q-pa-xl"
      v-if="loading"
    >
      <p>loading...</p>
    </div>
    <div
      class="customer-overview q-pt-lg q-px-xl q-pb-xl"
      v-else-if="addingCustomer"
    >
      <new-customer
        @save="addCustomer"
        @cancel="addingCustomer = false"
      />
    </div>
    <div
      class="customer-overview q-pt-lg q-px-xl q-pb-xl"
      v-else-if="selectedCustomer"
    >
      <content-editable
        ref="customerName"
        class="q-mt-sm q-mb-xl q-py-sm text-h2"
        v-text="selectedCustomer.name"
        @change="editCustomer({customerId: selectedCustomerId, name: $event.value})"
      />
      <div class="q-gutter-md">
        <q-btn
          icon="add"
          color="primary"
          :label="$t('recordProblem')"
          outline
          class="q-mt-md"
          @click="addProblem"
          dense
        />
        <problem-summary
          v-for="problemRecord in selectedCustomerProblems"
          v-bind:key="problemRecord.id"
          :problemRecord="problemRecord"
          :params="{customerId: selectedCustomerId, problemId: problemRecord.id}"
        />
      </div>
    </div>

    <div
      class="customer-overview q-pa-xl"
      v-else-if="!customers.length"
    >
      <p>{{ $t("noExistingCustomer") }}</p>
      <q-btn
        @click="addingCustomer = true"
        no-caps
        color="primary"
        :label="$t('createFirstCustomer')"
        class="q-mt-md"
      />
    </div>
    <div
      class="customer-overview q-pa-xl"
      v-else
    >
      <p>{{ $t("noSelectedCustomer") }}</p>
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
import { mapMutations } from "vuex";
import ContentEditable from "../components/ContentEditable.vue";
import NewCustomer from "../components/NewCustomer.vue";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Terminology } from "../helper/terminology";
import * as Store from "../store";
import {
  Stitch,
  RemoteMongoClient,
} from "mongodb-stitch-browser-sdk";
import { ProblemRecord } from "../helper/coreTypes";

@Component({
  components: {
    ContentEditable,
    NewCustomer,
    ProblemSummary
  },
  // methods: {
  //   ...mapMutations([
  //     // "selectCustomer", 
  //     // "editCustomer",
  //   ])
  // }
})
export default class PageIndex extends Vue {
  customerDrawer = this.$q.screen.gt.sm;
  // loading = false;
  addingCustomer = false;
  // customers: any[] = [];

  get loading() {
    return this.$store.state.isLoadingCustomerList
      || this.$store.state.isLoadingCustomer;
  }
  get customers() { return this.$store.state.customers; }
  get selectedCustomerId() {
    if (this.$store.state.selectedCustomer) {
      return this.$store.state.selectedCustomer._id;
    }
    return "";
  }
  get sortedCustomers() {
    return this.customers
      .concat()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get selectedCustomer() {
    return this.$store.getters.getCustomer({
      customerId: this.selectedCustomerId,
      terminology: this.terminology
    });
  }
  get selectedCustomerProblems() {
    return this.selectedCustomer.problems.concat().sort(
      (first: ProblemRecord, second: ProblemRecord) =>
        // sort order: draft first, then high priority followed by low priority
        //@ts-ignore
        !second.createdAt - !first.createdAt ||
        //@ts-ignore
        second.problem.isHighPriority - first.problem.isHighPriority
    );
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }

  created() {
    this.$root.$on(
      "toggleCustomerDrawer",
      () => (this.customerDrawer = !this.customerDrawer)
    );
    this.$store.dispatch('fetchCustomersFromDB');
  }

  isSelected(customer: any) {
    if (this.selectedCustomer) {
      if (this.selectedCustomer._id.equals(customer._id)) return true;
    }
    return false;
  }

  addCustomer(name: string) {
    let customer = {
      user_id: this.$stitchApi.userId(),
      name: name,
      problems: [],
      createdAt: new Date()
    };
    this.$stitchApi.createCustomer(customer)
      .then(console.log)
      .catch(console.log);

    this.$store.dispatch('fetchCustomersFromDB');
    this.$store.commit("setCustomer", customer);
    this.addingCustomer = false;
  }

  editCustomer(payload: any) {
    let customer = this.$store.getters.getCustomer(payload);
    console.log(customer);
    if (!customer) {
      return;
    }
    for (let [key, value] of Object.entries(payload)) {
      if (["name"].includes(key)) {
        customer[key] = value;
      }
    }
    this.$store.commit("setCustomer", customer);
    this.$stitchApi.saveCustomer(customer)
      .then(() => this.$store.dispatch('fetchCustomersFromDB'))
      .catch(err => console.error(`Failed to save customer: ${err}`))
  }

  addProblem() {
    let params = {
      customerId: this.selectedCustomerId as string,
      problemId: ""
    };
    this.$store.commit("createProblemRecord", params);
    params.problemId = this.selectedCustomer.problems[
      this.selectedCustomer.problems.length - 1
    ].id;
    this.$router.push({ name: "problem", params: params });
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.customerDrawer = false;
    }
  }

  selectCustomer(customer: any) {
    // console.log(customer);
    const current = this.selectedCustomer;
    if (current)
      this.$stitchApi.saveCustomer(current)
        .catch(err => console.error(`Save current customer failed with error: ${err}`));
    this.loadCustomerFromDB(customer._id);
  }

  loadCustomerFromDB(id: string) {
    this.$store.commit('isLoadingCustomer', true);
    this.$stitchApi.getCustomerById(id)
      .then(customer => {
        this.$store.commit("setCustomer", customer);
        this.$store.commit('isLoadingCustomer', false);
      })
      .catch(err => {
        console.error(`Failed: ${err}`);
        this.$store.commit('isLoadingCustomer', false);
      })
    ;
  }

}
</script>
