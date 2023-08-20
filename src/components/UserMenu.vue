<template>
  <q-btn
    v-if="$ccApi.isLoggedIn"
    icon="share"
    flat
    stretch
    style="max-width:44px"
  >
    <q-menu
      max-width="260px"
      max-height="calc(96vh - 50px)"
    >
      <q-list
        class="text-body2"
        style="width: 260px"
      >
        <q-item
          v-if="!$q.platform.is.electron"
          clickable
          v-close-popup
          @click="print"
        >
          <q-item-section side>
            <q-icon name="fas fa-print" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("print") }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="!$store.direct.getters.isDemo"
          clickable
          v-close-popup
          @click="exportBackup"
        >
          <q-item-section side>
            <q-icon name="fas fa-file-arrow-down" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("exportBackup") }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section side>
            <q-icon name="fas fa-globe" />
          </q-item-section>
          <q-item-section>{{
            $t("selectLanguage", { language: $t($i18n.locale.toLowerCase()) })
          }}</q-item-section>
          <q-item-section side>
            <q-icon name="fas fa-angle-right" />
          </q-item-section>
          <language-menu
            :anchor="$q.screen.gt.xs ? 'top left' : 'bottom middle'"
            :self="$q.screen.gt.xs ? 'top right' : 'top middle'"
            :fit="true"
          />
        </q-item>

        <q-item
          clickable
          v-close-popup
          @click="openMail"
        >
          <q-item-section side>
            <q-icon name="far fa-comment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("feedback") }}</q-item-label>
          </q-item-section>
        </q-item>

        <div v-if="isDev">
          <q-separator />
          <q-item
            clickable
            v-close-popup
            tag="label"
          >
            <q-item-section side>
              <q-icon name="fas fa-file-arrow-up" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ "Import Backup" }}</q-item-label>
            </q-item-section>
            <input
              type="file" 
              accept=".coopcare"
              class="hidden"
              @change="importBackup"
            />
          </q-item>
          <q-item clickable>
            <q-item-section side>
              <q-icon name="fas fa-tools" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $q.platform.is.name }} – {{ $q.platform.is.platform }},
                Version {{ $q.platform.is.versionNumber }} ({{ $q.platform.is.version }})
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="fas fa-angle-right" />
            </q-item-section>
            <dev-menu
              :anchor="$q.screen.gt.xs ? 'top left' : 'bottom middle'"
              :self="$q.screen.gt.xs ? 'top right' : 'top middle'"
            />
          </q-item>
        </div>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style lang="sass">
.usermenu-signature
  font-size: 10px
  line-height: 2.4em
  border: 0 none
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import LanguageMenu from "./LanguageMenu.vue";
import DevMenu from "./DevMenu.vue";
import { downloadJSON } from "src/helper/download";
import { plainToInstance } from "class-transformer";
import { Client } from "src/models";

@Component({
  components: {
    LanguageMenu,
    DevMenu
  },
})
export default class UserMenu extends Vue {
  get isDev() {
    return process.env.DEV;
  }
  print() {
    if (this.$q.platform.is.cordova && (cordova?.plugins as any)?.printer) {
      (cordova?.plugins as any)?.printer?.print?.();
    } else if (this.$q.platform.is.electron) {
      window.print();
    } else {
      window.print();
    }
  }
  openMail() {
    location.href = "mailto:feedback@coopcare.de?subject=Feedback";
  }
  exportBackup() {
    const user = this.$store.direct.state.currentUser?.username;
    return downloadJSON(
      {
        scheme: 1, 
        createdAt: Date.now(), 
        user,
        clients: this.$store.direct.state.clients.map(client => client.toJSON())
      },
      "Backup_" + (user || "").replace(/ /g, "") + "_" + (new Date()).toISOString().substring(0, 19).replace(/\D/g, "") + ".coopcare"
    );
  }
  async importBackup(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];

    if (file) {
      const fileContent = await file.text();
      const json = JSON.parse(fileContent);
      const clients = plainToInstance<Client, Client[]>(Client, json.clients);
      clients.reduce(
        (promise, client) => promise.then(() => this.$store.direct.dispatch.addClient(client)).then(() => undefined),
        Promise.resolve()
      );
    }
  }
}
</script>
