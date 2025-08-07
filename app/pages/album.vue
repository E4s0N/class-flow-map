<template>
  <UPageSection
    :ui="{ container: 'gap-0 sm:gap-0 py-4 sm:py-6 lg:py-8', title: 'text-2xl sm:text-3xl' }"
  >
    <div class="album-container">
      <!-- 相册标题 -->
      <h2 class="text-2xl font-bold mb-6 text-center">
        分宜中学2014届高三1班相册
      </h2>

      <!-- 图片网格 -->
      <div class="image-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div
          v-for="(image, index) in images.filter(media => !isVideo(media.src))"
          :key="index"
          class="image-item overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <img
            :src="image.src"
            :alt="image.alt"
            class="w-full h-64 object-cover cursor-pointer"
            @click="openLightbox(getImageIndex(index))"
          >
        </div>
      </div>

      <!-- 视频播放区域 -->
      <div class="video-section mt-10">
        <h3 class="text-xl font-semibold mb-4">
          纪念视频
        </h3>
        <div
          v-for="(video, index) in videos"
          :key="index"
          class="video-container bg-black rounded-lg overflow-hidden mb-6 relative"
          @mouseenter="showControls[index] = true"
          @mouseleave="showControls[index] = false"
        >
          <h4 class="text-white p-2">
            {{ getVideoTitle(video.src) }}
          </h4>
          <video
            :ref="el => setVideoRef(el, index)"
            controls
            class="w-full h-auto"
            :poster="video.poster"
            @play="onVideoPlay(index)"
            @pause="onVideoPause(index)"
            @ended="onVideoEnd(index)"
            @timeupdate="onTimeUpdate(index)"
          >
            <source
              :src="video.src"
              type="video/mp4"
            >
            您的浏览器不支持视频播放。
          </video>
          <!-- 自定义播放按钮 -->
          <div
            v-show="shouldShowPlayButton(index)"
            class="custom-play-button absolute inset-0 flex items-center justify-center"
            @click="togglePlay(index)"
          >
            <!-- <div
              class="w-16 h-16 bg-[var(--color-primary)] bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-100 transition"
            >
              <UIcon
                :name="getPlayButtonIcon(index)"
                class="size-5"
              />
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 图片灯箱 -->
    <div
      v-if="lightboxOpen"
      class="lightbox fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      @click="closeLightbox"
    >
      <button
        class="absolute top-4 right-4 text-white text-3xl z-10"
        @click="closeLightbox"
      >
        ×
      </button>
      <img
        :src="images.filter(media => !isVideo(media.src))[currentImageIndex].src"
        :alt="images.filter(media => !isVideo(media.src))[currentImageIndex].alt"
        class="max-w-full max-h-full object-contain"
      >
      <button
        class="absolute left-4 text-white text-3xl z-10"
        @click.stop="prevImage"
      >
        &#8249;
      </button>
      <button
        class="absolute right-4 text-white text-3xl z-10"
        @click.stop="nextImage"
      >
        &#8250;
      </button>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'

// 媒体数据
const images = ref([
  {
    src: '/photo/分宜中学2014届高三1班师生合影留念.jpg',
    alt: '分宜中学2014届高三1班师生合影留念'
  },
  {
    src: '/photo/2013-元旦-合影.JPG',
    alt: '2013-元旦-合影.JPG'
  },
  {
    src: '/photo/2012-12-31-坟墓山.jpg',
    alt: '2012-12-31-坟墓山.jpg'
  },
  {
    src: '/video/2011-元旦-合唱.mp4',
    alt: '2011-元旦-合唱.mp4'
  },
  {
    src: '/video/2012-刀哥-小松-骑马舞.mp4',
    alt: '2012-刀哥-小松-骑马舞.mp4'
  },
  {
    src: '/video/2013-刀哥-狐狸叫.mp4',
    alt: '2013-刀哥-狐狸叫.mp4'
  }
])

// 视频引用和状态管理
const videoRefs = ref<HTMLVideoElement[]>([])
const playingStates = ref<boolean[]>([])
const showControls = ref<boolean[]>([])
const hideTimeouts = ref<NodeJS.Timeout[]>([])
const videoEnded = ref<boolean[]>([])
const lastTimeUpdate = ref<number[]>([])

// 过滤出视频文件
const videos = computed(() => {
  return images.value.filter(media => isVideo(media.src))
})

// 判断是否为视频文件
const isVideo = (src: string) => {
  return src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.avi')
}

// 获取视频标题
const getVideoTitle = (src: string) => {
  const fileName = src.split('/').pop() || ''
  return fileName.replace(/\.[^/.]+$/, '') // 移除扩展名
}

// 设置视频引用
const setVideoRef = (el: HTMLVideoElement | null, index: number) => {
  if (el) {
    videoRefs.value[index] = el
    playingStates.value[index] = false
    showControls.value[index] = true
    videoEnded.value[index] = false
    lastTimeUpdate.value[index] = Date.now()
  }
}

// 视频播放事件处理
const onVideoPlay = (index: number) => {
  playingStates.value[index] = true
  videoEnded.value[index] = false
  startHideTimer(index)
}

// 视频暂停事件处理
const onVideoPause = (index: number) => {
  playingStates.value[index] = false
  clearHideTimer(index)
}

// 视频结束事件处理
const onVideoEnd = (index: number) => {
  playingStates.value[index] = false
  videoEnded.value[index] = true
  showControls.value[index] = true
}

// 视频时间更新事件
const onTimeUpdate = (index: number) => {
  // 更新最后更新时间
  lastTimeUpdate.value[index] = Date.now()
  
  // 如果正在播放且控制按钮已显示，则重新开始隐藏计时
  if (playingStates.value[index] && showControls.value[index]) {
    startHideTimer(index)
  }
}

// 开始隐藏按钮计时器
const startHideTimer = (index: number) => {
  clearHideTimer(index)
  hideTimeouts.value[index] = setTimeout(() => {
    showControls.value[index] = false
  }, 2000) // 2秒后隐藏
}

// 清除隐藏计时器
const clearHideTimer = (index: number) => {
  if (hideTimeouts.value[index]) {
    clearTimeout(hideTimeouts.value[index])
    hideTimeouts.value[index] = undefined
  }
}

// 切换播放状态
const togglePlay = (index: number) => {
  const video = videoRefs.value[index]
  if (video) {
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }
}

// 判断是否应该显示播放按钮
const shouldShowPlayButton = (index: number) => {
  // 如果视频结束，始终显示按钮
  if (videoEnded.value[index]) {
    return true
  }
  
  // 如果鼠标悬停在视频上，显示按钮
  if (showControls.value[index]) {
    return true
  }
  
  // 如果视频正在播放但按钮未隐藏，显示按钮
  if (playingStates.value[index]) {
    // 检查是否在最近有更新（防止在某些情况下按钮不消失）
    const timeSinceLastUpdate = Date.now() - lastTimeUpdate.value[index]
    return timeSinceLastUpdate < 2500 // 给一些缓冲时间
  }
  
  // 默认情况下（暂停状态），显示按钮
  return !playingStates.value[index]
}

// 获取播放按钮图标
const getPlayButtonIcon = (index: number) => {
  if (videoEnded.value[index]) {
    return 'i-lucide-rotate-cw' // 重播图标
  }
  return playingStates.value[index] ? 'i-lucide-pause' : 'i-lucide-play'
}

// 获取图片在图片数组中的索引
const getImageIndex = (index: number) => {
  // 计算在纯图片数组中的位置
  let imageCount = 0
  for (let i = 0; i < images.value.length; i++) {
    if (!isVideo(images.value[i].src)) {
      if (imageCount === index) {
        return i
      }
      imageCount++
    }
  }
  return 0
}

// 灯箱相关状态
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

// 打开灯箱
const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭灯箱
const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = 'auto'
}

// 上一张图片
const prevImage = () => {
  const imageCount = images.value.filter(media => !isVideo(media.src)).length
  currentImageIndex.value = (currentImageIndex.value - 1 + imageCount) % imageCount
}

// 下一张图片
const nextImage = () => {
  const imageCount = images.value.filter(media => !isVideo(media.src)).length
  currentImageIndex.value = (currentImageIndex.value + 1) % imageCount
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return

  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  // 清理所有计时器
  hideTimeouts.value.forEach(timeout => {
    if (timeout) clearTimeout(timeout)
  })
})
</script>

<style scoped>
.image-grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.lightbox {
  backdrop-filter: blur(5px);
}

.video-container {
  aspect-ratio: 16/9;
}

.custom-play-button {
  background: rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;
}

.custom-play-button:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>