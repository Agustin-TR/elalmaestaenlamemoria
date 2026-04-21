<template>
  <div ref="container" class="book-viewer">
    <div v-if="loading" class="loader">
      <span>Cargando modelo…</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  /** Ruta al archivo .glb, relativo a /public  */
  modelPath: {
    type: String,
    default: '/elalmaestaenlamemoria/assets/libro3d.glb'
  },
  /** Rotación automática */
  autoRotate: {
    type: Boolean,
    default: false
  }
})

// ── Estado ─────────────────────────────────────────────────────────────────
const container = ref(null)
const loading   = ref(true)

// Three.js internals
let scene, camera, renderer, controls, animationId
let bookMesh = null

// ── Ciclo de vida ──────────────────────────────────────────────────────────
onMounted(() => {
  initScene()
  loadBook()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  controls?.dispose()
  renderer?.dispose()
  window.removeEventListener('resize', onResize)
})

// ── Inicialización ─────────────────────────────────────────────────────────
function initScene() {
  const el = container.value
  const w  = el.clientWidth
  const h  = el.clientHeight

  // Escena
  scene = new THREE.Scene()
  // Sin fondo (transparente para integrarse en cualquier layout)

  // Cámara — ángulo 3/4 mostrando portada y lomo
  camera = new THREE.PerspectiveCamera(38, w / h, 0.001, 10)
  camera.position.set(0.16, 0.06, 0.28)
  camera.lookAt(0, 0, 0)

  // Renderer con antialias y soporte alpha
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping      = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.shadowMap.enabled   = true
  renderer.shadowMap.type      = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  // ── Iluminación ────────────────────────────────────────
  // Luz ambiental suave
  const ambient = new THREE.AmbientLight(0xfff5e8, 0.55)
  scene.add(ambient)

  // Luz principal (frontal-superior derecha)
  const main = new THREE.DirectionalLight(0xffffff, 1.4)
  main.position.set(1.2, 2.0, 2.5)
  main.castShadow = true
  main.shadow.mapSize.set(1024, 1024)
  scene.add(main)

  // Luz de relleno (izquierda, fría)
  const fill = new THREE.DirectionalLight(0xb8d4ff, 0.35)
  fill.position.set(-2, 0.5, -1)
  scene.add(fill)

  // Luz de contorno (trasera)
  const rim = new THREE.DirectionalLight(0xffeedd, 0.25)
  rim.position.set(0, -1, -2)
  scene.add(rim)

  // ── Controles de órbita ────────────────────────────────
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping    = true
  controls.dampingFactor    = 0.06
  controls.minDistance      = 0.12
  controls.maxDistance      = 0.90
  controls.minPolarAngle    = Math.PI * 0.15   // no pasar del cénit
  controls.maxPolarAngle    = Math.PI * 0.80   // no pasar del nadir
  controls.autoRotate       = props.autoRotate
  controls.autoRotateSpeed  = 0.8
  controls.target.set(0, 0, 0)
  controls.update()

  // Loop de render
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

// ── Carga del modelo ───────────────────────────────────────────────────────
function loadBook() {
  const loader = new GLTFLoader()

  loader.load(
    props.modelPath,
    (gltf) => {
      bookMesh = gltf.scene
      scene.add(bookMesh)

      // Mejorar materiales: activar mapa de entorno si hay uno en la escena
      bookMesh.traverse((node) => {
        if (node.isMesh) {
          node.castShadow    = true
          node.receiveShadow = true

          const mat = node.material
          if (mat) {
            // Envmap suave para reflejos del acabado brillante
            mat.envMapIntensity = 0.4
            mat.needsUpdate     = true
          }
        }
      })

      loading.value = false
    },
    (progress) => {
      // opcional: emitir progreso
      if (progress.total > 0) {
        const pct = (progress.loaded / progress.total * 100).toFixed(0)
        console.debug(`[BookViewer] Cargando: ${pct}%`)
      }
    },
    (error) => {
      console.error('[BookViewer] Error al cargar GLB:', error)
      loading.value = false
    }
  )
}

// ── Responsive ────────────────────────────────────────────────────────────
function onResize() {
  const el = container.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// ── API pública (opcional) ────────────────────────────────────────────────
/** Resetea la cámara al ángulo 3/4 inicial */
function resetCamera() {
  camera.position.set(0.16, 0.06, 0.28)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
}

defineExpose({ resetCamera })
</script>

<style scoped>
.book-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: transparent;
  overflow: hidden;
}

.book-viewer canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-family: serif;
  font-style: italic;
  font-size: 0.9rem;
  pointer-events: none;
}
</style>
