<script setup>

const props = defineProps({
 seccionActiva: {
  type: String,
  required: true
 }
});

</script>

<template>
<header id="floating-header">
 <nav class="floating-tabs" role="tablist" aria-label="Navegación principal">
      <router-link
         to="/galeria"
         class="tab"
         :class="{ 'activo': props.seccionActiva === 'galeria' }"
         role="tab"
         :aria-current="props.seccionActiva === 'galeria' ? 'page' : null"
      >
         GALERIA
      </router-link>

      <router-link
         to="/inicio"
         class="tab"
         :class="{ 'activo': props.seccionActiva === 'inicio' }"
         role="tab"
         :aria-current="props.seccionActiva === 'inicio' ? 'page' : null"
      >
         INICIO
      </router-link>

      <router-link
         to="/tienda"
         class="tab"
         :class="{ 'activo': props.seccionActiva === 'tienda' }"
         role="tab"
         :aria-current="props.seccionActiva === 'tienda' ? 'page' : null"
      >
         TIENDA
      </router-link>
   </nav>
</header>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Tourney:ital,wght@0,100..900;1,100..900&display=swap');

/* --- LAYOUT DEL HEADER --- */

#floating-header {
 position: fixed;
 top: 1.5rem;
 width: 70%;
 z-index: 10;
 padding: 0 1rem;
 max-width: 1200px;
 min-width: 300px;
 box-sizing: border-box;
 margin: 0 auto;
 left: 0;
 right: 0;
 transform: none;
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
  font-family: 'Cinzel', serif;
  font-weight: bold;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  text-align: center;
  color: #f5f5f5ba;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  transition: background-color 0.25s ease, transform 0.25s ease;
  overflow: hidden;
  -webkit-backdrop-filter: blur(0.5rem);
  backdrop-filter: blur(0.5rem);
 }


/* --- ESTILOS DE ESTADO --- */

.floating-tabs .tab.activo {
 background-color: rgba(0,0,0,0.45);
 box-shadow: 0 4px 12px rgba(0,0,0,0.5);
 color: #fff;
}

.floating-tabs .tab:hover {
 background-color: rgba(0,0,0,0.45);
 transform: translateY(-2px);
}

/* --- MEDIA QUERIES --- */

@media (max-width: 768px) {
 #floating-header {
  width: 100%;
  padding: 0 1rem;
 }

 .floating-tabs .tab {
  padding: 0.3rem 0.5rem;
  font-size: clamp(1.0rem, 2.5vw, 1.1rem);
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
 transition: transform 0.8s ease-in-out, opacity 0.6s ease-in-out ;
 opacity: 0;
 pointer-events: none;
 z-index: 1;
 overflow-y: auto; /*scroll*/
}

.pantalla.visible{
 transform: translateY(0);
 transition: transform 0.8s ease-in-out; 
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