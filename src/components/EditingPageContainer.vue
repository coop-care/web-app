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
      <div
        v-if="title"
        class="text-h5 q-mb-lg"
      >
        {{ title }}
      </div>
      <slot />
      <slot name="footer">
        <div class="flex justify-around q-mt-lg">
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
import Vue from "vue";
import Component from "vue-class-component";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

const EditingPageContainerProps = Vue.extend({
  props: {
    isDataAvailable: Boolean,
    title: String,
  },
});

@Component({
  components: {
    Loading,
    CentralMessage,
  },
})
export default class EditingPageContainer extends EditingPageContainerProps {}
</script>
