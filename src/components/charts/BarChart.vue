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
import { BarChart } from 'echarts/charts'
import { 
  GridComponent,
  TooltipComponent, 
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer
])

export default {
  name: 'BarChartComponent',
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
    horizontal: {
      type: Boolean,
      default: false
    },
    stacked: {
      type: Boolean,
      default: false
    },
    showDataZoom: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    barWidth: {
      type: String,
      default: null
    },
    borderRadius: {
      type: Number,
      default: 0
    },
    colorBy: {
      type: String,
      default: 'series',
      validator: value => ['series', 'data'].includes(value)
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
    horizontal() {
      this.renderChart()
    },
    stacked() {
      this.renderChart()
    },
    showDataZoom() {
      this.renderChart()
    },
    showLabel() {
      this.renderChart()
    },
    barWidth() {
      this.renderChart()
    },
    borderRadius() {
      this.renderChart()
    },
    colorBy() {
      this.renderChart()
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

      const xAxisType = this.horizontal ? 'value' : 'category'
      const yAxisType = this.horizontal ? 'category' : 'value'
      const xAxisData = this.horizontal ? null : this.chartData.xAxis || []
      const yAxisData = this.horizontal ? this.chartData.xAxis || [] : null

      const option = {
        title: {
          text: this.title,
          left: 'center',
          show: !!this.title
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
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
            magicType: { show: true, type: ['line', 'bar', 'stack'] },
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
          type: xAxisType,
          data: xAxisData
        },
        yAxis: {
          type: yAxisType,
          data: yAxisData
        },
        dataZoom: this.showDataZoom ? [
          {
            type: 'inside',
            start: 0,
            end: 100,
            orient: this.horizontal ? 'vertical' : 'horizontal'
          },
          {
            start: 0,
            end: 100,
            orient: this.horizontal ? 'vertical' : 'horizontal'
          }
        ] : [],
        series: this.chartData.series?.map((series, index) => ({
          name: series.name,
          type: 'bar',
          stack: this.stacked ? 'total' : null,
          barWidth: this.barWidth,
          emphasis: {
            focus: 'series'
          },
          colorBy: this.colorBy,
          itemStyle: {
            color: series.color || this.getDefaultColor(index),
            borderRadius: this.borderRadius
          },
          label: {
            show: this.showLabel,
            position: this.horizontal ? 'right' : 'top',
            formatter: '{c}'
          },
          data: series.data || []
        })) || []
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