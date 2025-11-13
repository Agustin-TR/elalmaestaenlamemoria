<script setup>
import { defineProps, defineEmits } from 'vue';

// Define las props que esperas del componente padre
const props = defineProps({
  seccionActiva: {
    type: String,
    required: true
  }
});

// Define el evento que emitirás al componente padre
const emit = defineEmits(['cambiar-seccion']);

const orden = ["galeria", "inicio", "info"];

const cambiarSeccion = (targetId) => {
  // Notifica al padre qué sección fue clickeada
  emit('cambiar-seccion', targetId);
};
</script>

<template>
<header id="floating-header">
  <nav class="floating-tabs">
    <a href="#" 
       class="tab" 
       :class="{ 'activo': props.seccionActiva === 'galeria' }"
       @click.prevent="cambiarSeccion('galeria')" 
       data-section="galeria">
      GALERIA
    </a>
    <a href="#" 
       class="tab" 
       :class="{ 'activo': props.seccionActiva === 'inicio' }"
       @click.prevent="cambiarSeccion('inicio')" 
       data-section="inicio">
      INICIO
    </a>
    <a href="#" 
       class="tab" 
       :class="{ 'activo': props.seccionActiva === 'info' }"
       @click.prevent="cambiarSeccion('info')" 
       data-section="info">
      INFO
    </a>
  </nav>
</header>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Tourney:ital,wght@0,100..900;1,100..900&display=swap');

#floating-header {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  width: 70%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 0 1rem; /* Padding a la izquierda y derecha de 1rem */
  max-width: 1200px;
  min-width: 300px;
  box-sizing: border-box; /* Asegura que el padding no añada ancho extra */
}

.floating-tabs {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.floating-tabs .tab {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  padding: 0.3rem 2.2rem;
  font-family: 'Tourney', serif;
  font-weight: bold;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  text-align: center;
  color: #ffffffa3;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  transition: background-color 0.25s ease, transform 0.25s ease;
  overflow: hidden;
  -webkit-backdrop-filter: blur(0.5rem);
  backdrop-filter: blur(0.5rem);
}

.floating-tabs .tab.activo {
  background-color: rgba(0,0,0,0.3);
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  color: #fff;
}

.floating-tabs .tab:hover {
  background-color: rgba(0,0,0,0.45);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  #floating-header {
    width: 100%;
    padding: 0 1rem; /*separación de los bordes. */
  }

  .floating-tabs .tab {
    padding: 0.3rem 1rem; /* Más compacto en móvil */
    font-size: clamp(1.15rem, 3vw, 1.3rem); /* Ajuste de fuente */
  }
}



 /*Secciones animadas*/
.pantalla {
  position: absolute;
  top: 0; 
  left: 0;
  width: 100%; 
  height: 100vh;
  display:none; 
  align-items:center; 
  justify-content:center; 
  flex-direction:column;
  padding: 2rem; 
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 0.8s ease-in-out, opacity 0.6s ease-in-out  ;
  opacity: 0; 
  pointer-events: none; 
  z-index: 1;
  overflow-y: auto; /*scroll*/
}

.pantalla.visible{
  transform: translateY(0);
  transition: transform 0.8s ease-in-out; /*chequear  */
  opacity:1; 
  display: block;
  pointer-events:auto; 
  z-index:2;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.pantalla.pushing{ 
  z-index:3; 
}

/* Suavizado del fundido */
.pantalla:not(.visible) {
  opacity: 0;
}
</style>
