<template>
  <q-menu
    auto-close
    :anchor="anchor"
    :self="self"
    :fit="fit"
  >
    <q-list class="text-body2">
      <q-item
        clickable
        v-for="(locale, index) in $i18n.availableLocales"
        :key="index"
        :active="$i18n.locale === locale"
        @click="$bus.emit('did-change-locale', locale)"
      >
        <q-item-section side>
          <q-icon
            :name="$i18n.locale === locale ? 'fas fa-circle' : ''"
            color="primary"
            size="10px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t(locale.toLowerCase()) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">

defineProps({
  anchor: {
    type: String,
    default: "bottom middle",
  },
  self: {
    type: String,
    default: "top middle",
  },
  fit: {
    type: Boolean
  },
});

</script>
