export class Iframe {
  constructor() {
    this.resolve = null;
    this.setupMessageListener();
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
    window.parent.postMessage({ action: "getInteraction" }, "*");
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject({ error: "Timeout getting interaction" });
      }, 5000);
    });
  }
  
  close() {
    window.parent.postMessage({ action: "close" }, "*");
  }
  
  sent() {
    window.parent.postMessage({ action: "sent" }, "*");
  }
}

// Exportación por defecto para compatibilidad
export default Iframe;