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

  <!-- MODAL GLOBAL -->
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
  components: {
    Header,
    Preloader,
    PaymentModal,
  },
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
    '$route'(to, from) {
      this.previousRoutePath = from.path;
    }
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
  },
  mounted() {
  this.previousRoutePath = this.$route.path;
  },
  
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
   CONTENEDOR RAÍZ
=============================== */

.main-app-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ===============================
   CONTENEDOR DE RUTAS
=============================== */

.content-container {
  position: relative;
  width: 100%;
  height: 100%;
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
}

/* ===============================
   TRANSICIONES
=============================== */

.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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