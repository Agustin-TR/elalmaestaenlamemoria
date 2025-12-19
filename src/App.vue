<template>
  <Preloader />

  <div id="app-root" class="main-app-container">
    <Header
      :seccion-activa="$route.path.substring(1)"
      @cambiar-seccion="handleCambiarSeccion"
    />

    <div class="content-container">
      <RouterView v-slot="{ Component }">
        <Transition :name="animacionDireccion">
          <div :key="$route.path" class="router-view-wrapper">
            <!-- SOLO ESTE SE ANIMA -->
            <div class="route-scroll-area">
              <component :is="Component" />
            </div>
          </div>
        </Transition>
      </RouterView>
    </div>
  </div>

  <teleport to="body">
    <PaymentModal
      v-if="showPaymentModal && paymentKey"
      :version-key="paymentKey"
      @close="closePaymentModal"
    />
  </teleport>
</template>

<script>
import Header from '@/components/Header.vue';
import Preloader from '@/components/Preloader.vue';
import PaymentModal from '@/components/PaymentModal.vue';

const ordenRutas = ["/galeria", "/inicio", "/tienda"];

export default {
  name: "App",
  components: { Header, Preloader, PaymentModal },

  data() {
    return {
      ordenRutas,
      previousRoutePath: null,
      showPaymentModal: false,
      paymentKey: null,
    };
  },

  provide() {
    return {
      openPaymentModal: this.openPaymentModal
    };
  },

  watch: {
    $route(to, from) {
      this.previousRoutePath = from.path;
    }
  },

  mounted() {
    this.previousRoutePath = this.$route.path;
  },

  methods: {
    handleCambiarSeccion(targetId) {
      this.$router.push({ path: `/${targetId}` });
    },

    openPaymentModal(versionKey) {
      this.paymentKey = versionKey;
      this.showPaymentModal = true;
    },

    closePaymentModal() {
      this.showPaymentModal = false;
      this.paymentKey = null;
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
  }
};
</script>

<style>
/* ===============================
   BASE (NO ROMPE SAFARI)
================================ */

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

/* ===============================
   ROOT APP
================================ */

.main-app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===============================
   CONTENEDOR DE RUTAS
================================ */

.content-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* ===============================
   WRAPPER ANIMADO
================================ */

.router-view-wrapper {
  position: absolute;
  inset: 0;
}

/* ===============================
   SCROLL REAL
================================ */

.route-scroll-area {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===============================
   TRANSICIONES
================================ */

.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  position: absolute;
  inset: 0;
  transition: transform 0.8s ease-in-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(-100%);
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
