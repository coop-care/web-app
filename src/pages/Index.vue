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
              @click="addCustomer"
            />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-for="customer in sortedCustomers"
          :key="customer.id"
          v-ripple
          :active="selectedCustomerId == customer.id"
          @click="selectCustomer(customer)"
        >
          <q-item-section>
            <q-item-label class="q-pl-md">{{ customer.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div
      class="customer-overview q-pa-xl"
      v-if="selectedCustomer"
    >
      <content-editable
        ref="customerName"
        class="q-mt-sm q-mb-xl q-py-sm text-h2"
        v-text="selectedCustomer.name"
        @change="editCustomer({customerId: selectedCustomerId, name: $event.value})"
      />
      <div class="q-gutter-md">
        <problem-summary
          v-for="(problemRecord, problemIndex) in selectedCustomer.problems"
          v-bind:key="problemIndex"
          :problemRecord="problemRecord"
          :params="{customerId: selectedCustomerId, problemIndex: problemIndex}"
        />
        <q-btn
          icon="add"
          color="primary"
          :label="$t('recordProblem')"
          outline
          class="q-mt-md"
          @click="addProblem"
        />
      </div>
    </div>

    <div
      class="customer-overview q-pa-xl"
      v-else-if="!customers.length"
    >
      <p>{{ $t("noExistingCustomer") }}</p>
      <q-btn
        @click="addCustomer"
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
import ProblemSummary from "../components/ProblemSummary.vue";
import { Terminology } from "../helper/terminology";
import * as Api from "ts-api-client";


@Component({
  components: {
    ContentEditable,
    ProblemSummary
  },
  methods: {
    ...mapMutations(["selectCustomer", "editCustomer"])
  }
})
export default class PageIndex extends Vue {
  customerDrawer = !this.$q.platform.is.mobile;

  get customers() {
    return this.$store.state.customers;
  }
  get selectedCustomerId() {
    return this.$store.state.selectedCustomerId;
  }
  get sortedCustomers() {
    return this.customers
      .concat()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get selectedCustomer() {
    return this.$store.getters.getCustomerById({
      customerId: this.selectedCustomerId,
      terminology: this.terminology
    });
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }

  addCustomer() {
    this.$store.commit("addCustomer", { name: this.$t("newCustomer") });

    setTimeout(() => {
      // @ts-ignore
      let h2 = (this.$refs.customerName || {}).$el as HTMLElement;

      if (!h2) {
        return;
      }

      h2.focus();

      let range = document.createRange();
      range.selectNodeContents(h2);
      let sel = window.getSelection();

      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 1);
  }

  addProblem() {
    let params = {
      customerId: this.selectedCustomerId as string,
      problemIndex: ""
    };
    this.$store.commit("createProblemRecord", params);
    params.problemIndex = "" + (this.selectedCustomer.problems.length - 1);
    this.$router.push({ name: "problem", params: params });
  }
}
</script>
