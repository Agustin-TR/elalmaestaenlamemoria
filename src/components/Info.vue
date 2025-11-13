<template>
  <!-- Sección Pre-compra -->
  <section class="pantalla" id="info">
    <div class="libros m-5">
      <div class="version">
        <h3>Versión digital</h3>
        <p>Disponible en formato PDF y EPUB. Incluye acceso anticipado a contenido adicional.</p>
        <button class="btn-precompra">Pre-comprar</button>
      </div>
      <div class="version">
        <h3>Versión impresa</h3>
        <p>Edición limitada en papel reciclado, con sobrecubierta ilustrada. Envío internacional disponible.</p>
        <button class="btn-precompra">Pre-comprar</button>
      </div>
    </div>
  </section>

  <!-- Sección Comentarios y Formulario -->
  <section class="pantalla section-comentarios" id="comentarios">
    <h2 class="info-titulo">Lo que dicen los lectores</h2>

    <!-- Botón de contacto -->
    <div class="center-button-container m-5">
      <button class="btn-precompra btn-comentar" @click="showForm = !showForm">
        {{ showForm ? 'Ocultar Formulario' : 'Dejá tu comentario' }}
      </button>
    </div>

    <!-- Formulario de Contacto -->
    <div v-if="showForm" class="contact-form-container mb-5">

      <form class="contact-form" @submit.prevent="submitForm" action="https://formspree.io/f/xgvrvrrr" method="POST">
        <h4 class="form-title">Sé parte del poemario</h4>
        <h6 class="form-title2">Contanos qué sentiste</h6>

        <div class="form-group">
          <label for="name">Nombre</label>
          <input type="text" id="name" name="name" v-model="formName" required>
        </div>

        <div class="form-group">
          <label for="email">Email (Opcional, para respuesta)</label>
          <input type="email" id="email" name="email" v-model="formEmail" placeholder="ejemplo@correo.com">
        </div>

        <div class="form-group">
          <label for="comment">Comentario</label>
          <textarea id="comment" name="comment" v-model="formComment" rows="5" required></textarea>
        </div>

        <button type="submit" class="btn-submit">Enviar Mensaje</button>

        <p v-if="submissionMessage" class="submission-message">{{ submissionMessage }}</p>

      </form>
    </div>

    <!-- Grid de Comentarios -->
    <div class="comentarios-grid mb-10">
      <div v-for="comentario in comentarios" :key="comentario.id" class="comentario-card">
        <div class="comentario-header">
          <!-- Icono de comillas -->
          <svg class="quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M448 318.5c0 53.6-43.1 97.4-96.2 97.5-52.9.2-95.8-43.5-95.9-97.4-.1-53.5 43.1-97.5 96.2-97.5 52.9-.1 95.8 43.6 95.9 97.4zM192 318.5c0 53.6-43.1 97.4-96.2 97.5-52.9.2-95.8-43.5-95.9-97.4-.1-53.5 43.1-97.5 96.2-97.5 52.9-.1 95.8 43.6 95.9 97.4z" />
          </svg>
          <p class="nombre-usuario">— {{ comentario.nombreUsuario }}</p>
        </div>
        <p class="comentario-texto">{{ comentario.comentario }}</p>
      </div>
    </div>

  </section>
</template>

<script>
import { dataComentarios } from '@/data/comentarios.js';

export default {
  name: 'Info',
  data() {
    return {
      comentarios: dataComentarios,
      showForm: false,
      formName: '',
      formEmail: '',
      formComment: '',
      submissionMessage: null,
    };
  },
  methods: {
    submitForm() {
      const formData = new FormData();
      formData.append('name', this.formName);
      formData.append('email', this.formEmail);
      formData.append('message', this.formComment);

      fetch('https://formspree.io/f/xgvrvrrr', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
        .then(response => {
          if (response.ok) {
            this.submissionMessage = '¡Gracias por tu mensaje! Hemos recibido tu información.';
            this.formName = '';
            this.formEmail = '';
            this.formComment = '';
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

  },
};
</script>

<style scoped>
/* ========= INFO (Estilos originales) ========= */

.info-titulo {
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  font-family: 'Georgia', serif;
  font-weight: 300;
  letter-spacing: 1px;
}

.libros {
  display: flex;
  flex-wrap: wrap;
  row-gap: 1rem;
  column-gap: 4rem;
  justify-content: center;
  padding: 0rem;
}

.version {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border-radius: 4px;
  max-width: 350px;
  color: #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 7vh;
}

.version h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.version p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn-precompra {
  background-color: #005f6a;
  color: #fff;
  border: none;
  padding: 0.6rem 1.8rem;
  font-size: 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-precompra:hover {
  background-color: #003f48;
}

/* ======================================= */
/* ESTILOS DE COMENTARIOS Y NUEVO FORMULARIO */
/* ======================================= */

.section-comentarios {
  background-color: #f8f8f8;
  min-height: 80vh;
  padding: 5rem 2rem;
  display: flex;
  /* centrar el título, botón y formulario */
  flex-direction: column;
  align-items: center;
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
  font-size: 1rem;
  border-radius: 8px;
  background-color: #005f6a;
  box-shadow: 0 4px 10px rgba(0, 95, 106, 0.4);
}

.btn-comentar:hover {
  background-color: #003f48;
}

/* FORMULARIO DE CONTACTO */
.contact-form-container {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #005f6a;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

/* Estilos de la cuadrícula de comentarios */
.comentarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
}

/* Media Query para forzar 4 columnas en escritorio */
@media (min-width: 1200px) {
  .comentarios-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1400px;
  }
}

.comentario-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 5px solid #005f6a;
  display: flex;
  flex-direction: column;
}

.comentario-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.comentario-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.quote-icon {
  width: 20px;
  height: 20px;
  fill: #005f6a;
  margin-right: 10px;
}

.nombre-usuario {
  font-size: 1rem;
  font-weight: bold;
  color: #005f6a;
  margin: 0;
  letter-spacing: 0.5px;
}

.comentario-texto {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  font-style: italic;
  margin-top: 0;
}
</style>