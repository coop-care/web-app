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
      <h2
        ref="customerName"
        class="q-mt-sm q-mb-md q-py-sm cursor-pointer"
        contenteditable
        v-text="selectedCustomer.name"
        @blur="editCustomer({id: selectedCustomerId, name: $event.target.innerText.trim()})"
        @paste.prevent="onPasteTarget"
        @keydown.enter="blurTarget"
        @keydown.tab="blurTarget"
      ></h2>
      <q-list>
        <q-item-label header>{{ $tc("problem", 2) }}</q-item-label>
        <q-item
          v-for="(problemRecord, problemIndex) in selectedCustomer.problems"
          v-bind:key="problemIndex"
          class="row"
        >
          <div class="col">
            <q-item-label>{{ problemTitleForId(problemRecord.problem.id) }}</q-item-label>
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
        outline
        class="q-mt-md"
        @click="addProblem"
      />
    </div>
    <!-- <div
      class="customer-overview q-pa-xl"
      v-if="!customers.length"
    >
      Es existieren noch keine Kunden.
      <q-btn
        @click="addCustomer"
        flat
        no-caps
        label="Leg den ersten Kunden an."
      />
    </div> -->
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
import { Terminology } from "../helper/terminology";

@Component({
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
    return this.$store.getters.getCustomerById(this.selectedCustomerId);
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get problems() {
    return this.terminology.problemClassificationScheme.domains
      .map(domain => {
        return domain.problems;
      })
      .reduce((prev, current) => {
        return prev.concat(current);
      }, []);
  }
  get problemTitleForId() {
    return (id: string) => {
      return (
        this.terminology.problemClassificationScheme.domains
          .map(domain => {
            return domain.problems.filter(problem => problem.code == id);
          })
          .reduce((prev, current) => {
            return prev.concat(current);
          }, [])[0] || {}
      ).title;
    };
  }

  addCustomer() {
    this.$store.commit("addCustomer", { name: this.$t("newCustomer") });

    setTimeout(() => {
      let h2 = this.$refs.customerName as HTMLElement;

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

  onPasteTarget(evt: ClipboardEvent) {
    if (!evt.clipboardData) {
      return;
    }

    const text = evt.clipboardData
      .getData("text/plain")
      .replace(/[\n\r\t]/g, " ");
    window.document.execCommand("insertText", false, text);
  }

  blurTarget(evt: Event) {
    if (evt.target) {
      (evt.target as HTMLElement).blur();
    }
    let sel = window.getSelection();

    if (sel) {
      sel.removeAllRanges();
    }
  }
}
</script>
