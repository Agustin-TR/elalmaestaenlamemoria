<template>
    <section class="pantalla confirmacion-section">
        <div class="contact-form-container">

            <h2 class="form-title">¡Gracias por tu compra!</h2>

            <p class="info-text mb-4">
                A continuación, completá tus datos y a la brevedad me voy a estar comunicando con vos
                para coordinar el envío de tu copia de: <br>
                <strong>"El alma está en la memoria"</strong>.
            </p>

            <form class="contact-form" @submit.prevent="submitForm" action="https://formspree.io/f/xgvrvrrr"
                method="POST">

                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input type="text" id="name" name="name" v-model="formName" required>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" v-model="formEmail" placeholder="ejemplo@correo.com"
                        required>
                </div>

                <input type="hidden" name="_subject" value="Datos de COMPRA (Confirmación)">
                <input type="hidden" name="Mensaje" value="El usuario completó el formulario de datos post-pago.">

                <button type="submit" class="btn-submit" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Enviando...' : 'Enviar datos de envío' }}
                </button>

                <p v-if="submissionMessage" :class="['submission-message', submissionSuccess ? 'success' : 'error']">
                    {{ submissionMessage }}
                </p>

            </form>
        </div>
    </section>
</template>

<script>
export default {
    name: 'ConfirmacionPago',
    data() {
        return {
            formName: '',
            formEmail: '',
            submissionMessage: null,
            submissionSuccess: false,
            isSubmitting: false,
        };
    },
    methods: {
        submitForm() {
            this.isSubmitting = true;
            this.submissionMessage = null;

            const formData = new FormData();
            formData.append('name', this.formName);
            formData.append('email', this.formEmail);
            formData.append('source', 'ConfirmacionPago');

            fetch('https://formspree.io/f/xgvrvrrr', {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
            })
                .then(response => {
                    if (response.ok) {
                        this.submissionMessage = '¡Datos de compra enviados! Revisá tu email, te contactaremos a la brevedad.';
                        this.submissionSuccess = true;
                        this.formName = '';
                        this.formEmail = '';
                    } else {
                        this.submissionMessage = 'Hubo un error al enviar tus datos. Por favor, revisa y vuelve a intentarlo.';
                        this.submissionSuccess = false;
                    }
                })
                .catch(() => {
                    this.submissionMessage = 'No se pudo conectar con el servidor. Verificá tu conexión a internet.';
                    this.submissionSuccess = false;
                })
                .finally(() => {
                    this.isSubmitting = false;
                    setTimeout(() => {
                        if (this.submissionSuccess) {
                            //Redirigir a inicio después del éxito
                            this.$router.push('/inicio');
                        }
                    }, 5000);
                });
        },
    },
};
</script>

<style scoped>
/* Estilos globales */
.confirmacion-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
    background-color: #f4f4f4;
}

.info-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    text-align: center;
}

.contact-form-container {
    width: 100%;
    max-width: 500px;
    padding: 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-top: 5px solid #005f6a;
    margin-top: 50px; 
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-title {
    font-size: 1.6rem;
    color: #005f6a;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: bold;
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

.form-group input {
    padding: 0.8rem 1rem;
    border: 1px solid #9c9c9c;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
    border-color: #005f6a;
    box-shadow: 0 0 0 3px rgba(0, 95, 106, 0.2);
    outline: none;
}

.btn-submit {
    background-color: #005f6a;
    color: #fff;
    border: none;
    padding: 0.8rem 1rem;
    font-size: 1.1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 600;
}

.btn-submit:hover:not(:disabled) {
    background-color: #003f48;
}

.btn-submit:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.submission-message {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 6px;
    font-weight: bold;
    text-align: center;
}

.submission-message.success {
    background-color: #e6ffe6;
    color: #005f6a;
    border: 1px solid #005f6a;
}

.submission-message.error {
    background-color: #ffe6e6;
    color: #a00000;
    border: 1px solid #a00000;
}
</style>