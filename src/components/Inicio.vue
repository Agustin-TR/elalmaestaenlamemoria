<template>
    <div id="content-container">
        
        <transition name="bg-fade">
            <div 
                v-if="currentBgUrl" 
                :key="currentBgUrl"
                class="background-layer" 
                :style="backgroundStyle"
            ></div>
        </transition>

        <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
            <div class="list-wrapper">
                <ul id="itemList">
                    <li v-for="(item, index) in itemsData" :key="item.id" :ref="el => setItemRef(el)"
                        :class="{ 'item-activo': index === activeItemIndex }" @click="handleItemClick($event, index)">
                        <div class="item-content">
                            <h2>{{ item.title }}</h2>
                        </div>
                    </li>

                    <li class="scroll-to-top-item" @click="scrollToTop">
                        <div class="item-content">
                            <h2><i class="bi bi-arrow-up"></i></h2>
                        </div>

                        <button class="btn-compra" @click.stop="comprar">
                            Quiero el mío
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div id="detalle" v-if="detalle.text" :style="{ top: detalle.top, opacity: detalle.isVisible ? 1 : 0 }">
            <p>{{ detalle.text }}</p>
        </div>
    </div>
</template>

<script>
import { dataPoemas } from '@/data/poemas.js';
import { nextTick } from 'vue';

export default {
    name: "Inicio",
    inject: ['openPaymentModal'],
    data() {
        return {
            itemsData: dataPoemas,
            activeItemIndex: 0,
            detalle: {
                isVisible: false,
                text: '',
                top: '0px',
            },
            itemRefs: [],
            scrollHandler: null,
            globalClickHandler: null,
            BASE_URL: import.meta.env.BASE_URL,

            // estado para el fondo actual y cola de preload
            currentBgUrl: null,
            preloadQueue: [],        // cola de URLs a precargar
            isProcessingQueue: false,
            imageCache: null,        // Set para URLs ya precargadas
            destroyed: false,
        };
    },

    computed: {
        backgroundStyle() {
            if (this.currentBgUrl) {
                return {
                    backgroundImage: `url(${this.currentBgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                };
            }
            return {};
        }
    },

    methods: {

        /* RUTINAS AUXILIARES */

        getImagePath(imagePath) {
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },

        /* CARGA INTELIGENTE DEL FONDO */

        async loadAndSetBackground(index) {
            if (index == null) return;
            if (index < 0 || index >= this.itemsData.length) return;

            const rawBg = this.itemsData[index].bg;
            const url = this.getImagePath(rawBg);

            // Si ya está en cache interno, asignar rápido
            if (this.imageCache.has(url)) {
                this.currentBgUrl = url;
                return;
            }

            try {
                const img = new Image();
                img.src = url;

                // decode puede no existir en navegadores antiguos; hacemos fallback
                const decodePromise = img.decode
                    ? img.decode()
                    : new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve; // si falla, resolvemos igualmente
                    });

                await decodePromise;

                // Guardamos en cache y aplicamos fondo solo si el componente sigue vivo
                if (!this.destroyed) {
                    this.imageCache.add(url);
                    this.currentBgUrl = url;
                }
            } catch (e) {
                // Si algo falla, aplicamos igual para no bloquear UX
                if (!this.destroyed) {
                    this.imageCache.add(url);
                    this.currentBgUrl = url;
                }
            }
        },

        /* PRELOAD EN COLA (SERIAL) PARA NO SATURAR */

        enqueuePreload(url) {
            if (!url) return;
            if (this.imageCache.has(url)) return; // ya cargada
            if (this.preloadQueue.includes(url)) return; // ya en cola

            this.preloadQueue.push(url);

            // arrancar procesador si está detenido
            if (!this.isProcessingQueue) {
                this.processPreloadQueue();
            }
        },

        async processPreloadQueue() {
            if (this.isProcessingQueue) return;
            this.isProcessingQueue = true;

            while (this.preloadQueue.length && !this.destroyed) {
                const url = this.preloadQueue.shift();
                if (!url) continue;
                if (this.imageCache.has(url)) continue;

                try {
                    const img = new Image();
                    img.src = url;

                    const decodePromise = img.decode
                        ? img.decode()
                        : new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });

                    // Esperamos la decodificación para aliviar el trabajo del renderer
                    await decodePromise;

                    if (!this.destroyed) {
                        this.imageCache.add(url);
                    }
                } catch (e) {
                    // Ignorar errores y continuar con la siguiente imagen
                    if (!this.destroyed) {
                        this.imageCache.add(url); // marcar como intentada
                    }
                }
            }

            this.isProcessingQueue = false;
        },

        /* Precarga ligera: anterior, actual, siguiente */

        smartNeighborsPreload(index) {
            if (index == null) return;
            const total = this.itemsData.length;

            const indices = [index - 1, index, index + 1];
            indices.forEach(i => {
                if (i >= 0 && i < total) {
                    const raw = this.itemsData[i].bg;
                    const url = this.getImagePath(raw);
                    this.enqueuePreload(url);
                }
            });
        },

        /* SISTEMA DE ITEMS + SCROLL */

        setItemRef(el) {
            if (el && !this.itemRefs.includes(el)) {
                this.itemRefs.push(el);
            }
        },

        updateActiveItem() {
            const container = this.$refs.scrollContainer;
            const items = this.itemRefs.filter(Boolean);
            if (!container || items.length === 0) return;

            let closestIndex = null;
            let minDistance = Infinity;

            const containerRect = container.getBoundingClientRect();
            const containerCenterY = containerRect.top + container.clientHeight / 2;

            items.forEach((itemEl, i) => {
                const rect = itemEl.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - containerCenterY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });

            if (closestIndex !== this.activeItemIndex) {
                this.activeItemIndex = closestIndex;
                this.detalle.isVisible = false;

                // Carga segura del fondo (decodifica antes de aplicar)
                this.loadAndSetBackground(closestIndex);

                // Precarga escalonada y serializada de vecinos
                this.smartNeighborsPreload(closestIndex);
            }
        },

        handleScroll() {
            this.detalle.isVisible = false;

            if (!this.scrollHandler) {
                this.scrollHandler = requestAnimationFrame(() => {
                    this.updateActiveItem();
                    this.scrollHandler = null;
                });
            }
        },

        handleItemClick(event, itemIndex) {
            const itemEl = event.currentTarget;
            const itemData = this.itemsData[itemIndex];

            if (itemIndex !== this.activeItemIndex) {
                this.scrollToItem(itemEl);
                this.detalle.isVisible = false;
                return;
            }

            const rect = itemEl.getBoundingClientRect();
            const newText = itemData.detalle.replace(/\\n/g, '\n');

            if (this.detalle.isVisible && this.detalle.text === newText) {
                this.detalle.isVisible = false;
            } else {
                this.detalle.text = newText;
                this.detalle.top = `${rect.bottom + 15}px`;
                this.detalle.isVisible = true;
            }
        },

        findClosestToCenter() {
            const container = this.$refs.scrollContainer;
            const items = this.itemRefs.filter(Boolean);
            if (!container || items.length === 0) return null;

            const containerRect = container.getBoundingClientRect();
            const centerY = containerRect.top + container.clientHeight / 2;
            let closestIndex = null;
            let minDistance = Infinity;

            items.forEach((item, index) => {
                const r = item.getBoundingClientRect();
                const d = Math.abs((r.top + r.height / 2) - centerY);
                if (d < minDistance) {
                    minDistance = d;
                    closestIndex = index;
                }
            });
            return items[closestIndex] || null;
        },

        scrollToItem(itemEl) {
            const container = this.$refs.scrollContainer;
            if (!container || !itemEl) return;

            const containerRect = container.getBoundingClientRect();
            const itemRect = itemEl.getBoundingClientRect();

            const itemOffsetTop = container.scrollTop + (itemRect.top - containerRect.top);

            const target = Math.max(
                0,
                Math.round(itemOffsetTop - (container.clientHeight / 2) + (itemEl.clientHeight / 2))
            );

            container.scrollTo({ top: target, behavior: 'smooth' });
        },

        handleGlobalClick(event) {
            if (event.target.closest('#preloader')) return;
            if (event.target.closest('a, button, input, textarea, select')) return;
            if (event.target.closest('#detalle')) return;

            const clickedItem = event.target.closest('#itemList li');
            if (clickedItem && this.itemRefs[this.activeItemIndex] === clickedItem) return;

            this.detalle.isVisible = false;

            const activeItemEl = this.itemRefs[this.activeItemIndex] || this.findClosestToCenter();
            let nextItem = null;

            if (activeItemEl) {
                let currentIndex = this.itemRefs.indexOf(activeItemEl);
                if (currentIndex !== -1 && currentIndex < this.itemRefs.length - 1) {
                    nextItem = this.itemRefs[currentIndex + 1];
                }
            }

            if (nextItem) {
                this.scrollToItem(nextItem);
            } else {
                const first = this.itemRefs[0];
                if (first) this.scrollToItem(first);
            }
        },

        scrollToTop() {
            this.$refs.scrollContainer?.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            this.detalle.isVisible = false;
        },
        comprar() {
            this.openPaymentModal('printed');
        }
    },

    mounted() {
        // Inicializamos cache no reactiva
        this.imageCache = new Set();
        this.destroyed = false;

        this.$refs.scrollContainer?.addEventListener('scroll', this.handleScroll, { passive: true });

        this.globalClickHandler = this.handleGlobalClick.bind(this);
        document.addEventListener('click', this.globalClickHandler);

        nextTick(() => {
            this.updateActiveItem();

            // Carga inicial: fondo seguro para el item que quedó activo + vecinos
            this.loadAndSetBackground(this.activeItemIndex);
            this.smartNeighborsPreload(this.activeItemIndex);
        });
    },

    beforeUnmount() {
        this.destroyed = true;
        this.$refs.scrollContainer?.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('click', this.globalClickHandler);
        if (this.scrollHandler) {
            cancelAnimationFrame(this.scrollHandler);
            this.scrollHandler = null;
        }

        // limpiar cola
        this.preloadQueue = [];
    },
};
</script>

<style scoped>
/* ========= INICIO ========= */

#content-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: black;
}

/* ========= BACKGROUND LAYER & TRANSITION ========= */

.background-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}

/* Definición de la transición "bg-fade" */
.bg-fade-enter-active,
.bg-fade-leave-active {
    transition: opacity 1s ease-in-out;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
    opacity: 0;
}

/* IMPORTANTE: Posicionamiento absoluto para que se superpongan durante el fade */
.bg-fade-enter-active {
    position: absolute; 
}


/* ========= SCROLL CONTAINER ========= */

.scroll-container {
    position: absolute;
    inset: 0;
    overflow-y: scroll;
    padding: 0;
    z-index: 1; /* Encima del fondo */
}

/* Para navegadores WebKit (Chrome, Safari) */
.scroll-container::-webkit-scrollbar {
    display: none;
}

/* ========= ITEM LIST ========= */

.list-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

ul#itemList {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 1000px;
    padding: 40vh 5vw 10vh 5vw;
    /*top - right - bottom - left*/
}

ul#itemList li.item-activo {
    color: #fff;
    filter: none;
    position: relative;
    cursor: pointer;
    pointer-events: all;
}

ul#itemList li {
    margin: 4rem 0;
    font-size: 1.5rem;
    line-height: 1.4;
    text-align: center;
    color: #736767;
    transition: color 0.3s ease, filter 0.4s ease;
    filter: blur(1.5px);
    cursor: default;
    pointer-events: none;
}

/*Volver Arriba*/
ul#itemList li.scroll-to-top-item {
    pointer-events: all;
    cursor: pointer;
    color: #f5f5f5;
    transition: color 0.3s ease;
    filter: none;
    margin: 4rem 0;
}

ul#itemList li.scroll-to-top-item h2 {
    font-size: 5rem;
    line-height: 1;
}

/* BOTÓN COMPRA GLOBAL */
.btn-compra {
    background-color: #005f6a;
    color: white;
    border: 1px solid white;
    padding: 0.8rem 1.8rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 2rem;
    transition: transform 0.3s ease;
}
.btn-compra:hover {
    transform: scale(1.1);
    background-color: #003f48;
}

/* ========= DETALLE ========= */

#detalle {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.6);
    padding: 1rem 1rem;
    border-radius: 8px;
    color: #f5f5f5;
    font-style: italic;
    line-height: 1.6;
    max-width: 100vw;
    width: 70vw;
    z-index: 10;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
    white-space: pre-line;
    opacity: 0;
    /*inicial*/
    transition: opacity 0.4s ease, transform 0.3s ease;
    pointer-events: none;
}

p {
    margin: 0 0;
}

#detalle[style*="opacity: 1"] {
    pointer-events: all;
}

/*BARRA SCROLL COMPU*/
@media (min-width: 1024px) {

    .scroll-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(115, 103, 103, 0.5) rgba(0, 0, 0, 0.3);
    }

    /* Habilitamos la barra en WebKit */
    .scroll-container::-webkit-scrollbar {
        display: block;
        width: 15px;
    }

    .scroll-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
    }

    /*el scroll */
    .scroll-container::-webkit-scrollbar-thumb {
        background-color: rgba(115, 103, 103, 0.5);
        border-radius: 6px;
        border: 4px solid transparent;
        background-clip: content-box;
    }

    .scroll-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(115, 103, 103, 0.9);
    }
}
</style>