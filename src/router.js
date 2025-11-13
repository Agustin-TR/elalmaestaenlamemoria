import { createRouter, createWebHistory } from "vue-router"

import Inicio from "./components/Inicio.vue"
import Galeria from "./components/Galeria.vue"
import Header from "./components/Header.vue"
import Info from "./components/Info.vue"

const routes = [
    /* ----- definición de la ruta raíz ---- */
    { path: '/', component: Inicio  },
    
    /* ---- definición de las rutas activas ---- */
    { path: '/inicio', component: Inicio  },
    { path: '/galeria', component: Galeria  },
    { path: '/header', component: Header  },
    { path: '/info', component: Info  },

    /* ------ definición del comportamiento del rutear para rutas no existentes ----- */
    { path: '/:pathmatch(.*)*', redirect: '/inicio' }
]

const router = createRouter({
    history: createWebHistory(),
    routes // es igual a -> routes: routes
})

export default router

