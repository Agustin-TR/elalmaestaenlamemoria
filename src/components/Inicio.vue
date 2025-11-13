
<template>
  <div id="inicio" class="inicio-section">
    <section class="pantalla visible" id="inicio">
      <div class="scroll-container" ref="containerRef" id="container">
        <div class="background-layer" id="backgroundLayer" :style="backgroundStyle"></div>
        
        <ul class="item-list" id="itemList">
          <li v-for="(p, index) in itemsData" 
            :key="p.id"
            :class="{ 'activo': index === activeIndex }"
            :ref="el => itemRefs[index] = el"
            @click="handleItemClick($event, index)">
            {{ p.title }}
          </li>
        </ul>
        
        <div 
          id="detalle" 
          class="detalle-overlay" 
          v-if="detalle.isVisible"
          :style="{ top: detalle.top, opacity: detalle.isVisible ? 1 : 0 }">
          {{ detalle.text }}
        </div>
      </div>
    </section>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';

//(Lista de poemas)
import { dataPoemas } from '@/data/poemas.js'
const itemsData = ref(dataPoemas) //array reactivo


// 2. Estado Reactivo y Referencias del DOM
const containerRef = ref(null);         // Referencia al div 'scroll-container'
const itemRefs = ref([]);               // Array de referencias para los <li>
const activeIndex = ref(null);          // Índice del item activo
const detalle = ref({
  isVisible: false,
  text: '',
  top: '0px',
});

// 3. Propiedad Calculada para el Fondo Dinámico
const backgroundStyle = computed(() => {
  if (activeIndex.value !== null) {
    const bgUrl = itemsData.value[activeIndex.value].bg;
    return { backgroundImage: `url(${bgUrl})` };
  }
  return {}; // Fondo predeterminado si no hay activo
});

// 4. Lógica de Actualización (Similar a `updateActiveItem` original)
const updateActiveItem = () => {
  const container = containerRef.value;
  const items = itemRefs.value;
  if (!container || items.length === 0) return;

  let closest = null;
  let minDistance = Infinity;
  const viewportCenterY = window.innerHeight / 2;

  items.forEach((itemEl, i) => {
    // Usar getBoundingClientRect() para determinar la posición en el viewport
    const rect = itemEl.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportCenterY);

    if (distance < minDistance) {
      minDistance = distance;
      closest = i;
    }
  });

  if (closest !== activeIndex.value) {
    activeIndex.value = closest;
    // Oculta el detalle al cambiar de item activo por scroll
    detalle.value.isVisible = false; 
  }
};

// 5. Manejadores de Eventos
const handleScroll = () => {
  // Usar requestAnimationFrame para optimizar la actualización de scroll
  requestAnimationFrame(updateActiveItem);
  detalle.value.isVisible = false; // Ocultar detalle al hacer scroll
};

const handleItemClick = (event, itemIndex) => {
  const itemEl = event.currentTarget;
  const itemData = itemsData.value[itemIndex];

  if (itemIndex === activeIndex.value) {
    // Es el elemento activo, mostrar/ocultar detalle
    const rect = itemEl.getBoundingClientRect();
    const newText = itemData.detalle.replace(/\\n/g, '\n');
    
    // Si ya está visible con el mismo texto, ocúltalo, sino, muéstralo
    if (detalle.value.isVisible && detalle.value.text === newText) {
      detalle.value.isVisible = false;
    } else {
      detalle.value.text = newText;
      // Usar nextTick para asegurar que la posición se calcule después de que Vue actualice el DOM
      nextTick(() => {
        // Establecer la posición relativa al elemento clickeado
        detalle.value.top = `${rect.bottom + 3}px`;
        detalle.value.isVisible = true;
      }); 
    }
  } else {
    // Es un elemento inactivo, simplemente ignorar el click para el detalle
    detalle.value.isVisible = false;
  }
};

// 6. Lógica de Scroll al hacer Click Global (Similar al original)
const scrollToItem = (itemEl) => {
  const container = containerRef.value;
  if (!container || !itemEl) return;

  const containerRect = container.getBoundingClientRect();
  const itemRect = itemEl.getBoundingClientRect();
  
  // Calcular la posición del item respecto al inicio del scroll-container
  const itemOffsetTop = container.scrollTop + (itemRect.top - containerRect.top);
  
  // Calcular la posición para centrar el item
  const target = Math.max(0, Math.round(itemOffsetTop - (container.clientHeight / 2) + (itemEl.clientHeight / 2)));
  
  container.scrollTo({ top: target, behavior: 'smooth' });
};

const findClosestToCenter = () => {
  const container = containerRef.value;
  const items = itemRefs.value;
  if (!container || items.length === 0) return null;

  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.top + container.clientHeight / 2;
  let closestIndex = null;
  let minDistance = Infinity;
  
  items.forEach((item, index) => {
    const r = item.getBoundingClientRect();
    const d = Math.abs((r.top + r.height / 2) - centerY);
    if (d < minDistance) { 
      minDistance = d; 
      closestIndex = index; 
    }
  });
  return items[closestIndex];
};

const handleGlobalClick = (event) => {
  // Exclusiones para el click global
  if (event.target.closest('#preloader')) return;
  if (event.target.closest('a, button, input, textarea, select')) return;
  if (event.target.closest('#detalle')) return;

  // Si se hizo click en el elemento activo, no hacer nada (el click ya fue manejado por handleItemClick)
  const clickedItem = event.target.closest('#itemList li');
  if (clickedItem && clickedItem.classList.contains('activo')) return; 

  // Determinar el siguiente elemento para scrollear
  const activeItemEl = itemRefs.value[activeIndex.value] || findClosestToCenter();
  let nextItem = null;
  
  if (activeItemEl) {
    let currentIndex = itemRefs.value.indexOf(activeItemEl);
    nextItem = itemRefs.value[currentIndex + 1];
  }

  if (nextItem) {
    scrollToItem(nextItem);
  } else {
    // Si no hay siguiente, vuelve al primero
    const first = itemRefs.value[0];
    if (first) scrollToItem(first);
  }
  //`itemRefs`: Vue actualiza las referencias de arrays automáticamente
  //  cuando se usa `:ref="el => itemRefs[index] = el"`.
};


// 7. Ciclos de Vida (Reemplazan a `DOMContentLoaded` y `window.addEventListener`)

onMounted(() => {
  // 1. Inicializar la escucha del scroll
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll);
  }
  // 2. Inicializar la escucha del click global
  document.addEventListener('click', handleGlobalClick);
  // 3. Primera actualización para establecer el fondo inicial
  updateActiveItem();
  
});

onUnmounted(() => {
  // Limpieza: importante para evitar fugas de memoria
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
  }
  document.removeEventListener('click', handleGlobalClick);
});


</script>


<style scoped>

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* ========= INICIO ========= */

.background-layer {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -1;
  transition: background-image 0.4s linear;
  width: 100vw;
  height: 100vh;
}

.content-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* ========= SCROLL CONTAINER ========= */
*, *::before, *::after {
    box-sizing: inherit;
}

.scroll-container {
  position: fixed;
  inset: 0;
  overflow-y: scroll;
  padding: 5vh 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 0;
  scrollbar-width: auto;
}

/* ========= ITEM LIST ========= */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 800px;
  padding-top: 50vh;
  padding-bottom: 50vh;
  cursor:default;
}

.item-list li {
  margin: 4rem 0;
  font-size: 1.5rem;
  line-height: 1.4;
  text-align: center;
  color: #736767;
  transition: color 0.3s ease, filter 0.4s ease;
  filter: blur(1.5px);
  cursor: default;
  pointer-events: none;
}

.item-list li.activo {
  color: #fff;
  filter: none;
  position: relative;
  cursor: pointer;
  pointer-events: all;
}

/* ========= DETALLE ========= */
.detalle-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #f5f5f5;
  font-style: italic;
  line-height: 1.6;
  max-width: 80vw;
  z-index: 10;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  white-space: pre-line;
  opacity: 0;
  transition: opacity 0.4s ease, top 0.3s ease;
  pointer-events: none;
}

/* Añadir un estilo para que el detalle se muestre cuando la condición sea verdadera */
.detalle-overlay[style*="opacity: 1"] {
    pointer-events: all;
}

.scroll-container::before,
.scroll-container::after {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  height: 15vh;
  pointer-events: none;
  z-index: 1;
}

@media (max-width: 600px) {
  .item-list li {
    margin: 3rem 0;
    font-size: 1.5rem;
    padding: 0 1rem;
  }

  .detalle-overlay {
    font-size: 1rem;
    padding: 0.8rem 1rem;
    width: 60ch; 

  }
}
</style>