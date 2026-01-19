<template>
  <!-- Root -->
  <div class="galeria-wrapper" ref="galeriaRoot">

   <!-- git commit -m "pre venta"-->

    <!-- GALERÍA -->
    <section class="pantalla section-galeria" id="galeria">

       <!-- FOTO PORTADA -->
        <div class="foto foto-portada">
          <div class="foto-imagen">
            <img :src="getImagePath('img/portada.webp')" alt="Imagen principal" loading="eager" />
            <a href="https://www.instagram.com/adrianhmuxk" target="_blank" rel="noopener" class="overlay-link">
              <span>@adrianhmuxk</span>
            </a>
          </div>
          <div class="foto-texto">
            <p class="poema">Portada</p>
            <p class="fotografo">Adrián Rolo Cuevas</p>
            </div>
        </div>


      <div class="galeria-grid">

       

        <div class="foto" v-for="item in galeriaItems" :key="item.id">
          <div class="foto-imagen">
            <img :src="item.src" :alt="item.poema" loading="lazy" />

            <a :href="item.instaLink" target="_blank" rel="noopener" class="overlay-link">
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

    <!-- BOTÓN COMPRA -->
    <div class="btn-compra-wrapper">
      <button class="btn-compra" @click="comprar">
        Quiero el mío
      </button>
    </div>

    <!-- CRÉDITOS -->
    <div class="creditos">
      <h2>Colaboradores</h2>

      <ul class="creditos-lista">
        <li class="bloque-creditos">
          <h3>Autor</h3>
          <ul>
            <li>Agustín Rojas</li>
          </ul>
        </li>

        <li class="bloque-creditos">
          <h3>Diseño editorial</h3>
          <ul>
            <li>Paula Kempfert</li>
          </ul>
        </li>

        <li class="bloque-creditos">
          <h3>Diseño web</h3>
          <ul>
            <li>Renata Fain</li>
          </ul>
        </li>

        <li class="bloque-creditos">
          <h3>Selección de poemas y fotografías</h3>
          <ul>
            <li>Tadeo Orellana</li>
          </ul>
        </li>

        <li class="bloque-creditos">
          <h3>Portada</h3>
          <ul>
            <li>Adrián Rolo Cuevas</li>
          </ul>
        </li>

        <li class="bloque-creditos">
          <h3>Fotografía</h3>
          <ul class="creditos-fotografos">
            <li v-for="f in fotografos" :key="f.id">
              {{ f.nombre }}
            </li>
          </ul>
        </li>
      </ul>
    </div>


    <!-- BOTÓN COMPRA -->
    <div class="btn-compra-wrapper">
      <button class="btn-compra" @click="comprar">
        Quiero el mío
      </button>
    </div>

  </div>
</template>

<script>
import { dataPoemas } from '@/data/poemas.js'
import { dataFotografos } from '@/data/fotografos'

export default {
  name: 'Galeria',
  inject: ['openPaymentModal'],

  data() {
    return {
      poemas: dataPoemas,
      fotografos: dataFotografos,
      BASE_URL: import.meta.env.BASE_URL,

      activeContainer: null,
      tapTimeout: null,
      outsideClickHandler: null
    }
  },

  mounted() {
    this.setupTouchInteraction()
  },

  beforeUnmount() {
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler)
    }
  },

  methods: {
    comprar() {
      this.openPaymentModal('printed')
    },

    getImagePath(imagePath) {
      const cleaned = imagePath.startsWith('/')
        ? imagePath.slice(1)
        : imagePath

      return this.BASE_URL + cleaned
    },

    crearFotografosMap() {
      return this.fotografos.reduce((map, f) => {
        map[f.id] = f
        return map
      }, {})
    },

    setupTouchInteraction() {
      const root = this.$refs.galeriaRoot
      if (!root) return

      const isTouchDevice =
        window.matchMedia('(hover: none)').matches ||
        'ontouchstart' in window

      if (!isTouchDevice) return

      const fotos = root.querySelectorAll('.foto')

      fotos.forEach(container => {
        const link = container.querySelector('.overlay-link')
        if (!link) return

        container.addEventListener('click', e => {
          e.preventDefault()

          if (this.activeContainer !== container) {
            this.clearActive()

            container.classList.add('activo')
            this.activeContainer = container

            this.tapTimeout = setTimeout(() => {
              this.clearActive()
            }, 2500)
          } else {
            this.clearActive()
            window.open(link.href, '_blank')
          }
        })
      })

      this.outsideClickHandler = e => {
        if (
          this.activeContainer &&
          !e.target.closest('.foto')
        ) {
          this.clearActive()
        }
      }

      document.addEventListener('click', this.outsideClickHandler)
    },

    clearActive() {
      if (this.activeContainer) {
        this.activeContainer.classList.remove('activo')
        this.activeContainer = null
      }
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout)
        this.tapTimeout = null
      }
    }
  },

  computed: {
    galeriaItems() {
      const fotografosMap = this.crearFotografosMap()

      return this.poemas.map(poema => {
        const f = fotografosMap[poema.fotografoId] || {
          nombre: 'Anónimo',
          instaHandle: 'N/A',
          instaLink: '#'
        }

        return {
          id: poema.id,
          poema: poema.title,
          src: this.getImagePath(poema.bg),
          fotografo: f.nombre,
          instaHandle: f.instaHandle,
          instaLink: f.instaLink
        }
      })
    }
  }
}
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
  gap: 3rem 2rem;
  padding: 2rem;
  max-width: 100%;
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
  pointer-events: none;
}

.overlay-link span {
  font-size: 1rem;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  text-align: center;
}

.foto.activo .overlay-link {
  opacity: 1 !important;
  pointer-events: auto;
}

.foto-imagen:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
}

.foto-imagen:hover .overlay-link {
  opacity: 1;
  pointer-events: auto;
}

@media (hover: none) {
  .foto-imagen:hover .overlay-link {
    opacity: 0;
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

/* ========= PORTADA ========= */
.foto-portada {
  grid-column: 1 / -1;
  max-width: 85%; /* ocupa todo el ancho disponible */
  max-height: 800px; 
  margin: 5rem auto 1rem auto;
  justify-content: center;
}

@media (max-width: 600px) {
  .foto-portada {
    height: 300px;
    width: 100%;
  }
}

.foto-portada .foto-imagen {
  aspect-ratio: 1 / 2;
}


/* ========= CRÉDITOS ========= */

.creditos {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #005f6a;
  border-radius: 4px;
  color: #f0f0f0;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.creditos h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.creditos h3 {
  font-size: 1.5rem;
  margin: 0.7rem 0rem 0.2rem 0rem;
  text-align: left;
  color: #ac7f4c;
}

.creditos ul {
  list-style: none;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.creditos-fotografos {
  margin-top: 0.5rem;
}

/* Pantallas grandes */
@media (min-width: 1200px) {
  .creditos-fotografos {
    column-count: 2;
    column-gap: 3rem;
  }

  .creditos-fotografos p {
    break-inside: avoid;
  }
}


/* ========= BOTÓN COMPRA ========= */

.btn-compra-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4rem 0;
  width: 100%;
}

.btn-compra {
  background-color: #005f6a;
  color: #fff;
  border: none;
  padding: 0.8rem 2.4rem;
  font-size: 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-compra:hover {
  background-color: #003f48;
  transform: scale(1.1);
}

.btn-compra:active {
  transform: translateY(0);
}
</style>
