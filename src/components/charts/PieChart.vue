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
import { PieChart } from 'echarts/charts'
import { 
  TooltipComponent, 
  TitleComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  PieChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer
])

export default {
  name: 'PieChartComponent',
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
    doughnut: {
      type: Boolean,
      default: false
    },
    roseType: {
      type: [Boolean, String],
      default: false,
      validator: value => [false, true, 'radius', 'area'].includes(value)
    },
    selectedMode: {
      type: [Boolean, String],
      default: false,
      validator: value => [false, true, 'single', 'multiple'].includes(value)
    },
    showLabel: {
      type: Boolean,
      default: true
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
    doughnut() {
      this.renderChart()
    },
    roseType() {
      this.renderChart()
    },
    selectedMode() {
      this.renderChart()
    },
    showLabel() {
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
      if (!this.chart || !this.chartData || !this.chartData.data) return
      
      const seriesData = this.chartData.data.map((item, index) => ({
        ...item,
        itemStyle: {
          color: item.color || this.getDefaultColor(index)
        }
      }))

      const option = {
        title: {
          text: this.title,
          left: 'center',
          top: 0,
          show: !!this.title
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 0,
          left: 'center',
          data: seriesData.map(item => item.name)
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataView: { show: true, readOnly: true },
            restore: {}
          }
        },
        series: [
          {
            name: this.chartData.name || '数据',
            type: 'pie',
            radius: this.doughnut 
              ? ['40%', '70%'] 
              : this.roseType 
                ? ['20%', '70%']
                : '70%',
            center: ['50%', '45%'],
            roseType: this.roseType === true ? 'radius' : this.roseType || false,
            selectedMode: this.selectedMode,
            itemStyle: {
              borderRadius: 5,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: this.showLabel,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: seriesData
          }
        ]
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