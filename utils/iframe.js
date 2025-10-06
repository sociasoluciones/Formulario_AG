export class Iframe {
  constructor() {
    this.resolve = null;
    this.isDevelopment = this.detectDevelopmentMode();
    this.setupMessageListener();
  }

  detectDevelopmentMode() {
    // Si window.parent === window, estamos en desarrollo (no hay iframe)
    return window.parent === window;
  }

  setupMessageListener() {
    window.addEventListener("message", (e) => {
      const { action, interaction } = e.data || {};
      if (action === "interaction" && this.resolve) {
        this.resolve(interaction);
      }
    });
  }

  async getInteraction() {
    // En desarrollo, retornar datos mock inmediatamente
    if (this.isDevelopment) {
      console.log('🔧 Modo desarrollo: usando datos mock');
      return this.getMockInteraction();
    }

    // En producción, pedir datos al padre (uContact)
    window.parent.postMessage({ action: "getInteraction" }, "*");
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject({ error: "Timeout getting interaction" });
      }, 5000);
    });
  }

  getMockInteraction() {
    return {
      clientId: "",  // Vacío para no pre-llenar el celular automáticamente
      clientName: "",
      channel: "webchat",
      campaign: "AG_COMERCIAL_2833",  // Campaña de Agenciauto para testing
      guid: "mock-interaction-123",
      agent: "asesor.demo",
      user: "asesor.demo",
      source: "asesor.demo",
      lastMessage: {
        source: "asesor.demo"
      },
      stored_values: {
        interaction_channel: "webchat",
        interaction_campaign: "AG_COMERCIAL_2833"
      },
      data: {
        cliente: {
          nombre: "",
          primerApellido: "",
          segundoApellido: "",
          correo: "",
          celular: "",
          direccion: "",
          fechaNacimiento: "",
          genero: "",
          vendedorVN: "",
          vendedorVU: "",
          recepcionista: "",
          vendedorAlmacen: ""
        },
        vehiculos: [],
        oportunidades: [],
        cotizaciones: [],
        facturas: []
      }
    };
  }

  close() {
    if (this.isDevelopment) {
      console.log('🔧 Modo desarrollo: close() simulado');
      return;
    }
    window.parent.postMessage({ action: "close" }, "*");
  }

  sent() {
    if (this.isDevelopment) {
      console.log('🔧 Modo desarrollo: sent() simulado - Cliente guardado');
      alert('✅ Desarrollo: Datos guardados exitosamente (mock)');
      return;
    }
    window.parent.postMessage({ action: "sent" }, "*");
  }
}

// Exportación por defecto para compatibilidad
export default Iframe;