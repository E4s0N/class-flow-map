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
          class="bg-[var(--ui-bg)] rounded-lg overflow-hidden mb-6"
        >
          <h4 class="p-2">
            {{ getVideoTitle(video.src) }}
          </h4>
          <div class="flex justify-center items-center aspect-video">
            <video-player
              class="w-full h-full object-contain"
              :src="video.src"
              controls
              :loop="true"
              :volume="0.4"
            />
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
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

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
    src: '/photo/班服.jpg',
    alt: '班服.jpg'
  },
  {
    src: '/photo/班徽.jpeg',
    alt: '班徽.jpeg'
  },
  {
    src: 'https://niceimg.com/oss/video/2011-元旦-合唱.mp4',
    alt: '2011-元旦-合唱.mp4'
  },
  {
    src: 'https://niceimg.com/oss/video/2012-刀哥-小松-骑马舞.mp4',
    alt: '2012-刀哥-小松-骑马舞.mp4'
  },
  {
    src: 'https://niceimg.com/oss/video/2012-刀哥-小松-骑马舞2.mp4',
    alt: '2012-刀哥-小松-骑马舞2.mp4'
  },
  {
    src: 'https://niceimg.com/oss/video/2013-%E5%88%80%E5%93%A5-%E7%8B%90%E7%8B%B8%E5%8F%AB.mp4',
    alt: '2013-刀哥-狐狸叫.mp4'
  }
])

// 分离视频和图片
const videos = computed(() => {
  return images.value.filter(media => isVideo(media.src))
})

// 判断是否为视频文件
const isVideo = (src: string) => {
  return src.includes('.mp4') || src.includes('.mov') || src.includes('.avi') || src.includes('.m3u8')
}

// 获取视频标题
const getVideoTitle = (src: string) => {
  const url = new URL(src)
  const pathname = url.pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1)
  return decodeURIComponent(filename)
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
const hideTimeouts = ref<any[]>([])

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
  hideTimeouts.value.forEach((timeout) => {
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

/* 视频播放器样式覆盖 */
.aspect-video :deep(.video-js) {
  width: 100%;
  height: 100%;
}

.aspect-video :deep(.vjs-tech) {
  object-fit: contain;
}
</style>
