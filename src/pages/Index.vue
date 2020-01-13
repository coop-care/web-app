<template>
  <q-page>
    <q-drawer v-model="customerDrawer" content-class="bg-grey-2" show-if-above>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label class="q-pl-none" header>{{
              $tc("customer", 2)
            }}</q-item-label>
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
          v-for="(customer, index) in sortedCustomers"
          :key="index"
          v-ripple
          :active="isSelected(customer)"
          active-class="text-primary"
          @click="
            selectCustomer(customer);
            closeDrawerIfNeeded();
          "
        >
          <q-item-section>
            <q-item-label class="q-pl-md">{{ customer.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="customer-overview q-pa-xl" v-if="loading">
      <p>{{ $t("loading") }}</p>
    </div>
    <div
      class="customer-overview q-pt-lg q-px-xl q-pb-xl"
      v-else-if="addingCustomer"
    >
      <new-customer @save="addCustomer" @cancel="addingCustomer = false" />
    </div>
    <div
      class="customer-overview q-pt-lg q-px-xl q-pb-xl"
      v-else-if="selectedCustomer"
    >
      <content-editable
        ref="customerName"
        class="q-mt-sm q-mb-xl q-py-sm text-h2"
        v-text="selectedCustomer.name"
        @change="
          editCustomer({ customerId: selectedCustomerId, name: $event.value })
        "
      />
      <div class="q-gutter-md">
        <q-btn
          icon="add"
          color="primary"
          :label="$t('problemAdmission')"
          rounded
          outline
          class="q-mt-md"
          @click="addProblem"
          size="12px"
        />
        <problem-summary
          v-for="problemRecord in selectedCustomerProblems"
          v-bind:key="problemRecord.id"
          :problemRecord="problemRecord"
          :params="{
            customerId: selectedCustomerId,
            problemId: problemRecord.id
          }"
        />
      </div>
    </div>

    <div class="customer-overview q-pa-xl" v-else-if="!customers.length">
      <p>{{ $t("noExistingCustomer") }}</p>
      <q-btn
        @click="addingCustomer = true"
        no-caps
        color="primary"
        :label="$t('createFirstCustomer')"
        class="q-mt-md"
      />
    </div>
    <div class="customer-overview q-pa-xl" v-else>
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
import ContentEditable from "../components/ContentEditable.vue";
import NewCustomer from "../components/NewCustomer.vue";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Customer } from "../models/customer";
import { ProblemRecord } from "../models/problemRecord";
import { ObjectID } from "bson";

@Component({
  components: {
    ContentEditable,
    NewCustomer,
    ProblemSummary
  }
})
export default class PageIndex extends Vue {
  customerDrawer = this.$q.screen.gt.sm;
  addingCustomer = false;

  get loading() {
    return (
      this.$store.direct.state.isLoadingCustomerList ||
      this.$store.direct.state.isLoadingCustomer
    );
  }
  get customers() {
    return this.$store.direct.state.customers;
  }
  get selectedCustomerId() {
    if (this.$store.direct.state.selectedCustomer) {
      return this.$store.direct.state.selectedCustomer._id;
    }
    return "";
  }
  get sortedCustomers() {
    return this.customers
      .concat()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get selectedCustomer() {
    return this.$store.direct.getters.getCustomer({
      customerId: this.selectedCustomerId
    });
  }
  get selectedCustomerProblems() {
    const customer = this.selectedCustomer;
    const problems = customer ? customer.problems : [];
    return problems
      .concat()
      .filter((problem: ProblemRecord) => {
        return !problem.resolvedAt;
      })
      .sort(
        (first: ProblemRecord, second: ProblemRecord) =>
          // sort order: draft first, then high priority followed by low priority
          //@ts-ignore
          !second.createdAt - !first.createdAt ||
          //@ts-ignore
          second.problem.isHighPriority - first.problem.isHighPriority
      );
  }

  created() {
    this.$root.$on("toggleCustomerDrawer", () => {
      this.customerDrawer = !this.customerDrawer;
    });
    this.$store.direct.dispatch.fetchCustomersFromDB();
  }

  isSelected(customer: Customer) {
    const selectedId = this.selectedCustomer && this.selectedCustomer._id;
    return !!selectedId && customer._id && selectedId.equals(customer._id);
  }

  addCustomer(name: string) {
    const customer = new Customer(this.$stitchApi.userId(), name);
    this.$stitchApi
      .createCustomer(customer)
      .then(res => {
        this.$store.direct.dispatch.fetchCustomersFromDB().then(() => {
          this.selectCustomerById(res.insertedId);
        });
      })
      .catch(console.log);
    this.addingCustomer = false;
  }

  editCustomer(payload: any) {
    const customer = this.$store.direct.getters.getCustomer(payload);
    if (!customer) {
      return;
    }

    for (const [key, value] of Object.entries(payload)) {
      if (["name"].includes(key)) {
        (customer as any)[key] = value;
      }
    }
    this.$store.direct.commit.setCustomer(customer);
    this.$stitchApi
      .saveCustomer(customer)
      .then(() => this.$store.direct.dispatch.fetchCustomersFromDB())
      .catch(err => console.error(`Failed to save customer: ${err}`));
  }

  addProblem() {
    const customer = this.selectedCustomer;
    if (!customer) {
      console.error("no customer selected: this should not happen.");
      return;
    }

    const params = {
      customerId: this.selectedCustomerId
    };
    this.$store.direct.commit.createProblemRecord(params);
    this.$router.push({
      name: "problem",
      params: this.$store.direct.getters.getRouteParamsForLatestProblem(params)
    });
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.customerDrawer = false;
    }
  }

  selectCustomer(customer: Customer) {
    if (customer._id) {
      this.selectCustomerById(customer._id);
    }
  }

  selectCustomerById(id: ObjectID) {
    this.$store.direct.commit.isLoadingCustomer(true);
    // console.log("selectCustomerById:", id);
    const current = this.selectedCustomer;
    if (current) {
      this.$stitchApi
        .saveCustomer(current)
        .then(() => this.loadCustomerFromDB(id))
        .catch(err =>
          console.error(`Save current customer failed with error: ${err}`)
        );
    } else {
      this.loadCustomerFromDB(id);
    }
  }

  loadCustomerFromDB(id: ObjectID) {
    // console.log("loadCustomerFromDB:", id);
    this.$store.direct.commit.isLoadingCustomer(true);
    this.$stitchApi
      .getCustomerById(id)
      .then(customer => {
        this.$store.direct.commit.setCustomer(customer);
        this.$store.direct.commit.isLoadingCustomer(false);
      })
      .catch(err => {
        console.error(`Failed: ${err}`);
        this.$store.direct.commit.isLoadingCustomer(false);
      });
  }
}
</script>
