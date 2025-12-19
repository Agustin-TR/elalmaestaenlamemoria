<template>
  <div
    v-if="preloaderVisible"
    class="preloader"
    :class="{ 'slide-up': slideUpActive }"
    ref="preloaderEl"
  >
    <div class="text-container">
      <!-- TEXTO BASE -->
      <h1
        class="base-text"
        :class="{ show: baseTextShow }"
      >
        El alma está en la memoria
      </h1>

      <!-- BARRA -->
      <div class="reveal-bar" :class="{ animate: revealBarAnimate }">
        <span
          class="revealed-name"
          :class="{ show: revealedNameShow }"
        >
          Agustin Rojas
        </span>
      </div>
    </div>
  </div>
</template>

<script>
// ==========================================
// CONFIGURACIÓN DE TIEMPOS
// ==========================================
const TIME_FADE_IN_TEXT = 300;
const TIME_START_DELAY = 1500;
const TIME_BAR_ANIMATION = 800;
const TIME_NAME_OFFSET = 100;
const TIME_FINAL_HOLD = 500;
const TIME_SLIDE_UP_SEC = 0.8;

export default {
  name: "Preloader",

  data() {
    return {
      preloaderVisible: true,
      baseTextShow: false,
      revealBarAnimate: false,
      revealedNameShow: false,
      slideUpActive: false,
      fontReady: false,
    };
  },

  async mounted() {
    document.body.style.overflow = "hidden";

    // ESPERAMOS EXPLÍCITAMENTE A LA FUENTE
    await this.waitForFonts();

    this.initPreloader();
  },

  methods: {
    async waitForFonts() {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      this.fontReady = true;
    },

    showMainContent() {
      document.body.style.overflow = "auto";
      const main = document.getElementById("main-content");
      if (main) main.style.opacity = "1";
    },

    startAnimationSequence() {
      this.revealBarAnimate = true;

      setTimeout(() => {
        this.revealedNameShow = true;
      }, TIME_NAME_OFFSET);

      setTimeout(() => {
        this.slideUpActive = true;

        setTimeout(() => {
          this.preloaderVisible = false;
          this.showMainContent();
        }, TIME_SLIDE_UP_SEC * 1000);

      }, TIME_BAR_ANIMATION + TIME_FINAL_HOLD);
    },

    initPreloader() {
      if (sessionStorage.getItem("preloaderShown")) {
        this.preloaderVisible = false;
        this.showMainContent();
        return;
      }

      sessionStorage.setItem("preloaderShown", "true");

      // transición dinámica
      this.$nextTick(() => {
        if (this.$refs.preloaderEl) {
          this.$refs.preloaderEl.style.transition =
            `transform ${TIME_SLIDE_UP_SEC}s ease-in-out`;
        }
      });

      // EL TEXTO SOLO APARECE CUANDO LA FUENTE YA ESTÁ LISTA
      setTimeout(() => {
        if (this.fontReady) {
          this.baseTextShow = true;

          setTimeout(() => {
            this.startAnimationSequence();
          }, TIME_START_DELAY);
        }
      }, TIME_FADE_IN_TEXT);
    }
  }
};
</script>

<style scoped>
/* ========= PRELOADER ========= */

.preloader {
  position: fixed;
  inset: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: 'Cinzel', serif;
}

.preloader.slide-up {
  transform: translateY(-100%);
}

/* ========= TEXTO ========= */

.text-container {
  position: relative;
  text-align: center;
}

.base-text {
  font-family: 'Cinzel', serif;
  font-weight: bold;
  font-size: 6vw;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.5s ease-in;
}

.base-text.show {
  opacity: 1;
}

/* ========= REVEAL ========= */

.reveal-bar {
  position: absolute;
  bottom: 0;
  left: -5%;
  width: 0%;
  height: 3em;
  background-color: #005f6a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reveal-bar.animate {
  animation: revealAnimation 1s ease-out forwards;
}

.revealed-name {
  font-family: 'Cinzel', serif;
  color: white;
  font-weight: bold;
  font-size: 8vw;
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.revealed-name.show {
  opacity: 1;
}

@keyframes revealAnimation {
  from { width: 0%; }
  to   { width: 110%; }
}

@media (min-width: 768px) {
  .base-text { font-size: 5vw; }
  .revealed-name { font-size: 1.5vw; }
}
</style>
