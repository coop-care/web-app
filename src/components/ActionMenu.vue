<template>
  <q-btn-dropdown
    color="primary"
    rounded
    outline
    size="14px"
    dense
    class="more-button shadow-1"
    auto-close
    content-class="dense-avatar text-primary"
    :title="title || $t('moreActions')"
  >
    <q-list>
      <q-item
        v-for="(item, index) in items"
        v-bind:key="index"
        v-if="item.condition || item.condition === undefined"
        clickable
        v-ripple
        @click="item.action"
        :class="item.isDestructive ? 'text-negative' : ''"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
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

@Component({
  props: {
    title: String,
    items: Array
  }
})
export default class ActionMenu extends Vue {}
</script>
