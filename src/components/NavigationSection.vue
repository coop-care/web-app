<template>
  <div>
    <q-item
      v-for="item in items.filter(item => item.visible != false)"
      :key="item.label"
      clickable
      v-ripple
      active-class="text-primary active-hover-background"
      :active="$route.name == item.route"
      @click="item.action ? item.action() : route(item.route)"
    >
      <q-item-section side>
        <q-icon
          :name="item.icon"
          :color="$route.name == item.route ? 'primary' : ''"
        />
      </q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

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

  route(routeName?: string) {
    if (this.$route.name != routeName) {
      this.$router.push({ name: routeName })
    }
  }
}
</script>
