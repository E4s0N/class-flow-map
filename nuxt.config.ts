// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    'nuxt-echarts'
  ],
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark'
  },
  ui: {
    fonts: false
  },
  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',
  echarts: {
    charts: ['BarChart', 'MapChart', 'LineChart', 'EffectScatterChart', 'LinesChart'],
    components: [
      'DatasetComponent',
      'GridComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'GeoComponent',
      'VisualMapComponent',
      'DataZoomComponent',
      'DataZoomSliderComponent'
    ]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
