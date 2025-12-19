<template>
  <div
    v-if="preloaderVisible"
    class="preloader"
    :class="{ 'slide-up': slideUpActive }"
    ref="preloaderEl"
  >
    <div class="text-container">
      <h1 class="base-text" :class="{ show: baseTextShow }">
        El alma está en la memoria
      </h1>

      <div class="reveal-bar" :class="{ animate: revealBarAnimate }">
        <span class="revealed-name" :class="{ show: revealedNameShow }">
          Agustin Rojas
        </span>
      </div>
    </div>
  </div>
</template>

<script>
    
const SLIDE_UP_TIME = 800;
const FADE_IN_TIME = 300;
const ANIMATION_START_DELAY = 1500;
const BAR_ANIMATION_DURATION = 1000;
const FINAL_DELAY = 500;

export default {
  name: "Preloader",

  data() {
    return {
      preloaderVisible: true,
      baseTextShow: false,
      revealBarAnimate: false,
      revealedNameShow: false,
      slideUpActive: false,
      windowLoaded: false,
      animationFinished: false,
    };
  },

  mounted() {
    document.body.style.overflow = "hidden";

    this.initPreloader();

    if (document.readyState === "complete") {
      this.handleWindowLoad();
    } else {
      window.addEventListener("load", this.handleWindowLoad);
    }
  },

  beforeUnmount() {
    window.removeEventListener("load", this.handleWindowLoad);
  },

  methods: {
    mostrarApp() {
      document.body.style.overflow = "auto";
    },

    cerrarPreloader() {
      if (this.slideUpActive) return;

      this.slideUpActive = true;

      setTimeout(() => {
        this.preloaderVisible = false;
        this.mostrarApp();
      }, SLIDE_UP_TIME);
    },

    checkCerrar() {
      if (this.windowLoaded && this.animationFinished) {
        this.cerrarPreloader();
      }
    },

    startAnimationSequence() {
      this.revealBarAnimate = true;

      setTimeout(() => {
        this.revealedNameShow = true;
      }, 100);

      setTimeout(() => {
        this.animationFinished = true;
        this.checkCerrar();
      }, BAR_ANIMATION_DURATION + FINAL_DELAY);
    },

    initPreloader() {
      if (sessionStorage.getItem("preloaderShown")) {
        this.preloaderVisible = false;
        this.mostrarApp();
        return;
      }

      sessionStorage.setItem("preloaderShown", "true");

      setTimeout(() => {
        this.baseTextShow = true;

        setTimeout(() => {
          this.startAnimationSequence();
        }, ANIMATION_START_DELAY);

      }, FADE_IN_TIME);
    },

    handleWindowLoad() {
      this.windowLoaded = true;
      this.checkCerrar();

      const imagenes = Array.from(
        document.querySelectorAll("[data-bg]")
      ).map(el => el.getAttribute("data-bg"));

      imagenes.slice(0, 2).forEach(src => {
        const img = new Image();
        img.src = src;
      });

      imagenes.slice(2).forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }
};
</script>


<style scoped>
/* ========= PRELOADER ========= */

.preloader {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: transform 1s ease-in-out;
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
  font-weight: bold;
  font-size: 6vw;
  margin: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in;
  white-space: nowrap;
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
