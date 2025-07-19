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
const linesData = ref([
  {
    coords: [
      [114.68482, 27.806033],
      [116.405285, 39.904989]
    ]
  } // 分宜中学->北京
])
const planePath // 飞机svg
  = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'

echarts.registerMap('China', chinaJson as any)

const option = {
  backgroundColor: '#0E2152',
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      if (params.seriesType === 'map') {
        const provinceData = provincePeopleData.find(p => p.name === params.name)
        if (provinceData?.people?.length) {
          const peopleHtml = provinceData.people
            .map(
              person => `
                <div style="display:flex;align-items:center;margin:4px 0;">
                  <img src="${person.avatar}" style="width:30px;height:30px;border-radius:50%;margin-right:8px;" />
                  <span>${person.name}</span>
                </div>`
            )
            .join('')
          return `<div style="padding:8px;background:#fff;color:#000;border:1px solid #ccc;">${params.name}<br/>${peopleHtml}</div>`
        }
        return params.name
      }
      return ''
    }
  },
  geo: {
    map: 'China',
    type: 'map',
    roam: false,
    label: { show: true, color: '#fff' },
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
    emphasis: {
      focus: 'self',
      itemStyle: { areaColor: '#2386AD', borderWidth: 0 },
      label: { show: true, color: '#fff' }
    }
  },
  series: [
    {
      type: 'map',
      map: 'China',
      label: { show: true, color: '#fff' },
      itemStyle: { areaColor: 'transparent' },
      data: provincePeopleData.map(p => ({
        name: p.name,
        value: p.people.length
      }))
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
</script>

<template>
  <div class="h-256 w-256">
    <VChart :option="option" />
  </div>
</template>
