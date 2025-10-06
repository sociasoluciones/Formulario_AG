// utils/index.js

import Iframe from "./iframe.js";

// Exportación directa de la instancia (singleton)
export const iframeInstance = new Iframe();

export function useIframe() {
  return iframeInstance;
}

// Campos utilizados para renderizado dinámico (solo si los usas en formManager.js)
export const fields = [
  { text: "Client Id", value: "clientId" },
  { text: "Client name", value: "clientName" },
  { text: "Channel", value: "channel" },
  { text: "Campaign", value: "campaign" },
];

// Funciones principales del sistema
export {
  showTab,
  buscarCliente,
  cargarDatosComerciales,
  enviarFormulario,
  mostrarModalOportunidad
} from '../js/utils.js';


