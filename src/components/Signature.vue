<template>
  <div 
    :class="'signature text-' + (signature ? color : 'grey-4') + ' ' + 
      (hasTooltip && teamMember ? 'cursor-help' : '')"
  >
    {{ signature || " " }}
    <q-tooltip
      v-if="hasTooltip && teamMember"
      anchor="top middle"
      self="bottom middle"
      transition-show="jump-up"
      transition-hide="jump-down"
      :offset="$q.platform.is.mobile ? [0,14] : [0,4]"
      content-class="signature-tooltip"
    >
      {{ tooltip }}
    </q-tooltip>
  </div>
</template>

<style lang="sass">
.signature
  border-radius: 50%
  padding: 0 .2em 0 0
  text-align: center
  line-height: 2.3em
  width: 2.4em
  height: 2.4em
  font-weight: 500
  font-style: italic
  border: 1px solid
.cursor-help
  cursor: help
.signature-tooltip
  font-size: .8rem
  padding: 2px 6px
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { TeamMember } from "../models";

@Component
export default class SignatureView extends Vue {
  @Prop({ type: Object }) readonly user?: TeamMember;
  @Prop({ type: String, default: "" }) readonly userId!: string;
  @Prop({ type: String, default: "black"}) readonly color!: string;
  @Prop({ type: String, default: ""}) readonly description!: string;
  @Prop({ type: Boolean}) readonly hasTooltip!: boolean;

  get signature() {
    return this.teamMember?.signature;
  }
  get tooltip() {
    return [this.teamMember?.username, this.description].filter(text => text).join(", ");
  }
  get teamMember() {
    return this.user || this.$store.direct.state.teamMembers[this.userId];
  }
}
</script>
