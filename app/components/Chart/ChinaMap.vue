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
        // 修改为一行两个显示
        const peopleArray = people as any[];
        let peopleHtml = '<div style="display: flex; flex-wrap: wrap; gap: 4px;">';
        
        for (let i = 0; i < peopleArray.length; i += 2) {
          peopleHtml += '<div style="width: 100%; display: flex; gap: 4px;">';
          
          // 第一个元素
          peopleHtml += `
            <div style="display: flex; align-items: center; padding: 2px 4px; border-radius: 4px; background: rgba(147, 235, 248, 0.1); ${i + 1 < peopleArray.length || peopleArray.length > 1 ? 'width: calc(50% - 2px)' : 'width: 100%'}">
              <img src="${peopleArray[i].avatar}" style="width:26px;height:26px;border-radius:50%;margin-right:6px;flex-shrink: 0; border: 1px solid rgba(147, 235, 248, 0.3);" />
              <span style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${peopleArray[i].name}</span>
            </div>`;
          
          // 第二个元素（如果存在）
          if (i + 1 < peopleArray.length) {
            peopleHtml += `
              <div style="display: flex; align-items: center; padding: 2px 4px; border-radius: 4px; background: rgba(147, 235, 248, 0.1); width: calc(50% - 2px)">
                <img src="${peopleArray[i + 1].avatar}" style="width:26px;height:26px;border-radius:50%;margin-right:6px;flex-shrink: 0; border: 1px solid rgba(147, 235, 248, 0.3);" />
                <span style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${peopleArray[i + 1].name}</span>
              </div>`;
          } else if (peopleArray.length > 1) {
            // 大于1个人且为单数时，第二个位置添加空元素占位，保持布局一致
            peopleHtml += '<div style="width: calc(50% - 2px)"></div>';
          }
          
          peopleHtml += '</div>';
        }
        peopleHtml += '</div>';

        return `
          <div style="margin-bottom: 8px; padding-left: 2px;">
            <div style="text-align: left; font-weight:bold;color:#00EEFF;margin-bottom:6px;font-size:13px;display: flex; align-items: center;">
              <span style="margin-right: 4px;">📍</span>
              <span>${city}</span>
              <span style="margin-left: 6px; font-size: 11px; background: rgba(0, 238, 255, 0.2); padding: 1px 6px; border-radius: 8px;">${peopleArray.length}人</span>
            </div>
            <div style="padding-left: 2px; position: relative; margin-bottom: 8px;">
              <div style="position: absolute; bottom: -4px; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, #93EBF8, transparent);"></div>
              ${peopleHtml}
            </div>
          </div>`
      })
      .join('')

    return `
      <div style="padding:10px 14px;background: linear-gradient(135deg, #0F1B2C, #1a2a4a);color:#fff;border:1px solid #5089EC;box-shadow:0 4px 12px rgba(0,0,0,0.4);border-radius:8px;max-width: 240px; backdrop-filter: blur(4px);">
        <div style="font-size:15px;font-weight:bold;margin-bottom:8px; color: #93EBF8; display: flex; justify-content: space-between; align-items: center;">
          <span>${params.name}</span>
          <span style="font-size: 12px; background: rgba(80, 137, 236, 0.3); padding: 2px 8px; border-radius: 10px;">
            共${provinceData.people.length}人
          </span>
        </div>
        <div style=" padding-right: 2px;">
          ${cityList}
        </div>
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

// 添加移动端 tooltip 位置计算函数
function mobileTooltipPosition(point, params, dom, rect, size) {
  // size 包含了视图尺寸 { contentSize: [width, height], viewSize: [width, height] }
  const x = point[0]
  const y = point[1]
  const viewWidth = size.viewSize[0]
  const viewHeight = size.viewSize[1]
  const tooltipWidth = size.contentSize[0]
  const tooltipHeight = size.contentSize[1]

  // 计算 tooltip 的理想位置
  let posX = x + 10
  let posY = y - tooltipHeight - 10

  // 防止右侧溢出
  if (posX + tooltipWidth > viewWidth) {
    posX = viewWidth - tooltipWidth - 5
  }

  // 防止左侧溢出
  if (posX < 5) {
    posX = 5
  }

  // 防止顶部溢出
  if (posY < 5) {
    posY = y + 10
  }

  // 防止底部溢出
  if (posY + tooltipHeight > viewHeight) {
    posY = viewHeight - tooltipHeight - 5
  }

  return [posX, posY]
}

const option = computed(() => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return {
    tooltip: {
      trigger: 'item',
      padding: 0,
      formatter: getTooltipContent,
      confine: true, // 限制 tooltip 在图表区域内
      position: isMobile ? mobileTooltipPosition : undefined
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
