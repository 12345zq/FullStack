<script setup>
import { ref } from 'vue'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import vueLogo from '../assets/vue.svg'

const count = ref(0)
const listData = ref(null)
const loading = ref(false)
const error = ref(null)

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
</script>

<template>
  <section id="center">
    <div class="hero">
      <img :src="heroImg" class="base" width="170" height="179" alt="" />
      <img :src="vueLogo" class="framework" alt="Vue logo" />
      <img :src="viteLogo" class="vite" alt="Vite logo" />
    </div>
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/App.vue</code> and save to test <code>HMR</code></p>
    </div>
    <button class="counter" @click="count++">Count is {{ count }}</button>
    <button class="counter" @click="fetchList" :disabled="loading">
      {{ loading ? 'Loading...' : 'Get List Data' }}
    </button>
    
    <h2>3D Model</h2>
    <ThreeModel />
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

  <div class="ticks"></div>

  <section id="next-steps">
    <div id="docs">
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#documentation-icon"></use>
      </svg>
      <h2>Documentation</h2>
      <p>Your questions, answered</p>
      <ul>
        <li>
          <a href="https://vite.dev/" target="_blank">
            <img class="logo" :src="viteLogo" alt="" />
            Explore Vite
          </a>
        </li>
        <li>
          <a href="https://vuejs.org/" target="_blank">
            <img class="button-icon" :src="vueLogo" alt="" />
            Learn more
          </a>
        </li>
      </ul>
    </div>
    <div id="social">
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#social-icon"></use>
      </svg>
      <h2>Connect with us</h2>
      <p>Join the Vite community</p>
      <ul>
        <li>
          <a href="https://github.com/vitejs/vite" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
            GitHub
          </a>
        </li>
        <li>
          <a href="https://chat.vite.dev/" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#discord-icon"></use>
            </svg>
            Discord
          </a>
        </li>
        <li>
          <a href="https://x.com/vite_js" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#x-icon"></use>
            </svg>
            X.com
          </a>
        </li>
        <li>
          <a href="https://bsky.app/profile/vite.dev" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#bluesky-icon"></use>
            </svg>
            Bluesky
          </a>
        </li>
      </ul>
    </div>
  </section>

  <div class="ticks"></div>
  <section id="spacer"></section>
</template>
