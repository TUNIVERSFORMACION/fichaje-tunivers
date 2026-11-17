// ═══════════════════════════════════════════════════════════════
// OBLIGACIONES Y AVISOS — Tunivers Formación
// Agenda laboral: qué presentar en Sistema RED, SILTRA (Sistema de
// Liquidación Directa), Contrat@, Certific@2 y la Agencia Tributaria,
// con sus plazos; avisos por empleado; resúmenes para SILTRA y los
// modelos 111 y 190; comprobación en el BOE de actualizaciones de los
// convenios y de la normativa de cotización.
// Depende de nominas.js (NOM, r2, num, eur, esc, MESES_NOM…).
// ═══════════════════════════════════════════════════════════════

// ── FECHAS Y DÍAS HÁBILES ───────────────────────────────────────
function oblFecha(a, m, d) { return new Date(a, m - 1, d); }
function oblIso(f) { return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`; }
function oblFmt(f) { return f.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
function oblHoy() { const h = new Date(); return new Date(h.getFullYear(), h.getMonth(), h.getDate()); }
function oblDias(desde, hasta) { return Math.round((hasta - desde) / 86400000); }
function oblSumarDias(f, n) { const x = new Date(f); x.setDate(x.getDate() + n); return x; }
function oblUltimoDia(a, m) { return new Date(a, m, 0); }

// Domingo de Pascua (algoritmo de Meeus/Butcher)
function oblPascua(a) {
  const b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4;
  const g = Math.floor((c + 8) / 25), h = Math.floor((c - g + 1) / 3), i = (19 * b + c - e - h + 15) % 30;
  const k = Math.floor(d / 4), l = d % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * i + 22 * m) / 451);
  const mes = Math.floor((i + m - 7 * n + 114) / 31), dia = ((i + m - 7 * n + 114) % 31) + 1;
  return new Date(a, mes - 1, dia);
}

// Festivos nacionales comunes (sin los autonómicos ni locales)
function oblFestivos(a) {
  const fijos = ["01-01", "01-06", "05-01", "08-15", "10-12", "11-01", "12-06", "12-08", "12-25"].map(s => `${a}-${s}`);
  fijos.push(oblIso(oblSumarDias(oblPascua(a), -2)));  // Viernes Santo
  return new Set(fijos);
}

// Si el plazo acaba en sábado, domingo o festivo, pasa al siguiente día hábil
function oblHabil(f) {
  let x = new Date(f);
  while (x.getDay() === 0 || x.getDay() === 6 || oblFestivos(x.getFullYear()).has(oblIso(x))) x = oblSumarDias(x, 1);
  return x;
}

// Para lo que hay que hacer "antes de": se adelanta al día hábil anterior
function oblHabilAnterior(f) {
  let x = new Date(f);
  while (x.getDay() === 0 || x.getDay() === 6 || oblFestivos(x.getFullYear()).has(oblIso(x))) x = oblSumarDias(x, -1);
  return x;
}

// ── PLAZOS ──────────────────────────────────────────────────────
const OBL_DONDE = {
  siltra: { nombre: "SILTRA / SLD", color: "#185fa5", bg: "#e6f1fb" },
  red: { nombre: "Sistema RED", color: "#0F6E56", bg: "#eaf3de" },
  aeat: { nombre: "Agencia Tributaria", color: "#854f0b", bg: "#faeeda" },
  sepe: { nombre: "SEPE", color: "#6c3483", bg: "#f4ecf7" },
  empresa: { nombre: "Empresa", color: "#2C3E50", bg: "#e8edf2" },
  convenio: { nombre: "Convenio / normativa", color: "#993C1D", bg: "#fcebeb" },
};

function oblMesNombre(m) { return MESES_NOM[(m + 11) % 12]; }

// Plazos generales y de cada empleado entre dos fechas
function oblPlazos(desde, hasta) {
  const plazos = [];
  const add = (id, fecha, donde, titulo, detalle) => { if (fecha >= desde && fecha <= hasta) plazos.push({ id, fecha, donde, titulo, detalle }); };
  for (let x = new Date(desde.getFullYear(), desde.getMonth() - 1, 1); x <= hasta; x = new Date(x.getFullYear(), x.getMonth() + 1, 1)) {
    const a = x.getFullYear(), m = x.getMonth() + 1;
    const mesAnt = oblMesNombre(m - 1), anioAnt = m === 1 ? a - 1 : a;
    const sufijo = `${a}-${String(m).padStart(2, "0")}`;

    add(`pago-${sufijo}`, oblHabilAnterior(oblFecha(a, m, 5)), "empresa", `Pagar las nóminas de ${mesAnt}`,
      "Los dos convenios fijan el pago en los cinco primeros días del mes siguiente. Entrega el recibo de salarios a cada persona.");
    add(`sld-borrador-${sufijo}`, oblHabilAnterior(oblFecha(a, m, 10)), "siltra", `Seguros sociales de ${mesAnt}: comunicar conceptos retributivos y pedir el borrador`,
      `En SILTRA o RED Directo: comunica los conceptos retributivos abonados (CRA) de ${mesAnt} ${anioAnt}, solicita el cálculo del borrador y compáralo con el resumen de cotización de la app (pestaña Obligaciones › Resumen SILTRA).`);
    add(`sld-cargo-${sufijo}`, oblHabilAnterior(oblFecha(a, m, 20)), "siltra", `Seguros sociales de ${mesAnt}: confirmar si pagas por cargo en cuenta`,
      "Para pagar por domiciliación (cargo en cuenta) hay que confirmar la liquidación antes del cierre de cargo en cuenta, que suele ser el día 22 (el 20 en algunos meses; consulta el calendario del SLD de este mes). El adeudo se hace el último día hábil del mes.");
    add(`sld-fin-${sufijo}`, oblSumarDias(oblUltimoDia(a, m), -1), "siltra", `Seguros sociales de ${mesAnt}: último día para confirmar`,
      "La confirmación de la liquidación acaba a las 23:59 del penúltimo día natural del mes. El pago por otros medios (recibo con código de barras) se hace hasta el último día del mes. Fuera de plazo hay recargo.");

    if ([1, 4, 7, 10].includes(m)) {
      const t = { 1: 4, 4: 1, 7: 2, 10: 3 }[m];
      add(`111-dom-${sufijo}`, oblHabilAnterior(oblFecha(a, m, 15)), "aeat", `Modelo 111 del ${t}.º trimestre: fin del plazo si lo domicilias`,
        "Si pagas el 111 por domiciliación bancaria, preséntalo antes (suele ser hasta el día 15).");
      add(`111-${sufijo}`, oblHabil(oblFecha(a, m, 20)), "aeat", `Modelo 111 del ${t}.º trimestre ${t === 4 ? a - 1 : a}: retenciones de IRPF`,
        "Retenciones e ingresos a cuenta del trimestre. Los importes los tienes en Obligaciones › Modelo 111.");
    }
    if (m === 1) {
      add(`190-${a}`, oblHabil(oblFecha(a, 1, 31)), "aeat", `Modelo 190: resumen anual de retenciones de ${a - 1}`,
        "Un registro por cada perceptor con percepciones, retenciones, cotizaciones y datos del modelo 145. Los tienes en Obligaciones › Modelo 190.");
      add(`params-${a}`, oblFecha(a, 1, 2), "convenio", `Año nuevo: revisar parámetros de ${a}`,
        "Comprueba: orden de cotización del año (bases y tipos), SMI, cambios del IRPF, tarifa de accidentes de trabajo y tablas salariales de los dos convenios. Actualízalos en Empresa y parámetros y en Convenios.");
      add(`145-${a}`, oblHabilAnterior(oblFecha(a, 1, 8)), "empresa", "Pedir el modelo 145 actualizado",
        "Pide a cada persona que comunique cambios en su situación familiar (hijos, ascendientes, discapacidad…) y recalcula su tipo de IRPF.");
      add(`calendario-${a}`, oblHabilAnterior(oblFecha(a, 1, 15)), "empresa", `Calendario laboral de ${a}`,
        "Elabora y expón en un lugar visible el calendario laboral del año.");
    }
    if (m === 3) add(`certret-${a}`, oblHabilAnterior(oblFecha(a, 3, 31)), "aeat", `Entregar los certificados de retenciones de ${a - 1}`,
      "Hay que darlos a cada persona antes de que empiece la campaña de la Renta (principios de abril). Los generas en Obligaciones › Modelo 190.");
  }

  // Vencimiento de los convenios
  (NOM.convenios || []).forEach(c => {
    if (!c.vigenciaHasta) return;
    const fin = new Date(c.vigenciaHasta + "T00:00:00");
    add(`vig90-${c.id}`, oblSumarDias(fin, -90), "convenio", `Faltan 3 meses para que venza el ${c.nombre}`,
      "Vigila el BOE: cuando se publique un nuevo convenio o una revisión salarial habrá que actualizar las tablas.");
    add(`vig-${c.id}`, fin, "convenio", `Vence el ${c.nombre}`,
      "Si no se publica uno nuevo, sigue aplicándose prorrogado. La app avisará cuando falten tablas salariales.");
  });

  // Plazos de cada empleado
  (NOM.empleados || []).forEach(e => {
    const n = e.nombre || "empleado";
    const f = s => s ? new Date(s + "T00:00:00") : null;
    const alta = f(e.fechaAlta), baja = f(e.fechaBaja), fin = f(e.fechaFinContrato);
    if (alta) {
      add(`alta-${e.id}`, oblHabilAnterior(oblSumarDias(alta, -1)), "red", `Alta de ${n} en la Seguridad Social`,
        `El alta se tramita en Sistema RED antes de que empiece a trabajar (${oblFmt(alta)}); se puede hacer hasta 60 días antes.`);
      add(`contrata-${e.id}`, oblSumarDias(alta, 10), "sepe", `Comunicar el contrato de ${n} en Contrat@`,
        "Plazo: 10 días desde la firma del contrato. Entrega también la copia básica a la representación de los trabajadores si la hay.");
    }
    if (fin && !baja) {
      add(`preaviso-${e.id}`, oblHabilAnterior(oblSumarDias(fin, -15)), "empresa", `Fin del contrato de ${n} el ${oblFmt(fin)}`,
        "Decide si se prorroga o se extingue. En contratos de más de un año hay que preavisar con 15 días. Si se prorroga, comunícalo en Contrat@; si termina, prepara finiquito, baja en RED y certificado de empresa.");
    }
    if (baja) {
      add(`certific-${e.id}`, baja, "sepe", `Certificado de empresa de ${n} en Certific@2`,
        "Se envía al SEPE el mismo día de la baja (o al día siguiente de que lo pida la persona). Tienes un borrador en Nóminas › Certificado de empresa.");
      add(`baja-${e.id}`, oblSumarDias(baja, 3), "red", `Baja de ${n} en Sistema RED`,
        "Plazo: 3 días naturales desde la fecha de baja. Liquida también el finiquito (vacaciones no disfrutadas y partes proporcionales).");
    }
  });
  return plazos.sort((x, y) => x.fecha - y.fecha);
}

// ── AVISOS ──────────────────────────────────────────────────────
function oblUltimoAnioTablas(c) {
  return Math.max(num(c.anioTablas), ...Object.keys(c.porAnio || {}).map(Number).filter(Boolean));
}

function oblAvisos() {
  const avisos = [];
  const hoy = oblHoy(), anio = hoy.getFullYear(), mes = hoy.getMonth() + 1;
  const add = (nivel, titulo, detalle, extra = {}) => avisos.push({ nivel, titulo, detalle, ...extra });
  const hechos = new Set(NOM.plazosHechos || []);
  // Los plazos anteriores al primer uso de la agenda no se dan por vencidos
  if (!NOM.inicioAgenda) { NOM.inicioAgenda = oblIso(hoy); nomGuardar(); }
  const inicioAgenda = new Date(NOM.inicioAgenda + "T00:00:00");

  // Plazos vencidos o próximos
  oblPlazos(oblSumarDias(hoy, -20), oblSumarDias(hoy, 10)).forEach(p => {
    if (hechos.has(p.id) || p.fecha < inicioAgenda) return;
    const d = oblDias(hoy, p.fecha);
    if (d < 0) add("alerta", `Plazo vencido hace ${-d} día${d === -1 ? "" : "s"}: ${p.titulo}`, p.detalle, { plazo: p });
    else if (d <= 3) add("alerta", `${d === 0 ? "Hoy" : `En ${d} día${d === 1 ? "" : "s"}`}: ${p.titulo}`, p.detalle, { plazo: p });
    else add("aviso", `En ${d} días: ${p.titulo}`, p.detalle, { plazo: p });
  });

  // Novedades del BOE sin revisar
  (NOM.boe?.novedades || []).filter(b => !b.vista).forEach(b =>
    add("alerta", `Publicado en el BOE (${b.fecha}): posible actualización de ${b.tema}`, b.titulo, { boe: b }));

  // Convenios: tablas y vigencia
  (NOM.convenios || []).forEach(c => {
    const ult = oblUltimoAnioTablas(c);
    if (ult && ult < anio) add("alerta", `${c.nombre}: no hay tablas salariales de ${anio}`,
      `La app está usando las de ${ult}. Busca en el BOE la revisión salarial o el nuevo convenio y actualiza las tablas en Convenios.`, { convenio: c });
    else if (ult === anio && mes >= 11) add("info", `${c.nombre}: las tablas cargadas llegan hasta ${ult}`,
      `En enero harán falta las de ${anio + 1}.`, { convenio: c });
    if (c.vigenciaHasta) {
      const fin = new Date(c.vigenciaHasta + "T00:00:00"), d = oblDias(hoy, fin);
      if (d < 0) add("aviso", `${c.nombre}: vigencia terminada el ${oblFmt(fin)}`,
        "Se aplica prorrogado hasta que se firme uno nuevo. Revisa el BOE por si ya hay convenio o revisión salarial.", { convenio: c });
      else if (d <= 90) add("aviso", `${c.nombre}: vence en ${d} días (${oblFmt(fin)})`,
        "Atenta al BOE: puede publicarse un nuevo convenio o tablas con efectos retroactivos (atrasos).", { convenio: c });
    }
  });

  // Parámetros legales del año
  if (!PARAMETROS_LEGALES[anio] && !(NOM.parametros || {})[anio]) add("alerta", `Sin parámetros de cotización de ${anio}`,
    `La app usa los de ${Math.max(...Object.keys(PARAMETROS_LEGALES).map(Number))}. Cuando se publique la orden de cotización de ${anio}, actualiza bases y tipos en Empresa y parámetros.`);

  // Empleados
  const activos = (NOM.empleados || []).filter(e => !e.fechaBaja || new Date(e.fechaBaja + "T00:00:00") >= oblFecha(anio, mes, 1));
  const mAnt = mes === 1 ? 12 : mes - 1, aAnt = mes === 1 ? anio - 1 : anio;
  const sinNomina = activos.filter(e => !NOM.historico?.[`${e.id}_${aAnt}-${String(mAnt).padStart(2, "0")}`]
    && (!e.fechaAlta || new Date(e.fechaAlta + "T00:00:00") <= oblUltimoDia(aAnt, mAnt)));
  if (sinNomina.length) add("aviso", `Faltan ${sinNomina.length} nómina${sinNomina.length === 1 ? "" : "s"} de ${MESES_NOM[mAnt - 1]}`,
    sinNomina.map(e => e.nombre).join(", ") + ". Sin ellas el resumen de SILTRA y del modelo 111 estará incompleto.");
  activos.forEach(e => {
    const falta = [];
    if (!e.nif) falta.push("NIF"); if (!e.naf) falta.push("nº de afiliación");
    if (!e.contratoClave) falta.push("clave de contrato"); if (!e.fechaAlta) falta.push("fecha de alta");
    if (falta.length) add("info", `Ficha incompleta de ${e.nombre}`, `Falta: ${falta.join(", ")}.`);
    if (!e.anioNacimiento) add("info", `Pide el modelo 145 a ${e.nombre}`, "Sin sus datos personales y familiares la retención de IRPF puede no ser la correcta.");
    if (e.tipoContrato === "temporal" && !e.fechaFinContrato) add("info", `Contrato temporal de ${e.nombre} sin fecha de fin`, "Indícala en su ficha para que la app te avise antes de que termine.");
  });

  if (NOM.boe?.error) add("info", "No se pudo consultar el BOE automáticamente", NOM.boe.error);
  const orden = { alerta: 0, aviso: 1, info: 2 };
  return avisos.sort((x, y) => orden[x.nivel] - orden[y.nivel]);
}

// ── BOE: DETECCIÓN DE ACTUALIZACIONES ───────────────────────────
// Lee el sumario diario del BOE (API de datos abiertos) desde la última
// comprobación y busca publicaciones de los convenios y de la normativa.
const OBL_TEMAS_GENERALES = [
  { tema: "la orden de cotización a la Seguridad Social", claves: ["normas legales de cotización"] },
  { tema: "el salario mínimo interprofesional", claves: ["salario mínimo interprofesional"] },
  { tema: "las retenciones de IRPF", claves: ["reglamento del impuesto sobre la renta"] },
  { tema: "la tarifa de accidentes de trabajo", claves: ["tarifa de primas"] },
];

function oblTemasBoe() {
  const temas = (NOM.convenios || []).filter(c => c.boeClaves?.length).map(c => ({ tema: c.nombre, claves: c.boeClaves, convenioId: c.id }));
  return [...temas, ...OBL_TEMAS_GENERALES];
}

function oblItemsSumario(nodo, out = []) {
  if (Array.isArray(nodo)) nodo.forEach(n => oblItemsSumario(n, out));
  else if (nodo && typeof nodo === "object") {
    if (typeof nodo.titulo === "string" && nodo.identificador) out.push(nodo);
    Object.values(nodo).forEach(v => { if (v && typeof v === "object") oblItemsSumario(v, out); });
  }
  return out;
}

function oblNormaliza(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

async function oblComprobarBoe(forzar = false) {
  NOM.boe = NOM.boe || { novedades: [] };
  const hoy = oblHoy();
  if (!forzar && NOM.boe.comprobado === oblIso(hoy)) return;
  const inicio = NOM.boe.ultimaFecha ? oblSumarDias(new Date(NOM.boe.ultimaFecha + "T00:00:00"), 1) : oblSumarDias(hoy, -30);
  const desde = oblDias(inicio, hoy) > 60 ? oblSumarDias(hoy, -60) : inicio;
  const dias = [];
  for (let d = new Date(desde); d <= hoy; d = oblSumarDias(d, 1)) if (d.getDay() !== 0) dias.push(new Date(d));
  const temas = oblTemasBoe();
  let ultimaOk = NOM.boe.ultimaFecha, fallos = 0;
  for (let i = 0; i < dias.length; i += 5) {
    await Promise.all(dias.slice(i, i + 5).map(async d => {
      const ymd = oblIso(d).replace(/-/g, "");
      try {
        const resp = await fetch(`https://www.boe.es/datosabiertos/api/boe/sumario/${ymd}`, { headers: { Accept: "application/json" } });
        if (resp.status === 404) { ultimaOk = ultimaOk > oblIso(d) ? ultimaOk : oblIso(d); return; }
        if (!resp.ok) throw new Error(resp.status);
        const items = oblItemsSumario(await resp.json());
        items.forEach(it => {
          const t = oblNormaliza(it.titulo);
          temas.forEach(tm => {
            if (!tm.claves.some(k => t.includes(oblNormaliza(k)))) return;
            if (NOM.boe.novedades.some(n => n.id === it.identificador && n.tema === tm.tema)) return;
            const pdf = typeof it.url_pdf === "string" ? it.url_pdf : it.url_pdf?.texto;
            NOM.boe.novedades.push({ id: it.identificador, fecha: oblIso(d), tema: tm.tema, convenioId: tm.convenioId || null,
              titulo: it.titulo, url: it.url_html || pdf || `https://www.boe.es/diario_boe/txt.php?id=${it.identificador}`, vista: false });
          });
        });
        if (!ultimaOk || oblIso(d) > ultimaOk) ultimaOk = oblIso(d);
      } catch (e) { fallos++; }
    }));
  }
  if (fallos && fallos === dias.length) {
    NOM.boe.error = "El navegador no ha podido conectar con la API del BOE. Usa los enlaces de búsqueda de la sección «Convenios y normativa» para revisarlo a mano.";
  } else {
    delete NOM.boe.error;
    NOM.boe.ultimaFecha = ultimaOk;
  }
  NOM.boe.comprobado = oblIso(hoy);
  nomGuardar();
}

function oblUrlBusquedaBoe(texto) {
  return `https://www.boe.es/buscar/boe.php?campo%5B0%5D=TIT&dato%5B0%5D=${encodeURIComponent(texto)}&operador%5B0%5D=and&sort_field%5B0%5D=FPU&sort_order%5B0%5D=desc&accion=Buscar`;
}

// ── RESÚMENES (desde el histórico de nóminas) ───────────────────
function oblNominasPeriodo(anio, meses) {
  return Object.values(NOM.historico || {}).filter(r => r.anio === anio && meses.includes(r.mes));
}

function oblLinea(r, concepto, lista = "cotTrabajador") {
  return r2((r[lista] || []).filter(l => l.concepto === concepto).reduce((s, l) => s + l.importe, 0));
}

function oblResumenSiltra(anio, mes) {
  const filas = oblNominasPeriodo(anio, [mes]).map(r => {
    const e = NOM.empleados.find(x => x.id === r.empleado.id) || r.empleado;
    return {
      nombre: e.nombre, naf: e.naf || "", nif: e.nif || "", grupo: r.grupoCotizacion ?? r.categoria?.grupoCotizacion,
      contrato: e.contratoClave || e.tipoContrato || "", coef: e.modalidad === "horas" ? r2(r.jornadaPctEfectiva * 10) : r2(num(e.jornadaPct, 100) * 10),
      dias: r.dias, baseCC: r.bases.baseCC, baseAT: r.bases.baseAT, baseHE: r2(r.bases.importeHE + r.bases.importeHEFM),
      trabajador: r.totalCotTrab, empresa: r.totalCotEmp, total: r2(r.totalCotTrab + r.totalCotEmp),
      lineasT: r.cotTrabajador, lineasE: r.cotEmpresa,
    };
  });
  const conceptos = {};
  filas.forEach(f => {
    f.lineasT.forEach(l => { (conceptos[l.concepto] ||= { trab: 0, emp: 0 }).trab += l.importe; });
    f.lineasE.forEach(l => { (conceptos[l.concepto] ||= { trab: 0, emp: 0 }).emp += l.importe; });
  });
  return { filas, conceptos };
}

function oblResumen111(anio, trimestre) {
  const meses = [1, 2, 3].map(i => (trimestre - 1) * 3 + i);
  const noms = oblNominasPeriodo(anio, meses);
  return {
    meses, nominas: noms.length,
    perceptores: new Set(noms.map(r => r.empleado.id)).size,
    percepciones: r2(noms.reduce((s, r) => s + r.irpf.base, 0)),
    retenciones: r2(noms.reduce((s, r) => s + r.irpf.importe, 0)),
    faltan: NOM.empleados.filter(e => !noms.some(r => r.empleado.id === e.id)).map(e => e.nombre),
  };
}

function oblResumen190(anio) {
  const noms = oblNominasPeriodo(anio, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const porEmp = {};
  noms.forEach(r => {
    const p = porEmp[r.empleado.id] ||= { id: r.empleado.id, meses: 0, percepciones: 0, retenciones: 0, gastos: 0, exentas: 0 };
    p.meses++;
    p.percepciones += r.irpf.base;
    p.retenciones += r.irpf.importe;
    p.gastos += r.totalCotTrab;
    p.exentas += r.devengos.filter(d => !d.tributa).reduce((s, d) => s + d.importe, 0);
  });
  return Object.values(porEmp).map(p => {
    const e = NOM.empleados.find(x => x.id === p.id) || {};
    return { ...p, percepciones: r2(p.percepciones), retenciones: r2(p.retenciones), gastos: r2(p.gastos), exentas: r2(p.exentas), e };
  });
}

// CSV para Excel en español (separador ; y coma decimal)
function oblCsv(nombre, cabecera, filas) {
  const celda = v => typeof v === "number" ? String(v).replace(".", ",") : `"${String(v ?? "").replace(/"/g, '""')}"`;
  const txt = "\ufeff" + [cabecera, ...filas].map(f => f.map(celda).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
  a.download = nombre;
  a.click();
}

// ── CALENDARIO .ICS CON ALARMAS ─────────────────────────────────
function oblDescargarIcs() {
  const hoy = oblHoy();
  const plazos = oblPlazos(hoy, oblSumarDias(hoy, 365));
  const escIcs = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ev = plazos.map(p => {
    const d = oblIso(p.fecha).replace(/-/g, ""), d2 = oblIso(oblSumarDias(p.fecha, 1)).replace(/-/g, "");
    return ["BEGIN:VEVENT", `UID:${p.id}@nominas-tunivers`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d2}`,
      `SUMMARY:${escIcs(`[${OBL_DONDE[p.donde].nombre}] ${p.titulo}`)}`, `DESCRIPTION:${escIcs(p.detalle)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P3D", `DESCRIPTION:${escIcs(p.titulo)}`, "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT15H", `DESCRIPTION:${escIcs(p.titulo)}`, "END:VALARM",
      "END:VEVENT"].join("\r\n");
  });
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tunivers//Nominas//ES", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Obligaciones laborales", ...ev, "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = "obligaciones_laborales.ics";
  a.click();
  showToast(`${plazos.length} plazos exportados al calendario.`);
}

// ── INTERFAZ ────────────────────────────────────────────────────
let oblVista = "avisos";

function oblContarAlertas() {
  try { return oblAvisos().filter(a => a.nivel === "alerta").length; } catch { return 0; }
}

function oblActualizarBadge() {
  const b = document.getElementById("tab-nominas");
  if (!b) return;
  const n = oblContarAlertas();
  b.innerHTML = `Nóminas${n ? ` <span class="obl-badge">${n}</span>` : ""}`;
}

function oblRender() {
  const subs = [["avisos", "Avisos"], ["calendario", "Calendario"], ["siltra", "Resumen SILTRA"], ["m111", "Modelo 111"], ["m190", "Modelo 190"], ["normativa", "Convenios y normativa"], ["guia", "Guía"]];
  const cuerpo = { avisos: oblRenderAvisos, calendario: oblRenderCalendario, siltra: oblRenderSiltra, m111: oblRender111, m190: oblRender190, normativa: oblRenderNormativa, guia: oblRenderGuia }[oblVista]();
  return `<div class="obl-sub">${subs.map(([k, l]) => `<button class="${k === oblVista ? "on" : ""}" onclick="oblIr('${k}')">${l}</button>`).join("")}</div>${cuerpo}`;
}

function oblIr(v) { oblVista = v; renderNominas(); }

function oblChip(donde) { const d = OBL_DONDE[donde]; return `<span class="obl-chip" style="background:${d.bg};color:${d.color}">${d.nombre}</span>`; }

function oblRenderAvisos() {
  const avisos = oblAvisos();
  const icono = { alerta: "⚠", aviso: "⏰", info: "ℹ" }, clase = { alerta: "al-warn obl-rojo", aviso: "al-warn", info: "al-info" };
  const lista = avisos.map((a, i) => `<div class="alerta ${clase[a.nivel]}"><span>${icono[a.nivel]}</span><span style="flex:1">
      ${a.plazo ? oblChip(a.plazo.donde) + " " : ""}<strong>${esc(a.titulo)}</strong><br/>${esc(a.detalle)}
      ${a.boe ? `<br/><a href="${esc(a.boe.url)}" target="_blank" rel="noopener">Ver en el BOE</a> · <a href="#" onclick="event.preventDefault();oblMarcarBoe('${esc(a.boe.id)}','${esc(a.boe.tema)}')">Marcar como revisado</a>` : ""}
      ${a.plazo ? `<br/><a href="#" onclick="event.preventDefault();oblMarcarHecho('${esc(a.plazo.id)}')">Marcar como hecho</a>` : ""}
    </span></div>`).join("") || `<div class="alerta al-ok"><span>✓</span><span>No hay nada pendiente en los próximos días.</span></div>`;
  return `<div class="nom-card">
    <div class="section-title">Avisos y pendientes</div>
    ${lista}
    <div class="nom-acciones" style="margin-top:8px">
      <button class="btn-export" onclick="oblDescargarIcs()">Añadir los plazos a mi calendario (.ics)</button>
      <button class="btn-export-sec" onclick="oblComprobarAhora()">Comprobar el BOE ahora</button>
    </div>
    <div class="nom-hint" style="margin-top:6px">El archivo .ics se abre en el calendario del móvil o de Outlook y te avisa 3 días antes y la víspera de cada plazo. Vuelve a descargarlo cuando des de alta o de baja a alguien.
    ${NOM.boe?.comprobado ? `<br/>BOE revisado hasta el ${esc(NOM.boe.ultimaFecha || "—")} (última comprobación: ${esc(NOM.boe.comprobado)}).` : ""}</div>
  </div>`;
}

async function oblComprobarAhora() {
  showToast("Consultando el BOE…");
  await oblComprobarBoe(true);
  renderNominas();
  oblActualizarBadge();
  showToast(NOM.boe?.error ? "No se pudo consultar el BOE." : "BOE revisado.");
}

function oblMarcarHecho(id) {
  NOM.plazosHechos = [...new Set([...(NOM.plazosHechos || []), id])];
  nomGuardar(); renderNominas(); oblActualizarBadge();
}

function oblMarcarBoe(id, tema) {
  (NOM.boe?.novedades || []).forEach(n => { if (n.id === id && n.tema === tema) n.vista = true; });
  nomGuardar(); renderNominas(); oblActualizarBadge();
}

function oblRenderCalendario() {
  const hoy = oblHoy();
  const plazos = oblPlazos(oblSumarDias(hoy, -31), oblSumarDias(hoy, 365));
  const hechos = new Set(NOM.plazosHechos || []);
  let mesActual = "";
  const filas = plazos.map(p => {
    const cab = `${MESES_NOM[p.fecha.getMonth()]} ${p.fecha.getFullYear()}`;
    const d = oblDias(hoy, p.fecha), hecho = hechos.has(p.id);
    const estado = hecho ? `<span class="fi-badge badge-ok">Hecho</span>` : d < 0 ? `<span class="fi-badge badge-ausente">Vencido</span>` : d <= 7 ? `<span class="fi-badge badge-pendiente">${d === 0 ? "Hoy" : `${d} d`}</span>` : "";
    const sep = cab !== mesActual ? `<div class="section-title" style="margin-top:12px">${cab}</div>` : "";
    mesActual = cab;
    return `${sep}<div class="fichaje-item" style="${hecho ? "opacity:.5" : ""}">
      <div class="fi-color" style="background:${OBL_DONDE[p.donde].color}"></div>
      <div class="fi-info"><div class="fi-titulo" style="white-space:normal">${esc(p.titulo)}</div>
      <div class="fi-meta">${oblFmt(p.fecha)} · ${oblChip(p.donde)}</div>
      <div class="fi-meta" style="white-space:normal;margin-top:3px">${esc(p.detalle)}</div></div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">${estado}
      <label class="obl-check"><input type="checkbox" ${hecho ? "checked" : ""} onchange="oblToggleHecho('${esc(p.id)}',this.checked)"/> hecho</label></div>
    </div>`;
  }).join("");
  return `<div class="nom-card">
    <div class="nom-acciones"><button class="btn-export" onclick="oblDescargarIcs()">Añadir los plazos a mi calendario (.ics)</button></div>
    <div class="nom-hint" style="margin-top:6px">Los plazos que acaban en sábado, domingo o festivo nacional se trasladan al siguiente día hábil (en los de Hacienda). Revisa los festivos de Asturias y de Gijón.</div>
    ${filas}
  </div>`;
}

function oblToggleHecho(id, on) {
  const s = new Set(NOM.plazosHechos || []);
  on ? s.add(id) : s.delete(id);
  NOM.plazosHechos = [...s];
  nomGuardar(); oblActualizarBadge();
}

function oblSelPeriodo(id, opciones, valor, fn) {
  return `<select id="${id}" onchange="${fn}">${opciones.map(([v, l]) => `<option value="${v}" ${String(v) === String(valor) ? "selected" : ""}>${l}</option>`).join("")}</select>`;
}

let oblPer = null;
function oblPeriodo() {
  if (!oblPer) {
    const h = oblHoy(), m = h.getMonth() === 0 ? 12 : h.getMonth(), a = h.getMonth() === 0 ? h.getFullYear() - 1 : h.getFullYear();
    oblPer = { anio: a, mes: m, trimestre: Math.ceil(m / 3), anio190: h.getMonth() < 2 ? h.getFullYear() - 1 : h.getFullYear() };
  }
  return oblPer;
}
function oblCambiar(k, v) { oblPeriodo()[k] = num(v); renderNominas(); }
const oblAnios = () => { const a = oblHoy().getFullYear(); return [a - 2, a - 1, a, a + 1].map(x => [x, x]); };

function oblRenderSiltra() {
  const p = oblPeriodo();
  const { filas, conceptos } = oblResumenSiltra(p.anio, p.mes);
  const tot = k => r2(filas.reduce((s, f) => s + f[k], 0));
  return `<div class="nom-card">
    <div class="section-title">Resumen de cotización para SILTRA</div>
    <div class="nom-acciones">${oblSelPeriodo("obl-mes", MESES_NOM.map((m, i) => [i + 1, m]), p.mes, "oblCambiar('mes',this.value)")}
      ${oblSelPeriodo("obl-anio", oblAnios(), p.anio, "oblCambiar('anio',this.value)")}</div>
    <div class="nom-hint" style="margin:8px 0">Con el Sistema de Liquidación Directa la Seguridad Social calcula las cuotas. Usa esta tabla para comprobar que el borrador que te devuelve SILTRA cuadra con las nóminas. Si no cuadra, revisa días, grupo, contrato y coeficiente de parcialidad de cada persona en Sistema RED.</div>
    ${filas.length ? `<div class="nom-scroll"><table class="nom-table">
      <thead><tr><th>Trabajador/a</th><th>Nº afiliación</th><th>Grupo</th><th>Contrato</th><th>Coef. parc.</th><th>Días</th><th class="num">Base CC</th><th class="num">Base AT/desempleo</th><th class="num">Horas extra</th><th class="num">Cuota trab.</th><th class="num">Cuota empresa</th></tr></thead>
      <tbody>${filas.map(f => `<tr><td>${esc(f.nombre)}</td><td>${esc(f.naf)}</td><td>${esc(f.grupo)}</td><td>${esc(f.contrato)}</td><td>${f.coef < 1000 ? f.coef : "—"}</td><td>${f.dias}</td><td class="num">${eur(f.baseCC)}</td><td class="num">${eur(f.baseAT)}</td><td class="num">${eur(f.baseHE)}</td><td class="num">${eur(f.trabajador)}</td><td class="num">${eur(f.empresa)}</td></tr>`).join("")}
      <tr class="t"><td colspan="6">Total</td><td class="num">${eur(tot("baseCC"))}</td><td class="num">${eur(tot("baseAT"))}</td><td class="num">${eur(tot("baseHE"))}</td><td class="num">${eur(tot("trabajador"))}</td><td class="num">${eur(tot("empresa"))}</td></tr></tbody>
    </table></div>
    <div class="section-title" style="margin-top:12px">Cuotas por concepto</div>
    <table class="nom-table"><thead><tr><th>Concepto</th><th class="num">Trabajador</th><th class="num">Empresa</th><th class="num">Total</th></tr></thead><tbody>
      ${Object.entries(conceptos).map(([c, v]) => `<tr><td>${esc(c)}</td><td class="num">${eur(r2(v.trab))}</td><td class="num">${eur(r2(v.emp))}</td><td class="num">${eur(r2(v.trab + v.emp))}</td></tr>`).join("")}
      <tr class="t"><td>Total a ingresar</td><td class="num">${eur(tot("trabajador"))}</td><td class="num">${eur(tot("empresa"))}</td><td class="num">${eur(r2(tot("trabajador") + tot("empresa")))}</td></tr>
    </tbody></table>
    <button class="btn-export-sec" onclick="oblCsvSiltra()">Descargar en Excel (.csv)</button>` : `<div class="empty">No hay nóminas calculadas de ${MESES_NOM[p.mes - 1]} ${p.anio}.</div>`}
  </div>`;
}

function oblCsvSiltra() {
  const p = oblPeriodo();
  const { filas } = oblResumenSiltra(p.anio, p.mes);
  oblCsv(`siltra_${p.anio}-${String(p.mes).padStart(2, "0")}.csv`,
    ["Trabajador", "NIF", "Nº afiliación", "Grupo", "Contrato", "Coef. parcialidad", "Días", "Base CC", "Base AT/desempleo", "Horas extra", "Cuota trabajador", "Cuota empresa", "Total"],
    filas.map(f => [f.nombre, f.nif, f.naf, f.grupo, f.contrato, f.coef < 1000 ? f.coef : "", f.dias, f.baseCC, f.baseAT, f.baseHE, f.trabajador, f.empresa, f.total]));
}

function oblRender111() {
  const p = oblPeriodo();
  const r = oblResumen111(p.anio, p.trimestre);
  const fin = { 1: "abril", 2: "julio", 3: "octubre", 4: "enero" }[p.trimestre];
  return `<div class="nom-card">
    <div class="section-title">Modelo 111 — retenciones de IRPF del trimestre</div>
    <div class="nom-acciones">${oblSelPeriodo("obl-tri", [[1, "1.er trimestre"], [2, "2.º trimestre"], [3, "3.er trimestre"], [4, "4.º trimestre"]], p.trimestre, "oblCambiar('trimestre',this.value)")}
      ${oblSelPeriodo("obl-anio111", oblAnios(), p.anio, "oblCambiar('anio',this.value)")}</div>
    <table class="nom-table" style="margin-top:10px">
      <tr class="h"><td colspan="2">Rendimientos del trabajo — dinerarios</td></tr>
      <tr><td>[01] Nº de perceptores</td><td class="num">${r.perceptores}</td></tr>
      <tr><td>[02] Importe de las percepciones</td><td class="num">${eur(r.percepciones)}</td></tr>
      <tr><td>[03] Importe de las retenciones</td><td class="num">${eur(r.retenciones)}</td></tr>
      <tr class="t"><td>Resultado a ingresar</td><td class="num">${eur(r.retenciones)}</td></tr>
    </table>
    <div class="nom-hint" style="margin-top:8px">Se presenta en la sede de la Agencia Tributaria del 1 al 20 de ${fin} (hasta el 15 si lo domicilias). Calculado con ${r.nominas} nóminas de ${r.meses.map(m => MESES_NOM[m - 1]).join(", ")} ${p.anio}. No incluye retenciones de profesionales, alquileres ni otros perceptores que no sean empleados: si los tienes, súmalos en sus casillas.
    ${r.faltan.length ? `<br/><strong>Sin ninguna nómina en el trimestre:</strong> ${esc(r.faltan.join(", "))}.` : ""}</div>
  </div>`;
}

function oblRender190() {
  const p = oblPeriodo();
  const filas = oblResumen190(p.anio190);
  const contrato = e => e.tipoContrato === "temporal" ? "2 (inferior al año) — revisar" : "1 (general)";
  return `<div class="nom-card">
    <div class="section-title">Modelo 190 — resumen anual de retenciones</div>
    <div class="nom-acciones">${oblSelPeriodo("obl-anio190", oblAnios(), p.anio190, "oblCambiar('anio190',this.value)")}</div>
    ${filas.length ? `<div class="nom-scroll"><table class="nom-table" style="margin-top:10px">
      <thead><tr><th>Perceptor/a</th><th>NIF</th><th>Clave</th><th class="num">Percepción íntegra</th><th class="num">Retenciones</th><th class="num">Gastos deducibles (SS)</th><th>Año nac.</th><th>Situación</th><th>Contrato</th><th></th></tr></thead>
      <tbody>${filas.map(f => `<tr><td>${esc(f.e.nombre)}</td><td>${esc(f.e.nif)}</td><td>A</td><td class="num">${eur(f.percepciones)}</td><td class="num">${eur(f.retenciones)}</td><td class="num">${eur(f.gastos)}</td><td>${esc(f.e.anioNacimiento || "—")}</td><td>${esc(f.e.situacionFamiliar || 3)}</td><td>${contrato(f.e)}</td><td><button class="btn-mini" onclick="oblCertificadoRetenciones('${esc(f.id)}')">Certificado</button></td></tr>`).join("")}
      <tr class="t"><td colspan="3">Total (${filas.length} perceptores)</td><td class="num">${eur(r2(filas.reduce((s, f) => s + f.percepciones, 0)))}</td><td class="num">${eur(r2(filas.reduce((s, f) => s + f.retenciones, 0)))}</td><td class="num">${eur(r2(filas.reduce((s, f) => s + f.gastos, 0)))}</td><td colspan="4"></td></tr></tbody>
    </table></div>
    <div class="nom-acciones"><button class="btn-export-sec" onclick="oblCsv190()">Descargar en Excel (.csv)</button></div>
    <div class="nom-hint" style="margin-top:8px">Clave A: empleados por cuenta ajena. Se presenta del 1 al 31 de enero. La suma de retenciones debe coincidir con la de los cuatro modelos 111 del año. Comprueba también que cada persona tiene completos los datos del modelo 145 (hijos, ascendientes, discapacidad, movilidad…).</div>`
    : `<div class="empty">No hay nóminas calculadas de ${p.anio190}.</div>`}
  </div>`;
}

function oblCsv190() {
  const p = oblPeriodo();
  oblCsv(`modelo190_${p.anio190}.csv`,
    ["Perceptor", "NIF", "Clave", "Percepción íntegra", "Retenciones", "Gastos deducibles", "Percepciones exentas", "Año nacimiento", "Situación familiar", "Discapacidad", "Contrato", "Movilidad geográfica", "Hijos", "Hijos < 3", "Ascendientes", "Pensión compensatoria", "Anualidades alimentos", "Préstamo vivienda", "Meses"],
    oblResumen190(p.anio190).map(f => [f.e.nombre, f.e.nif, "A", f.percepciones, f.retenciones, f.gastos, f.exentas, f.e.anioNacimiento || "", f.e.situacionFamiliar || 3, num(f.e.discapacidad),
      f.e.tipoContrato === "temporal" ? 2 : 1, f.e.movilidadGeografica ? 1 : 0, num(f.e.hijos), num(f.e.hijosMenores3), num(f.e.ascendientes65) + num(f.e.ascendientes75),
      num(f.e.pensionCompensatoria), num(f.e.anualidadesAlimentos), f.e.prestamoVivienda ? 1 : 0, f.meses]));
}

function oblCertificadoRetenciones(id) {
  const p = oblPeriodo();
  const f = oblResumen190(p.anio190).find(x => x.id === id);
  if (!f) return;
  const em = NOM.empresa;
  const win = window.open("", "_blank", "width=800,height=700");
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Certificado de retenciones ${p.anio190} - ${esc(f.e.nombre)}</title>
  <style>body{font-family:Arial,sans-serif;font-size:11px;margin:1.5cm;color:#111}h1{font-size:15px}table{width:100%;border-collapse:collapse;margin:10px 0}td{border:1px solid #bbb;padding:6px}.n{text-align:right}.f{margin-top:40px}</style></head><body>
  <h1>Certificado de retenciones e ingresos a cuenta del IRPF — ejercicio ${p.anio190}</h1>
  <p><strong>Pagador:</strong> ${esc(em.nombre)} · NIF ${esc(em.cif)} · ${esc(em.domicilio)}, ${esc(em.cp)} ${esc(em.localidad)}</p>
  <p><strong>Perceptor/a:</strong> ${esc(f.e.nombre)} · NIF ${esc(f.e.nif)}</p>
  <table>
    <tr><td>Rendimientos del trabajo (dinerarios): percepciones íntegras</td><td class="n">${eur(f.percepciones)}</td></tr>
    <tr><td>Retenciones practicadas</td><td class="n">${eur(f.retenciones)}</td></tr>
    <tr><td>Gastos deducibles: cotizaciones a la Seguridad Social a cargo del trabajador</td><td class="n">${eur(f.gastos)}</td></tr>
    <tr><td>Percepciones exentas (dietas y gastos de locomoción)</td><td class="n">${eur(f.exentas)}</td></tr>
  </table>
  <p>Se expide el presente certificado a efectos de lo dispuesto en el artículo 108 del Reglamento del IRPF.</p>
  <p class="f">${esc(em.localidad)}, a ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
  <p class="f">Firma y sello de la empresa</p>
  <script>window.onload=function(){window.print();}<\/script></body></html>`);
  win.document.close();
}

function oblRenderNormativa() {
  const hoy = oblHoy(), anio = hoy.getFullYear();
  const convenios = (NOM.convenios || []).map(c => {
    const ult = oblUltimoAnioTablas(c);
    const novedades = (NOM.boe?.novedades || []).filter(n => n.convenioId === c.id);
    const estado = ult < anio ? `<span class="fi-badge badge-ausente">Sin tablas de ${anio}</span>` : `<span class="fi-badge badge-ok">Tablas hasta ${ult}</span>`;
    return `<div class="fichaje-item"><div class="fi-info">
      <div class="fi-titulo" style="white-space:normal">${esc(c.nombre)}</div>
      <div class="fi-meta">Código ${esc(c.codigo || "—")}${c.boeReferencia ? ` · ${esc(c.boeReferencia)}` : ""} · vigente hasta ${c.vigenciaHasta ? oblFmt(new Date(c.vigenciaHasta + "T00:00:00")) : "—"}</div>
      ${novedades.map(n => `<div class="fi-meta" style="white-space:normal">📰 ${esc(n.fecha)}: <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.titulo)}</a></div>`).join("")}
      <div class="fi-meta"><a href="${oblUrlBusquedaBoe(c.boeClaves?.[0] || c.nombre)}" target="_blank" rel="noopener">Buscar publicaciones en el BOE</a></div>
    </div>${estado}</div>`;
  }).join("");
  const generales = OBL_TEMAS_GENERALES.map(t => {
    const nov = (NOM.boe?.novedades || []).filter(n => n.tema === t.tema);
    return `<div class="fichaje-item"><div class="fi-info"><div class="fi-titulo" style="white-space:normal">${esc(t.tema[0].toUpperCase() + t.tema.slice(1))}</div>
      ${nov.map(n => `<div class="fi-meta" style="white-space:normal">📰 ${esc(n.fecha)}: <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.titulo)}</a></div>`).join("")}
      <div class="fi-meta"><a href="${oblUrlBusquedaBoe(t.claves[0])}" target="_blank" rel="noopener">Buscar en el BOE</a></div></div></div>`;
  }).join("");
  return `<div class="nom-card">
    <div class="section-title">Convenios colectivos</div>${convenios}
    <div class="section-title" style="margin-top:12px">Normativa que cambia cada año</div>${generales}
    <div class="nom-acciones" style="margin-top:8px"><button class="btn-export-sec" onclick="oblComprobarAhora()">Comprobar el BOE ahora</button></div>
    <div class="nom-hint" style="margin-top:6px">Cada día que abres Nóminas la app revisa los sumarios del BOE desde la última comprobación y avisa si aparece una revisión salarial o un nuevo convenio de enseñanza (reglada o no reglada), la orden de cotización, el SMI, cambios en las retenciones o en la tarifa de accidentes de trabajo. Cuando salga, actualiza las tablas en Convenios: la app no cambia importes sola.</div>
  </div>`;
}

function oblRenderGuia() {
  const bloque = (donde, titulo, items) => `<div class="nom-card"><div class="section-title">${oblChip(donde)} ${titulo}</div><ul class="obl-lista">${items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
  return [
    bloque("red", "Sistema RED — afiliación (altas, bajas y cambios)", [
      "<strong>Alta:</strong> siempre antes de que la persona empiece a trabajar (se puede hacer hasta 60 días antes). Necesitas NIF, nº de afiliación, grupo de cotización, clave de contrato, coeficiente de parcialidad si es a tiempo parcial y fecha de inicio.",
      "<strong>Baja:</strong> en los 3 días naturales siguientes al cese.",
      "<strong>Variaciones</strong> (cambio de jornada, de grupo, de contrato…): en los 3 días naturales siguientes.",
      "<strong>Fijos discontinuos:</strong> alta en cada llamamiento y baja al terminar cada periodo de actividad.",
      "<strong>Incapacidad temporal:</strong> el INSS te comunica la baja médica por el fichero INSS-Empresas; tú envías los datos adicionales por RED en 3 días hábiles.",
    ]),
    bloque("siltra", "SILTRA / Sistema de Liquidación Directa — seguros sociales cada mes", [
      "Las cuotas de un mes se ingresan durante el mes siguiente.",
      "1) Comunica los <strong>conceptos retributivos abonados (CRA)</strong> del mes. 2) <strong>Solicita el borrador</strong>: la Seguridad Social calcula las cuotas de cada persona. 3) <strong>Compáralo</strong> con el Resumen SILTRA de la app. 4) <strong>Confírmalo</strong>.",
      "Para pagar por <strong>cargo en cuenta</strong> confirma antes del cierre (suele ser el día 22; el 20 en algunos meses). Si no, confirma hasta el penúltimo día natural y paga con el recibo antes de fin de mes.",
      "Si el borrador no cuadra, casi siempre es un dato de afiliación: días, grupo, contrato o coeficiente de parcialidad. Corrígelo en RED y vuelve a pedirlo.",
    ]),
    bloque("sepe", "SEPE — Contrat@ y Certific@2", [
      "<strong>Contrat@:</strong> comunica cada contrato nuevo, y sus prórrogas, en los 10 días siguientes a la firma.",
      "<strong>Certific@2:</strong> al terminar una relación laboral, el certificado de empresa se envía el mismo día de la baja (o al día siguiente de que la persona lo pida). Tienes un borrador en Nóminas › Certificado de empresa.",
    ]),
    bloque("aeat", "Agencia Tributaria", [
      "<strong>Modelo 111</strong> (trimestral): del 1 al 20 de abril, julio, octubre y enero, con las retenciones de IRPF de las nóminas del trimestre.",
      "<strong>Modelo 190</strong> (anual): del 1 al 31 de enero, el resumen de todo el año por persona.",
      "<strong>Certificado de retenciones:</strong> entrégalo a cada persona antes de la campaña de la Renta.",
      "<strong>Modelo 145:</strong> pídelo al contratar y cuando cambie la situación personal o familiar; recalcula entonces el tipo de IRPF.",
    ]),
    bloque("empresa", "En la empresa", [
      "Pagar las nóminas en los 5 primeros días del mes siguiente y entregar el recibo de salarios.",
      "Registro de jornada: lo hace la app de fichaje; hay que conservarlo 4 años.",
      "Calendario laboral expuesto, registro retributivo anual y, en enseñanza no reglada, seguros de responsabilidad civil y accidentes del convenio (art. 28).",
    ]),
  ].join("") + `<div class="nom-hint">Plazos orientativos según la normativa general. Si tienes dudas con un caso concreto, consulta con tu asesoría laboral o con la Tesorería General de la Seguridad Social.</div>`;
}

// Al abrir Nóminas: comprobar el BOE una vez al día (en segundo plano)
function oblAlEntrar() {
  oblActualizarBadge();
  oblComprobarBoe(false).then(() => { oblActualizarBadge(); if (vistaActual === "nominas" && nomVista === "obligaciones") renderNominas(); }).catch(() => {});
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { oblPascua, oblFestivos, oblHabil, oblPlazos, oblItemsSumario };
}
