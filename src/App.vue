<template>

    <Preloader />

    <div class="main-app-container" id="main-content">
        <Header :seccion-activa="$route.path.substring(1)" @cambiar-seccion="handleCambiarSeccion" />
        <div class="content-container">
            <RouterView v-slot="{ Component }">
                <Transition :name="animacionDireccion" mode="out-in">
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

const ordenRutas = ["/galeria", "/inicio", "/info"];

export default {
    name: "App",
    components: {
        Header,
        Preloader
    },
    data() {
        return {
            ordenRutas: ordenRutas
        };
    },
    methods: {
        // Función que maneja la navegación desde el componente Header.
        handleCambiarSeccion(targetId) {
            this.$router.push({ path: `/${targetId}` });
        },
    },
    computed: {
        // Propiedad computada que determina el nombre de la transición (ej. 'slide-up').
        animacionDireccion() {
            // Accedemos al estado del historial directamente desde $router.options.history.state
            const routerHistoryState = this.$router.options.history.state;

            // Si la aplicación acaba de cargar, no hay historial y no se anima.
            if (!routerHistoryState.back) {
                return 'no-animation';
            }

            const currentPath = this.$route.path;
            // Intentamos obtener la ruta previa del historial.
            const previousPath = routerHistoryState.back ? routerHistoryState.back.split('?')[0] : '';

            const indexActual = this.ordenRutas.indexOf(currentPath);
            const indexPrevio = this.ordenRutas.indexOf(previousPath);

            // Si la nueva ruta tiene un índice mayor, vamos hacia abajo/subiendo (slide-up).
            if (indexActual > indexPrevio) {
                return 'slide-up';
            }
            // Si la nueva ruta tiene un índice menor, vamos hacia arriba/bajando (slide-down).
            else if (indexActual < indexPrevio) {
                return 'slide-down';
            }

            return 'slide-default';
        },
    },
    mounted() {
        // Nada adicional.
    },
};
</script>

<style>
/* ========================================================
    ESTILOS GLOBALES Y DE TRANSICIÓN
    ========================================================
*/
html,
body,
.main-app-container {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden; /* Evita el scroll global */
}

/* Oculta el contenido principal por defecto. El Preloader lo pondrá en opacity: 1 al terminar. */
#main-content {
    opacity: 0;
    transition: opacity 1s ease-out;
}

/* Contenedor principal de las vistas. Ocupa toda la pantalla. */
.content-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

/* Wrapper de cada vista del router. Es absoluto para que las transiciones funcionen. */
.router-view-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    /* Permite el scroll dentro de cada sección (Inicio, Galeria, etc.). */
}

/* ------------------------------------------------ */
/* --- CLASES DE TRANSICIÓN DE SLIDE UP (Subiendo) --- */
/* ------------------------------------------------ */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.8s ease-in-out;
}

/* Estado inicial de la nueva vista (entra) */
.slide-up-enter-from {
    transform: translateY(100vh);
    /* La nueva entra desde abajo */
}

/* Estado final de la vista vieja (sale) */
.slide-up-leave-to {
    transform: translateY(-100vh);
    /* La vieja sale por arriba */
}

/* ------------------------------------------------- */
/* --- CLASES DE TRANSICIÓN DE SLIDE DOWN (Bajando) --- */
/* ------------------------------------------------- */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.8s ease-in-out;
}

/* Estado inicial de la nueva vista (entra) */
.slide-down-enter-from {
    transform: translateY(-100vh);
    /* La nueva entra desde arriba */
}

/* Estado final de la vista vieja (sale) */
.slide-down-leave-to {
    transform: translateY(100vh);
    /* La vieja sale por abajo */
}

/* Asegura que los estados finales y de reposo no tengan transformaciones */
.slide-up-enter-to,
.slide-up-leave-from,
.slide-down-enter-to,
.slide-down-leave-from,
.no-animation-enter-to,
.no-animation-leave-from {
    transform: translateY(0);
}
</style>