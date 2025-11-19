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
                // Usamos el ID del contenedor para asegurar que el fondo se aplica
                return { 
                    backgroundImage: `url(${bgUrl})`,
                    // Asegurar que el fondo cubre todo el contenedor
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }; 
            }
            return {};
        }
    },
    methods: {
        getImagePath(imagePath) {
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },
        
        setItemRef(el, index) {
            // Limpia el array itemRefs al principio, solo si hay datos.
            if (index === 0) {
                 this.itemRefs = new Array(this.itemsData.length).fill(null);
            }
            if (el) {
                this.itemRefs[index] = el;
            }
        },

        updateActiveItem() {
            const container = this.$refs.scrollContainer;
            // Solo considerar refs que son elementos DOM
            const items = this.itemRefs.filter(Boolean); 
            if (!container || items.length === 0) return;

            let closestIndex = null;
            let minDistance = Infinity;
            
            // CORRECCIÓN: Usamos el centro del CONTENEDOR de scroll, no de la ventana
            const containerRect = container.getBoundingClientRect();
            const containerCenterY = containerRect.top + container.clientHeight / 2;

            items.forEach((itemEl, i) => {
                const rect = itemEl.getBoundingClientRect();
                // Distancia entre el centro del item y el centro del contenedor
                const distance = Math.abs(rect.top + rect.height / 2 - containerCenterY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });

            if (closestIndex !== this.activeItemIndex) {
                this.activeItemIndex = closestIndex;
                this.detalle.isVisible = false; 
            }
        },

        handleScroll() {
            // Cancelar el detalle al hacer scroll
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

            // 1. Desplazar el item clickeado al centro si no es el activo
            if (itemIndex !== this.activeItemIndex) {
                 this.scrollToItem(itemEl);
                 // Oculta el detalle por si acaso se estaba mostrando otro
                 this.detalle.isVisible = false;
                 return; // Esperar a que termine el scroll y se active el item
            }
            
            // 2. Si es el activo, muestra/oculta el detalle
            const rect = itemEl.getBoundingClientRect();
            const newText = itemData.detalle.replace(/\\n/g, '\n');
            
            if (this.detalle.isVisible && this.detalle.text === newText) {
                this.detalle.isVisible = false; // Ocultar
            } else {
                this.detalle.text = newText;
                this.detalle.top = `${rect.bottom + 15}px`; // Un poco más de espacio
                this.detalle.isVisible = true; 
            }
        },
        
        // ... (findClosestToCenter y scrollToItem están bien, no los alteramos)
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
            
            // Centrar: itemOffsetTop - (mitad del contenedor) + (mitad del item)
            const target = Math.max(0, Math.round(itemOffsetTop - (container.clientHeight / 2) + (itemEl.clientHeight / 2)));
            
            container.scrollTo({ top: target, behavior: 'smooth' });
        },

        handleGlobalClick(event) {
            // Exclusiones
            if (event.target.closest('#preloader')) return;
            if (event.target.closest('a, button, input, textarea, select')) return;
            // Si se hace click en el overlay #detalle, no hacer nada
            if (event.target.closest('#detalle')) return;

            // Si se hizo click en el item activo, ignorar (el handleItemClick lo gestiona)
            const clickedItem = event.target.closest('#itemList li');
            if (clickedItem && this.itemRefs[this.activeItemIndex] === clickedItem) return; 
            
            // Ocultar el detalle si estaba visible y no se hace click sobre él
            this.detalle.isVisible = false;

            // Lógica de scroll
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
        // Asegúrate de que el contenedor de scroll exista antes de añadir el listener
        this.$refs.scrollContainer?.addEventListener('scroll', this.handleScroll);
        
        this.globalClickHandler = this.handleGlobalClick.bind(this);
        document.addEventListener('click', this.globalClickHandler);

        // Inicializar tras el render para obtener posiciones
        nextTick(() => {
             this.updateActiveItem();
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
    position: absolute; /* Usamos absolute si el padre es #content-container */
    inset: 0; 
    overflow-y: scroll;
    padding: 0; /* saco el padding y lo ponemos en list-wrapper/ul */
    z-index: 0;
}

/* Para navegadores WebKit (Chrome, Safari) */
.scroll-container::-webkit-scrollbar {
    display: none;
}

/* ========= ITEM LIST ========= */

.list-wrapper {
    /* Esto ayuda a centrar verticalmente la lista en el scroll-container */
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
    max-width: 800px;
    padding-top: 50vh;
    padding-bottom: 50vh; 
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
    pointer-events: none; /* No permite clicks a menos que esté activo */
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

/* El espaciador final es esencial para centrar el último elemento */
.padding-bottom-spacer {
    height: 5vh; 
    width: 100%;
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
    max-width: 80vw;
    z-index: 10;
    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
    white-space: pre-line;
    opacity: 0; /*inicial*/
    transition: opacity 0.4s ease, top 0.3s ease;
    pointer-events: none;
}

#detalle[style*="opacity: 1"] {
    pointer-events: all;
}

</style>