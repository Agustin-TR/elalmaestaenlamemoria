<template>

    <Preloader />

    <div class="main-app-container" id="main-content">
        <Header :seccion-activa="$route.path.substring(1)" @cambiar-seccion="handleCambiarSeccion" />
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
        // Función que maneja la navegación desde el componente Header.
        handleCambiarSeccion(targetId) {
            this.$router.push({ path: `/${targetId}` });
        },
    },
    computed: {
        animacionDireccion() {
            const currentPath = this.$route.path;
            const previousPath = this.previousRoutePath; //watcher

            if (!previousPath) {
                return 'no-animation';
            }

            const indexActual = this.ordenRutas.indexOf(currentPath);
            // Aseguramos que la ruta anterior esté en nuestro orden definido.
            const indexPrevio = this.ordenRutas.indexOf(previousPath);

            if (indexActual === -1 || indexPrevio === -1) {
                 return 'no-animation';
            }
            
            if (indexActual > indexPrevio) {
                return 'slide-up';
            }
            else if (indexActual < indexPrevio) {
                return 'slide-down';
            }

            return 'no-animation'; // Si los índices son iguales o no hay cambio.
        },
    },
    mounted() {
        // Al montar, inicializamos la ruta previa con la ruta actual para que no anime.
        this.previousRoutePath = this.$route.path;
    },
};
</script>

<style>
/* ========================================================
    ESTILOS GLOBALES Y DE TRANSICIÓN
    ========================================================
*/
html,
body{ 
  margin: 0;
  padding: 0;
  height: 100%;
}

.main-app-container,
.content-container,
.router-view-wrapper {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    overflow: hidden; /* Evita el scroll global */
}

@supports (-webkit-touch-callout: none) {
  .main-app-container,
  .content-container,
  .router-view-wrapper {
    min-height: -webkit-fill-available; /* ocupa todo el alto real en iOS Safari */
  }
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