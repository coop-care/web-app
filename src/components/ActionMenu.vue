<template>
  <q-btn-dropdown
    v-if="items.filter(item => item.condition !== false).length"
    :color="color"
    rounded
    outline
    size="14px"
    dense
    class="more-button shadow-1 bg-white"
    auto-close
    :content-class="'radius-md shadow-5 text-' + color"
    :title="title || $t('moreActions')"
  >
    <q-list>
      <div
        v-for="(item, index) in items"
        v-bind:key="index"
        v-if="item.condition !== false"
      >
        <slot
          v-if="item.customType"
          :name="item.customType"
        />
        <q-separator v-else-if="item.name == '-'" />
        <q-item
          v-else
          clickable
          v-ripple
          @click="item.action"
          :class="item.isDestructive ? 'text-negative' : ''"
        >
          <q-item-section side>
            <q-icon
              :name="item.icon"
              :color="item.isDestructive ? 'negative': color"
            />
          </q-item-section>
          <q-item-section>
            {{ item.name }}
          </q-item-section>
        </q-item>
      </div>
    </q-list>
  </q-btn-dropdown>
</template>

<style lang="sass">
.more-button.q-btn-dropdown .q-btn-dropdown__arrow
  margin: 0
</style>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

export interface ActionItem  {
  name: string;
  icon?: string;
  action: () => void;
  condition: boolean;
  isDestructive: boolean;
  customType?: string;
}

@Component
export default class ActionMenu extends Vue {
  @Prop({ type: String, default: ""}) readonly title!: string;
  @Prop({ type: Array, default: () => [] }) readonly items!: ActionItem[];
  @Prop({ type: String, default: "primary" }) readonly color!: string;
}
</script>
