<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
        <q-btn
          dense
          borderless
          flat
          icon="settings"
        >
          <q-menu>
            <q-item clickable>
              <q-item-section>{{ $t('settings.language') }}</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>

              <q-menu
                anchor="top right"
                self="top left"
              >
                <q-list>
                  <q-item
                    v-for="language in langOptions"
                    :active="lang === language.value"
                    :key="language.value"
                    dense
                    clickable
                    @click="lang = language.value"
                  >
                    <q-item-section>{{ language.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>

            </q-item>
            <q-item
              clickable
              @click="$q.dark.toggle()"
            >
              <q-item-section avatar>
                <q-icon :name="$q.dark.mode ? 'brightness_low' : 'brightness_high'" />
              </q-item-section>
              <q-item-section>
                {{ $t('settings.darkMode') }}
              </q-item-section>
            </q-item>
            <q-separator />
          </q-menu>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <auth-menu />
      <admin-menu />
      <superuser-menu />
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import authMenu from 'ext-quasar-auth/components/AuthMenu'
import adminMenu from './menu/AdminMenu'
import superuserMenu from './menu/SuperuserMenu'

import languages from 'quasar/lang/index.json'
const appLanguages = languages.filter(lang =>
  ['nl', 'en-us'].includes(lang.isoName)
)

export default {
  name: 'MyLayout',
  components: {
    authMenu,
    adminMenu,
    superuserMenu
  },
  data () {
    return {
      leftDrawerOpen: false,
      lang: this.$q.lang.isoName
    }
  },
  watch: {
    lang (lang) {
      let language
      try {
        language = require(`quasar/lang/${lang}`)
      } catch (e) { }

      if (language) {
        this.$q.lang.set(language.default)
      }
    }
  },

  created () {
    this.langOptions = appLanguages.map(lang => ({
      label: lang.nativeName, value: lang.isoName
    }))
  }
}
</script>
