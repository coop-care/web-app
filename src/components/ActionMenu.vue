<template>
  <q-btn-dropdown
    v-if="items.filter(item => item.condition !== false).length"
    :color="color"
    rounded
    outline
    size="14px"
    dense
    class="more-button shadow-1"
    auto-close
    content-class="text-primary"
    :title="title || $t('moreActions')"
  >
    <q-list>
      <q-item
        v-for="(item, index) in items"
        v-bind:key="index"
        v-if="item.condition !== false"
        clickable
        v-ripple
        @click="item.action"
        :class="item.isDestructive ? 'text-negative' : 'text-' + color"
      >
        <q-item-section side>
          <q-icon
            :name="item.icon"
            :color="item.isDestructive ? 'negative': color"
          />
        </q-item-section>
        <q-item-section>{{ item.name }}</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<style lang="sass">
.more-button.q-btn-dropdown .q-btn-dropdown__arrow
  margin: 0
</style>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const ActionMenuProps = Vue.extend({
  props: {
    title: String,
    items: Array,
    color: {
      type: String,
      default: "primary"
    }
  }
});

@Component
export default class ActionMenu extends ActionMenuProps {}
</script>
