<template>
  <!-- Agregamos ref="galeriaRoot" para acceder a este elemento desde JS -->
  <div class="galeria-wrapper" ref="galeriaRoot"> 
    <!-- Sección galeria -->
    <section class="pantalla section-galeria" id="galeria">
      <div class="galeria-grid">
        
        <div class="foto" v-for="item in galeriaItems" :key="item.id">
          
          <div class="foto-imagen">
            <img :src="item.src" :alt="item.poema" />
            
            <a :href="item.instaLink" 
               target="_blank" 
               rel="noopener" 
               class="overlay-link">
              <span>{{ item.instaHandle }}</span>
            </a>
          </div>
          
          <div class="foto-texto">
            <p class="poema">{{ item.poema }}</p>
            <p class="fotografo">{{ item.fotografo }}</p>
          </div>
        </div>
        
      </div>
    </section>

    <!-- Créditos -->
    <div class="creditos">
      <h2>Colaboradores</h2>
      <ul>
        <li>
          <h3>Autor</h3>
        </li>
        <li>Agustin Rojas</li>
        <br>
        <li>
          <h3>Diseño y edición</h3>
        </li>
        <li>Paula KemPfert</li>
        <br>
        <li>
          <h3>Fotografía</h3>
        </li>
        <div v-for="f in fotografos" :key="f.id">
          <p>{{ f.nombre }}</p>
        </div>

      </ul>
    </div>
  </div>
</template>

<script>
import { dataPoemas } from '@/data/poemas.js';
import { dataFotografos } from '@/data/fotografos';

export default {
    name: "Galeria",
    data() {
        return {
            poemas: dataPoemas, 
            fotografos: dataFotografos,
            activeContainer: null,
            tapTimeout: null,
            BASE_URL: import.meta.env.BASE_URL, // variable de entorno url
        };
    },
    mounted() {
        // Ejecuta la lógica de doble toque cuando el componente se monta en el DOM
        this.setupTouchInteraction();
    },
    methods: {
        // método para prefijar la ruta base a la ruta de la imagen.
        // Esto transforma 'img/casa.JPG' en '/elalmaestaenlamemoria/img/casa.JPG'
        getImagePath(imagePath) {
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },
        //crea el mapa de búsqueda rápida
        crearFotografosMap() {
            return this.fotografos.reduce((map, fotografo) => {
                map[fotografo.id] = fotografo;
                return map;
            }, {});
        },
        // ---------- LÓGICA DE DOBLE TOQUE EN CELULAR ----------
        setupTouchInteraction() {
            const rootElement = this.$refs.galeriaRoot;
            
            if (!rootElement) return;

            const fotoContainers = rootElement.querySelectorAll('.foto'); 
            
            let activeContainer = null; 
            let tapTimeout = null;
            
            const isTouchDevice = window.matchMedia('(hover: none)').matches || 
                                     ('ontouchstart' in window);

            if (!isTouchDevice) {
                return; 
            }

            fotoContainers.forEach(container => {
                const link = container.querySelector('.overlay-link');
                if (!link) return; 

                container.addEventListener('click', (e) => {
                    e.preventDefault(); 

                    if (activeContainer !== container) {
                        // --- Primer Toque: Mostrar Overlay ---

                        if (activeContainer) {
                            activeContainer.classList.remove('activo');
                            clearTimeout(tapTimeout);
                        }
                        
                        container.classList.add('activo');
                        activeContainer = container;

                        tapTimeout = setTimeout(() => {
                            container.classList.remove('activo');
                            activeContainer = null;
                        }, 2500); 

                    } else {
                        // --- Segundo Toque: Ir al Enlace ---

                        clearTimeout(tapTimeout);
                        container.classList.remove('activo');
                        activeContainer = null;

                        window.open(link.href, '_blank');
                    }
                });
            });

            // Clic o tap fuera de una imagen → ocultar overlays activos
            document.addEventListener('click', (e) => {
                if (activeContainer && !e.target.closest('.foto')) { 
                    activeContainer.classList.remove('activo');
                    activeContainer = null;
                    clearTimeout(tapTimeout);
                }
            });
        },
    },
    computed: {
        galeriaItems() {
            // Creamos el mapa de fotógrafos
            const fotografosMap = this.crearFotografosMap(); 

            // Unimos los datos
            return this.poemas.map(poema => {
                const fotografoInfo = fotografosMap[poema.fotografoId] || { 
                    nombre: 'Anónimo', 
                    instaHandle: 'N/A', 
                    instaLink: '#' 
                };

                return {
                    id: poema.id,
                    poema: poema.title, 
                    // FUNCIÓN DE RUTA
                    src: this.getImagePath(poema.bg),
                    fotografo: fotografoInfo.nombre,
                    instaHandle: fotografoInfo.instaHandle,
                    instaLink: fotografoInfo.instaLink,
                };
            });
        },
    },
};
</script>

<style scoped>
/* ========= GALERIA ========= */

.section-galeria {
  background-color: white;
  text-align: left;
}

.galeria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  column-gap: 2rem;
  row-gap: 3.5rem;
  padding: 2rem;
  max-width: 100%;
  margin-top: 10vh;
  box-sizing: border-box;
}

.foto {
  display: flex;  
  flex-direction: column;
  align-items: center;
}

.foto-imagen {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  box-shadow: 0px 10px 20px rgb(0 0 0 / 0.5);
  transition: transform 0.3s ease;
}

.foto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 1;
}

/* Enlace invisible que cubre toda la imagen*/
.overlay-link {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-family: 'Georgia', serif;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 2;
  pointer-events: none; /*para que no bloquee el click debajo */
}

.overlay-link span {
  font-size: 1rem;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  text-align: center;
}

/* Hover */

.foto.activo .overlay-link {
  opacity: 1 !important ;
  pointer-events: auto; /* Permite el clic/tap en el enlace */
}

.foto-imagen:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 28px rgba(0,0,0,0.55);
}

.foto-imagen:hover .overlay-link {
  opacity: 1;
  pointer-events: auto;
}

@media (hover: none) {
  .foto-imagen:hover .overlay-link {
    opacity: 0; /* desactiva hover en pantallas táctiles */
    pointer-events: none;
  }
}


.foto-texto {
  margin-top: 1.2rem;
  text-align: left;
  width: 100%; 
}

.foto-texto .poema {
  color: #005f6a;
  font-weight: bold;
  font-size: 1rem;
  margin: 0;
}

.foto-texto .fotografo {
  color: #000000;
  font-size: 0.9rem;
  margin: 0.2rem 0 0;
}

/* Limitar a máximo 5 columnas */
@media (min-width: 1200px) {
  .galeria-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Mínimo 2 columnas en pantallas pequeñas */
@media (max-width: 600px) {
  .galeria-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.autor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 0.9rem;
  padding: 0.5rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.foto:hover .autor {
  opacity: 1;
}

.creditos {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #005f6a;
  border-radius: 4px;
  color: #f0f0f0;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 22vh;
}

.creditos h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.creditos h3 {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
  text-align: left;
  color: #ac7f4c;
}

.creditos ul {
  list-style: none;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

</style>
