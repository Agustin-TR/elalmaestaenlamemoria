<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
            <button class="modal-close bi bi-x-circle" @click="$emit('close')"></button>

            <h3 class="modal-title">{{ content.title }}</h3>

                <h6 class="modal-tienda">Tienda: {{ content.tienda }}</h6>
                <h5 class="modal-alias">
                    Alias: {{ content.alias }}
                   <i class="bi bi-copy ms-2" style="cursor: pointer;" @click="copiarAlias(content.alias)"
                        title="Copiar alias"></i>
                </h5>
                <transition name="fade">
                    <span v-if="mensajeVisible" class="floating-msg">
                        <i class="bi bi-check-circle-fill text-success"></i> Copiado
                    </span>
                </transition>

                <h6 class="modal-name">Nombre: {{ content.nombre }}</h6>

                </br>
                <p class="modal-valor">{{ content.valor }}</p>
                <p class="modal-info">{{ content.info }}</p>
            

            <div class="d-flex justify-content-center mt-3 mb-2">
                <!-- Mercado Pago -->
                <div class="mp-button-container" v-if="content.alias">
                    <button class="btn-mp" @click="goToMp(content.alias)">
                        <img :src="getMpLogoPath()" alt="Mercado Pago" class="mp-icon" />
                    </button>
                </div>
            </div>

        </div>

    </div>
</template>

<script>

export default {
    name: 'PaymentModal',
    //Recibimos la clave del padre
    props: {
        versionKey: {
            type: String,
            required: true,
            validator: (value) => ['digital', 'printed'].includes(value) // Opcional
        }
    },
    data() {
        return {
            paymentInfo: {
                digital: {
                    title: '🛒 Ya casi es tuyo',
                    alias: 'agustin.t.rojas',
                    tienda: 'El alma está en la memoria',
                    nombre: 'Agustin Tomas Rojas',
                    valor: 'El valor del libro es de: $30.000',
                    info: 'El pago se realiza mediante Mercado Pago. Luego de abonar en la app, te va a redirigir a una pantalla de confirmación para que completes tus datos y poder coordinar el envío del libro.',
                },
                printed: {
                    title: '📦 Pre-compra Versión Impresa',
                    info: 'La pre-compra te asegura una edición limitada. Te contactaremos por email para coordinar el método de pago, el costo exacto del envío internacional y la fecha de entrega. ¡Gracias por tu interés!'
                }
            },
            mensajeVisible: false,
            BASE_URL: import.meta.env.BASE_URL,
        };
    },
    computed: {
        //selecciona el contenido según la clave
        content() {
            return this.paymentInfo[this.versionKey];
        },
    },
    methods: {
        async copiarAlias(texto) {
            if (!texto) return;

            try {
                await navigator.clipboard.writeText(texto);

                this.mensajeVisible = true;

                setTimeout(() => {
                    this.mensajeVisible = false;
                }, 1500);

            } catch (err) {
                console.error('Error al copiar', err);
            }
        },
        async goToMp(alias) {
            await this.copiarAlias(alias);

            setTimeout(() => {
                //redireccionamiento
                window.open('https://mpago.li/2jL8GFk', '_blank');
            }, 300);
        },
        getMpLogoPath() {
            const imagePath = 'img/mercado-pago.png';
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },
    }
};
</script>

<style scoped>
/*POP UP*/
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    transition: opacity 0.3s ease;
}

.modal-container {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.4);
    position: relative;
    animation: slide-in 0.3s ease-out;
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #333;
    line-height: 1;
    padding: 0;
    transition: color 0.2s ease;
    background: none;
}

.modal-close:hover {
    color: #005f6a;
}

.modal-title {
    color: #005f6a;
    font-size: 1.6rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
}

.modal-info {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #555;
    margin-bottom: 0rem;
}


/* Animación para el modal */
@keyframes slide-in {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}


/* Enviar datos */
.center-button-container {
    text-align: center;
}

.btn-enviar-datos {
    color: #fff;
    padding: 0.95rem 1.3rem;
    font-size: 0.9rem;
    border-radius: 8px;
    background-color: #005f6a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.btn-enviar-datos:hover {
    background-color: #003f48;
}


/*FORMULARIO*/
.contact-form-container {
    width: 100%;
    max-width: 600px;
    padding: 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid #005f6a;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-title {
    font-size: 1.8rem;
    color: #005f6a;
    margin-bottom: 0.5rem;
    text-align: center;
}

.form-title2 {
    font-size: 1.5rem;
    color: #005f6a;
    margin-bottom: 0.5rem;
    text-align: center;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
    padding: 0.8rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: #005f6a;
    box-shadow: 0 0 0 3px rgba(0, 95, 106, 0.2);
    outline: none;
}

.form-group textarea {
    resize: vertical;
}

.btn-submit {
    background-color: #005f6a;
    color: #fff;
    border: none;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submission-message {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 6px;
    background-color: #e6ffe6;
    color: #005f6a;
    font-weight: bold;
    text-align: center;
    border: 1px solid #005f6a;
}


/*COPIADO*/
/* Contenedor necesario para que el 'absolute' funcione respecto al icono */
.icon-container {
    position: relative;
    display: inline-block;
    margin-left: 10px;
}

.click-icon {
    cursor: pointer;
    transition: color 0.2s;
}

.click-icon:hover {
    color: #0d6efd;
}

.floating-msg {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #090909;
    color: #f9f9f9;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    pointer-events: none;
    margin-bottom: 5px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translate(-50%, 10px);
    /* Empieza de abajo */
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translate(-50%, 0);
    /* Termina en su posición original */
}



/* BOTON MERCADO PAGO */
.mp-button-container {
    display: inline-block;
}

.btn-mp {
    padding: 0.1rem 0.1rem;
    max-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid black;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.btn-mp:hover {
    background: #979797;
}

.mp-icon {
    width: 100%;
    height: auto;
}
</style>