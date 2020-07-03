<template>
  <editing-page-container
    :title="$t('planInterveneStep')"
    :is-data-available="!!record"
    @cancel="$router.back()"
    @save="save"
  >
    <intervention-view />
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import InterventionView from "components/InterventionV3.vue";

@Component({
  components: {
    InterventionView,
    EditingPageContainer
  }
})
export default class ClassificationPage extends Vue {
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  save() {
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
