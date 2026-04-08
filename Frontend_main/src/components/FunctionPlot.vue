<template>
  <div class="function-plot-container">
    <h3>函数曲线绘制</h3>
    <div class="controls">
      <input 
        v-model="functionExpression" 
        @input="handleFunctionChange" 
        placeholder="输入函数表达式，如: x*x 或 2*x" 
        class="function-input"
      />
      <span v-if="error" class="error-text">{{ error }}</span>
    </div>
    <canvas ref="canvas" class="plot-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const canvas = ref(null)
let ctx = null
const functionExpression = ref('x*x')
const error = ref(null)
let functionEvaluator = null

function parseFunction(expression) {
  try {
    // 创建一个安全的函数评估器
    functionEvaluator = new Function('x', `return ${expression}`)
    error.value = null
    return true
  } catch (err) {
    error.value = `函数表达式错误: ${err.message}`
    return false
  }
}

function handleFunctionChange() {
  const success = parseFunction(functionExpression.value)
  if (success) {
    drawFunction()
  }
}

function drawFunction() {
  if (!canvas.value || !ctx) return

  const canvasElement = canvas.value
  const width = canvasElement.width
  const height = canvasElement.height
  
  // 清除画布
  ctx.clearRect(0, 0, width, height)
  
  // 绘制坐标轴
  drawAxes()
  
  // 绘制函数曲线 y = 2x
  drawCurve()
}

function drawAxes() {
  if (!ctx) return
  
  const canvasElement = canvas.value
  const width = canvasElement.width
  const height = canvasElement.height
  const centerX = width / 2
  const centerY = height / 2
  
  // 绘制坐标轴
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  
  // X轴
  ctx.beginPath()
  ctx.moveTo(0, centerY)
  ctx.lineTo(width, centerY)
  ctx.stroke()
  
  // Y轴
  ctx.beginPath()
  ctx.moveTo(centerX, 0)
  ctx.lineTo(centerX, height)
  ctx.stroke()
  
  // 绘制网格
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 0.5
  
  // 垂直网格线
  for (let x = centerX; x < width; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  for (let x = centerX; x > 0; x -= 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  // 水平网格线
  for (let y = centerY; y < height; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  for (let y = centerY; y > 0; y -= 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function drawCurve() {
  if (!ctx) return
  
  const canvasElement = canvas.value
  const width = canvasElement.width
  const height = canvasElement.height
  const centerX = width / 2
  const centerY = height / 2
  
  // 绘制函数曲线 y = 2x
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  // 从左侧开始绘制
  for (let x = 0; x < width; x++) {
    // 将像素坐标转换为数学坐标
    const mathX = (x - centerX) / 50 // 缩放因子
    
    // 计算函数值
    let mathY = 0
    try {
      if (functionEvaluator) {
        mathY = functionEvaluator(mathX)
      } else {
        mathY = mathX * mathX // 默认函数
      }
    } catch (err) {
      error.value = `计算错误: ${err.message}`
      return
    }
    
    // 将数学坐标转换回像素坐标（注意Y轴方向相反）
    const pixelY = centerY - mathY * 25 // 缩小Y轴缩放以更好显示
    
    if (x === 0) {
      ctx.moveTo(x, pixelY)
    } else {
      ctx.lineTo(x, pixelY)
    }
  }
  
  ctx.stroke()
}

function handleResize() {
  if (!canvas.value) return
  
  const container = canvas.value.parentElement
  if (container) {
    canvas.value.width = container.clientWidth
    canvas.value.height = 400
    drawFunction()
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    parseFunction(functionExpression.value) // 初始化函数解析器
    handleResize()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.function-plot-container {
  width: 100%;
  margin: 20px 0;
}

.function-plot-container h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.function-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.function-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.error-text {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

.plot-canvas {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
