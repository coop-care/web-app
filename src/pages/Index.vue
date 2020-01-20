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
              outline
              size="10.5px"
              color="primary"
              @click="addingCustomer = true"
              :title="$t('newCustomer')"
              class="shadow-1"
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
          class="shadow-1 q-mt-md"
          @click="addProblem"
          size="12.5px"
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

    <div
      class="customer-overview q-pa-xl"
      v-else-if="!customers.length"
    >
      <p>{{ $t("noExistingCustomer") }}</p>
      <q-btn
        @click="addingCustomer = true"
        no-caps
        color="primary"
        rounded
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
import CustomerDrawer from "../components/CustomerDrawer.vue";
import ContentEditable from "../components/ContentEditable.vue";
import NewCustomer from "../components/NewCustomer.vue";
import ActionMenu from "../components/ActionMenu.vue";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Customer } from "../models/customer";
import { ProblemRecord } from "../models/problemRecord";
import { ObjectID } from "bson";

const nameof = (name: keyof Customer) => name;

@Component({
  components: {
    ContentEditable,
    NewCustomer,
    ProblemSummary,
    ActionMenu,
    CustomerDrawer
  }
})
export default class PageIndex extends Vue {
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
  get customerActionItems() {
  }
  get selectedCustomer() {
    return this.$store.direct.state.selectedCustomer;
  }
  get selectedCustomerId() {
    return (this.selectedCustomer || {})._id;
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
    this.$store.direct.dispatch.fetchCustomersFromDB();
  }

  addCustomer(name: string) {
    const customer = new Customer(this.$stitchApi.userId(), name);
    this.$stitchApi
      .createCustomer(customer)
      .then(res => {
        this.$store.direct.dispatch.fetchCustomersFromDB().then(() => {
          (this.$refs.customerDrawer as CustomerDrawer).selectCustomerById(
            res.insertedId
          );
        });
      })
      .catch(console.log);
    this.addingCustomer = false;
  }

  changeCustomerName(customerId: ObjectID | undefined, name: string) {
    const customer = this.$store.direct.getters.getCustomer({
      customerId: customerId
    });
    if (!customer) {
      return;
    }

    const changes: any = {};
    changes[nameof("name")] = name;
    this.$store.direct.commit.updateObject({
      target: customer,
      changes: changes
    });

    this.$store.direct.dispatch
      .saveCustomer({ customerId: this.selectedCustomerId })
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
}
</script>
