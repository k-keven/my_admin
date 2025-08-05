<template>
  <div class="chart-container" :style="{ height }">
    <div ref="chartRef" class="chart"></div>
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <div>加载中...</div>
    </div>
    <div v-if="error" class="chart-error">
      <i class="iconfont icon-warning"></i>
      <div>{{ error }}</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { 
  GridComponent,
  TooltipComponent, 
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
])

export default {
  name: 'LineChartComponent',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    height: {
      type: String,
      default: '300px'
    },
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    smooth: {
      type: Boolean,
      default: false
    },
    area: {
      type: Boolean,
      default: false
    },
    showDataZoom: {
      type: Boolean,
      default: false
    },
    showMarkLine: {
      type: Boolean,
      default: false
    },
    showMarkPoint: {
      type: Boolean,
      default: false
    },
    yAxis: {
      type: Object,
      default: () => ({})
    },
    xAxis: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    smooth() {
      this.renderChart()
    },
    area() {
      this.renderChart()
    },
    showDataZoom() {
      this.renderChart()
    },
    showMarkLine() {
      this.renderChart()
    },
    showMarkPoint() {
      this.renderChart()
    },
    yAxis: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    xAxis: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.renderChart()
    },
    renderChart() {
      if (!this.chart || !this.chartData) return

      const option = {
        title: {
          text: this.title,
          left: 'center',
          show: !!this.title
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: this.chartData.series?.map(item => item.name) || [],
          bottom: 0
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataView: { show: true, readOnly: true },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: this.showDataZoom ? '15%' : '10%',
          top: this.title ? '8%' : '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.chartData.xAxis || [],
          ...this.xAxis
        },
        yAxis: {
          type: 'value',
          ...this.yAxis
        },
        series: this.chartData.series?.map((series, index) => ({
          name: series.name,
          type: 'line',
          stack: series.stack || '',
          smooth: this.smooth,
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: series.color || this.getDefaultColor(index),
            borderWidth: 1
          },
          lineStyle: {
            width: 2
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 3
            }
          },
          areaStyle: this.area ? {
            opacity: 0.3
          } : null,
          data: series.data || [],
          markPoint: this.showMarkPoint ? {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          } : null,
          markLine: this.showMarkLine ? {
            data: [
              { type: 'average', name: '平均值' }
            ]
          } : null
        })) || [],
        dataZoom: this.showDataZoom ? [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ] : []
      }

      this.chart.setOption(option)
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    getDefaultColor(index) {
      const colorList = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
      ]
      return colorList[index % colorList.length]
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-loading, .chart-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  color: #666;
  font-size: 14px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 