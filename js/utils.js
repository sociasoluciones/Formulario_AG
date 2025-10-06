// js/utils.js

import Iframe from '../utils/iframe.js';
import { mostrarModalVehiculos } from '../utils/config.js';

export const iframeInstance = new Iframe();

export function obtenerInteractionId() {
  if (typeof getInteraction !== 'function') {
    console.error("getInteraction no está disponible en este contexto");
    return null;
  }

  const interaccion = getInteraction();
  return interaccion?.interactionId || null;
}



export async function obtenerMensajesInteraccion() {
  const interactionId = obtenerInteractionId();

  if (!interactionId) {
    alert('No se pudo obtener el ID de la interacción.');
    return;
  }

  const url = `https://livecenter.ucontactcloud.com/api/interactions/id/${interactionId}/messages?lastMessage=-1&limit=2000`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer 1d6a7012-49f3-489d-9a84-50e991d55485',  
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Mensajes obtenidos:', data.result);
    return data.result;
  } catch (error) {
    console.error('Error al obtener mensajes de la interacción:', error);
    alert('❌ No se pudo obtener la conversación');
    return [];
  }
}

export function showTab(tabName) {
  document.querySelectorAll('.form-section').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName)?.classList.add('active');

  document.querySelectorAll('.tabs a').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll(`.tabs a`).forEach(tab => {
    if (tab.textContent.trim().toLowerCase() === tabName.toLowerCase()) {
      tab.classList.add('active');
    }
  });
}

export async function buscarCliente() {
  const documento = document.getElementById('documento')?.value;
  const tipoDocumento = document.getElementById('tipoDocumento')?.value;
  const celular = document.getElementById('celular')?.value;
  const correo = document.getElementById('correo')?.value;

  if (!documento && !celular && !correo) {
    alert('Por favor ingresa al menos documento, celular o correo');
    return;
  }

  try {
    const res = await fetch('https://livecenter.ucontactcloud.com/api/webhook/api_workflow_sociabpo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodo: "obtener_datos", data: { documento, tipoDocumento, celular, correo } })
    });

    const resws = await res.json();
    const respuesta = resws.result.result;
    console.log(respuesta)
    const data = Array.isArray(respuesta) ? respuesta[0] : respuesta;

    const cliente = data.cliente || {};
    const vehiculos = data.vehiculos || [];

    function limpiarFecha(fecha) {
      return fecha?.split('T')[0] || '';
    }

    document.querySelector('[name=nombre]').value = cliente.nombre || '';
    document.querySelector('[name=correo]').value = cliente.correo || '';
    document.querySelector('[name=celular]').value = cliente.celular || '';
    document.querySelector('[name=primerApellido]').value = cliente.primerApellido || '';
    document.querySelector('[name=segundoApellido]').value = cliente.segundoApellido || '';
    document.querySelector('[name=direccion]').value = cliente.direccion || '';
    document.querySelector('[name=fechaNacimiento]').value = limpiarFecha(cliente.fechaNacimiento);
    document.querySelector('[name=vendedorVN]').value = cliente.vendedorVN || '';
    document.querySelector('[name=vendedorVU]').value = cliente.vendedorVU || '';
    document.querySelector('[name=recepcionista]').value = cliente.recepcionista || '';
    document.querySelector('[name=vendedorAlmacen]').value = cliente.vendedorAlmacen || '';

    const generoSelect = document.querySelector('[name=genero]');
    if (generoSelect && cliente.genero) {
      const opciones = Array.from(generoSelect.options).map(o => o.value);
      if (opciones.includes(cliente.genero)) {
        generoSelect.value = cliente.genero;
      }
    }

    if (vehiculos.length > 0) {
      mostrarModalVehiculos(vehiculos);
    }

    cargarDatosComerciales(data);
    return data;
  } catch (err) {
    console.error('Error al buscar cliente:', err);
    alert('No se pudo encontrar información del cliente');
    throw err;
  }
}

export function cargarDatosComerciales(data) {
  llenarTabla('tabla-oportunidades', data.oportunidades || []);
  llenarTabla('tabla-cotizaciones', data.cotizaciones || []);
  llenarTabla('tabla-facturas', data.facturas || []);
}

function llenarTabla(idTabla, registros) {
  const tabla = document.getElementById(idTabla);
  if (!tabla) return;

  tabla.innerHTML = '';
  if (!Array.isArray(registros) || registros.length === 0) return;

  // Orden de columnas según el THEAD de cada tabla
  const columnasPorTabla = {
    'tabla-oportunidades': ['fecha', 'vendedor', 'nombreoportunidad', 'equiposede', 'etapa', 'actividad', 'URL'],
    'tabla-cotizaciones': ['fecha', 'estado', 'vendedor', 'marca', 'familia', 'modelo', 'equiposede', 'link'],
    'tabla-facturas': ['placa', 'fechafactura', 'fechamatricula', 'fechaentrega', 'vendedor', 'marca', 'familia', 'modelo', 'sede', 'chasis'],
  };

  const orden = columnasPorTabla[idTabla];

  registros.forEach((reg) => {
    const fila = document.createElement('tr');

    orden.forEach((campo) => {
      const celda = document.createElement('td');
      
      let valor = reg[campo] ?? reg[campo?.toLowerCase?.()] ?? '';

      
      if (typeof valor === 'string') valor = valor.trim();

      
      if (
        idTabla === 'tabla-oportunidades' &&
        (campo === 'URL' || campo === 'url') &&
        typeof valor === 'string' &&
        valor.length > 0
      ) {
        const a = document.createElement('a');
        a.href = valor;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Abrir';
        celda.appendChild(a);
      } else {
        celda.textContent = valor ?? '';
      }

      fila.appendChild(celda);
    });

    tabla.appendChild(fila);
  });
}


export async function enviarFormulario() {
  const formData = Object.fromEntries(
    [...document.querySelectorAll('input, select')].map(el => [el.name, el.value])
  );

  Object.keys(formData).forEach(key => {
    if (formData[key] === 'null' || formData[key] == null) {
      formData[key] = '';
    }
  });

  formData.genero = formData.genero === 'Mujer' ? 'female' : 'male';



  try {
    const response = await fetch('https://livecenter.ucontactcloud.com/api/webhook/api_workflow_sociabpo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodo: "actualizar_datos", data: formData })
    });

    const data = await response.json();
    const rawResult = Array.isArray(data.result) ? data[0] : data;
    const result = rawResult.result.result;

    if (result.id) {
      alert('Cliente guardado correctamente');
      iframeInstance.sent();
    } else {
      alert('No se pudo guardar el cliente');
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    alert('Hubo un error al guardar el cliente');
  }
}

// Función para detectar empresa según prefijo de campaña
function detectarEmpresaDesdeCampana(campaign) {
  if (!campaign) return null;

  const campaignUpper = campaign.toUpperCase();

  if (campaignUpper.startsWith('AG_')) {
    return 'AGENCIAUTO';
  } else if (campaignUpper.startsWith('MG_')) {
    return 'MEGAUTO';
  }

  return null;
}

export async function mostrarModalOportunidad() {
  // Eliminar cualquier versión previa del modal
  const modalAnterior = document.getElementById('modal-oportunidad');
  if (modalAnterior) modalAnterior.remove();

  // Crear nuevo modal desde cero
  const modal = document.createElement('div');
  modal.id = 'modal-oportunidad';
  modal.className = 'modal active-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" style="float:right; font-size:20px; cursor:pointer;">&times;</span>
      <h3>Crear Oportunidad</h3>
      <div class="form-grid">
        <div class="form-group"><label>Empresa</label><select name="empresa"><option>Seleccione</option></select></div>
        <div class="form-group"><label>Vendedor</label><select name="vendedor"><option>Seleccione</option></select></div>
        <div class="form-group"><label>Equipo</label><select name="equipo"><option>Seleccione</option></select></div>
        <div class="form-group"><label>Media</label><select name="media"><option>Seleccione</option></select></div>
        <div class="form-group"><label>Origen</label><select name="origen"><option>Seleccione</option></select></div>
        <div class="form-group"><label>Nombre Oportunidad</label><input type="text" name="nombreOportunidad"></div>
        <div class="form-group" style="grid-column: span 3;">
          <label>Etiqueta</label>
          <div class="tags-container">
            <div class="tags-input-container">
              <input type="text" class="tags-search" placeholder="Buscar etiquetas...">
              <div class="tags-dropdown">
                <div class="tags-options"></div>
              </div>
            </div>
            <div class="tags-list"></div>
          </div>
          <select name="etiqueta[]" multiple style="display: none;"></select>
        </div>
        <div class="form-group"><label>Nombre cliente</label><input type="text" name="clienteNombre" readonly></div>
        <div class="form-group"><label>Correo</label><input type="text" name="clienteCorreo" readonly></div>
        <div class="form-group"><label>Celular</label><input type="text" name="clienteCelular" readonly></div>
        <div class="form-group" style="grid-column: span 3;">
          <label>Comentario</label>
          <textarea name="comentario" rows="4" placeholder="Agrega observaciones o detalles adicionales..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" id="guardarOportunidad">Guardar Oportunidad</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Esperar a que el modal esté en el DOM
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    console.log("Cargando opciones para el modal de oportunidad...");

     // 1 Obtener interacción y extraer channel/campaign
    const interaction = await iframeInstance.getInteraction();
    const asesorLogin = interaction?.lastMessage?.source || interaction?.source || interaction?.agent || interaction?.user || null;
    const channel = interaction?.channel || interaction?.stored_values?.interaction_channel || null;
    const campaign = interaction?.campaign || interaction?.stored_values?.interaction_campaign || null;

    console.log("🔎 Extraídos de la interacción -> channel:", channel, "campaign:", campaign, "asesor:", asesorLogin );

    // Detectar empresa desde la campaña
    const empresaDetectada = detectarEmpresaDesdeCampana(campaign);
    console.log("🏢 Empresa detectada desde campaña:", empresaDetectada);

    // Cargar opciones iniciales pasando la empresa detectada
    const opcionesMapeadas = await cargarOpcionesOportunidad({ channel, campaign, empresa: empresaDetectada });
    console.log("Opciones cargadas correctamente");

    // Configurar el componente de tags
    setupTagsInput(modal, opcionesMapeadas.etiqueta);

    // Pre-seleccionar empresa si fue detectada desde la campaña
    const selectEmpresa = modal.querySelector('select[name="empresa"]');
    if (selectEmpresa && empresaDetectada && opcionesMapeadas.empresa.length === 1) {
      // Si solo hay una empresa disponible (filtrada por campaña), seleccionarla automáticamente
      const empresaId = opcionesMapeadas.empresa[0].id;
      selectEmpresa.value = empresaId;

      // Cargar las opciones dependientes inmediatamente
      console.log(`✅ Empresa pre-seleccionada: ${empresaDetectada} (ID: ${empresaId})`);

      const opcionesConDependencias = await cargarOpcionesOportunidad({
        channel,
        campaign,
        company_id: empresaId,
        empresa: empresaDetectada
      });

      // Actualizar tags con las opciones de la empresa seleccionada
      setupTagsInput(modal, opcionesConDependencias.etiqueta);
    }

    // Configurar evento onChange para el select de empresa
    if (selectEmpresa) {
      selectEmpresa.addEventListener('change', async (e) => {
        const empresaSeleccionada = e.target.value;

        if (!empresaSeleccionada) {
          // Si se deselecciona la empresa, limpiar los demás campos
          ['vendedor', 'equipo', 'media', 'origen'].forEach(campo => {
            const select = modal.querySelector(`select[name="${campo}"]`);
            if (select) {
              select.innerHTML = '<option value="">Seleccione...</option>';
            }
          });
          return;
        }

        console.log(`🔄 Empresa seleccionada: ${empresaSeleccionada}, recargando opciones...`);

        // Recargar opciones filtradas por empresa
        const nuevasOpciones = await cargarOpcionesOportunidad({
          channel,
          campaign,
          company_id: empresaSeleccionada
        });

        // Actualizar el componente de tags con las nuevas etiquetas
        setupTagsInput(modal, nuevasOpciones.etiqueta);

        console.log("✅ Opciones actualizadas para la empresa seleccionada");
      });
    }
  } catch (error) {
    console.error("Error al cargar opciones:", error);
  }

  // Precargar cliente
  const nombre = document.querySelector('[name=nombre]')?.value || '';
  const primerApellido = document.querySelector('[name=primerApellido]')?.value || '';
  const segundoApellido = document.querySelector('[name=segundoApellido]')?.value || '';
  const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`.trim();

  modal.querySelector('[name=clienteNombre]').value = nombreCompleto;
  modal.querySelector('[name=clienteCorreo]').value = document.querySelector('[name=correo]')?.value || '';
  modal.querySelector('[name=clienteCelular]').value = document.querySelector('[name=celular]')?.value || '';

  // Cerrar modal
  modal.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('active-modal');
  });

  // Guardar oportunidad
  const btnGuardar = modal.querySelector('#guardarOportunidad');
  btnGuardar.addEventListener('click', async () => {
    const hiddenSelect = modal.querySelector('select[name="etiqueta[]"]');
    const etiquetasSeleccionadas = Array.from(hiddenSelect.selectedOptions).map(opt => opt.value);
    
    if (etiquetasSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos una etiqueta');
      return;
    }

    const datos = {
      empresa: modal.querySelector('[name="empresa"]').value,
      vendedor: modal.querySelector('[name="vendedor"]').value,
      equipo: modal.querySelector('[name="equipo"]').value,
      media: modal.querySelector('[name="media"]').value,
      origen: modal.querySelector('[name="origen"]').value,
      nombreOportunidad: modal.querySelector('[name="nombreOportunidad"]').value,
      etiqueta: etiquetasSeleccionadas,
      clienteNombre: modal.querySelector('[name="clienteNombre"]').value,
      clienteCorreo: modal.querySelector('[name="clienteCorreo"]').value,
      clienteCelular: modal.querySelector('[name="clienteCelular"]').value,
      comentario: modal.querySelector('[name="comentario"]').value
    };

    try {
      // interacción: guid, asesor, canal y campaña
      const interaction = await iframeInstance.getInteraction();
      if (interaction?.guid) datos.interactionId = interaction.guid;

      datos.asesorLogin =
        interaction?.lastMessage?.source ||
        interaction?.source ||
        interaction?.agent ||
        interaction?.user || null;

      datos.channel  = interaction?.channel  || interaction?.stored_values?.interaction_channel  || null;
      datos.campaign = interaction?.campaign || interaction?.stored_values?.interaction_campaign || null;

      datos.documento = document.getElementById('documento')?.value || '';
      console.log("🔁 Datos que se enviarán al webhook:", datos);

      const response = await fetch('https://livecenter.ucontactcloud.com/api/webhook/api_workflow_sociabpo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo: "crear_oportunidad", data: datos })
      });

      const result = await response.json();
      console.log("🧾 Respuesta cruda del backend:", result);

      const parsed = result.result.result;
      console.log("📦 Resultado parseado:", parsed);

      if (parsed.id) {
        alert('✅ Oportunidad registrada correctamente');
        modal.classList.remove('active-modal');
        iframeInstance.sent();
      } else {
        alert('❌ No se pudo registrar la oportunidad');
      }
    } catch (error) {
      console.error('Error al crear oportunidad:', error);
      alert('❌ Hubo un error al enviar la oportunidad');
    }
  });
}

function setupTagsInput(modal, opcionesEtiquetas) {
  const tagsContainer = modal.querySelector('.tags-container');
  const tagsList = modal.querySelector('.tags-list');
  const tagsSearch = modal.querySelector('.tags-search');
  const tagsDropdown = modal.querySelector('.tags-dropdown');
  const tagsOptions = modal.querySelector('.tags-options');
  const hiddenSelect = modal.querySelector('select[name="etiqueta[]"]');
  
  let selectedTags = [];
  let allOptions = opcionesEtiquetas;

  // Renderizar tags seleccionados
  function renderTags() {
    tagsList.innerHTML = '';
    if (selectedTags.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'tags-placeholder';
      placeholder.textContent = 'Seleccionadas...';
      tagsList.appendChild(placeholder);
    } else {
      selectedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
          ${tag.nombre}
          <span class="tag-remove" data-id="${tag.id}">&times;</span>
        `;
        tagsList.appendChild(tagElement);
      });
    }
    
    // Actualizar el select oculto
    hiddenSelect.innerHTML = '';
    selectedTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag.id;
      option.selected = true;
      hiddenSelect.appendChild(option);
    });
  }

  // Renderizar opciones del dropdown
  function renderOptions(filter = '') {
    tagsOptions.innerHTML = '';
    const filtered = allOptions.filter(opt => 
      opt.nombre.toLowerCase().includes(filter.toLowerCase()) && 
      !selectedTags.some(t => t.id === opt.id)
    );
    
    if (filtered.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'tag-option';
      noResults.textContent = 'No hay resultados';
      tagsOptions.appendChild(noResults);
      return;
    }
    
    filtered.forEach(opt => {
      const option = document.createElement('div');
      option.className = 'tag-option';
      option.textContent = opt.nombre;
      option.dataset.id = opt.id;
      tagsOptions.appendChild(option);
      
      option.addEventListener('click', () => {
        selectedTags.push(opt);
        renderTags();
        tagsSearch.value = '';
        renderOptions();
        tagsSearch.focus();
      });
    });
  }

  // Eventos
  tagsSearch.addEventListener('focus', () => {
    tagsDropdown.classList.add('show');
    renderOptions();
  });

  tagsSearch.addEventListener('input', (e) => {
    renderOptions(e.target.value);
  });

  document.addEventListener('click', (e) => {
    if (!tagsContainer.contains(e.target)) {
      tagsDropdown.classList.remove('show');
    }
  });

  tagsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-remove')) {
      const id = e.target.dataset.id;
      selectedTags = selectedTags.filter(tag => tag.id !== id);
      renderTags();
      renderOptions(tagsSearch.value);
    }
  });

  // Inicializar
  renderTags();
  renderOptions();
}

async function cargarOpcionesOportunidad({ channel = null, campaign = null, company_id = null, empresa = null } = {}) {
  console.log("Iniciando carga de opciones de oportunidad...", { channel, campaign, company_id, empresa });
  try {
    const res = await fetch('https://livecenter.ucontactcloud.com/api/webhook/api_workflow_sociabpo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodo: "opciones_oportunidad", data: { channel, campaign, company_id, empresa } })
    });

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const json = await res.json();
    const opciones = json.result.result

    console.log("Opciones parseadas:", opciones);

    const opcionesMapeadas = {
      empresa: opciones.company_id?.map(item => ({ id: item[0], nombre: item[1] })) || [],
      vendedor: opciones.user_id?.map(item => ({ id: item[0], nombre: item[1] })) || [],
      equipo: opciones.team_id?.map(item => ({ id: item[0], nombre: item[1] })) || [],
      media: opciones.medium_id?.map(item => ({ id: item[0], nombre: item[1] })) || [],
      origen: opciones.source_id?.map(item => ({ id: item[0], nombre: item[1] })) || [],
      etiqueta: opciones.tag_id?.map(item => ({ id: item[0], nombre: item[1] })) || []
    };

    console.log("Opciones mapeadas:", opcionesMapeadas);

    const modal = document.getElementById('modal-oportunidad');
    if (!modal) {
      throw new Error("Modal no encontrado en el DOM");
    }

    // Cargar opciones para los selects normales (empresa, vendedor, etc.)
    const campos = ['empresa', 'vendedor', 'equipo', 'media', 'origen'];
    campos.forEach(campo => {
      const select = modal.querySelector(`select[name="${campo}"]`);
      if (!select) return;

      // Para empresa, mantener la selección actual
      const valorActual = select.value;

      select.innerHTML = '<option value="">Seleccione...</option>';
      opcionesMapeadas[campo].forEach(opt => {
        const option = new Option(opt.nombre, opt.id);
        select.add(option);
      });

      // Restaurar selección de empresa si existe
      if (campo === 'empresa' && valorActual) {
        select.value = valorActual;
      }
    });

    return opcionesMapeadas;
  } catch (err) {
    console.error("Error cargando opciones:", err);
    alert('Error al cargar opciones: ' + err.message);
    throw err;
  }
}
