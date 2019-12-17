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
import { store } from "../store";
import {
  Stitch,
  RemoteMongoClient,
} from "mongodb-stitch-browser-sdk";
import { CoreCustomer, ProblemRecord } from "../helper/coreTypes";
import { ObjectID } from 'bson';


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
    return store.state.isLoadingCustomerList
      || store.state.isLoadingCustomer;
  }
  get customers() { return store.state.customers; }
  get selectedCustomerId() {
    if (store.state.selectedCustomer) {
      return store.state.selectedCustomer._id;
    }
    return "";
  }
  get sortedCustomers() {
    return this.customers
      .concat()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get selectedCustomer() {
    return store.getters.getCustomer({
      customerId: this.selectedCustomerId,
      terminology: this.terminology
    });
  }
  get selectedCustomerProblems() {
    const customer = this.selectedCustomer;
    const problems = customer ? customer.problems : [];
    return problems.concat().sort(
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
    store.dispatch.fetchCustomersFromDB();
  }

  isSelected(customer: CoreCustomer) {
    const id = this.selectedCustomer && this.selectedCustomer._id;
    // if (id && id === customer._id) return true; 
    if (id && customer._id && id.equals(customer._id)) return true;
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
      .then((res) => {
        store.dispatch.fetchCustomersFromDB()
          .then(() => {
            this.selectCustomerById(res.insertedId)
          })
      })
      .catch(console.log)
    ;
    // store.commit.setCustomer(customer);
    this.addingCustomer = false;
  }

  editCustomer(payload: any) {
    let customer = store.getters.getCustomer(payload);
    console.log(customer);
    if (!customer) {
      return;
    }
    for (let [key, value] of Object.entries(payload)) {
      if (["name"].includes(key)) {
        (customer as any)[key] = value;
      }
    }
    store.commit.setCustomer(customer);
    this.$stitchApi.saveCustomer(customer)
      .then(() => store.dispatch.fetchCustomersFromDB())
      .catch(err => console.error(`Failed to save customer: ${err}`))
    ;
  }

  addProblem() {
    const customer = this.selectedCustomer;
    if (!customer) {
      console.error("no customer selected: this should not happen.");
      return;
    }
    let params = {
      customerId: this.selectedCustomerId as string,
      problemId: ""
    };
    store.commit.createProblemRecord(params);
    params.problemId = customer.problems[
      customer.problems.length - 1
    ].id;
    this.$router.push({ name: "problem", params: params });
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.customerDrawer = false;
    }
  }

  selectCustomer(customer: CoreCustomer) {
    this.selectCustomerById(customer._id)
  }

  selectCustomerById(id: ObjectID) {
    // console.log("selectCustomerById:", id);
    const current = this.selectedCustomer;
    if (current) {
      this.$stitchApi.saveCustomer(current)
        .then(() => this.loadCustomerFromDB(id))
        .catch(err => console.error(`Save current customer failed with error: ${err}`))
      ;
    } else {
      this.loadCustomerFromDB(id);
    }
  }

  loadCustomerFromDB(id: ObjectID) {
    // console.log("loadCustomerFromDB:", id);
    store.commit.isLoadingCustomer(true);
    this.$stitchApi.getCustomerById(id)
      .then(customer => {
        store.commit.setCustomer(customer);
        store.commit.isLoadingCustomer(false);
      })
      .catch(err => {
        console.error(`Failed: ${err}`);
        store.commit.isLoadingCustomer(false);
      })
    ;
  }

}
</script>
