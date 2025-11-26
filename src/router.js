import { createRouter, createWebHistory } from "vue-router"

import Inicio from "./components/Inicio.vue"
import Galeria from "./components/Galeria.vue"
import Header from "./components/Header.vue"
import Tienda from "./components/Tienda.vue"
import ConfirmacionPago from "./components/ConfirmacionPago.vue"

const routes = [
    /* ----- definición de la ruta raíz ---- */
    { path: '/', component: Inicio  },
    
    /* ---- definición de las rutas activas ---- */
    { path: '/galeria', component: Galeria  },
    { path: '/header', component: Header  },
    { path: '/tienda', component: Tienda  },
     { path: '/confirmacion', component: ConfirmacionPago, name: 'confirmacion' }, 

    /* ------ definición del comportamiento del rutear para rutas no existentes ----- */
    { path: '/:pathmatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router

