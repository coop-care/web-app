<template>
  <div>
    <q-item
      v-for="(item, index) in items.filter(item => item.visible != false)"
      :key="'item' + index"
      clickable
      v-ripple
      :class="[type == 'splitview' ? 'q-pl-lg q-pr-sm' : '']"
      active-class="text-primary active-hover-background"
      :active="item.active != undefined ? item.active : $route.name == item.route"
      @click="item.action ? item.action() : route(item.route)"
    >
      <q-item-section v-if="type == 'default'" side>
        <q-icon
          :name="item.icon"
          :color="$route.name == item.route ? 'primary' : ''"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label :class="item.labelClass">{{ item.label }}</q-item-label>
        <q-item-label v-if="item.caption" caption>{{ item.caption }}</q-item-label>
      </q-item-section>
      <q-item-section v-if="type == 'splitview'" side>
        <q-icon name="fas fa-angle-right" />
      </q-item-section>
    </q-item>
  </div>
</template>

<style lang="sass">
.q-item
  .fa-angle-right
    color: #bbbbbb
  &.active-hover-background.q-item--active .fa-angle-right
    color: var(--q-color-primary)
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

export type NavigationItem = {
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
  visible?: boolean;
  active?: boolean;
  caption?: string;
  labelClass?: string;
}

@Component
export default class NavigationItems extends Vue {
  @Prop({type: Array, default: () => []}) readonly items!: NavigationItem[];
  @Prop({type: String, default: "default"}) readonly type!: "splitview" | "default";

  route(routeName?: string) {
    if (this.$route.name != routeName) {
      void this.$router.push({ name: routeName })
    }
    this.$emit("did-route");
  }
}
</script>
