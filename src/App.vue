<template>
  <Preloader />

  <div class="main-app-container" id="main-content">
    <Header :seccion-activa="$route.path.substring(1)" @cambiar-seccion="handleCambiarSeccion" />
    <div class="content-container">
      <RouterView v-slot="{ Component }">
        <Transition :name="animacionDireccion">
          <div :key="$route.path" class="router-view-wrapper">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Preloader from './components/Preloader.vue';

const ordenRutas = ["/galeria", "/inicio", "/tienda"];

export default {
  name: "App",
  components: {
    Header,
    Preloader
  },
  data() {
    return {
      ordenRutas: ordenRutas,
      previousRoutePath: null,
    };
  },
  watch: {
    '$route'(to, from) {
      this.previousRoutePath = from.path;
    }
  },
  methods: {
    handleCambiarSeccion(targetId) {
      this.$router.push({ path: `/${targetId}` });
    },
    actualizarVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  },
  computed: {
    animacionDireccion() {
      const currentPath = this.$route.path;
      const previousPath = this.previousRoutePath;

      if (!previousPath) {
        return 'no-animation';
      }

      const indexActual = this.ordenRutas.indexOf(currentPath);
      const indexPrevio = this.ordenRutas.indexOf(previousPath);

      if (indexActual === -1 || indexPrevio === -1) {
        return 'no-animation';
      }
     
      if (indexActual > indexPrevio) {
        return 'slide-up';
      }
      else if (indexActual < indexPrevio) {
        return 'slide-down';
      }

      return 'no-animation';
    },
  },
  mounted() {
    this.previousRoutePath = this.$route.path;

    // ==== PANTALLA COMPLETA REAL ====
    this.actualizarVH();
    window.addEventListener('resize', this.actualizarVH);
  },
  unmounted() {
    window.removeEventListener('resize', this.actualizarVH);
  }
};
</script>

<style>
/* ========================================================
  ESTILOS GLOBALES Y ESTRUCTURA (FIX ALTURA MÓVIL)
  ========================================================
*/
html,
body{
 margin: 0;
 padding: 0;
 width: 100%;
 height: 100%;
 overflow: hidden; /* Crucial para evitar el scroll y el "rebote" de la página completa */
}

/* Contenedores que definen el ALTO de la aplicación */
.main-app-container,
.content-container,
.router-view-wrapper {
  margin: 0;
  padding: 0;
  width: 100vw;
  overflow: hidden; /* Evita el scroll global */
    
    /* Altura dinámica moderna (100dvh)*/
    height: 100dvh; 
    min-height: 100dvh;

    /* Fallback del cálculo JS (--vh) */
    height: calc(var(--vh, 1vh) * 100);
    min-height: calc(var(--vh, 1vh) * 100);
}

/* FIX ESPECÍFICO DE SAFARI iOS/WebKit: */
@supports (-webkit-touch-callout: none) {
    .main-app-container,
    .content-container,
    .router-view-wrapper {
        min-height: -webkit-fill-available; /* Ocupa el alto real en iOS Safari */
    }
}

#main-content {
  opacity: 0;
  transition: opacity 1s ease-out;
}

/* Contenedor principal de las vistas. */
.content-container {
  position: relative;
}

/* Wrapper de cada vista del router. Es el ÚNICO elemento con scroll vertical. */
.router-view-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* Hereda el alto corregido */
  overflow-y: auto; 
    /* Mejora la sensación de scroll en iOS */
    -webkit-overflow-scrolling: touch; 
}


/* ------------------------------------------------ */
/* --- CLASES DE TRANSICIÓN DE SLIDE UP (Subiendo) --- */
/* ------------------------------------------------ */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.8s ease-in-out;
    position: absolute; /* Agregado para que las transiciones de Vue funcionen correctamente */
    width: 100%;
    height: 100%;
}

/* Estado inicial de la nueva vista (entra) */
.slide-up-enter-from {
  transform: translateY(100vh);
  /* La nueva entra desde abajo */
}

/* Estado final de la vista vieja (sale) */
.slide-up-leave-to {
  transform: translateY(-100vh);
  /* La vieja sale por arriba */
}

/* ------------------------------------------------- */
/* --- CLASES DE TRANSICIÓN DE SLIDE DOWN (Bajando) --- */
/* ------------------------------------------------- */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.8s ease-in-out;
    position: absolute;
    width: 100%;
    height: 100%;
}

/* Estado inicial de la nueva vista (entra) */
.slide-down-enter-from {
  transform: translateY(-100vh);
  /* La nueva entra desde arriba */
}

/* Estado final de la vista vieja (sale) */
.slide-down-leave-to {
  transform: translateY(100vh);
  /* La vieja sale por abajo */
}

/* Asegura que los estados finales y de reposo no tengan transformaciones */
.slide-up-enter-to,
.slide-up-leave-from,
.slide-down-enter-to,
.slide-down-leave-from,
.no-animation-enter-to,
.no-animation-leave-from {
  transform: translateY(0);
}
</style>