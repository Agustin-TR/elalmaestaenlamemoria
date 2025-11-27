<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalInfo">
            <button type="button" class="modal-close bi bi-x-circle" @click="$emit('close')" aria-label="Cerrar"></button>

            <h3 id="modalTitle" class="modal-title">{{ content.title }}</h3>

            <div class="modal-content-wrapper modal-scrollable-content">
                <div v-if="versionKey === 'printed'" class="payment-details-block">
                    <h6 class="detail-label">Tienda/Producto:</h6>
                    <p class="detail-text bold">{{ content.tienda }}</p>

                    <h6 class="detail-label">Importe total:</h6>
                    <p class="detail-text price">{{ content.valor }}</p>

                    <div class="alias-container">
                        <h6 class="detail-label">Alias de Mercado Pago:</h6>
                            <p class="detail-text alias-code">
                            {{ content.alias }}
                            <i class="bi bi-copy ms-2 copy-icon" @click="copiarAlias(content.alias)"
                                tabindex="0" role="button" @keydown.enter.prevent="copiarAlias(content.alias)" @keydown.space.prevent="copiarAlias(content.alias)" title="Copiar alias" aria-label="Copiar alias"></i>
                        </p>
                    </div>
                    <h6 class="detail-label">Titular de la cuenta:</h6>
                    <p class="detail-text">{{ content.nombre }}</p>
                </div>

                <!-- Mensaje de información importante -->
                <div id="modalInfo" class="info-block">
                    <p class="modal-info">{{ content.info }}</p>
                    <p class="modal-transferencia m-2">{{ content.transferencia }}</p>
                </div>

                <!-- Botón Mercado Pago -->
                <div class="mp-button-container d-flex justify-content-center mb-3" v-if="content.alias">
                    <button class="btn-mp" @click="goToMp(content.alias)">
                        <img :src="getMpLogoPath()" alt="Mercado Pago" class="mp-icon" />
                    </button>
                </div>
            </div>

            <!-- Mensaje de copiado -->
                <transition name="fade">
                <span v-if="mensajeVisible" class="floating-msg" role="status" aria-live="polite">
                    <i class="bi bi-check-circle-fill"></i> Copiado
                </span>
            </transition>

        </div>
    </div>
</template>

<script>
export default {
    name: 'PaymentModal',
    props: {
        versionKey: {
            type: String,
            required: true,
            validator: (value) => ['digital', 'printed'].includes(value)
        }
    },
    data() {
        return {
            paymentInfo: {
                printed: {
                    title: '🛒 Ya casi es tuyo',
                    alias: 'agustin.t.rojas',
                    tienda: 'El alma está en la memoria',
                    nombre: 'Agustín Tomas Rojas',
                    valor: '$30.000 ARS',
                    info: 'El pago se realiza mediante transferencia con Mercado Pago. Una vez abonado, serás redirigido a una pantalla de confirmación para que completes tus datos de contacto.',
                    transferencia: 'También podes transferir y hablarme directamente por las redes sociales para coordinar el envío. (Por favor, recordá enviar el comprobante)'
                },
                digital: {
                    title: '📦 Solicitud de compra (Digital)',
                    info: 'Lo sentimos, esta versión no se encuentra disponible ¡Gracias por tu interés! Te recomiendo que consigas la versión impresa',
                }
            },
            mensajeVisible: false,
            _prevFocusedEl: null,
            BASE_URL: import.meta.env.BASE_URL,
        };
    },
    computed: {
        // selecciona el contenido según la clave
        content() {
            return this.paymentInfo[this.versionKey];
        },
    },
    mounted() {
        // Accessibility: trap focus inside modal and handle Escape
        try {
            this._prevFocusedEl = document.activeElement;
            const focusables = this._getFocusableElements();
            if (focusables && focusables.length) {
                focusables[0].focus();
            }
            document.addEventListener('keydown', this._handleKeydown);
        } catch (e) {}
    },
    beforeUnmount() {
        try {
            if (this._prevFocusedEl && this._prevFocusedEl.focus) this._prevFocusedEl.focus();
            document.removeEventListener('keydown', this._handleKeydown);
        } catch (e) {}
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
            window.open('https://mpago.li/2jL8GFk', '_blank');
            }, 300);
        },
        getMpLogoPath() {
            const imagePath = 'img/mercado-pago.png';
            const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return this.BASE_URL + cleanedPath;
        },
        // --- Accessibility helpers ---
        _getFocusableElements() {
            const modal = this.$el.querySelector('.modal-container');
            if (!modal) return [];
            return Array.from(modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
                .filter(el => el.offsetParent !== null);
        },
        _handleKeydown(e) {
            if (e.key === 'Escape') {
                this.$emit('close');
                return;
            }

            if (e.key === 'Tab') {
                const focusables = this._getFocusableElements();
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
    }
};
</script>

<style scoped>
/* POP UP BASE */
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
}

.modal-container {
    background-color: #fff;
    padding: 2rem;
    border-radius: 10px;
    width: 95%;
    max-width: 550px;
    position: relative;
    animation: slide-in 0.3s ease-out;
    display: flex;
    flex-direction: column;
    max-height: 100vh;
}

/* Contenedor de contenido scrollable */
.modal-scrollable-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 5px;
    margin-right: -5px;
}

.modal-close {
    position: absolute;
    top: 12px;
    right: 15px;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #777;
    background: none;
    transition: color 0.2s ease;
}

.modal-close:hover {
    color: #005f6a;
}

.modal-title {
    color: #005f6a;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    border-bottom: 3px solid #005f6a;
    padding-bottom: 0.5rem;
    text-align: left;
}

/* CONTENEDORES DE INFORMACIÓN */
.payment-details-block {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #070707;
}

.detail-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #555;
    margin-bottom: 0.2rem;
    text-transform: uppercase;
}

.detail-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.8rem;
}

.detail-text.bold {
    font-weight: 700;
    color: #005f6a;
}

.detail-text.price {
    font-size: 1.1rem;
    color: #495057;
    font-weight: 750;
}

/* Alias */
.alias-code {
    display: inline-block;
    font-size: 1.1rem;
    text-align: left;
}

.copy-icon {
    cursor: pointer;
    color: #005f6a;
    font-size: 1rem;
    margin-left: 0.5rem;
    transition: color 0.2s;
}

.copy-icon:hover {
    color: #009ee3;
}


/* Bloque de Información General */
.info-block {
    padding: 1rem 0;
}

.modal-info {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 0;
    text-align: center;
}

.modal-transferencia {
    font-size: 0.85rem;
    color: #777;
    font-style: italic;
    text-align: center;
}

/* BOTONES */
.btn-comentar {
    color: #fff;
    padding: 0.9rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    background-color: #005f6a;
    box-shadow: 0 4px 10px rgba(0, 95, 106, 0.4);
    border: none;
    outline: none;
    transition: background-color 0.3s ease;
}

.btn-comentar:hover {
    background-color: #003f48;
}


/* BOTON MERCADO PAGO */
.mp-button-container {
    display: inline-block;
}

.btn-mp {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid #00000030;
    border-radius: 8px;
    padding: 0.1rem 0.1rem;
    max-width: 150px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.btn-mp:hover {
    background: #f0f0f0;
}

.mp-icon {
    width: 100%;
    height: auto;
    display: block;
}

/* Mensaje Flotante de Copiado */
.floating-msg {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1001;
    transform: translate(-50%, -50px);
    background-color: #00a651;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
}

.floating-msg i {
    color: #fff;
    font-size: 1.1rem;
    margin-right: 5px;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translate(-50%, 0);
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translate(-50%, -50px);
}

/* REGLAS DE RESPONSIVIDAD PARA MÓVILES */
@media (max-width: 600px) {
    .modal-container {
        padding: 1.2rem;
        max-height: 90vh;
    }

    .modal-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .payment-details-block {
        padding: 0.8rem;
    }

    .detail-text {
        font-size: 1rem;
    }

    .alias-code {
        font-size: 1rem;
    }

    .button-group {
        margin-bottom: 0.5rem !important;
    }

    .btn-comentar {
        font-size: 0.9rem;
        padding: 0.7rem 1rem;
    }
}
</style>