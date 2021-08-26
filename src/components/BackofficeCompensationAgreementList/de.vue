<template>
  <div>
    <q-item class="q-mt-sm q-px-sm q-pb-none text-subtitle1 text-weight-bold">
      <q-item-section>
        <q-item-label class="ellipsis">{{ $tc("de.compensationAgreement", 2) }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          icon="add"
          round
          outline
          size="10.5px"
          color="primary"
          @click.stop=""
          :title="$t('de.addCompensationAgreement')"
          class="shadow-1"
        />
      </q-item-section>
    </q-item>
    <navigation-items
      :items="[]"
      type="splitview"
    />
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BackofficeMixin from "src/mixins/BackofficeMixin";
import NavigationItems from "components/NavigationItems.vue";

@Component({
  components: {
    NavigationItems
  }
})
export default class BackofficeCompensationAgreementList extends BackofficeMixin {
  
}
</script>
