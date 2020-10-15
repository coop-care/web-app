<template>
  <q-page
    padding
    class="limit-page-width width-md"
  >
    <loading v-if="$store.direct.state.isLoadingClientList && !isDataAvailable" />

    <central-message
      v-else-if="!$store.direct.state.isLoadingClientList && !isDataAvailable"
      :message="$t('clientNotFound')"
    />

    <div v-else>
      <simplified-markdown
        v-if="title"
        :text="title"
        class="text-h5 q-mb-lg"
      />
      <slot />
      <slot name="footer">
        <div
          v-if="!hideDefaultFooter"
          class="flex justify-around q-mt-lg"
        >
          <q-btn
            :label="$t('cancel')"
            @click="$emit('cancel')"
            color="primary"
            rounded
            flat
            class="shadow-1"
          />
          <q-btn
            :label="$t('save')"
            @click="$emit('save')"
            color="primary"
            rounded
          />
        </div>
      </slot>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import SimplifiedMarkdown from "components/SimplifiedMarkdown.vue";

@Component({
  components: {
    Loading,
    CentralMessage,
    SimplifiedMarkdown,
  },
})
export default class EditingPageContainer extends Vue {
  @Prop(Boolean) readonly isDataAvailable!: boolean;
  @Prop({ type: String, default: ""}) readonly title!: string;
  @Prop(Boolean) readonly hideDefaultFooter!: boolean;
}
</script>
