<template>
  <q-page>
    <customer-drawer
      ref="customerDrawer"
      @willAddCustomer="addingCustomer = true"
      @didSelectCustomer="addingCustomer = false"
    />

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
      <div class="row">
        <content-editable
          ref="customerName"
          class="col q-mt-sm q-mb-xl q-py-sm text-h2"
          v-text="selectedCustomer.name"
          :contenteditable="!isDisabled"
          @change="changeCustomerName(selectedCustomerId, $event.value)"
        />
        <div>
          <action-menu :items="customerActionItems" class="on-right q-mt-sm" />
        </div>
      </div>
      <div class="q-gutter-md">
        <q-btn
          v-if="!isDisabled"
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
          :isDisabled="isDisabled"
        />
      </div>
    </div>

    <div class="customer-overview q-pa-xl" v-else-if="!customers.length">
      <p>{{ $t("noExistingClient") }}</p>
      <q-btn
        @click="addingCustomer = true"
        no-caps
        color="primary"
        rounded
        :label="$t('createFirstClient')"
        class="q-mt-md"
      />
    </div>
    <div class="customer-overview q-pa-xl" v-else>
      <p>{{ $t("noSelectedClient") }}</p>
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
    const customer = this.selectedCustomer;
    if (!customer) {
      return [];
    }

    return [
      {
        name: this.$t("clientDismissal"),
        icon: "fas fa-archive",
        action: this.archiveCustomer,
        condition: !customer.leftAt
      },
      {
        name: this.$t("clientReadmission"),
        icon: "fas fa-folder-open",
        action: this.unarchiveCustomer,
        condition: !!customer.leftAt
      },
      {
        name: this.$t("deleteClient"),
        icon: "delete_forever",
        action: this.deleteCustomer,
        condition:
          !!customer.leftAt ||
          (!customer.problems.length && !customer.masterDataHistory.length),
        isDestructive: true
      }
    ];
  }
  get selectedCustomer() {
    return this.$store.direct.getters.getSelectedCustomer();
  }
  get selectedCustomerId() {
    return this.$store.direct.state.selectedCustomerId;
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
  get isDisabled() {
    return !!this.selectedCustomer?.leftAt;
  }

  created() {
    if (this.selectedCustomer) {
      this.$store.direct.commit.isLoadingCustomerList(true);
    }
    this.$store.direct.dispatch
      .saveCustomer({ customer: this.selectedCustomer, resolveOnError: true })
      .then(() => this.$store.direct.dispatch.fetchCustomersFromDB());
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
      .catch(console.error);
    this.addingCustomer = false;
  }

  changeCustomerName(customerId: ObjectID | undefined, name: string) {
    this.updateCustomer(customer => {
      const changes: any = {};
      changes[nameof("name")] = name;
      this.$store.direct.commit.updateObject({
        target: customer,
        changes: changes
      });
    });
  }

  archiveCustomer() {
    this.updateCustomer(customer =>
      this.$store.direct.commit.archiveCustomer(customer)
    );
    (this.$refs
      .customerDrawer as CustomerDrawer).archivedCustomersExpansionState = true;
  }

  unarchiveCustomer() {
    this.updateCustomer(customer =>
      this.$store.direct.commit.unarchiveCustomer(customer)
    );
    (this.$refs
      .customerDrawer as CustomerDrawer).activeCustomersExpansionState = true;
  }

  updateCustomer(mutate: (customer: Customer) => void) {
    setTimeout(() => {
      const customer = this.selectedCustomer;
      if (!customer) {
        return;
      }

      mutate(customer);
      this.$store.direct.dispatch.saveCustomer({
        customer: this.selectedCustomer
      });
    }, 0);
  }

  deleteCustomer() {
    if (this.selectedCustomer) {
      this.$store.direct.dispatch.deleteCustomer(this.selectedCustomer);
    }
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
