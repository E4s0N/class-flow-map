<script setup lang="ts">
import * as echarts from 'echarts/core'
import chinaJson from '@/assets/json/mapWithoutHainanIsLands.json'
import provincePeopleData from '@/assets/json/provincePeopleData.json'

const points = ref([
  // 散点图数据
  {
    name: '分宜中学',
    value: [114.68482, 27.806033],
    itemStyle: { color: '#00EEFF' }
  } // 分宜中学
])

const provinceCenterMap = ref<Record<string, [number, number]>>({})
// 构建省名 -> 中心坐标的映射表
provinceCenterMap.value = chinaJson.features.reduce((acc: any, feature: any) => {
  acc[feature.properties.name] = feature.properties.center
  return acc
}, {})

const workRoutes = [
  { from: '分宜中学', to: '北京市' },
  { from: '分宜中学', to: '福建省' },
  { from: '分宜中学', to: '湖南省' },
  { from: '分宜中学', to: '上海市' },
  { from: '分宜中学', to: '广东省' },
  { from: '分宜中学', to: '黑龙江省' },
  { from: '分宜中学', to: '浙江省' },
  { from: '分宜中学', to: '海南省' },
  { from: '分宜中学', to: '江苏省' },
  { from: '分宜中学', to: '江西省' }
]

const linesData = computed(() => {
  return workRoutes.map((route) => {
    const fromCoord = [114.68482, 27.806033] // 分宜中学坐标
    const toCoord = provinceCenterMap.value[route.to]

    return {
      coords: [fromCoord, toCoord]
    }
  })
})

const highlightedProvinces = computed(() => {
  return linesData.value.map(item => ({
    name: item.coords[1], // 获取目标省份名称
    value: 100 // 高亮用，值可忽略
  }))
})

const planePath // 飞机svg
  = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'

echarts.registerMap('China', chinaJson as any)

function groupByWork(people) {
  return people.reduce((acc, person) => {
    const key = person.work
    if (!acc[key]) acc[key] = []
    acc[key].push(person)
    return acc
  }, {})
}
function getTooltipContent(params: any) {
  // 参数保护
  if (!params || !params.seriesType || params.seriesType !== 'map' || !params.name) {
    return ''
  }

  const provinceData = provincePeopleData.find(p => p.name === params.name)
  if (provinceData?.people?.length) {
    const groupedPeople = groupByWork(provinceData.people)

    const cityList = Object.entries(groupedPeople)
      .map(([city, people]) => {
        const peopleHtml = (people as any[]).map(
          person => `
            <div style="display:flex;align-items:center;margin:4px 0;padding-left: 2px;">
              <img src="${person.avatar}" style="width:28px;height:28px;border-radius:50%;margin-right:4px;" />
              <span>${person.name}</span>
            </div>`
        ).join('')

        return `
          <div style="margin-bottom: 10px; border-left: 2px solid #93EBF8; padding-left: 2px;">
            <div style="text-align: left; font-weight:bold;color:#00EEFF;margin-bottom:4px;">📍 ${city}</div>
            <div style="padding-left: 2px;">${peopleHtml}</div>
          </div>`
      })
      .join('')

    return `
      <div style="padding:12px 16px;background:#0F1B2C;color:#fff;border:1px solid #5089EC;box-shadow:0 2px 10px rgba(0,0,0,0.3);border-radius:6px;">
        <div style="font-size:16px;font-weight:bold;margin-bottom:10px;">${params.name}</div>
        ${cityList}
      </div>`
  }
  return params.name || '未知省份'
}

const chartRef = ref()
const showLabel = ref(false)
onMounted(() => {
  showLabel.value = window.innerWidth >= 768
  const chart = chartRef.value
  chart.setOption(option.value)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  const newShowLabel = window.innerWidth >= 768
  if (newShowLabel !== showLabel.value) {
    showLabel.value = newShowLabel
  }
  if (chartRef.value) {
    chartRef.value.resize()
  }
}
watch(
  () => showLabel.value,
  () => {
    if (chartRef.value) {
      chartRef.value.setOption({
        geo: {
          label: {
            show: showLabel.value
          }
        }
      })
    }
  }
)

const option = computed(() => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return {
    tooltip: {
      trigger: 'item',
      padding: 0,
      formatter: getTooltipContent
    },
    geo: {
      map: 'China',
      type: 'map',
      roam: false,
      label: { show: showLabel.value, color: '#fff' },
      itemStyle: {
        borderColor: '#5089EC',
        borderWidth: 1,
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [
            { offset: 0, color: 'rgba(0, 102, 154, 0)' },
            { offset: 1, color: 'rgba(0, 102, 154, .4)' }
          ]
        }
      },
      zoom: isMobile ? 2.5 : 1, // 移动端放大3倍
      center: isMobile ? [115, 34] : [110, 34] // 可调整中心点，默认显示右侧
    },
    // dataZoom: isMobile
    //   ? [
    //       {
    //         type: 'slider',
    //         start: 70,
    //         end: 100,
    //         xAxisIndex: 0,
    //         filterMode: 'none',
    //         height: 10,
    //         bottom: 0
    //       }
    //     ]
    //   : [],
    series: [
      {
        type: 'map',
        map: 'China',
        label: {
          show: true,
          color: '#fff',
          formatter: (params) => {
            // 只在小屏时生效
            if (window.innerWidth < 768) {
              const isHighlighted = workRoutes.some(route => route.to === params.name)
              return isHighlighted ? params.name : ''
            }
            // 非小屏时正常显示所有 label
            return params.name
          }
        },
        itemStyle: { areaColor: 'transparent' },
        zoom: isMobile ? 2.5 : 1, // 移动端放大3倍
        center: isMobile ? [115, 34] : [110, 34], // 可调整中心点，默认显示右侧
        emphasis: {
          itemStyle: { areaColor: '#00C16A', borderWidth: 0 },
          label: { show: true, color: '#fff' }
        },
        data: provincePeopleData.map((p) => {
          const isHighlighted = workRoutes.some(route => route.to === p.name)
          return {
            name: p.name,
            value: p.people.length,
            itemStyle: isHighlighted
              ? {
                  areaColor: '#2441AE',
                  borderColor: '#4B24AE',
                  borderWidth: 2
                }
              : {}
          }
        })
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        effectType: 'ripple',
        showEffectOn: 'render',
        rippleEffect: { period: 10, scale: 4, brushType: 'fill' },
        zlevel: 1,
        data: points.value
      },
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        symbol: ['none', 'arrow'],
        symbolSize: 10,
        effect: {
          show: true,
          period: 6,
          trailLength: 0,
          symbol: planePath,
          symbolSize: 15
        },
        lineStyle: {
          color: '#93EBF8',
          width: 2.5,
          opacity: 0.6,
          curveness: 0.2
        },
        data: linesData.value
      }
    ]
  }
})
</script>

<template>
  <div class="w-96 h-180 md:w-256 md:h-180 mx-auto">
    <VChart
      ref="chartRef"
      :option="option"
    />
  </div>
</template>
