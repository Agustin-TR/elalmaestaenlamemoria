<template>
    <!-- Preloader (igual que el HTML original) -->
    <div class="preloader" id="preloader" v-if="preloaderVisible" :class="{ 'slide-up': slideUpActive }"
        ref="preloaderEl">
        <div class="text-container">
            <h1 class="base-text" id="baseText" :class="{ show: baseTextShow }">El alma está en la memoria</h1>
            <div class="reveal-bar" id="revealBar" :class="{ animate: revealBarAnimate }" ref="revealBarEl">
                <span class="revealed-name" id="revealedName" :class="{ show: revealedNameShow }"
                    ref="revealedNameEl">Agustin Rojas</span>
            </div>
        </div>
    </div>
</template>

<script>
const SLIDE_UP_TIME = 1; // segundos - coincide con la transición CSS

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
        // Iniciamos la lógica del preloader al montar el componente
        this.initPreloader();

        // Registramos listener para el load (preload de imágenes)
        // Usamos addEventListener para respetar el comportamiento original.
        if (document.readyState === "complete") {
            // Si el load ya ocurrió, ejecutamos directamente el handler
            this.handleWindowLoad();
        } else {
            window.addEventListener("load", this.handleWindowLoad);
        }
    },
    beforeUnmount() {
        // Limpiamos listener
        window.removeEventListener("load", this.handleWindowLoad);
    },
    methods: {
        startAnimationSequence() {
            const barAnimationDuration = 1000; // ms (coincide con CSS animation 1s)
            const finalDelay = 1000; // ms

            // Inicia la animación de la barra
            this.revealBarAnimate = true;

            // Mostramos el nombre poco después (pequeño offset)
            setTimeout(() => {
                this.revealedNameShow = true;
            }, 100);

            // Luego de la animación de barra + finalDelay hacemos slide-up y removemos
            setTimeout(() => {
                // activamos la clase slide-up (usa transition transform 1s en CSS)
                this.slideUpActive = true;

                // Tras el tiempo de slide up, quitamos el preloader del DOM (v-if)
                setTimeout(() => {
                    this.preloaderVisible = false;

                    // Restauramos scroll y mostramos el contenido principal
                    document.body.style.overflow = "auto";
                    const main = document.getElementById("main-content");
                    if (main) main.style.opacity = 1;
                }, SLIDE_UP_TIME * 1000);

            }, barAnimationDuration + finalDelay);
        },

        initPreloader() {
            if (sessionStorage.getItem("preloaderShown")) {
                // Si ya se mostró en esta sesión, lo eliminamos y mostramos la app
                this.preloaderVisible = false;
                document.body.style.overflow = "auto";
                const main = document.getElementById("main-content");
                if (main) main.style.opacity = 1;
                return;
            }

            // Marcamos que se mostró en sessionStorage
            sessionStorage.setItem("preloaderShown", "true");

            // Aseguramos la transición del elemento preloader (igual que en original)
            const preloader = this.$refs.preloaderEl;
            if (preloader) {
                preloader.style.transition = `transform ${SLIDE_UP_TIME}s ease-in-out`;
            }

            const FADE_IN_TIME = 200; // ms
            const ANIMATION_START_DELAY = 2000; // ms

            setTimeout(() => {
                // Mostrar texto base
                this.baseTextShow = true;

                // Iniciar secuencia principal tras delay
                setTimeout(() => {
                    this.startAnimationSequence();
                }, ANIMATION_START_DELAY);
            }, FADE_IN_TIME);
        },

        // Manejo del evento 'load' para pre-cargar imágenes
        handleWindowLoad() {
            const imagenes = Array.from(document.querySelectorAll("li"))
                .map((item) => item.getAttribute("data-bg"))
                .filter(Boolean);

            if (imagenes.length === 0) {
                setTimeout(() => {
                    const main = document.getElementById("main-content");
                    document.body.style.overflow = "auto";
                    if (main) main.style.opacity = 1;
                }, 100);
                return;
            }

            const inicio = Date.now();
            const tiempoMinimo = 5000; // ms
            const mostrarContenido = () => {
                const main = document.getElementById("main-content");
                document.body.style.overflow = "auto";
                if (main) main.style.opacity = 1;
            };

            const intentarOcultar = () => {
                const tiempoTranscurrido = Date.now() - inicio;
                const restante = Math.max(0, tiempoMinimo - tiempoTranscurrido);
                setTimeout(mostrarContenido, restante + 1000);
            };

            // Cargamos solo las primeras 5 imágenes para el preloader
            const primeras = imagenes.slice(0, 5);
            let cargadas = 0;

            primeras.forEach((src) => {
                const img = new Image();
                img.src = src;
                img.onload = img.onerror = () => {
                    cargadas++;
                    if (cargadas === primeras.length) {
                        intentarOcultar();
                    }
                };
            });

            // Cargamos el resto en segundo plano sin bloquear
            const restantes = imagenes.slice(5);
            restantes.forEach((src) => {
                const img = new Image();
                img.src = src;
                // No hacemos nada con onload/onerror aquí
            });
        },

    },
};
</script>

<style scoped>
/* ========= PRELOADER ========= */
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
    transition: transform 1s ease-in-out;
    font-family: 'Cinzel', serif;
}

/* Slide up final */
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
    from {
        width: 0%;
    }

    to {
        width: 110%;
    }
}

.reveal-bar.animate {
    animation: revealAnimation 1s ease-out forwards;
}

@media (min-width: 768px) {
    .base-text {
        font-size: 5vw;
    }

    .revealed-name {
        font-size: 1.5vw;
    }
}
</style>
