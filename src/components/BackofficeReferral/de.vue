<template>
  <split-view
    class="min-height"
  >
    <template v-slot:before>
      <q-list 
        class="text-size-adjust-md q-mb-xl"
      >
        <q-item class="q-px-sm q-pb-none text-subtitle1 text-weight-bold">
          <q-item-section>
            <q-item-label class="ellipsis">{{ $tc("de.medicalReferral", 2) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="add"
              round
              outline
              size="10.5px"
              color="primary"
              @click.stop=""
              :title="$t('de.addMedicalReferral')"
              class="shadow-1"
            />
          </q-item-section>
        </q-item>
        <navigation-items
          :items="[]"
          type="splitview"
        />
      </q-list>
    </template>

    <template v-slot:after>
    </template>
  </split-view>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BackofficeMixin from "src/mixins/BackofficeMixin";
import SplitView from "components/SplitView.vue";
import NavigationItems from "components/NavigationItems.vue";

@Component({
  components: {
    SplitView,
    NavigationItems
  },
})
export default class BackofficeReferral extends BackofficeMixin {
}
</script>
