<template>
  <div>
    <q-item
      v-for="item in items.filter(item => item.visible != false)"
      :key="item.label"
      clickable
      v-ripple
      active-class="text-primary active-hover-background"
      :active="isActive(item)"
      @click="item.action ? item.action() : route(item.route)"
    >
      <q-item-section side>
        <q-icon
          :name="item.icon"
          :color="isActive(item) ? 'primary' : ''"
        />
      </q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

export type NavigationItem = {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  visible?: boolean
}

@Component
export default class NavigationSection extends Vue {
  @Prop({type: Array, default: () => []}) readonly items!: NavigationItem[];

  isActive(item: NavigationItem) {
    return !!item.route && this.$route.name == item.route;
  }

  route(routeName?: string) {
    if (!!routeName && this.$route.name != routeName) {
      this.$router.push({ name: routeName })
        .catch(console.error)
    }
  }
}
</script>
