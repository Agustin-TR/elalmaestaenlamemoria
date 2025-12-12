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
  },
  computed: {
    animacionDireccion() {
      const currentPath = this.$route.path;
      const previousPath = this.previousRoutePath;

      if (!previousPath) return 'no-animation';

      const indexActual = this.ordenRutas.indexOf(currentPath);
      const indexPrevio = this.ordenRutas.indexOf(previousPath);

      if (indexActual === -1 || indexPrevio === -1) return 'no-animation';

      if (indexActual > indexPrevio) return 'slide-up';
      if (indexActual < indexPrevio) return 'slide-down';

      return 'no-animation';
    },
  },
  mounted() {
    // altura real en móviles (Safari incluido)
    const actualizarVH = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`
      );
    };

    actualizarVH();
    window.addEventListener('resize', actualizarVH);

    // Inicializamos ruta previa
    this.previousRoutePath = this.$route.path;
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.main-app-container,
.content-container,
.router-view-wrapper {
  margin: 0;
  padding: 0;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  min-height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
}

@supports (-webkit-touch-callout: none) {
  .main-app-container,
  .content-container,
  .router-view-wrapper {
    min-height: -webkit-fill-available; /* Safari iOS */
  }
}

#main-content {
  opacity: 0;
  transition: opacity 1s ease-out;
}

.content-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.router-view-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* scroll suave en iOS */
}

/* --- Transiciones Slide Up --- */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.8s ease-in-out;
}
.slide-up-enter-from {
  transform: translateY(100vh);
}
.slide-up-leave-to {
  transform: translateY(-100vh);
}

/* --- Transiciones Slide Down --- */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.8s ease-in-out;
}
.slide-down-enter-from {
  transform: translateY(-100vh);
}
.slide-down-leave-to {
  transform: translateY(100vh);
}

/* Estados finales */
.slide-up-enter-to,
.slide-up-leave-from,
.slide-down-enter-to,
.slide-down-leave-from,
.no-animation-enter-to,
.no-animation-leave-from {
  transform: translateY(0);
}
</style>
