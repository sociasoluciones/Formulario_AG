// main.js

import FormManager from './js/formManager';
import {
  showTab,
  cargarDatosComerciales,
  enviarFormulario,
  iframeInstance,
  mostrarModalOportunidad,
} from './utils';

import { buscarCliente } from './utils/config.js';
import { setupMockApi } from './utils/mockData.js';
import './style.css';

// Configurar mocks para desarrollo local
setupMockApi();



window.showTab = showTab;



class Main {
  static async init() {
    console.log('el build anda');
    try {
      // Inicializar formulario y esperar que se renderice
      const form = new FormManager();
      await form.generateForm();

      // Obtener interacción desde iframe
      const interaction = await iframeInstance.getInteraction();
      console.log(interaction);

      // Setear celular si el input existe
      const celularInput = document.querySelector('[name=celular]');
      if (celularInput && interaction?.clientId) {
        celularInput.value = interaction.clientId;
      }

      // Configurar título
      this.setTitle(interaction?.form);

      // Establecer valores iniciales
      if (interaction) {
        form.setValues(interaction);
        if (interaction.data) {
          cargarDatosComerciales(interaction.data);
        }
      }

      // Configurar eventos
      this.setupEventListeners();

    } catch (error) {
      console.error('Error inicializando aplicación:', error);
      alert('Error al cargar el formulario');
    }
  }

  static setTitle(formPath) {
    const titleElement = document.getElementById('title');
    if (titleElement) {
      titleElement.textContent = formPath 
        ? formPath.split('/').slice(-2, -1)[0] 
        : 'uContact Form';
    }
  }

  static setupEventListeners() {
    // Enviar formulario
    document.getElementById('enviarFormulario')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await enviarFormulario();
      } catch (error) {
        console.error('Error enviando formulario:', error);
      }
    });

       

    // Buscar cliente al hacer clic en el botón
    document.getElementById('btnBuscarCliente')?.addEventListener('click', (e) => {e.preventDefault();buscarCliente();});

;
    
    // Crear oportunidad
    document.getElementById('btnCrearOportunidad')?.addEventListener('click', mostrarModalOportunidad);
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => Main.init());