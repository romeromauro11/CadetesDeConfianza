// ============================================================
//  CADETES DE CONFIANZA — app.js
//  Lógica principal: tarjetas, disponibilidad, filtros, reloj
// ============================================================

// ── ÍCONOS POR TIPO DE VEHÍCULO ─────────────────────────────
const vehiculoIconos = {
  moto:       "🛵 Moto",
  auto:       "🚗 Auto",
  bicicleta:  "🚲 Bicicleta",
  camioneta:  "🚐 Camioneta",
  utilitario: "🚚 Utilitario",
};

// ── VERIFICAR SI UN CADETE ESTÁ DISPONIBLE AHORA ────────────
function estaDisponible(cadete) {
  const ahora  = new Date();
  const hoy    = new Date();

  const [hIni, mIni] = cadete.horario.inicio.split(":").map(Number);
  const [hFin, mFin] = cadete.horario.fin.split(":").map(Number);

  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), hIni, mIni);
  const fin    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), hFin, mFin);

  return ahora >= inicio && ahora <= fin;
}

// ── CONSTRUIR UNA TARJETA ────────────────────────────────────
function crearTarjeta(cadete) {
  const tpl  = document.getElementById("tpl-tarjeta");
  const card = tpl.content.cloneNode(true).querySelector(".tarjeta");
  const disp = estaDisponible(cadete);

  // Estado CSS
  card.classList.add(disp ? "disponible" : "no-disponible");
  card.querySelector(".tarjeta-estado-badge").textContent = disp ? "Disponible" : "Fuera de horario";

  // Foto
  const img = card.querySelector(".tarjeta-foto");
  if (cadete.foto) {
    img.src = cadete.foto;
    img.alt = cadete.nombre;
    img.onerror = () => { img.style.display = "none"; };
  }

  // Nombre
  card.querySelector(".tarjeta-nombre").textContent = cadete.nombre;

  // Vehículos
  const vehWrap = card.querySelector(".tarjeta-vehiculos");
  cadete.vehiculos.forEach(v => {
    const chip = document.createElement("span");
    chip.className = "vehiculo-chip";
    chip.textContent = vehiculoIconos[v] || v;
    vehWrap.appendChild(chip);
  });

  // Horario
  card.querySelector(".tarjeta-horario-texto").textContent =
    `${cadete.horario.inicio} – ${cadete.horario.fin}`;

  const estadoEl = card.querySelector(".tarjeta-estado-texto");
  estadoEl.textContent   = disp ? "En horario" : "Sin servicio";
  estadoEl.className     = "tarjeta-estado-texto " + (disp ? "estado-activo" : "estado-inactivo");

  // Tarifa
  card.querySelector(".tarjeta-tarifa-texto").textContent =
    `Tarifa mínima: $${cadete.tarifaMinima.toLocaleString("es-AR")}`;

  // Zonas SÍ
  const zonaSiWrap = document.createElement("div");
  zonaSiWrap.className = "zona-chips";
  cadete.zonas.forEach(z => {
    const chip = document.createElement("span");
    chip.className = "zona-chip si";
    chip.textContent = z;
    zonaSiWrap.appendChild(chip);
  });
  card.querySelector(".tarjeta-zonas-si").appendChild(zonaSiWrap);

  // Zonas NO
  if (cadete.zonas_no && cadete.zonas_no.length > 0) {
    const zonaNoSeccion = card.querySelector(".tarjeta-zonas-no-seccion");
    zonaNoSeccion.style.display = "flex";
    const zonaNoWrap = document.createElement("div");
    zonaNoWrap.className = "zona-chips";
    cadete.zonas_no.forEach(z => {
      const chip = document.createElement("span");
      chip.className = "zona-chip no";
      chip.textContent = z;
      zonaNoWrap.appendChild(chip);
    });
    card.querySelector(".tarjeta-zonas-no").appendChild(zonaNoWrap);
  }

  // Extra
  const extraEl = card.querySelector(".tarjeta-extra");
  if (cadete.extra) {
    extraEl.textContent = cadete.extra;
  } else {
    extraEl.style.display = "none";
  }

  // WhatsApp
  const waLink = card.querySelector(".btn-whatsapp");
  if (disp) {
    waLink.href = `https://wa.me/${cadete.telefono}`;
  } else {
    waLink.href = "#";
    waLink.title = "El cadete no está disponible en este horario";
  }

  // Guardar datos para filtros
  card.dataset.zonas     = cadete.zonas.join("|").toLowerCase();
  card.dataset.vehiculos = cadete.vehiculos.join("|").toLowerCase();
  card.dataset.disp      = disp ? "1" : "0";

  return card;
}

// ── INICIALIZAR OPCIONES DE ZONA EN EL SELECT ───────────────
function poblarFiltroZonas() {
  const todas = new Set();
  cadetes.forEach(c => c.zonas.forEach(z => todas.add(z)));
  const select = document.getElementById("filtro-zona");
  [...todas].sort().forEach(z => {
    const opt = document.createElement("option");
    opt.value = z.toLowerCase();
    opt.textContent = z;
    select.appendChild(opt);
  });
}

// ── APLICAR FILTROS ──────────────────────────────────────────
function aplicarFiltros() {
  const zona     = document.getElementById("filtro-zona").value;
  const vehiculo = document.getElementById("filtro-vehiculo").value;
  const soloDisp = document.getElementById("filtro-disponibles").checked;

  const tarjetas = document.querySelectorAll(".tarjeta");
  let visibles = 0;

  tarjetas.forEach(t => {
    const matchZona     = !zona     || t.dataset.zonas.split("|").includes(zona);
    const matchVehiculo = !vehiculo || t.dataset.vehiculos.split("|").includes(vehiculo);
    const matchDisp     = !soloDisp || t.dataset.disp === "1";

    const mostrar = matchZona && matchVehiculo && matchDisp;
    t.style.display = mostrar ? "" : "none";
    if (mostrar) visibles++;
  });

  const contador = document.getElementById("contador-resultado");
  contador.textContent = `Mostrando ${visibles} de ${cadetes.length} cadetes`;
}

// ── RELOJ EN TIEMPO REAL ─────────────────────────────────────
function actualizarReloj() {
  const ahora = new Date();
  const h = ahora.getHours().toString().padStart(2, "0");
  const m = ahora.getMinutes().toString().padStart(2, "0");
  document.getElementById("reloj").textContent = `${h}:${m}`;
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
function init() {
  const grilla = document.getElementById("grilla");
  cadetes.forEach(c => grilla.appendChild(crearTarjeta(c)));

  poblarFiltroZonas();
  aplicarFiltros();

  document.getElementById("filtro-zona").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-vehiculo").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-disponibles").addEventListener("change", aplicarFiltros);

  document.getElementById("btn-limpiar").addEventListener("click", () => {
    document.getElementById("filtro-zona").value = "";
    document.getElementById("filtro-vehiculo").value = "";
    document.getElementById("filtro-disponibles").checked = false;
    aplicarFiltros();
  });

  actualizarReloj();
  setInterval(actualizarReloj, 30000);

  document.getElementById("anio-footer").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);
