<script setup>
import { ref, onMounted } from 'vue'
import ThreeModel from './ThreeModel.vue'

const listData = ref(null)
const loading = ref(false)
const error = ref(null)
const modelList = ref([])
const modelLoading = ref(true)
const modelError = ref(null)

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

onMounted(() => {
  fetchModelList()
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
