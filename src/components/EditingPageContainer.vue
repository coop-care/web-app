<template>
  <q-page
    class="limit-page-width page-padding width-sm"
  >
    <pull-to-refresh>
      <loading
        v-if="$store.direct.state.isLoadingClientList && !isDataAvailable"
        class="fit"
      />

      <central-message
        v-else-if="!$store.direct.state.isLoadingClientList && !isDataAvailable"
        :message="$t('clientNotFound')"
      />

      <div v-else>
        <div 
          v-if="!hideDefaultHeader"
          class="row items-center q-pb-md q-mb-lg"
        > 
          <q-btn
            flat
            round
            color="primary"
            icon="fas fa-chevron-left"
            size="13.5px"
            dense
            @click="$router.back()"/>
          <simplified-markdown
            v-if="title"
            :text="title"
            class="text-h5 block col text-center"
          />
        </div>
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
    </pull-to-refresh>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import SimplifiedMarkdown from "components/SimplifiedMarkdown.vue";
import PullToRefresh from "components/PullToRefresh.vue";

@Component({
  components: {
    Loading,
    CentralMessage,
    SimplifiedMarkdown,
    PullToRefresh
  },
})
export default class EditingPageContainer extends Vue {
  @Prop(Boolean) readonly isDataAvailable!: boolean;
  @Prop({ type: String, default: ""}) readonly title!: string;
  @Prop(Boolean) readonly hideDefaultHeader!: boolean;
  @Prop(Boolean) readonly hideDefaultFooter!: boolean;
}
</script>
