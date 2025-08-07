<script setup lang="ts">
import APlayer from 'aplayer-ts'
import 'aplayer-ts/src/css/base.css'

const playerContainer = ref<HTMLElement | null>(null)
let aplayer: any = null

onMounted(() => {
  if (playerContainer.value) {
    try {
      // 使用 setTimeout 确保 DOM 完全准备好
      setTimeout(() => {
        if (playerContainer.value) {
          // 简化初始化过程
          aplayer = APlayer()

          // 使用本地音乐文件
          aplayer.init({
            container: playerContainer.value,
            mini: true,
            audio: [
              {
                name: '怒放的生命',
                artist: '汪峰',
                url: '/music/怒放的生命.mp3',
                cover: '/music/怒放的生命.jpg'
              }
            ]
          })
        }
      }, 100)
    } catch (error) {
      console.error('Failed to initialize music player:', error)
    }
  }
})

onUnmounted(() => {
  if (aplayer) {
    try {
      // 如果 aplayer 有销毁方法则调用
      if (typeof aplayer.destroy === 'function') {
        aplayer.destroy()
      }
      aplayer = null
    } catch (e) {
      console.warn('Error destroying APlayer:', e)
    }
  }
})
</script>

<template>
  <div
    ref="playerContainer"
    class="local-music-player"
  />
</template>

<style scoped>
.local-music-player {
  display: inline-block;
  width: 44px;
  height: 44px;
}

.local-music-player :deep(.aplayer) {
  width: 44px !important;
  height: 44px !important;
  margin: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}

.local-music-player :deep(.aplayer-mini) {
  width: 44px !important;
  height: 44px !important;
}

.local-music-player :deep(.aplayer-pic) {
  width: 44px !important;
  height: 44px !important;
  float: none !important;
}

.local-music-player :deep(.aplayer-info) {
  display: none !important;
}
</style>
