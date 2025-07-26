<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }

}
)

const title = '拾光一班'
const description = '这里是分宜中学 2014 届高三 1 班的线上家园，是承载着青春记忆与师生情谊的港湾。在班主任张小勇老师的悉心浇灌下，我们曾在分宜中学的教室里并肩奋斗，以浓郁的学风为笔，以团结的情谊为墨，书写下属于青春的炽热篇章。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3VpLXByby1zdGFydGVyLm51eHQuZGV2IiwiaWF0IjoxNzM5NDYzMzk4fQ.XLzPkSW6nRbPW07QO1RkMwz_RAPA4KfeyrWrK3li9YI.jpg?theme=light',
  twitterImage: 'https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3VpLXByby1zdGFydGVyLm51eHQuZGV2IiwiaWF0IjoxNzM5NDYzMzk4fQ.XLzPkSW6nRbPW07QO1RkMwz_RAPA4KfeyrWrK3li9YI.jpg?theme=light',
  twitterCard: 'summary_large_image'
})

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: '首页',
  to: '/',
  active: route.path.endsWith('/')
}, {
  label: '3D地图',
  to: '/3d',
  active: route.path.startsWith('/3d')
}, {
  label: '人物',
  to: '/person',
  active: route.path.startsWith('/person')
}, {
  label: '相册',
  to: '/album',
  active: route.path.startsWith('/album')
}, {
  label: '关于',
  to: '/about',
  active: route.path.startsWith('/about')
}])
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <img
          src="/分宜中学.png"
          alt="分宜中学"
          class="w-auto h-14 shrink-0"
        >
      </template>
      <UNavigationMenu :items="items" />
      <template #right>
        <UColorModeButton />

        <UButton
          to="https://github.com/E4s0N/class-flow-map"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template><template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UMain class="min-h-[calc(100vh-var(--ui-header-height))]">
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/E4s0N/class-flow-map"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
