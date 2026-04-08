<template>
  <div class="three-model-container">
    <div class="toolbar">
      <a-select v-model:value="selectedModel" @change="loadSelectedModel" placeholder="选择模型" style="width: 120px; margin-right: 10px;">
        <a-select-option v-for="model in props.modelList" :key="model.value" :value="model.value">
          {{ model.label }}
        </a-select-option>
      </a-select>

      <button @click="resetModel">重置</button>
    </div>



    <div ref="container" class="model-container"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

const props = defineProps({
  modelList: {
    type: Array,
    default: () => []
  }
})

const container = ref(null)
let scene, camera, renderer, animationId
let controls, transformControls

const models = ref({})
const cache = {}
const loader = new GLTFLoader()

let activeModel = null
const selectedModel = ref('')
let currentLoadingPath = null

// 性能信息
const performanceInfo = reactive({
  memory: 'N/A',
  navigation: 'N/A',
  fps: 0,
  renderTime: 0
})

// 帧率计算
let frameCount = 0
let lastTime = performance.now()
let fps = 0



// ⭐ 面板状态
const transform = reactive({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
})

function applyState(obj, state) {
  obj.position.set(state.position.x, state.position.y, state.position.z)
  obj.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z)
  obj.scale.set(state.scale.x, state.scale.y, state.scale.z)
  syncPanel()
}

// 重置模型到初始状态
function resetModel() {
  if (!activeModel) return
  
  // 重置模型位置、旋转、缩放
  activeModel.position.set(0, 0, 0)
  activeModel.rotation.set(0, 0, 0)
  activeModel.scale.set(1, 1, 1)
  
  // 重置相机位置
  camera.position.set(0, 2, 5)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
  
  // 同步到面板
  syncPanel()
}

onMounted(() => {
  initThree()
  animate()
  window.addEventListener('resize', handleResize)

  if (props.modelList.length > 0) {
    // 默认选中第一个模型
    selectedModel.value = props.modelList[0].value
    loadSelectedModel()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationId)
  renderer.dispose()
})

function initThree() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f8ff) // 浅蓝色背景

  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.position.set(0, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)

  transformControls = new TransformControls(camera, renderer.domElement)

  if (transformControls && transformControls.isObject3D) {
    transformControls.addEventListener('objectChange', syncPanel)
    scene.add(transformControls)
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 5, 5)
  scene.add(light)
}

function onTransformChange() {
  if (!activeModel) return

  applyState(activeModel, transform)
}

// 点击选中
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect()

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(Object.values(models.value), true)

  if (intersects.length > 0) {
    let obj = intersects[0].object
    while (obj.parent && !Object.values(models.value).includes(obj)) {
      obj = obj.parent
    }

    activeModel = obj
    transformControls.attach(activeModel)
    syncPanel()
  }
}

function syncPanel() {
  if (!activeModel) return

  transform.position.x = activeModel.position.x
  transform.position.y = activeModel.position.y
  transform.position.z = activeModel.position.z

  transform.rotation.x = activeModel.rotation.x
  transform.rotation.y = activeModel.rotation.y
  transform.rotation.z = activeModel.rotation.z

  transform.scale.x = activeModel.scale.x
  transform.scale.y = activeModel.scale.y
  transform.scale.z = activeModel.scale.z
}

function updatePerformanceInfo() {
  // 内存使用信息
  if (performance.memory) {
    const memory = performance.memory
    const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
    const total = (memory.totalJSHeapSize / 1024 / 1024).toFixed(1)
    const limit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
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

function animate() {
  const startTime = performance.now()
  
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  
  // 计算渲染时间
  const endTime = performance.now()
  performanceInfo.renderTime = (endTime - startTime).toFixed(2)
  
  // 计算帧率
  frameCount++
  const currentTime = performance.now()
  if (currentTime - lastTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastTime = currentTime
    updatePerformanceInfo()
  }
}

function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  const maxSize = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxSize / (2 * Math.tan(fov / 2)));
  
  cameraZ *= 1.5; // 增加一些间距
  
  camera.position.x = center.x;
  camera.position.y = center.y + size.y * 0.5;
  camera.position.z = center.z + cameraZ;
  
  camera.lookAt(center);
  
  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

function switchModel(newModel, name) {
  // 1️⃣ 移除旧模型（如果你是单模型模式）
  if (activeModel) {
    scene.remove(activeModel);

    // ❗ 释放资源（避免内存泄漏）
    activeModel.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }

  // 2️⃣ 添加新模型
  scene.add(newModel);

  // 3️⃣ 更新状态
  models.value[name] = newModel;
  activeModel = newModel;

  // 4️⃣ 重新绑定控制器
  transformControls.detach();
  transformControls.attach(newModel);

  // 5️⃣ 相机自适应（建议加）
  fitCameraToObject(camera, newModel, controls);

  // 6️⃣ UI同步
  syncPanel();
}
function loadModel(path, name) {
  currentLoadingPath = path;

  // ✅ 1. 优先走缓存
  if (cache[path]) {
    const model = cache[path].scene.clone(true); // 深拷贝
    switchModel(model, name);
    return;
  }

  // ✅ 2. 加载新模型
  loader.load(
    path,
    (gltf) => {
      // ❗ 防止异步加载错乱
      if (currentLoadingPath !== path) return;

      // ✅ 存缓存（只存原始 gltf，不直接用）
      cache[path] = gltf;

      const model = gltf.scene.clone(true); // ❗ 一律用 clone
      switchModel(model, name);
    },
    undefined,
    (err) => {
      console.error('模型加载失败:', path, err);
    }
  );
}
function loadSelectedModel() {
  if (!selectedModel.value) return
  
  // 清除当前模型
  if (activeModel) {
    scene.remove(activeModel)
  }
  activeModel = null
  transformControls.detach()
  currentLoadingPath = null
  
  // 加载新模型
  loadModel(selectedModel.value, 'selected')
}

function handleResize() {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}
</script>

<style scoped>
.three-model-container {
  width: 100%;
  box-sizing: border-box;
}
.model-container { 
  height: 800px; 
  width: 100%;
  box-sizing: border-box;
}
.toolbar { margin-bottom: 10px; }
.panel {
  position: absolute;
  right: 10px;
  top: 10px;
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  z-index: 10;
}
.group { margin-bottom: 10px; }
.info { margin-top: 5px; font-size: 14px; color: #666; }
button { margin-right: 5px; }
</style>
