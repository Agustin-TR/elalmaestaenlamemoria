<template>
  <Preloader />

  <div class="main-app-container" id="main-content">
    <Header
      :seccion-activa="$route.path.substring(1)"
      @cambiar-seccion="handleCambiarSeccion"
    />

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
      ordenRutas,
      previousRoutePath: null
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
    }
  },
  computed: {
    animacionDireccion() {
      if (!this.previousRoutePath) return 'no-animation';

      const actual = this.ordenRutas.indexOf(this.$route.path);
      const previo = this.ordenRutas.indexOf(this.previousRoutePath);

      if (actual === -1 || previo === -1) return 'no-animation';

      return actual > previo ? 'slide-up' : 'slide-down';
    }
  },
  mounted() {
    this.previousRoutePath = this.$route.path;
  }
};
</script>

<style>

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* ===============================
   CONTENEDOR RAÍZ
=============================== */
.main-app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  /* Respetar muescas/notches en móviles modernos */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ===============================
   CONTENEDOR DE RUTAS
=============================== */
.content-container {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

/* ===============================
   ROUTER VIEW
=============================== */
.router-view-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  will-change: transform;
}

/* ===============================
   TRANSICIONES (CSS Optimizado)
=============================== */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Slide Up: La nueva sube, la vieja sube */
.slide-up-enter-from {
  transform: translate3d(0, 100%, 0);
}
.slide-up-leave-to {
  transform: translate3d(0, -100%, 0);
}

/* Slide Down: La nueva baja, la vieja baja */
.slide-down-enter-from {
  transform: translate3d(0, -100%, 0);
}
.slide-down-leave-to {
  transform: translate3d(0, 100%, 0);
}

/* Estado final común */
.slide-up-enter-to,
.slide-down-enter-to {
  transform: translate3d(0, 0, 0);
}

/* Sin animación */
.no-animation-enter-active,
.no-animation-leave-active {
  transition: none;
}
</style>