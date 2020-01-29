<template>
  <q-drawer
    v-model="isVisible"
    content-class="bg-grey-2 customer-drawer"
    show-if-above
  >
    <q-list>
      <q-expansion-item
        switch-toggle-side
        v-model="activeCustomersExpansionState"
        expand-separator
        header-class="q-pt-md text-subtitle1"
      >
        <template v-slot:header>
          <q-item-section>
            <q-item-label class="q-pl-none">{{
              $tc("client", 2)
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="add"
              round
              outline
              size="10.5px"
              color="primary"
              @click.stop="addCustomer"
              :title="$t('newClient')"
              class="shadow-1"
            />
          </q-item-section>
        </template>

        <q-item
          clickable
          v-for="(customer, index) in activeCustomers"
          :key="'active' + index"
          v-ripple
          :active="isSelected(customer)"
          active-class="text-primary"
          @click="selectCustomer(customer)"
          class="q-pl-xl"
        >
          <q-item-section>
            <q-item-label class="q-pl-sm">{{ customer.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        v-if="archivedCustomers.length"
        v-model="archivedCustomersExpansionState"
        switch-toggle-side
        :label="$t('clientArchive')"
        header-class="text-subtitle1"
      >
        <q-item
          clickable
          v-for="(customer, index) in archivedCustomers"
          :key="'archived' + index"
          v-ripple
          :active="isSelected(customer)"
          active-class="text-primary"
          @click="selectCustomer(customer)"
          class="q-pl-xl"
        >
          <q-item-section>
            <q-item-label class="q-pl-sm">{{ customer.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>
  </q-drawer>
</template>

<style lang="sass">
.customer-drawer .q-item__section--avatar
  min-width: inherit
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ObjectID } from "bson";
import { Customer } from "../models/customer";

@Component
export default class CustomerDrawer extends Vue {
  isVisible = this.$q.screen.gt.sm;
  activeCustomersExpansionState = true;
  archivedCustomersExpansionState = false;

  get selectedCustomer() {
    return this.$store.direct.getters.getSelectedCustomer();
  }
  get customers() {
    return this.$store.direct.state.customers;
  }
  get activeCustomers() {
    return this.customers
      .filter(customer => !customer.leftAt)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get archivedCustomers() {
    return this.customers
      .filter(customer => !!customer.leftAt)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  created() {
    this.$root.$on("toggleCustomerDrawer", () => {
      this.isVisible = !this.isVisible;
    });
  }

  beforeDestroy() {
    this.$root.$off("toggleCustomerDrawer");
  }

  isSelected(customer: Customer) {
    return this.selectedCustomer == customer;
  }

  addCustomer() {
    this.$emit("willAddCustomer");
    this.closeDrawerIfNeeded();
  }

  selectCustomer(customer: Customer) {
    this.selectCustomerById(customer._id);
    this.closeDrawerIfNeeded();
  }

  selectCustomerById(id: ObjectID | undefined) {
    if (!id) {
      return;
    }

    this.$emit("didSelectCustomer");
    if (this.selectedCustomer) {
      this.$store.direct.commit.isLoadingCustomer(true);
    }
    this.$store.direct.dispatch
      .saveCustomer({ customer: this.selectedCustomer, resolveOnError: true })
      .then(() => this.loadCustomerFromDB(id));
  }

  loadCustomerFromDB(id: ObjectID) {
    this.$store.direct.commit.isLoadingCustomer(true);
    this.$stitchApi
      .getCustomerById(id)
      .then(customer => {
        this.$store.direct.commit.replaceCustomerInList(customer);
        this.$store.direct.commit.setSelectedCustomer(customer);
        this.$store.direct.commit.isLoadingCustomer(false);
      })
      .catch(err => {
        console.error(`Failed: ${err}`);
        this.$store.direct.commit.isLoadingCustomer(false);
      });
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.isVisible = false;
    }
  }
}
</script>
