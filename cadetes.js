// ============================================================
//  CADETES DE CONFIANZA — San Nicolás de los Arroyos
//  Archivo de datos: cadetes.js
// ============================================================
//
//  Para agregar un cadete nuevo:
//  1. Copiá el bloque comentado al final de este archivo
//  2. Descomentalo (quitá los /* y */)
//  3. Completá los campos
//  4. Guardá y hacé deploy en Vercel
//
// ============================================================

const cadetes = [

  // ── CADETE DE EJEMPLO (real, visible) ────────────────────
  {
    nombre: "Martín Rodríguez",
    foto: "fotos/martin.jpg",          // Ruta relativa a la carpeta fotos/
    telefono: "5493364000000",          // Formato: 549 + código de área + número (sin 0 ni 15)
    vehiculos: ["moto"],                // Opciones: "moto", "auto", "bicicleta", "camioneta", "utilitario"
    zonas: ["Centro", "Matheu", "Villa del Parque", "Las Quintas"],
    zonas_no: ["Zona Rural", "Ramallo"],
    horario: { inicio: "08:00", fin: "20:00" },
    tarifaMinima: 1500,                 // En pesos argentinos
    extra: "Acepta pago en efectivo y transferencia. Hace mandados y gestiones bancarias.",
  },

  // ── OTRO CADETE DE EJEMPLO ───────────────────────────────
  {
    nombre: "Laura Gómez",
    foto: "fotos/laura.jpg",
    telefono: "5493364111111",
    vehiculos: ["auto", "moto"],
    zonas: ["Centro", "Güemes", "Alem", "Cooperativa"],
    zonas_no: [],
    horario: { inicio: "09:00", fin: "18:00" },
    tarifaMinima: 2000,
    extra: "Especializada en documentación y trámites. No hace mudanzas.",
  },

];

// ============================================================
//  PLANTILLA PARA NUEVO CADETE — Copiá, descomentá y completá
// ============================================================
/*
{
  nombre: "",
  foto: "fotos/NOMBRE_ARCHIVO.jpg",   // Subí la foto a la carpeta fotos/
  telefono: "5493364",                 // Completá con el número completo
  vehiculos: ["moto"],                 // "moto", "auto", "bicicleta", "camioneta", "utilitario"
  zonas: ["Centro"],                   // Barrios donde SÍ va
  zonas_no: [],                        // Barrios donde NO va (podés dejarlo vacío: [])
  horario: { inicio: "08:00", fin: "20:00" },
  tarifaMinima: 0,                     // Tarifa mínima en pesos
  extra: "",                           // Info adicional. Podés dejarlo vacío: ""
},
*/
