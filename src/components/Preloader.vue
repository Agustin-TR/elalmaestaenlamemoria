<template>
  <div
    v-if="preloaderVisible"
    ref="preloaderEl"
    class="preloader"
    :class="{ 'slide-up': slideUpActive }"
  >
    <div class="text-container">
      <h1
        class="base-text"
        :class="{ show: baseTextShow }"
      >
        El alma está en la memoria
      </h1>

      <div
        class="reveal-bar"
        :class="{ animate: revealBarAnimate }"
      >
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
// ==============================
// TIMINGS
// ==============================
const TIMING = {
  FADE_IN_TEXT: 300,
  START_DELAY: 1500,
  BAR_ANIMATION: 800,
  NAME_OFFSET: 100,
  FINAL_HOLD: 500,
  SLIDE_UP_SEC: 0.8,
};

export default {
  name: "Preloader",

  data() {
    return {
      preloaderVisible: true,
      baseTextShow: false,
      revealBarAnimate: false,
      revealedNameShow: false,
      slideUpActive: false,
    };
  },

  async mounted() {
    // Early exit: nada se ejecuta
    if (sessionStorage.getItem("preloaderShown")) {
      this.preloaderVisible = false;
      this.showMainContent();
      return;
    }

    sessionStorage.setItem("preloaderShown", "true");

    document.body.style.overflow = "hidden";

    this.setupTransition();
    this.startTimeline();
  },

  methods: {
    setupTransition() {
      this.$refs.preloaderEl.style.transition =
        `transform ${TIMING.SLIDE_UP_SEC}s ease-in-out`;
    },

    startTimeline() {
      // Texto base
      setTimeout(() => {
        this.baseTextShow = true;
      }, TIMING.FADE_IN_TEXT);

      // Reveal bar
      setTimeout(() => {
        this.revealBarAnimate = true;
      }, TIMING.FADE_IN_TEXT + TIMING.START_DELAY);

      // Nombre
      setTimeout(() => {
        this.revealedNameShow = true;
      }, TIMING.FADE_IN_TEXT + TIMING.START_DELAY + TIMING.NAME_OFFSET);

      // Slide up
      setTimeout(() => {
        this.slideUpActive = true;
      }, TIMING.FADE_IN_TEXT + TIMING.START_DELAY + TIMING.BAR_ANIMATION + TIMING.FINAL_HOLD);

      // Cleanup final
      setTimeout(() => {
        this.preloaderVisible = false;
        this.showMainContent();
      }, TIMING.FADE_IN_TEXT
        + TIMING.START_DELAY
        + TIMING.BAR_ANIMATION
        + TIMING.FINAL_HOLD
        + TIMING.SLIDE_UP_SEC * 1000
      );
    },

    showMainContent() {
      document.body.style.overflow = "auto";
      const main = document.getElementById("main-content");
      if (main) main.style.opacity = "1";
    },
  },
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
  font-size: 6vw;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.5s ease-in;
  font-weight: bold;
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
