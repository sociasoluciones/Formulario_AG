// utils/config.js

export function showTab(tabId) {
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => section.style.display = 'none');

  const selectedTab = document.getElementById(tabId);
  if (selectedTab) selectedTab.style.display = 'block';

  const tabs = document.querySelectorAll('.tabs a');
  tabs.forEach(tab => tab.classList.remove('active'));
  const activeTab = Array.from(tabs).find(tab => tab.getAttribute('onclick')?.includes(tabId));
  if (activeTab) activeTab.classList.add('active');
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

  console.log('🔍 Buscando cliente con:', { documento, tipoDocumento, celular, correo });

  try {
    const res = await fetch('https://livecenter.ucontactcloud.com/api/webhook/api_workflow_sociabpo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metodo: "obtener_datos",
        data: { documento, tipoDocumento, celular, correo }
      })
    });

    const resws = await res.json();
    const respuesta = resws.result.result;
    console.log(respuesta)
    const data = Array.isArray(respuesta) ? respuesta[0] : respuesta;

    const cliente = data.cliente || {};
    const vehiculos = data.vehiculos || [];

    document.querySelector('[name=nombre]').value = cliente.nombre || '';
    document.querySelector('[name=correo]').value = cliente.correo || '';
    document.querySelector('[name=celular]').value = cliente.celular || '';
    document.querySelector('[name=primerApellido]').value = cliente.primerApellido || '';
    document.querySelector('[name=segundoApellido]').value = cliente.segundoApellido || '';
    document.querySelector('[name=direccion]').value = cliente.direccion || '';
    document.querySelector('[name=fechaNacimiento]').value = cliente.fechaNacimiento || '';
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

    if (vehiculos.length > 0) mostrarModalVehiculos(vehiculos);

    cargarDatosComerciales(data);
    return data;
  } catch (err) {
    console.error('Error al buscar cliente:', err);
    alert('No se pudo encontrar información del cliente');
    throw err;
  }
}

export function mostrarModalVehiculos(vehiculos) {
  // Eliminar cualquier modal previo
  const existente = document.getElementById('modal-vehiculos');
  if (existente) existente.remove();

  // Crear nuevo modal
  const modal = document.createElement('div');
  modal.id = 'modal-vehiculos';
  modal.className = 'modal active-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h3>Seleccione un vehículo</h3>
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Fecha Entrega</th>
            <th>Chasis</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  document.body.appendChild(modal);

  // Rellenar la tabla ordenando por fecha de matrícula descendente
const tbody = modal.querySelector('tbody');
vehiculos
  .sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega))
  .forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.placa}</td>
      <td>${v.fecha_entrega || ''}</td>
      <td>${v.chasis}</td>
      <td>${v.marca}</td>
      <td>${v.modelo}</td>
      <td><button class="btn-select-vehiculo">Seleccionar</button></td>
    `;
    row.querySelector('.btn-select-vehiculo').addEventListener('click', () => seleccionarVehiculo(v));
    tbody.appendChild(row);
  });

  
  modal.querySelector('.close').addEventListener('click', cerrarModal);
}

export function cerrarModal() {
  const modal = document.getElementById('modal-vehiculos');
  if (modal) modal.classList.remove('active-modal');
}

export function seleccionarVehiculo(v) {
  document.querySelector('[name=placa]').value = v.placa || '';
  document.querySelector('[name=chasis]').value = v.chasis || '';
  document.querySelector('[name=marca]').value = v.marca || '';
  document.querySelector('[name=familia]').value = v.familia || '';
  document.querySelector('[name=modelo]').value = v.modelo || '';
  document.querySelector('[name=fecha_entrega]').value = v.fecha_entrega || '';
  document.querySelector('[name=fechaSoat]').value = v.fechaSoat || '';
  document.querySelector('[name=fechaTecnomecanica]').value = v.fechaTecnomecanica || '';
  document.querySelector('[name=fechaPoliza]').value = v.fechaPoliza || '';
  cerrarModal();
}



export function cargarDatosComerciales(data) {
  llenarTabla('tabla-oportunidades', data.oportunidades);
  llenarTabla('tabla-cotizaciones', data.cotizaciones);
  llenarTabla('tabla-facturas', data.facturas);
}

export function llenarTabla(idTabla, datos) {
  const tbody = document.getElementById(idTabla);
  if (!tbody) return;
  tbody.innerHTML = '';

  const columnas = {
    'tabla-oportunidades': d => `
      <td>${d.fecha || ''}</td>
      <td>${d.vendedor || ''}</td>
      <td>${d.nombreoportunidad || ''}</td>
      <td>${d.equiposede || ''}</td>
      <td>${d.etapa || ''}</td>
      <td>${d.actividad || ''}</td>
      <td>${d.jivochat || ''}</td>
    `,
    'tabla-cotizaciones': d => `
      <td>${d.fecha || ''}</td>
      <td>${d.estado || ''}</td>
      <td>${d.vendedor || ''}</td>
      <td>${d.marca || ''}</td>
      <td>${d.familia || ''}</td>
      <td>${d.modelo || ''}</td>
      <td>${d.equiposede || ''}</td>
    `,
    'tabla-facturas': d => `
      <td>${d.placa || ''}</td>
      <td>${d.fecha_cierre || ''}</td>
      <td>${d.fecha_matricula || ''}</td>
      <td>${d.fecha_entrega || ''}</td>
      <td>${d.nombrevendedor || ''}</td>
      <td>${d.nombremarca || ''}</td>
      <td>${d.familia || ''}</td>
      <td>${d.modelo || ''}</td>
      <td>${d.sede || ''}</td>
      <td>${d.chasis || ''}</td>
    `
  };

  const numColumnas = {
    'tabla-oportunidades': 7,
    'tabla-cotizaciones': 7,
    'tabla-facturas': 10
  }[idTabla] || 6;

  if (!Array.isArray(datos) || datos.length === 0) {
    for (let i = 0; i < 6; i++) {
      const filaVacia = document.createElement('tr');
      filaVacia.innerHTML = '<td>&nbsp;</td>'.repeat(numColumnas);
      tbody.appendChild(filaVacia);
    }
    return;
  }

  datos.forEach(d => {
    const fila = document.createElement('tr');
    fila.innerHTML = columnas[idTabla] ? columnas[idTabla](d) : '';
    tbody.appendChild(fila);
  });

  const filasActuales = tbody.querySelectorAll('tr').length;
  for (let i = filasActuales; i < 6; i++) {
    const filaVacia = document.createElement('tr');
    filaVacia.innerHTML = '<td>&nbsp;</td>'.repeat(numColumnas);
    tbody.appendChild(filaVacia);
  }
}
