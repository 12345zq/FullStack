<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import ThreeModel from './ThreeModel.vue'

const listData = ref(null)
const loading = ref(false)
const error = ref(null)
const modelList = ref([])
const modelLoading = ref(true)
const modelError = ref(null)

// 性能信息
const performanceInfo = reactive({
  memory: 'N/A',
  navigation: 'N/A',
  fps: 0,
  renderTime: 0
})

// 服务器时间
const serverTime = ref('')
let ws = null

// 帧率计算
let frameCount = 0
let lastTime = performance.now()
let fps = 0

const fetchList = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:3000/getList?type=test')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    listData.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchModelList = async () => {
  modelLoading.value = true
  modelError.value = null
  try {
    const response = await fetch('http://localhost:3000/getModelList')
    if (!response.ok) {
      throw new Error('Failed to fetch model list')
    }
    const data = await response.json()
    modelList.value = data.data
  } catch (err) {
    console.error('Error fetching model list:', err)
    modelError.value = '未获取到3d模型列表'
  } finally {
    modelLoading.value = false
  }
}

const updatePerformanceInfo = () => {
  // 内存使用信息
  if (performance.memory) {
    const memory = performance.memory
    const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
    const total = (memory.totalJSHeapSize / 1024 / 1024).toFixed(1)
    performanceInfo.memory = `${used} MB / ${total} MB`
  }

  // 导航耗时信息
  if (performance.timing) {
    const timing = performance.timing
    const loadTime = (timing.loadEventEnd - timing.navigationStart).toFixed(0)
    performanceInfo.navigation = `${loadTime} ms`
  }

  // 更新帧率
  performanceInfo.fps = fps
}

// 连接 WebSocket
const connectWebSocket = () => {
  try {
    ws = new WebSocket('ws://localhost:3000')
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        serverTime.value = data.time
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  } catch (err) {
    console.error('Error connecting to WebSocket:', err)
  }
}

// 帧率计算
const animate = () => {
  frameCount++
  const currentTime = performance.now()
  if (currentTime - lastTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastTime = currentTime
    updatePerformanceInfo()
  }
  requestAnimationFrame(animate)
}

onMounted(() => {
  fetchModelList()
  connectWebSocket()
  animate()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<template>
  <section id="center">

    <button class="counter" @click="fetchList" :disabled="loading">
      {{ loading ? 'Loading...' : 'Get List Data' }}
    </button>
    
    <h2>3D Model</h2>
    <div v-if="modelLoading">加载模型列表中...</div>
    <div v-else-if="modelError">{{ modelError }}</div>
    <ThreeModel v-else-if="modelList.length > 0" :modelList="modelList" />
    <div v-else>暂无模型数据</div>
    
    <!-- 性能信息面板 -->
    <div class="panel" style="margin-top: 20px;">
      <h4>性能信息</h4>

      <div class="group">
        <label>内存使用</label>
        <div class="info">{{ performanceInfo.memory }}</div>
      </div>

      <div class="group">
        <label>导航耗时</label>
        <div class="info">{{ performanceInfo.navigation }}</div>
      </div>

      <div class="group">
        <label>帧率</label>
        <div class="info">{{ performanceInfo.fps }} FPS</div>
      </div>

      <div class="group">
        <label>服务器时间</label>
        <div class="info">{{ serverTime }}</div>
      </div>
    </div>
  </section>
  <section id="list-data" v-if="listData">
    <h2>List Data</h2>
    <p>Type: {{ listData.type }}</p>
    <ul>
      <li v-for="item in listData.data" :key="item.id">
        <div>ID: {{ item.id }}</div>
        <div>Name: {{ item.name }}</div>
        <div>Type: {{ item.type }}</div>
        <div>Value: {{ item.value.toFixed(2) }}</div>
        <div>Active: {{ item.isActive ? 'Yes' : 'No' }}</div>
        <div>Image: <img :src="item.imageUrl" alt="Item image" width="100" /></div>
        <div>Description: {{ item.description }}</div>
        <div>Created At: {{ new Date(item.createdAt).toLocaleString() }}</div>
        <hr />
      </li>
    </ul>
  </section>

  <section id="error" v-if="error">
    <h2>Error</h2>
    <p>{{ error }}</p>
  </section>
</template>

<style scoped>
.panel {
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.group {
  margin-bottom: 10px;
}
.info {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}
</style>
