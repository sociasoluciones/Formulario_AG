// utils/mockData.js
// Datos mock para desarrollo local - intercepta llamadas al webhook en desarrollo

export const mockApiResponses = {
  obtener_datos: (params) => {
    console.log('🔧 Mock API: obtener_datos', params);
    return {
      result: {
        result: {
          cliente: {
            nombre: "María",
            primerApellido: "González",
            segundoApellido: "Ramírez",
            correo: "maria.gonzalez@example.com",
            celular: "3009876543",
            direccion: "Carrera 45 #67-89",
            fechaNacimiento: "1990-03-20T00:00:00",
            genero: "Mujer",
            vendedorVN: "Laura Martínez",
            vendedorVU: "Diego Fernández",
            recepcionista: "Carmen Silva",
            vendedorAlmacen: "Roberto Díaz"
          },
          vehiculos: [
            {
              placa: "DEF456",
              fecha_entrega: "2024-02-10",
              chasis: "3HGBH41JXMN109188",
              marca: "Mazda",
              familia: "CX-5",
              modelo: "2024",
              fechaSoat: "2025-02-10",
              fechaTecnomecanica: "2025-01-15",
              fechaPoliza: "2024-12-20"
            },
            {
              placa: "GHI789",
              fecha_entrega: "2021-11-05",
              chasis: "4HGBH41JXMN109189",
              marca: "Toyota",
              familia: "Corolla",
              modelo: "2021",
              fechaSoat: "2024-11-05",
              fechaTecnomecanica: "2024-10-20",
              fechaPoliza: "2024-09-15"
            }
          ],
          oportunidades: [
            {
              fecha: "2024-02-15",
              vendedor: "Laura Martínez",
              nombreoportunidad: "Compra Mazda CX-30",
              equiposede: "Medellín Centro",
              etapa: "Prospección",
              actividad: "Email enviado",
              URL: "https://example.com/oportunidad/456"
            },
            {
              fecha: "2024-01-20",
              vendedor: "Laura Martínez",
              nombreoportunidad: "Test Drive CX-5",
              equiposede: "Medellín Centro",
              etapa: "Calificación",
              actividad: "Test drive agendado",
              URL: "https://example.com/oportunidad/457"
            }
          ],
          cotizaciones: [
            {
              fecha: "2024-02-12",
              estado: "Pendiente",
              vendedor: "Laura Martínez",
              marca: "Mazda",
              familia: "CX-30",
              modelo: "Grand Touring 2024",
              equiposede: "Medellín Centro",
              link: "https://example.com/cotizacion/789"
            }
          ],
          facturas: [
            {
              placa: "DEF456",
              fechafactura: "2024-02-08",
              fechamatricula: "2024-02-09",
              fechaentrega: "2024-02-10",
              vendedor: "Laura Martínez",
              marca: "Mazda",
              familia: "CX-5",
              modelo: "2024",
              sede: "Medellín Centro",
              chasis: "3HGBH41JXMN109188"
            }
          ]
        }
      }
    };
  },

  actualizar_datos: (params) => {
    console.log('🔧 Mock API: actualizar_datos', params);
    return {
      result: {
        result: {
          id: "mock-cliente-" + Date.now(),
          success: true,
          message: "Cliente actualizado correctamente (mock)"
        }
      }
    };
  },

  crear_oportunidad: (params) => {
    console.log('🔧 Mock API: crear_oportunidad', params);
    return {
      result: {
        result: {
          id: "mock-oportunidad-" + Date.now(),
          success: true,
          message: "Oportunidad creada correctamente (mock)"
        }
      }
    };
  },

  opciones_oportunidad: (params) => {
    console.log('🔧 Mock API: opciones_oportunidad', params);

    const { company_id, channel, campaign, empresa } = params;

    // Detectar empresa desde campaña si no viene company_id
    let empresaFiltro = empresa;
    if (!empresaFiltro && campaign) {
      const campaignUpper = campaign.toUpperCase();
      if (campaignUpper.startsWith('AG_')) {
        empresaFiltro = 'AGENCIAUTO';
      } else if (campaignUpper.startsWith('MG_')) {
        empresaFiltro = 'MEGAUTO';
      }
    }

    console.log('🔍 Empresa filtro aplicado:', empresaFiltro);

    // Mapeo de empresas a IDs
    const empresaIds = {
      'AGENCIAUTO': 1,
      'MEGAUTO': 2
    };

    // Si no hay company_id, retornar empresas filtradas o todas
    if (!company_id) {
      let empresasDisponibles = [
        [1, "Agenciauto"],
        [2, "Megauto"]
      ];

      // Si hay empresa detectada, filtrar solo esa
      if (empresaFiltro && empresaIds[empresaFiltro]) {
        const idEmpresa = empresaIds[empresaFiltro];
        empresasDisponibles = empresasDisponibles.filter(emp => emp[0] === idEmpresa);
      }

      return {
        result: {
          result: {
            company_id: empresasDisponibles,
            user_id: [],
            team_id: [],
            medium_id: [],
            source_id: [],
            tag_id: []
          }
        }
      };
    }

    // Datos específicos por empresa
    const datosPorEmpresa = {
      1: { // Agenciauto
        user_id: [
          [101, "Laura Martínez"],
          [102, "Carlos Rodríguez"],
          [103, "Ana Torres"]
        ],
        team_id: [
          [201, "Bogotá Norte"],
          [202, "Bogotá Sur"],
          [203, "Medellín Centro"]
        ],
        medium_id: [
          [301, "Llamada telefónica"],
          [302, "WhatsApp"],
          [303, "Email"]
        ],
        source_id: [
          [401, "Campaña digital"],
          [402, "Referido"],
          [403, "Cliente recurrente"]
        ],
        tag_id: [
          [501, "VIP"],
          [502, "Primera compra"],
          [503, "Financiación"],
          [504, "Test drive"]
        ]
      },
      2: { // Megauto
        user_id: [
          [104, "Diego Fernández"],
          [105, "María López"],
          [106, "Roberto Díaz"]
        ],
        team_id: [
          [204, "Cali Valle"],
          [205, "Barranquilla Atlántico"]
        ],
        medium_id: [
          [304, "Chat web"],
          [305, "Presencial"]
        ],
        source_id: [
          [404, "Base de datos"],
          [405, "Redes sociales"]
        ],
        tag_id: [
          [505, "Test drive"],
          [506, "Postventa"],
          [507, "Repuestos"]
        ]
      }
    };

    const empresaSeleccionada = datosPorEmpresa[company_id] || datosPorEmpresa[1];

    return {
      result: {
        result: {
          company_id: [
            [1, "Agenciauto"],
            [2, "Megauto"]
          ],
          ...empresaSeleccionada
        }
      }
    };
  }
};

// Interceptor de fetch para desarrollo
export function setupMockApi() {
  // Solo en desarrollo (cuando window.parent === window)
  if (window.parent !== window) {
    console.log('🌐 Producción: usando API real');
    return;
  }

  console.log('🔧 Modo desarrollo: interceptando llamadas API con mocks');

  const originalFetch = window.fetch;

  window.fetch = async function(url, options) {
    // Solo interceptar llamadas al webhook de uContact
    if (url.includes('api_workflow_sociabpo')) {
      try {
        const body = JSON.parse(options.body);
        const { metodo, data } = body;

        console.log(`🔧 Mock interceptado: ${metodo}`, data);

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        // Retornar respuesta mock
        if (mockApiResponses[metodo]) {
          const mockResponse = mockApiResponses[metodo](data);
          return {
            ok: true,
            status: 200,
            json: async () => mockResponse
          };
        } else {
          console.warn(`⚠️ Mock no definido para método: ${metodo}`);
          return {
            ok: false,
            status: 404,
            json: async () => ({ error: `Mock no implementado para: ${metodo}` })
          };
        }
      } catch (error) {
        console.error('Error en mock API:', error);
      }
    }

    // Para otras URLs, usar fetch original
    return originalFetch.apply(this, arguments);
  };
}
