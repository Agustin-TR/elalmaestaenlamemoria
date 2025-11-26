<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
            <button class="modal-close bi bi-x-circle" @click="$emit('close')"></button>

            <h3 class="modal-title">{{ content.title }}</h3>

            <div v-show="!showForm" class="modal-body">
                
                <h5 class="modal-alias">Alias: {{ content.alias }}</h5>
                <h6 class="modal-name">Nombre: {{ content.nombre }}</h6>

                </br>
                <p class="modal-valor">{{ content.valor }}</p>
                <p class="modal-info">{{ content.info }}</p>
            </div>

            <!-- Botón envío de comprobante -->
            <div class="center-button-container m-3">
                <button class="btn-precompra btn-comentar" @click="showForm = !showForm">
                    {{ showForm ? 'Ocultar Formulario' : 'Enviar datos' }}
                </button>
            </div>

            <!-- Formulario de Contacto -->
            <div v-if="showForm" class="contact-form-container mb-2">

                <form class="contact-form" @submit.prevent="submitForm" action="https://formspree.io/f/xgvrvrrr"
                    method="POST">

                    <p class="modal-info">Si ya abonaste, completá tus datos y a la brevedad me voy a estar
                        comunicando con vos para
                        contarte sobre los siguentes pasos para que recibas: <br><strong>"El alma está en la memoria"</strong></p>

                    <p>Muchas gracias por tu compra!!!</p>

                    <div class="form-group">
                        <label for="name">Nombre</label>
                        <input type="text" id="name" name="name" v-model="formName" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" v-model="formEmail"
                            placeholder="ejemplo@correo.com">
                    </div>

                    <button type="submit" class="btn-submit">Enviar formulario</button>

                    <p v-if="submissionMessage" class="submission-message">{{ submissionMessage }}</p>

                </form>
            </div>
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
                    title: '🛒 Ya casi es tuyo',
                    alias: 'agustin.t.rojas',
                    nombre: 'Agustin Tomas Rojas',
                    valor: 'El valor del libro es de: $30.000',
                    info: 'El pago se realiza mediante Mercado Pago. Luego de enviar tus datos por el formulario, te va a llegar un email para coordinar el envío del libro.',
                },
                printed: {
                    title: '📦 Pre-compra Versión Impresa',
                    info: 'La pre-compra te asegura una edición limitada. Te contactaremos por email para coordinar el método de pago, el costo exacto del envío internacional y la fecha de entrega. ¡Gracias por tu interés!'
                }
            },
            showForm: false,
            formName: '',
            formEmail: '',
            submissionMessage: null,
        };
    },
    computed: {
        // 3. Propiedad computada que selecciona el contenido según la clave
        content() {
            return this.paymentInfo[this.versionKey];
        },
    },
    methods: {
        submitForm() {
            const formData = new FormData();
            formData.append('name', this.formName);
            formData.append('email', this.formEmail);
            formData.append('message', 'COMPRA');

            fetch('https://formspree.io/f/xgvrvrrr', {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
            })
                .then(response => {
                    if (response.ok) {
                        this.submissionMessage = '¡Gracias por tu compra! Hemos recibido tu información.';
                        this.formName = '';
                        this.formEmail = '';
                        setTimeout(() => {
                            this.submissionMessage = null;
                            this.showForm = false;
                        }, 4000);
                    } else {
                        this.submissionMessage = 'Hubo un error al enviar el formulario. Intentá nuevamente.';
                    }
                })
                .catch(() => {
                    this.submissionMessage = 'No se pudo conectar con el servidor. Verificá tu conexión.';
                });
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
    z-index: 1000;
    /* Asegura que esté por encima de todo */
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

/* Centrado del botón de comentario */
.center-button-container {
    width: 100%;
    text-align: center;
    margin-top: -2rem;
}

.btn-comentar {
    color: #fff;
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
    background-color: #005f6a;
    box-shadow: 0 4px 10px rgba(0, 95, 106, 0.4);
    display: flex;
}

.btn-comentar:hover {
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
</style>