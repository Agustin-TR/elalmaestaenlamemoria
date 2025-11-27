<template>
  <div id="content-container" :style="backgroundStyle">
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">

      <div class="list-wrapper">
        <ul id="itemList">
          <li 
            v-for="(item, index) in itemsData" 
            :key="item.id" 
            :ref="el => setItemRef(el, index)"
            :class="{ 'item-activo': index === activeItemIndex }" 
            @click="handleItemClick($event, index)"
          >
            <div class="item-content">
              <h2>{{ item.title }}</h2>
            </div>
          </li>

          <li class="scroll-to-top-item" @click="scrollToTop">
            <div class="item-content">
              <h2><i class="bi bi-arrow-up"></i></h2>
            </div>
          </li>
        </ul>
      </div>

      <div class="padding-bottom-spacer"></div>
    </div>

    <div 
      id="detalle" 
      v-if="detalle.text" 
      :style="{ top: detalle.top, opacity: detalle.isVisible ? 1 : 0 }"
    >
      <p>{{ detalle.text }}</p>
    </div>
  </div>
</template>


<script>
import { dataPoemas } from '@/data/poemas.js';
import { nextTick } from 'vue';

export default {
    name: "Inicio",
    data() {
        return {
            itemsData: dataPoemas,
            activeItemIndex: null,
            detalle: {
                isVisible: false,
                text: '',
                top: '0px',
            },
            itemRefs: [],
            scrollHandler: null, 
            globalClickHandler: null,
            BASE_URL: import.meta.env.BASE_URL,
        };
    },

    computed: {
        backgroundStyle() {
            if (this.activeItemIndex !== null) {
                const rawBgUrl = this.itemsData[this.activeItemIndex].bg;
                const bgUrl = this.getImagePath(rawBgUrl);
                return { 
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }; 
            }
            return {};
        }
    },

    methods: {

        /* ======================================================
         *   PRELOAD DE IMÁGENES
         * ====================================================== */

        getImagePath(imagePath) {
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },

        preloadImagesInRange(start, end) {
            const total = this.itemsData.length;

            const s = Math.max(0, start);
            const e = Math.min(end, total - 1);

            for (let i = s; i <= e; i++) {
                const raw = this.itemsData[i].bg;
                const url = this.getImagePath(raw);

                const img = new Image();
                img.src = url; // Esto lo mete en caché automáticamente
            }
        },

        progressivePreload(index) {
            if (index === null) return;
            
            // Precarga anticipada
            const before = 1;
            const after = 3;

            const start = index - before;
            const end = index + after;

            this.preloadImagesInRange(start, end);
        },

        /* ======================================================
         *   SISTEMA DE ITEMS + SCROLL
         * ====================================================== */

        setItemRef(el, index) {
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

                //PRELOAD PROGRESIVO
                this.progressivePreload(closestIndex);
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
    },

    mounted() {
        this.$refs.scrollContainer?.addEventListener('scroll', this.handleScroll, { passive: true });
        
        this.globalClickHandler = this.handleGlobalClick.bind(this);
        document.addEventListener('click', this.globalClickHandler);

        nextTick(() => {
            this.updateActiveItem();

            //PRELOAD INICIAL: primeras 3 imágenes
            this.preloadImagesInRange(0, 2);
        });
    },

    beforeUnmount() {
        this.$refs.scrollContainer?.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('click', this.globalClickHandler);
        if (this.scrollHandler) {
            cancelAnimationFrame(this.scrollHandler);
        }
    },
};
</script>


<style scoped>

/* ========= INICIO ========= */

#content-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden; /* Mantiene el scroll dentro de .scroll-container */
    background-color: black;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    transition: background-image 0.4s linear;
}

/* ========= SCROLL CONTAINER ========= */

.scroll-container {
    position: absolute;
    inset: 0; 
    overflow-y: scroll;
    padding: 0;
    z-index: 0;
}

/* Para navegadores WebKit (Chrome, Safari) */
.scroll-container::-webkit-scrollbar {
    display: none;
}

/* ========= ITEM LIST ========= */

.list-wrapper {
    /* centrar verticalmente */
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
    padding: 40vh 5vw 30vh 5vw; /*top - right - bottom - left*/
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
    margin: 8rem 0;
}

ul#itemList li.scroll-to-top-item h2 {
    font-size: 5rem;
    line-height: 1;
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
    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
    white-space: pre-line;
    opacity: 0; /*inicial*/
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