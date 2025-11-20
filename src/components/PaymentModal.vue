<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
            <button class="modal-close bi bi-x-circle" @click="$emit('close')"></button>
            
            <h3 class="modal-title">{{ content.title }}</h3>
            <p class="modal-info">{{ content.info }}</p>
            
            </div>
    </div>
</template>

<script>

export default {
    name: 'PaymentModal',
    // 1. Recibimos la clave del padre
    props: {
        versionKey: {
            type: String,
            required: true,
            validator: (value) => ['digital', 'printed'].includes(value) // Opcional: validación
        }
    },
    data() {
        return {
            paymentInfo: {
                digital: {
                    title: '🛒 Compra Versión Digital (PDF/EPUB)',
                    info: 'El pago se realiza mediante PayPal o Mercado Pago. Una vez confirmado, recibirás un enlace de descarga por email. El precio es de $5 USD (o su equivalente en moneda local).'
                },
                printed: {
                    title: '📦 Pre-compra Versión Impresa',
                    info: 'La pre-compra te asegura una edición limitada. Te contactaremos por email para coordinar el método de pago, el costo exacto del envío internacional y la fecha de entrega. ¡Gracias por tu interés!'
                }
            }
        };
    },
    computed: {
        // 3. Propiedad computada que selecciona el contenido según la clave
        content() {
            return this.paymentInfo[this.versionKey];
        },
    }
};
</script>

<style scoped>
/* ======================================= */
/* ESTILOS DEL MODAL (POP-UP) */
/* ======================================= */

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
    z-index: 1000; /* Asegura que esté por encima de todo */
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
    font-size: 1rem;
    line-height: 1.5;
    color: #555;
    margin-bottom: 2rem;
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
</style>