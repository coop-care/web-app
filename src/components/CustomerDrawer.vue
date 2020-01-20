<template>
  <q-drawer
    v-model="isVisible"
    content-class="bg-grey-2"
    show-if-above
  >
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label
            class="q-pl-none"
            header
          >{{
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
            @click="$emit('willAddCustomer')"
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
            selectCustomerById(customer._id);
            closeDrawerIfNeeded();
          "
      >
        <q-item-section>
          <q-item-label class="q-pl-md">{{ customer.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ObjectID } from "bson";
import { Customer } from "../models/customer";

@Component
export default class CustomerDrawer extends Vue {
  isVisible = this.$q.screen.gt.sm;

  get selectedCustomer() {
    return this.$store.direct.state.selectedCustomer;
  }
  get customers() {
    return this.$store.direct.state.customers;
  }
  get sortedCustomers() {
    return this.customers
      .concat()
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
    return this.selectedCustomer?.equals(customer) || false;
  }

  selectCustomerById(id: ObjectID | undefined) {
    if (!id) {
      return;
    }

    this.$emit("didSelectCustomer");
    this.$store.direct.commit.isLoadingCustomer(true);
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
    this.$store.direct.commit.isLoadingCustomer(true);
    this.$stitchApi
      .getCustomerById(id)
      .then(customer => {
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