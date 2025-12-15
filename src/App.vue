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
    },
    actualizarVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
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

  const setVH = () => {
    document.documentElement.style.setProperty(
      '--vh',
      `${window.visualViewport?.height
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01}px`
    );
  };

  setVH();
  window.addEventListener('resize', setVH);
}
,
  unmounted() {
    window.removeEventListener('resize', this.actualizarVH);
  }
};
</script>


<style>

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ===============================
   CONTENEDORES DE ALTURA
   =============================== */

.main-app-container,
.content-container,
.router-view-wrapper {
  margin: 0;
  padding: 0;
  width: 100vw;
  overflow: hidden;
  height: calc(var(--vh, 1vh) * 100);
  min-height: calc(var(--vh, 1vh) * 100);
}

/* ===============================
   CONTENEDOR DE SCROLL
   =============================== */

.router-view-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===============================
   TRANSICIONES
   =============================== */

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.8s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.8s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-enter-from {
  transform: translateY(-100%);
}

.slide-down-leave-to {
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from,
.slide-down-enter-to,
.slide-down-leave-from,
.no-animation-enter-to,
.no-animation-leave-from {
  transform: translateY(0);
}

</style>
