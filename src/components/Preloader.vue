<template>
    <div class="preloader" id="preloader" v-if="preloaderVisible" :class="{ 'slide-up': slideUpActive }" ref="preloaderEl">
        <div class="text-container">
            <h1 class="base-text" id="baseText" :class="{ show: baseTextShow }">El alma está en la memoria</h1>
            <div class="reveal-bar" id="revealBar" :class="{ animate: revealBarAnimate }" ref="revealBarEl">
                <span class="revealed-name" id="revealedName" :class="{ show: revealedNameShow }" ref="revealedNameEl">
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
const TIME_FADE_IN_TEXT = 200;      //  primer mensaje
const TIME_START_DELAY = 1500;     // Espera antes de iniciar la animación de la barra
const TIME_BAR_ANIMATION = 1000;   // Duración de la animación CSS de la barra (debe coincidir con el CSS)
const TIME_NAME_OFFSET = 100;      // Pequeño delay para mostrar el nombre dentro de la barra
const TIME_FINAL_HOLD = 500;       // Tiempo que se queda la barra llena antes de subir
const TIME_SLIDE_UP_SEC = 0.8;     // Duración de la transición de salida (en SEGUNDOS para el style)
const TIME_MIN_LOADER_LIFE = 3000; // Tiempo mínimo que el preloader debe estar visible

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
    mounted() {
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
        /**
         * Finaliza el preloader y muestra el contenido principal
         */
        showMainContent() {
            document.body.style.overflow = "auto";
            const main = document.getElementById("main-content");
            if (main) main.style.opacity = 1;
        },

        /**
         * Secuencia de animaciones de texto y barra
         */
        startAnimationSequence() {
            // 1. Inicia la animación de la barra
            this.revealBarAnimate = true;

            // 2. Mostramos el nombre con un ligero offset
            setTimeout(() => {
                this.revealedNameShow = true;
            }, TIME_NAME_OFFSET);

            // 3. Cuando termina la barra + el hold, subimos el telón
            setTimeout(() => {
                this.slideUpActive = true;

                // 4. Tras el desplazamiento, eliminamos del DOM
                setTimeout(() => {
                    this.preloaderVisible = false;
                    this.showMainContent();
                }, TIME_SLIDE_UP_SEC * 1000);

            }, TIME_BAR_ANIMATION + TIME_FINAL_HOLD);
        },

        initPreloader() {
            // Si ya se mostró en la sesión, saltear
            if (sessionStorage.getItem("preloaderShown")) {
                this.preloaderVisible = false;
                this.showMainContent();
                return;
            }

            sessionStorage.setItem("preloaderShown", "true");

            // Aplicamos el tiempo de transición dinámico al elemento
            this.$nextTick(() => {
                if (this.$refs.preloaderEl) {
                    this.$refs.preloaderEl.style.transition = `transform ${TIME_SLIDE_UP_SEC}s ease-in-out`;
                }
            });

            // Inicio de la cadena de aparición
            setTimeout(() => {
                this.baseTextShow = true;
                setTimeout(() => {
                    this.startAnimationSequence();
                }, TIME_START_DELAY);
            }, TIME_FADE_IN_TEXT);
        },

        handleWindowLoad() {
            const imagenes = Array.from(document.querySelectorAll("li"))
                .map((item) => item.getAttribute("data-bg"))
                .filter(Boolean);

            if (imagenes.length === 0) {
                setTimeout(this.showMainContent, 100);
                return;
            }

            const inicio = Date.now();
            
            const intentarOcultar = () => {
                const transcurrido = Date.now() - inicio;
                const restante = Math.max(0, TIME_MIN_LOADER_LIFE - transcurrido);
                // Agregamos un segundo de margen para asegurar que las animaciones respiren
                setTimeout(this.showMainContent, restante + 1000);
            };

            // Pre-carga controlada (Solo las 2 primeras para prioridad)
            const primeras = imagenes.slice(0, 2);
            let cargadas = 0;

            primeras.forEach((src) => {
                const img = new Image();
                img.src = src;
                img.onload = img.onerror = () => {
                    cargadas++;
                    if (cargadas === primeras.length) intentarOcultar();
                };
            });

            // El resto carga en background
            imagenes.slice(2).forEach(src => {
                const img = new Image();
                img.src = src;
            });
        },
    },
};
</script>

<style scoped>
.preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* La transición se pisa por JS para coincidir con la variable */
    font-family: 'Cinzel', serif;
}

.preloader.slide-up {
    transform: translateY(-100%);
}

.text-container {
    position: relative;
    text-align: center;
}

.base-text {
    color: black;
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
    z-index: 1;
}

.reveal-bar.animate {
    /* La duración aquí debe coincidir con TIME_BAR_ANIMATION */
    animation: revealAnimation 1s ease-out forwards;
}

.revealed-name {
    color: white;
    font-weight: bold;
    font-size: 8vw;
    opacity: 0;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    z-index: 2;
}

.revealed-name.show {
    opacity: 1;
}

@keyframes revealAnimation {
    from { width: 0%; }
    to { width: 110%; }
}

@media (min-width: 768px) {
    .base-text { font-size: 5vw; }
    .revealed-name { font-size: 1.5vw; }
}
</style>