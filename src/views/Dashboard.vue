<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">📊 数据看板</h1>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalNotes }}</div>
          <div class="stat-label">笔记总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📁</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalCategories }}</div>
          <div class="stat-label">分类数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">🏷️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTags }}</div>
          <div class="stat-label">标签数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">📌</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.topNotes }}</div>
          <div class="stat-label">置顶笔记</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">各分类笔记占比</h3>
        <div ref="categoryPieRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">月度新增笔记曲线</h3>
        <div ref="monthLineRef" class="chart-container"></div>
      </div>

      <div class="chart-card full-width">
        <h3 class="chart-title">标签使用频次</h3>
        <div ref="tagBarRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()

const categoryPieRef = ref(null)
const monthLineRef = ref(null)
const tagBarRef = ref(null)

let categoryPieChart = null
let monthLineChart = null
let tagBarChart = null

const isDark = computed(() => noteStore.settings.theme === 'dark')

const chartColors = computed(() => ({
  text: isDark.value ? '#C9CDD4' : '#1D2129',
  secondary: isDark.value ? '#86909C' : '#86909C',
  border: isDark.value ? '#323842' : '#E5E6EB',
  bg: isDark.value ? '#1D2129' : '#FFFFFF',
  tooltipBg: isDark.value ? '#2A2F3A' : 'rgba(255,255,255,0.95)'
}))

const stats = computed(() => ({
  totalNotes: noteStore.notes.length,
  totalCategories: noteStore.categories.length,
  totalTags: noteStore.tags.length,
  topNotes: noteStore.topNotes.length
}))

const categoryData = computed(() => {
  const counts = {}
  noteStore.notes.forEach(note => {
    counts[note.category] = (counts[note.category] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    itemStyle: {
      color: noteStore.categories.find(c => c.name === name)?.color || '#1677FF'
    }
  }))
})

const monthData = computed(() => {
  const months = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months[key] = 0
  }
  
  noteStore.notes.forEach(note => {
    const date = new Date(note.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (months[key] !== undefined) {
      months[key]++
    }
  })
  
  return {
    months: Object.keys(months).map(m => m.slice(5)),
    counts: Object.values(months)
  }
})

const tagData = computed(() => {
  const counts = {}
  noteStore.notes.forEach(note => {
    note.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))
})

function initCategoryPie() {
  if (!categoryPieRef.value) return
  categoryPieChart = echarts.init(categoryPieRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: chartColors.value.tooltipBg,
      textStyle: {
        color: chartColors.value.text
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: chartColors.value.secondary
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: chartColors.value.bg,
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: chartColors.value.text
          }
        },
        labelLine: {
          show: false
        },
        data: categoryData.value
      }
    ]
  }
  categoryPieChart.setOption(option)
}

function initMonthLine() {
  if (!monthLineRef.value) return
  monthLineChart = echarts.init(monthLineRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.value.tooltipBg,
      textStyle: {
        color: chartColors.value.text
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: monthData.value.months,
      axisLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      },
      axisLabel: {
        color: chartColors.value.secondary
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: chartColors.value.secondary
      },
      splitLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      }
    },
    series: [
      {
        name: '新增笔记',
        type: 'line',
        smooth: true,
        data: monthData.value.counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(32, 189, 153, 0.3)' },
            { offset: 1, color: 'rgba(32, 189, 153, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#20BD99',
          width: 3
        },
        itemStyle: {
          color: '#20BD99'
        }
      }
    ]
  }
  monthLineChart.setOption(option)
}

function initTagBar() {
  if (!tagBarRef.value) return
  tagBarChart = echarts.init(tagBarRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: chartColors.value.tooltipBg,
      textStyle: {
        color: chartColors.value.text
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: tagData.value.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      },
      axisLabel: {
        color: chartColors.value.secondary,
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: chartColors.value.secondary
      },
      splitLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: tagData.value.map(item => ({
          value: item.value,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4DD0AB' },
              { offset: 1, color: '#20BD99' }
            ])
          }
        })),
        barWidth: '50%'
      }
    ]
  }
  tagBarChart.setOption(option)
}

function handleResize() {
  categoryPieChart?.resize()
  monthLineChart?.resize()
  tagBarChart?.resize()
}

onMounted(() => {
  initCategoryPie()
  initMonthLine()
  initTagBar()
  window.addEventListener('resize', handleResize)
})

watch([() => noteStore.notes.length, isDark], () => {
  initCategoryPie()
  initMonthLine()
  initTagBar()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: rgba(32, 189, 153, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.blue {
  background: rgba(32, 189, 153, 0.1);
}

.stat-icon.green {
  background: rgba(76, 175, 80, 0.1);
}

.stat-icon.orange {
  background: rgba(255, 183, 77, 0.1);
}

.stat-icon.purple {
  background: rgba(116, 130, 137, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.chart-container {
  height: 300px;
}

.chart-card.full-width .chart-container {
  height: 350px;
}
</style>
