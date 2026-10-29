// ═══════════════════════════════════════════════════════════════
// NÓMINAS — Tunivers Formación
// Cálculo de nóminas según la normativa española (Seguridad Social +
// retenciones de IRPF) y las tablas de dos convenios colectivos.
//
// Los parámetros legales (bases, tipos, escala IRPF) cambian cada año:
// se revisan en PARAMETROS_LEGALES y se pueden ajustar desde la pestaña
// "Parámetros" sin tocar el código. Las tablas de los convenios se
// editan desde la pestaña "Convenios".
// ═══════════════════════════════════════════════════════════════

// ── PARÁMETROS LEGALES ──────────────────────────────────────────
// 2026: Orden PJC/297/2026 (cotización) y SMI RD 126/2026 (1.221 €/mes × 14).
// IRPF: art. 20 LIRPF y arts. 80-86 RIRPF (algoritmo de retenciones AEAT).
const PARAMETROS_LEGALES = {
  2026: {
    baseMax: 5101.20,
    // Bases mínimas mensuales por grupo de cotización (8-11: 47,48 €/día × 30)
    basesMin: { 1: 1989.30, 2: 1649.70, 3: 1435.20, 4: 1424.40, 5: 1424.40, 6: 1424.40, 7: 1424.40, 8: 1424.40, 9: 1424.40, 10: 1424.40, 11: 1424.40 },
    tipos: {
      cc:             { emp: 23.60, trab: 4.70 },  // contingencias comunes
      mei:            { emp: 0.75,  trab: 0.15 },  // mecanismo de equidad intergeneracional
      desempleoIndef: { emp: 5.50,  trab: 1.55 },
      desempleoTemp:  { emp: 6.70,  trab: 1.60 },
      fp:             { emp: 0.60,  trab: 0.10 },  // formación profesional
      fogasa:         { emp: 0.20,  trab: 0 },
      heFuerzaMayor:  { emp: 12.00, trab: 2.00 },
      heResto:        { emp: 23.60, trab: 4.70 },
    },
    // Cotización adicional de solidaridad sobre lo que exceda de la base máxima.
    // "hasta" = múltiplo de la base máxima donde acaba el tramo.
    solidaridad: [
      { hasta: 1.10, tipo: 1.15 },
      { hasta: 1.50, tipo: 1.25 },
      { hasta: null, tipo: 1.46 },
    ],
    solidaridadParteTrabajador: 1 / 6,  // reparto 5/6 empresa · 1/6 trabajador
    irpf: {
      escala: [ [12450, 19], [20200, 24], [35200, 30], [60000, 37], [300000, 45], [null, 47] ],
      minimoPersonal: 5550,
      minimoDescendientes: [2400, 2700, 4000, 4500],
      minimoMenor3: 2800,
      minimoDiscapacidad: { 33: 3000, 65: 12000 },       // ≥65 % incluye gastos de asistencia
      gastosGenerales: 2000,
      gastosDiscapacidad: { 33: 3500, 65: 7750 },
      // Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF)
      reduccion: { tramo1: 14852, importe1: 7302, coef1: 1.75, tramo2: 17673.52, importe2: 2364.34, coef2: 1.14, tramo3: 19747.5 },
      // Límites excluidos de retención (art. 81 RIRPF): [0 hijos, 1 hijo, 2 o más]
      limitesExcluidos: {
        1: [null, 17644, 18694],    // monoparental
        2: [17197, 18130, 19262],   // cónyuge a cargo (rentas < 1.500 €)
        3: [15876, 16342, 16867],   // resto de situaciones
      },
      porcentajeMaxCuota: 43,
      tipoMinimoTemporal: 2,        // contratos de duración inferior al año
    },
  },
};

// ── DATOS DE EJEMPLO ────────────────────────────────────────────
// IMPORTANTE: importes de ejemplo. Sustituir por las tablas salariales
// vigentes publicadas en el BOE / boletín oficial de cada convenio.
const CONVENIOS_EJEMPLO = [
  {
    id: "conv1",
    nombre: "Convenio 1 (editar nombre)",
    codigo: "",
    ejemplo: true,
    jornadaAnual: 1780,
    nombrePlus: "Plus convenio",
    pagas: { numero: 2, meses: [6, 12], prorrateo: false, incluyePlus: true, incluyeAntiguedad: true },
    antiguedad: { periodoAnios: 3, importe: 0, maxPeriodos: 0 },
    recargoHoraExtra: 0,
    conceptos: [],
    categorias: [
      { id: "c1-1", nombre: "Profesor/a titular",  grupoCotizacion: 2, salarioBase: 1600, plusConvenio: 0, importeAntiguedad: 30, precioHora: 18 },
      { id: "c1-2", nombre: "Profesor/a",          grupoCotizacion: 2, salarioBase: 1450, plusConvenio: 0, importeAntiguedad: 25, precioHora: 16 },
      { id: "c1-3", nombre: "Administrativo/a",    grupoCotizacion: 5, salarioBase: 1300, plusConvenio: 0, importeAntiguedad: 20, precioHora: 0 },
    ],
  },
  {
    id: "conv2",
    nombre: "Convenio 2 (editar nombre)",
    codigo: "",
    ejemplo: true,
    jornadaAnual: 1800,
    nombrePlus: "Plus convenio",
    pagas: { numero: 2, meses: [7, 12], prorrateo: false, incluyePlus: true, incluyeAntiguedad: true },
    antiguedad: { periodoAnios: 3, importe: 0, maxPeriodos: 0 },
    recargoHoraExtra: 0,
    conceptos: [],
    categorias: [
      { id: "c2-1", nombre: "Formador/a",          grupoCotizacion: 2, salarioBase: 1400, plusConvenio: 50, importeAntiguedad: 20, precioHora: 15 },
      { id: "c2-2", nombre: "Personal de oficina", grupoCotizacion: 7, salarioBase: 1250, plusConvenio: 40, importeAntiguedad: 15, precioHora: 0 },
    ],
  },
];

// ── UTILIDADES ──────────────────────────────────────────────────
function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
function num(x, def = 0) { const n = parseFloat(String(x ?? "").replace(",", ".")); return isNaN(n) ? def : n; }
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
function eur(x) { return (x || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const MESES_NOM = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function parametrosAnio(anio, overrides) {
  if (overrides && overrides[anio]) return overrides[anio];
  if (PARAMETROS_LEGALES[anio]) return PARAMETROS_LEGALES[anio];
  // Año sin parámetros propios: usar los del último año disponible
  const ult = Math.max(...Object.keys(PARAMETROS_LEGALES).map(Number));
  return PARAMETROS_LEGALES[ult];
}

// Aplica una escala progresiva [[hasta, tipo%], ...] a una base
function aplicarEscala(base, escala) {
  let cuota = 0, desde = 0;
  for (const [hasta, tipo] of escala) {
    const tope = hasta == null ? Infinity : hasta;
    if (base <= desde) break;
    cuota += (Math.min(base, tope) - desde) * tipo / 100;
    desde = tope;
  }
  return cuota;
}

function reduccionRendimientosTrabajo(rn, red) {
  if (rn <= red.tramo1) return red.importe1;
  if (rn <= red.tramo2) return Math.max(0, red.importe1 - red.coef1 * (rn - red.tramo1));
  if (rn <= red.tramo3) return Math.max(0, red.importe2 - red.coef2 * (rn - red.tramo2));
  return 0;
}

// ── IRPF: tipo de retención (algoritmo arts. 80-86 RIRPF) ───────
// d: { retribucionAnual, cotizacionesAnuales, situacion (1|2|3), hijos,
//      hijosMenores3, hijosCompartidos, discapacidad (0|33|65), temporal }
function calcularTipoIRPF(d, p) {
  const ip = p.irpf;
  const R = Math.max(0, d.retribucionAnual);
  const hijos = Math.max(0, Math.floor(d.hijos || 0));
  const disc = d.discapacidad || 0;

  const rendimientoNeto = Math.max(0, R - d.cotizacionesAnuales);
  const reduccion = reduccionRendimientosTrabajo(rendimientoNeto, ip.reduccion);
  const gastos = ip.gastosGenerales + (disc >= 65 ? ip.gastosDiscapacidad[65] : disc >= 33 ? ip.gastosDiscapacidad[33] : 0);
  const base = Math.max(0, rendimientoNeto - reduccion - gastos);

  let minDesc = 0;
  for (let i = 0; i < hijos; i++) minDesc += ip.minimoDescendientes[Math.min(i, 3)];
  minDesc += ip.minimoMenor3 * Math.min(d.hijosMenores3 || 0, hijos);
  if (d.hijosCompartidos) minDesc /= 2;
  const minimo = ip.minimoPersonal + minDesc + (disc >= 65 ? ip.minimoDiscapacidad[65] : disc >= 33 ? ip.minimoDiscapacidad[33] : 0);

  let cuota = Math.max(0, aplicarEscala(base, ip.escala) - aplicarEscala(minimo, ip.escala));

  // Límite excluido de retención
  const fila = ip.limitesExcluidos[d.situacion] || ip.limitesExcluidos[3];
  let limite = fila[Math.min(hijos, 2)];
  if (limite == null) limite = ip.limitesExcluidos[3][Math.min(hijos, 2)];
  if (R <= limite) cuota = 0;
  else cuota = Math.min(cuota, (R - limite) * ip.porcentajeMaxCuota / 100);

  let tipo = R > 0 ? r2(cuota / R * 100) : 0;
  if (d.temporal && R > limite) tipo = Math.max(tipo, ip.tipoMinimoTemporal);
  return { tipo, base: r2(base), minimo: r2(minimo), cuota: r2(cuota), limite, reduccion: r2(reduccion), rendimientoNeto: r2(rendimientoNeto) };
}

// Número de trienios/quinquenios cumplidos al final del mes de la nómina
function periodosAntiguedad(fechaAntiguedad, antig, anio, mes) {
  if (!fechaAntiguedad || !antig || !antig.periodoAnios) return 0;
  const ini = new Date(fechaAntiguedad + "T00:00:00");
  if (isNaN(ini)) return 0;
  const finMes = new Date(anio, mes, 0); // último día del mes (mes 1-12)
  let anios = finMes.getFullYear() - ini.getFullYear();
  if (finMes.getMonth() < ini.getMonth() || (finMes.getMonth() === ini.getMonth() && finMes.getDate() < ini.getDate())) anios--;
  let n = Math.max(0, Math.floor(anios / antig.periodoAnios));
  if (antig.maxPeriodos > 0) n = Math.min(n, antig.maxPeriodos);
  return n;
}

// ── CÁLCULO DE LA NÓMINA ────────────────────────────────────────
// ctx: { empleado, convenio, params, empresa, anio, mes (1-12), vars }
// vars: { dias, horasTrabajadas, horasExtra, horasExtraFM, precioHoraExtra,
//         incentivos, dietasExentas, anticipos, pagaExtra, retribucionAnual }
function calcularNomina(ctx) {
  const { empleado: e, convenio: c, params: p, empresa = {}, anio, mes } = ctx;
  const v = ctx.vars || {};
  const cat = (c.categorias || []).find(x => x.id === e.categoriaId);
  if (!cat) throw new Error("El empleado no tiene una categoría válida del convenio.");

  const jf = clamp(num(e.jornadaPct, 100), 0, 100) / 100;
  const dias = clamp(num(v.dias, 30), 0, 30);
  const fd = dias / 30;
  const porHoras = e.modalidad === "horas";
  const horas = num(v.horasTrabajadas);
  const nPagas = num(c.pagas?.numero, 0);
  const prorrateo = porHoras || !!c.pagas?.prorrateo || !!e.prorrateo;
  const jornadaMensualJC = num(c.jornadaAnual, 1780) / 12;

  const devengos = [];
  const add = (concepto, importe, opts = {}) => {
    importe = r2(importe);
    if (importe) devengos.push({ concepto, importe, salarial: true, cotiza: true, tributa: true, clase: "fijo", ...opts });
  };

  const nAnt = periodosAntiguedad(e.fechaAntiguedad, c.antiguedad, anio, mes);
  const impAntJC = nAnt * num(cat.importeAntiguedad, num(c.antiguedad?.importe));
  const nombrePeriodo = c.antiguedad?.periodoAnios === 5 ? "quinquenio" : c.antiguedad?.periodoAnios === 3 ? "trienio" : "periodo";

  let pagaMensual, fijoMensualCompleto;
  if (porHoras) {
    const precio = num(cat.precioHora);
    add(`Salario base (${horas} h × ${eur(precio)})`, horas * precio);
    pagaMensual = horas * precio;
    fijoMensualCompleto = pagaMensual;
  } else {
    const base = num(cat.salarioBase), plus = num(cat.plusConvenio), compl = num(e.complementoPersonal);
    add("Salario base", base * jf * fd);
    add(c.nombrePlus || "Plus convenio", plus * jf * fd);
    if (nAnt) add(`Antigüedad (${nAnt} ${nombrePeriodo}${nAnt !== 1 ? "s" : ""})`, impAntJC * jf * fd);
    add("Complemento personal", compl * jf * fd);
    pagaMensual = (base + (c.pagas?.incluyePlus ? plus : 0) + (c.pagas?.incluyeAntiguedad ? impAntJC : 0) + compl) * jf;
    fijoMensualCompleto = (base + plus + impAntJC + compl) * jf;
  }

  // Conceptos fijos del convenio y del empleado
  [...(c.conceptos || []), ...(e.conceptos || [])].forEach(k => {
    const factor = k.proporcional === false ? 1 : (porHoras ? 1 : jf * fd);
    const opts = { salarial: k.salarial !== false, cotiza: k.cotiza !== false, tributa: k.tributa !== false };
    add(k.nombre, num(k.importe) * factor, opts);
    if (opts.tributa) fijoMensualCompleto += num(k.importe) * (k.proporcional === false ? 1 : (porHoras ? 1 : jf));
  });

  // Pagas extraordinarias
  if (nPagas > 0) {
    if (prorrateo) add("Prorrata pagas extraordinarias", pagaMensual * nPagas / 12 * (porHoras ? 1 : fd), { clase: "prorrata" });
    else if ((c.pagas.meses || []).map(Number).includes(mes)) add("Paga extraordinaria", v.pagaExtra != null && v.pagaExtra !== "" ? num(v.pagaExtra) : pagaMensual, { clase: "paga" });
  }

  // Horas extraordinarias
  let precioOrdinario;
  if (porHoras) precioOrdinario = num(cat.precioHora);
  else {
    const pagaJC = num(cat.salarioBase) + (c.pagas?.incluyePlus ? num(cat.plusConvenio) : 0) + (c.pagas?.incluyeAntiguedad ? impAntJC : 0);
    const anualJC = (num(cat.salarioBase) + num(cat.plusConvenio) + impAntJC) * 12 + pagaJC * nPagas;
    precioOrdinario = anualJC / num(c.jornadaAnual, 1780);
  }
  const precioHE = num(v.precioHoraExtra) || r2(precioOrdinario * (1 + num(c.recargoHoraExtra) / 100));
  add(`Horas extraordinarias (${num(v.horasExtra)} h × ${eur(precioHE)})`, num(v.horasExtra) * precioHE, { clase: "he" });
  add(`Horas extra fuerza mayor (${num(v.horasExtraFM)} h × ${eur(precioHE)})`, num(v.horasExtraFM) * precioHE, { clase: "heFM" });
  add("Incentivos / otros", num(v.incentivos), { clase: "variable" });
  add("Dietas y gastos de locomoción (exentos)", num(v.dietasExentas), { salarial: false, cotiza: false, tributa: false, clase: "variable" });

  // ── Bases de cotización
  const sum = arr => r2(arr.reduce((s, d) => s + d.importe, 0));
  const importeHE = sum(devengos.filter(d => d.clase === "he"));
  const importeHEFM = sum(devengos.filter(d => d.clase === "heFM"));
  const remuneracionMensual = sum(devengos.filter(d => d.cotiza && !["paga", "he", "heFM"].includes(d.clase)));
  const prorrataNoIncluida = (!prorrateo && nPagas > 0) ? r2(pagaMensual * nPagas / 12 * fd) : 0;
  const remuneracionTotal = r2(remuneracionMensual + prorrataNoIncluida);

  const grupo = num(cat.grupoCotizacion, 7);
  const factorMin = porHoras ? Math.min(1, horas / jornadaMensualJC) : jf;
  const bMin = r2((p.basesMin[grupo] || p.basesMin[7]) * factorMin * fd);
  const bMax = r2(p.baseMax * fd);
  const baseCC = r2(clamp(remuneracionTotal, bMin, bMax));
  const baseAT = r2(clamp(remuneracionTotal + importeHE + importeHEFM, bMin, bMax));

  // Cotización adicional de solidaridad (exceso sobre la base máxima)
  let solidaridad = 0;
  const exceso = remuneracionTotal + importeHE + importeHEFM - bMax;
  if (exceso > 0) {
    let desde = 0;
    for (const t of p.solidaridad) {
      const tope = t.hasta == null ? Infinity : bMax * (t.hasta - 1);
      if (exceso <= desde) break;
      solidaridad += (Math.min(exceso, tope) - desde) * t.tipo / 100;
      desde = tope;
    }
  }
  solidaridad = r2(solidaridad);

  // ── Cotizaciones
  const T = p.tipos;
  const des = e.tipoContrato === "temporal" ? T.desempleoTemp : T.desempleoIndef;
  const atep = num(empresa.atep, 1.0);
  const lineas = [
    { concepto: "Contingencias comunes", base: baseCC, t: T.cc },
    { concepto: "MEI", base: baseCC, t: T.mei },
    { concepto: "Desempleo", base: baseAT, t: des },
    { concepto: "Formación profesional", base: baseAT, t: T.fp },
    { concepto: "Horas extra fuerza mayor", base: importeHEFM, t: T.heFuerzaMayor },
    { concepto: "Horas extra no estructurales", base: importeHE, t: T.heResto },
  ].filter(l => l.base > 0);
  const cotTrabajador = lineas.filter(l => l.t.trab).map(l => ({ concepto: l.concepto, base: l.base, tipo: l.t.trab, importe: r2(l.base * l.t.trab / 100) }));
  const cotEmpresa = [
    ...lineas.map(l => ({ concepto: l.concepto, base: l.base, tipo: l.t.emp, importe: r2(l.base * l.t.emp / 100) })),
    { concepto: "AT y EP", base: baseAT, tipo: atep, importe: r2(baseAT * atep / 100) },
    { concepto: "FOGASA", base: baseAT, tipo: T.fogasa.emp, importe: r2(baseAT * T.fogasa.emp / 100) },
  ].filter(l => l.importe);
  if (solidaridad) {
    const st = r2(solidaridad * p.solidaridadParteTrabajador);
    cotTrabajador.push({ concepto: "Cotización de solidaridad", base: r2(exceso), tipo: null, importe: st });
    cotEmpresa.push({ concepto: "Cotización de solidaridad", base: r2(exceso), tipo: null, importe: r2(solidaridad - st) });
  }

  // ── IRPF
  const baseIRPF = sum(devengos.filter(d => d.tributa));
  const retribucionAnual = num(v.retribucionAnual) || r2(fijoMensualCompleto * 12 + (porHoras ? pagaMensual * nPagas : pagaMensual * nPagas));
  const tipoTrabFijo = T.cc.trab + T.mei.trab + des.trab + T.fp.trab;
  const baseAnualMes = clamp(retribucionAnual / 12, p.basesMin[grupo] * factorMin, p.baseMax);
  const cotizacionesAnuales = r2(baseAnualMes * 12 * tipoTrabFijo / 100);
  const irpfCalc = calcularTipoIRPF({
    retribucionAnual, cotizacionesAnuales,
    situacion: num(e.situacionFamiliar, 3), hijos: num(e.hijos), hijosMenores3: num(e.hijosMenores3),
    hijosCompartidos: !!e.hijosCompartidos, discapacidad: num(e.discapacidad), temporal: e.tipoContrato === "temporal",
  }, p);
  const tipoIRPF = (e.irpfManual !== undefined && e.irpfManual !== "" && e.irpfManual !== null) ? num(e.irpfManual) : irpfCalc.tipo;
  const importeIRPF = r2(baseIRPF * tipoIRPF / 100);

  const totalDevengado = sum(devengos);
  const totalCotTrab = r2(cotTrabajador.reduce((s, l) => s + l.importe, 0));
  const anticipos = r2(num(v.anticipos));
  const totalDeducir = r2(totalCotTrab + importeIRPF + anticipos);
  const totalCotEmp = r2(cotEmpresa.reduce((s, l) => s + l.importe, 0));

  return {
    anio, mes, dias, porHoras, horas,
    empleado: e, convenio: { id: c.id, nombre: c.nombre, codigo: c.codigo }, categoria: cat, empresa,
    devengos, totalDevengado,
    cotTrabajador, totalCotTrab,
    irpf: { tipo: tipoIRPF, base: baseIRPF, importe: importeIRPF, manual: tipoIRPF !== irpfCalc.tipo, calculo: irpfCalc, retribucionAnual, cotizacionesAnuales },
    anticipos, totalDeducir,
    liquido: r2(totalDevengado - totalDeducir),
    bases: { remuneracionMensual, remuneracionTotal, baseCC, baseAT, importeHE, importeHEFM, bMin, bMax, prorrataNoIncluida },
    cotEmpresa, totalCotEmp,
    costeEmpresa: r2(totalDevengado + totalCotEmp),
    precioHE, generado: new Date().toISOString(),
  };
}

// Minutos trabajados a partir de los fichajes de un mes (formato OneDrive / localStorage)
function horasDesdePayload(payload) {
  let mins = 0;
  (payload?.dias || []).forEach(d => (d.eventos || []).forEach(ev => {
    if (ev.cancelado || !ev.inicio || !ev.fin) return;
    const m = (new Date(ev.fin) - new Date(ev.inicio)) / 60000;
    if (m > 0) mins += m;
  }));
  return r2(mins / 60);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PARAMETROS_LEGALES, CONVENIOS_EJEMPLO, calcularNomina, calcularTipoIRPF, aplicarEscala, reduccionRendimientosTrabajo, periodosAntiguedad, horasDesdePayload, parametrosAnio };
}

// ═══════════════════════════════════════════════════════════════
// INTERFAZ
// ═══════════════════════════════════════════════════════════════
const NOM_KEY = "nominas_datos_v1";
const NOM_ONEDRIVE_FILE = "nominas_datos.json";
let NOM = null;
let nomVista = "calcular";
let nomUltimo = null;  // último resultado calculado

function nomDatosIniciales() {
  return {
    empresa: { nombre: "Tunivers Formación", cif: "", domicilio: "", ccc: "", atep: 1.00 },
    convenios: JSON.parse(JSON.stringify(CONVENIOS_EJEMPLO)),
    empleados: [],
    parametros: {},
    historico: {},
  };
}

function nomCargar() {
  if (NOM) return NOM;
  try { NOM = JSON.parse(localStorage.getItem(NOM_KEY) || "null"); } catch { NOM = null; }
  if (!NOM) NOM = nomDatosIniciales();
  return NOM;
}

function nomGuardar() {
  try { localStorage.setItem(NOM_KEY, JSON.stringify(NOM)); } catch (e) { console.warn(e); }
}

function nomUid(pref) { return pref + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function renderNominas() {
  nomCargar();
  const subs = [["calcular", "Calcular nómina"], ["empleados", "Empleados"], ["convenios", "Convenios"], ["parametros", "Empresa y parámetros"]];
  let cuerpo = "";
  if (nomVista === "calcular") cuerpo = nomRenderCalcular();
  else if (nomVista === "empleados") cuerpo = nomRenderEmpleados();
  else if (nomVista === "convenios") cuerpo = nomRenderConvenios();
  else cuerpo = nomRenderParametros();

  const avisoEjemplo = NOM.convenios.some(c => c.ejemplo)
    ? `<div class="alerta al-warn"><span>⚠</span><span>Hay convenios con <strong>tablas salariales de ejemplo</strong>. Introduce las tablas vigentes publicadas en el boletín oficial en la pestaña <em>Convenios</em> antes de usar las nóminas.</span></div>` : "";

  document.getElementById("app-content").innerHTML = `
    <div class="nom-sub">${subs.map(([k, l]) => `<button class="${k === nomVista ? "on" : ""}" onclick="nomIr('${k}')">${l}</button>`).join("")}</div>
    <div class="section">${avisoEjemplo}${cuerpo}</div>`;
  if (nomVista === "calcular" && !nomUltimo) nomPrefijarHoras();
}

function nomIr(v) { nomVista = v; renderNominas(); }

// ── Calcular ───────────────────────────────────────────────────
function nomRenderCalcular() {
  if (!NOM.empleados.length) return `<div class="nom-card"><div class="empty">Primero da de alta a los empleados.</div><button class="btn-export" onclick="nomIr('empleados')">Ir a empleados</button></div>`;
  const hoy = new Date();
  const anio = nomUltimo?.anio || hoy.getFullYear();
  const mes = nomUltimo?.mes || hoy.getMonth() + 1;
  const empSel = nomUltimo?.empleado?.id || NOM.empleados[0].id;
  return `<div class="nom-card">
    <div class="section-title">Datos del periodo</div>
    <form id="nom-calc" class="nom-form" onsubmit="event.preventDefault();nomCalcular()">
      <label class="full">Empleado
        <select name="empleado" onchange="nomPrefijarHoras()">${NOM.empleados.map(e => `<option value="${esc(e.id)}" ${e.id === empSel ? "selected" : ""}>${esc(e.nombre)} — ${esc(nomNombreCategoria(e))}</option>`).join("")}</select>
      </label>
      <label>Mes<select name="mes" onchange="nomPrefijarHoras()">${MESES_NOM.map((m, i) => `<option value="${i + 1}" ${i + 1 === mes ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      <label>Año<input name="anio" type="number" value="${anio}" onchange="nomPrefijarHoras()"/></label>
      <label>Días cotizados<input name="dias" type="number" min="0" max="30" value="30"/></label>
      <label>Horas fichadas<input name="horasFichadas" type="number" step="0.01" placeholder="—"/></label>
      <label>Horas trabajadas <small>(pago por horas)</small><input name="horasTrabajadas" type="number" step="0.01"/></label>
      <label>Horas extra<input name="horasExtra" type="number" step="0.01" value="0"/></label>
      <label>Horas extra fuerza mayor<input name="horasExtraFM" type="number" step="0.01" value="0"/></label>
      <label>Precio hora extra <small>(vacío = automático)</small><input name="precioHoraExtra" type="number" step="0.01"/></label>
      <label>Incentivos / otros (€)<input name="incentivos" type="number" step="0.01" value="0"/></label>
      <label>Dietas exentas (€)<input name="dietasExentas" type="number" step="0.01" value="0"/></label>
      <label>Anticipos (€)<input name="anticipos" type="number" step="0.01" value="0"/></label>
      <label>Importe paga extra <small>(vacío = convenio)</small><input name="pagaExtra" type="number" step="0.01"/></label>
      <label>Retribución anual prevista <small>(vacío = automático)</small><input name="retribucionAnual" type="number" step="0.01"/></label>
      <div class="full nom-hint" id="nom-horas-info"></div>
      <div class="full nom-acciones">
        <button type="button" class="btn-export-sec" onclick="nomLeerFichajeOneDrive()">Leer fichaje del empleado en OneDrive</button>
        <label class="btn-export-sec nom-file">Importar fichaje (.json)<input type="file" accept=".json,application/json" onchange="nomImportarFichaje(this)"/></label>
      </div>
      <button class="btn-export full" type="submit">Calcular nómina</button>
    </form>
  </div>
  <div id="nom-resultado">${nomUltimo ? nomRenderResultado(nomUltimo) : ""}</div>`;
}

function nomNombreCategoria(e) {
  const c = NOM.convenios.find(x => x.id === e.convenioId);
  return c?.categorias.find(x => x.id === e.categoriaId)?.nombre || "sin categoría";
}

// Horas fichadas del propio usuario (localStorage del navegador) para el mes elegido
function nomHorasLocales(userId, anio, mes) {
  const diasMes = new Date(anio, mes, 0).getDate();
  let mins = 0;
  for (let d = 1; d <= diasMes; d++) {
    const f = `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem(`fichajes_${userId}_${f}`) || "[]"); } catch {}
    lista.forEach(x => {
      if (x.cancelado || !x.inicio || !x.fin) return;
      const m = (new Date(x.fin) - new Date(x.inicio)) / 60000;
      if (m > 0) mins += m;
    });
  }
  return r2(mins / 60);
}

function nomFormVals() {
  const f = document.getElementById("nom-calc");
  return Object.fromEntries(new FormData(f).entries());
}

function nomPrefijarHoras() {
  const f = document.getElementById("nom-calc");
  if (!f) return;
  const v = nomFormVals();
  const emp = NOM.empleados.find(e => e.id === v.empleado);
  const info = document.getElementById("nom-horas-info");
  const esYo = emp && typeof currentUser !== "undefined" && currentUser?.mail && emp.email && emp.email.toLowerCase() === currentUser.mail.toLowerCase();
  if (esYo) {
    const h = nomHorasLocales(currentUser.id, num(v.anio), num(v.mes));
    nomAplicarHoras(h, "fichajes de este navegador");
  } else {
    f.horasFichadas.value = "";
    if (info) info.textContent = "Puedes leer las horas fichadas del empleado desde OneDrive o importar su archivo de fichaje.";
  }
}

function nomAplicarHoras(h, origen) {
  const f = document.getElementById("nom-calc");
  const v = nomFormVals();
  const emp = NOM.empleados.find(e => e.id === v.empleado);
  const conv = NOM.convenios.find(c => c.id === emp?.convenioId);
  f.horasFichadas.value = h;
  let txt = `Horas fichadas: ${h} h (${origen}).`;
  if (emp?.modalidad === "horas") { f.horasTrabajadas.value = h; txt += " Se usan como horas trabajadas."; }
  else if (conv) {
    const teorica = r2(num(conv.jornadaAnual) / 12 * num(emp.jornadaPct, 100) / 100);
    const exceso = r2(h - teorica);
    txt += ` Jornada mensual media según convenio: ${teorica} h.` + (exceso > 0 ? ` Exceso de ${exceso} h: revisa si son horas extraordinarias.` : "");
  }
  document.getElementById("nom-horas-info").textContent = txt;
}

function nomImportarFichaje(input) {
  const file = input.files?.[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try { nomAplicarHoras(horasDesdePayload(JSON.parse(rd.result)), file.name); }
    catch { showToast("El archivo de fichaje no es válido."); }
  };
  rd.readAsText(file);
  input.value = "";
}

// Lee /FICHAJES OUTLOOK/[nombre]_[AAAA-MM].json del OneDrive del empleado.
// Necesita el permiso Files.Read.All (consentimiento de administrador en Azure).
async function nomLeerFichajeOneDrive() {
  const v = nomFormVals();
  const emp = NOM.empleados.find(e => e.id === v.empleado);
  if (!emp?.email) { showToast("El empleado no tiene email de Microsoft 365."); return; }
  try {
    const account = msalInstance.getActiveAccount();
    let token;
    try { token = (await msalInstance.acquireTokenSilent({ scopes: SCOPES_ADMIN, account })).accessToken; }
    catch { token = (await msalInstance.acquireTokenPopup({ scopes: SCOPES_ADMIN })).accessToken; }
    const archivo = `${(emp.nombre || "").replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "_")}_${v.anio}-${String(v.mes).padStart(2, "0")}.json`;
    const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(emp.email)}/drive/root:/${encodeURIComponent(ONEDRIVE_FOLDER)}/${encodeURIComponent(archivo)}:/content`;
    const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    if (!resp.ok) throw new Error(resp.status === 404 ? `No existe ${archivo} en su OneDrive` : "Error " + resp.status);
    nomAplicarHoras(horasDesdePayload(await resp.json()), "OneDrive");
  } catch (e) {
    console.warn(e);
    showToast("No se pudo leer el fichaje: " + e.message);
  }
}

function nomCalcular() {
  const v = nomFormVals();
  const emp = NOM.empleados.find(e => e.id === v.empleado);
  const conv = NOM.convenios.find(c => c.id === emp?.convenioId);
  if (!emp || !conv) { showToast("El empleado no tiene convenio asignado."); return; }
  const anio = num(v.anio), mes = num(v.mes);
  try {
    nomUltimo = calcularNomina({
      empleado: emp, convenio: conv, empresa: NOM.empresa, anio, mes,
      params: parametrosAnio(anio, NOM.parametros),
      vars: { ...v, pagaExtra: v.pagaExtra === "" ? null : v.pagaExtra },
    });
    nomUltimo.horasFichadas = v.horasFichadas;
    NOM.historico[`${emp.id}_${anio}-${String(mes).padStart(2, "0")}`] = nomUltimo;
    nomGuardar();
    document.getElementById("nom-resultado").innerHTML = nomRenderResultado(nomUltimo);
    document.getElementById("nom-resultado").scrollIntoView({ behavior: "smooth" });
  } catch (e) { showToast(e.message); }
}

function nomRenderResultado(r) {
  const filas = arr => arr.map(d => `<tr><td>${esc(d.concepto)}</td><td class="num">${eur(d.importe)}</td></tr>`).join("");
  const cot = arr => arr.map(d => `<tr><td>${esc(d.concepto)}${d.tipo != null ? ` <small>${d.tipo.toLocaleString("es-ES")} % s/ ${eur(d.base)}</small>` : ""}</td><td class="num">${eur(d.importe)}</td></tr>`).join("");
  const ic = r.irpf.calculo;
  return `<div class="nom-card">
    <div class="section-title">${esc(r.empleado.nombre)} · ${MESES_NOM[r.mes - 1]} ${r.anio}</div>
    <div class="totales-grid" style="margin-bottom:10px">
      <div class="total-card"><div class="total-label">Líquido a percibir</div><div class="total-val">${eur(r.liquido)}</div></div>
      <div class="total-card"><div class="total-label">Coste empresa</div><div class="total-val">${eur(r.costeEmpresa)}</div></div>
    </div>
    <table class="nom-table">
      <tr class="h"><td colspan="2">Devengos</td></tr>${filas(r.devengos)}
      <tr class="t"><td>Total devengado</td><td class="num">${eur(r.totalDevengado)}</td></tr>
      <tr class="h"><td colspan="2">Deducciones</td></tr>${cot(r.cotTrabajador)}
      <tr><td>IRPF <small>${r.irpf.tipo.toLocaleString("es-ES")} % s/ ${eur(r.irpf.base)}${r.irpf.manual ? " (tipo fijado manualmente)" : ""}</small></td><td class="num">${eur(r.irpf.importe)}</td></tr>
      ${r.anticipos ? `<tr><td>Anticipos</td><td class="num">${eur(r.anticipos)}</td></tr>` : ""}
      <tr class="t"><td>Total a deducir</td><td class="num">${eur(r.totalDeducir)}</td></tr>
      <tr class="h"><td colspan="2">Aportación empresa</td></tr>${cot(r.cotEmpresa)}
      <tr class="t"><td>Total aportación empresa</td><td class="num">${eur(r.totalCotEmp)}</td></tr>
    </table>
    <div class="nom-hint">Base CC: ${eur(r.bases.baseCC)} · Base AT/EP y desempleo: ${eur(r.bases.baseAT)} (mín. ${eur(r.bases.bMin)}, máx. ${eur(r.bases.bMax)}).<br/>
    IRPF: retribución anual prevista ${eur(r.irpf.retribucionAnual)}, cotizaciones ${eur(r.irpf.cotizacionesAnuales)}, reducción art. 20 ${eur(ic.reduccion)}, base ${eur(ic.base)}, mínimo personal y familiar ${eur(ic.minimo)}, cuota ${eur(ic.cuota)} → tipo calculado ${ic.tipo.toLocaleString("es-ES")} %.</div>
    <button class="btn-export" style="margin-top:10px" onclick="nomImprimirRecibo()">Ver / imprimir recibo de salarios</button>
  </div>`;
}

// Recibo individual de salarios (modelo de la Orden ESS/2098/2014)
function nomImprimirRecibo(r = nomUltimo) {
  if (!r) return;
  const e = r.empleado, emp = r.empresa || {};
  const ultimo = new Date(r.anio, r.mes, 0).getDate();
  const sal = r.devengos.filter(d => d.salarial), noSal = r.devengos.filter(d => !d.salarial);
  const filas = arr => arr.map(d => `<tr><td>${esc(d.concepto)}</td><td class="n">${eur(d.importe)}</td><td></td></tr>`).join("") || `<tr><td colspan="3" class="vac">—</td></tr>`;
  const cot = r.cotTrabajador.map(d => `<tr><td>${esc(d.concepto)}</td><td class="n">${d.tipo != null ? d.tipo.toLocaleString("es-ES") + " %" : ""}</td><td class="n">${eur(d.importe)}</td></tr>`).join("");
  const cotEmp = r.cotEmpresa.map(d => `<tr><td>${esc(d.concepto)}</td><td class="n">${eur(d.base)}</td><td class="n">${d.tipo != null ? d.tipo.toLocaleString("es-ES") + " %" : ""}</td><td class="n">${eur(d.importe)}</td></tr>`).join("");
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <title>Nómina ${esc(MESES_NOM[r.mes - 1])} ${r.anio} - ${esc(e.nombre)}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:10px;margin:1cm;color:#111}
    table{width:100%;border-collapse:collapse}
    .cab td{border:1px solid #999;padding:5px;vertical-align:top;width:50%}
    .cab b{display:block;font-size:9px;color:#555;text-transform:uppercase;margin-bottom:2px}
    .per{margin:8px 0;font-size:11px}
    .det th{background:#2C3E50;color:#fff;padding:4px 6px;text-align:left;font-size:9px}
    .det td{padding:3px 6px;border-bottom:1px solid #eee}
    .det .sec td{font-weight:bold;background:#f0f0f0}
    .n{text-align:right;white-space:nowrap}.vac{color:#aaa}
    .tot td{font-weight:bold;border-top:1px solid #333}
    .liq{font-size:13px;font-weight:bold;text-align:right;margin:10px 0;padding:8px;border:2px solid #2C3E50}
    .firma{display:flex;justify-content:space-between;margin:14px 0 18px;font-size:10px}
    h4{margin:12px 0 4px;font-size:10px;text-transform:uppercase}
    @media print{body{margin:0.6cm}}
  </style></head><body>
  <table class="cab"><tr>
    <td><b>Empresa</b>${esc(emp.nombre)}<br/>${esc(emp.domicilio)}<br/>CIF: ${esc(emp.cif)}<br/>CCC: ${esc(emp.ccc)}</td>
    <td><b>Trabajador/a</b>${esc(e.nombre)}<br/>NIF: ${esc(e.nif)} · Nº afiliación SS: ${esc(e.naf)}<br/>Categoría: ${esc(r.categoria.nombre)} · Grupo de cotización: ${esc(r.categoria.grupoCotizacion)}<br/>Antigüedad: ${esc(e.fechaAntiguedad || "")} · Contrato: ${esc(e.tipoContrato || "")}${num(e.jornadaPct, 100) < 100 ? ` · Jornada ${num(e.jornadaPct)} %` : ""}<br/>Convenio: ${esc(r.convenio.nombre)}${r.convenio.codigo ? ` (${esc(r.convenio.codigo)})` : ""}</td>
  </tr></table>
  <div class="per"><strong>Periodo de liquidación:</strong> del 01/${String(r.mes).padStart(2, "0")}/${r.anio} al ${ultimo}/${String(r.mes).padStart(2, "0")}/${r.anio} · <strong>Total días:</strong> ${r.dias}</div>
  <table class="det">
    <thead><tr><th>I. DEVENGOS</th><th class="n">Importe</th><th class="n">Totales</th></tr></thead>
    <tr class="sec"><td colspan="3">1. Percepciones salariales</td></tr>${filas(sal)}
    <tr class="sec"><td colspan="3">2. Percepciones no salariales</td></tr>${filas(noSal)}
    <tr class="tot"><td>A. TOTAL DEVENGADO</td><td></td><td class="n">${eur(r.totalDevengado)}</td></tr>
    <thead><tr><th>II. DEDUCCIONES</th><th class="n">Tipo</th><th class="n">Importe</th></tr></thead>
    <tr class="sec"><td colspan="3">1. Aportación del trabajador a las cotizaciones a la Seguridad Social y conceptos de recaudación conjunta</td></tr>${cot}
    <tr class="sec"><td colspan="3">2. Impuesto sobre la Renta de las Personas Físicas</td></tr>
    <tr><td>IRPF</td><td class="n">${r.irpf.tipo.toLocaleString("es-ES")} %</td><td class="n">${eur(r.irpf.importe)}</td></tr>
    <tr class="sec"><td colspan="3">3. Anticipos · 4. Valor productos en especie · 5. Otras deducciones</td></tr>
    <tr><td>Anticipos</td><td></td><td class="n">${eur(r.anticipos)}</td></tr>
    <tr class="tot"><td>B. TOTAL A DEDUCIR</td><td></td><td class="n">${eur(r.totalDeducir)}</td></tr>
  </table>
  <div class="liq">LÍQUIDO TOTAL A PERCIBIR (A − B): ${eur(r.liquido)}</div>
  <div class="firma"><span>Firma y sello de la empresa</span><span>${ultimo} de ${MESES_NOM[r.mes - 1]} de ${r.anio}</span><span>Recibí</span></div>
  <h4>Determinación de las bases de cotización a la Seguridad Social y conceptos de recaudación conjunta y de la base sujeta a retención del IRPF y aportación de la empresa</h4>
  <table class="det">
    <thead><tr><th>Concepto</th><th class="n">Base</th><th class="n">Tipo</th><th class="n">Aportación empresa</th></tr></thead>
    <tr class="sec"><td colspan="4">1. Base de cotización por contingencias comunes: remuneración mensual ${eur(r.bases.remuneracionMensual)} + prorrata pagas extraordinarias ${eur(r.bases.prorrataNoIncluida)} → ${eur(r.bases.baseCC)}</td></tr>
    <tr class="sec"><td colspan="4">2. Base de cotización por contingencias profesionales y conceptos de recaudación conjunta: ${eur(r.bases.baseAT)}</td></tr>
    <tr class="sec"><td colspan="4">3. Base cotización adicional horas extraordinarias: ${eur(r.bases.importeHE + r.bases.importeHEFM)}</td></tr>
    ${cotEmp}
    <tr class="tot"><td>Total aportación empresa</td><td></td><td></td><td class="n">${eur(r.totalCotEmp)}</td></tr>
    <tr class="sec"><td colspan="4">4. Base sujeta a retención del IRPF: ${eur(r.irpf.base)}</td></tr>
  </table>
  <script>window.onload=function(){window.print();}<\/script>
  </body></html>`);
  win.document.close();
}

// ── Empleados ──────────────────────────────────────────────────
let nomEmpEditando = null;

function nomRenderEmpleados() {
  const lista = NOM.empleados.map(e => {
    const conv = NOM.convenios.find(c => c.id === e.convenioId);
    return `<div class="fichaje-item">
      <div class="fi-info"><div class="fi-titulo">${esc(e.nombre)}</div>
      <div class="fi-meta">${esc(conv?.nombre || "sin convenio")} · ${esc(nomNombreCategoria(e))} · ${e.modalidad === "horas" ? "por horas" : num(e.jornadaPct, 100) + " % jornada"}</div></div>
      <button class="btn-mini" onclick="nomEditarEmpleado('${esc(e.id)}')">Editar</button>
    </div>`;
  }).join("") || `<div class="empty">No hay empleados todavía.</div>`;
  return `${lista}
    <button class="btn-export" style="margin:8px 0" onclick="nomEditarEmpleado(null)">+ Añadir empleado</button>
    <div id="nom-emp-form">${nomEmpEditando !== null ? nomFormEmpleado() : ""}</div>`;
}

function nomEditarEmpleado(id) {
  nomEmpEditando = id || "";
  renderNominas();
  document.getElementById("nom-emp-form")?.scrollIntoView({ behavior: "smooth" });
}

function nomFormEmpleado() {
  const e = NOM.empleados.find(x => x.id === nomEmpEditando) || { convenioId: NOM.convenios[0]?.id, jornadaPct: 100, tipoContrato: "indefinido", modalidad: "mensual", situacionFamiliar: 3, hijos: 0, hijosMenores3: 0, discapacidad: 0, irpfManual: "", conceptos: [] };
  const sel = (name, opts, val) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const conv = NOM.convenios.find(c => c.id === e.convenioId) || NOM.convenios[0];
  return `<div class="nom-card">
    <div class="section-title">${e.id ? "Editar empleado" : "Nuevo empleado"}</div>
    <form id="nom-emp" class="nom-form" onsubmit="event.preventDefault();nomGuardarEmpleado()">
      <label class="full">Nombre y apellidos<input name="nombre" required value="${esc(e.nombre)}"/></label>
      <label>NIF<input name="nif" value="${esc(e.nif)}"/></label>
      <label>Nº afiliación SS<input name="naf" value="${esc(e.naf)}"/></label>
      <label class="full">Email Microsoft 365 <small>(para leer su fichaje)</small><input name="email" type="email" value="${esc(e.email)}"/></label>
      <label>Convenio${sel("convenioId", NOM.convenios.map(c => [c.id, c.nombre]), e.convenioId)}</label>
      <label>Categoría${sel("categoriaId", (conv?.categorias || []).map(c => [c.id, c.nombre]), e.categoriaId)}</label>
      <label>Fecha de antigüedad<input name="fechaAntiguedad" type="date" value="${esc(e.fechaAntiguedad)}"/></label>
      <label>Contrato${sel("tipoContrato", [["indefinido", "Indefinido"], ["temporal", "Temporal"]], e.tipoContrato)}</label>
      <label>Modalidad de pago${sel("modalidad", [["mensual", "Salario mensual"], ["horas", "Por horas trabajadas"]], e.modalidad)}</label>
      <label>% de jornada<input name="jornadaPct" type="number" step="0.01" min="0" max="100" value="${esc(e.jornadaPct)}"/></label>
      <label>Complemento personal (€/mes)<input name="complementoPersonal" type="number" step="0.01" value="${esc(e.complementoPersonal || 0)}"/></label>
      <label>Prorratear pagas extra${sel("prorrateo", [["", "Según convenio"], ["1", "Sí"]], e.prorrateo ? "1" : "")}</label>
      <label class="full">Situación familiar (IRPF)${sel("situacionFamiliar", [[1, "1 · Monoparental con hijos"], [2, "2 · Cónyuge a cargo (rentas < 1.500 €)"], [3, "3 · Otras situaciones"]], e.situacionFamiliar)}</label>
      <label>Nº de hijos<input name="hijos" type="number" min="0" value="${esc(e.hijos)}"/></label>
      <label>De ellos, menores de 3 años<input name="hijosMenores3" type="number" min="0" value="${esc(e.hijosMenores3)}"/></label>
      <label>Hijos compartidos con otro progenitor${sel("hijosCompartidos", [["", "No"], ["1", "Sí (por mitad)"]], e.hijosCompartidos ? "1" : "")}</label>
      <label>Discapacidad${sel("discapacidad", [[0, "No"], [33, "≥ 33 % y < 65 %"], [65, "≥ 65 %"]], e.discapacidad)}</label>
      <label>IRPF fijo (%) <small>(vacío = calcular)</small><input name="irpfManual" type="number" step="0.01" value="${esc(e.irpfManual)}"/></label>
      <label class="full">Otros conceptos fijos <small>(uno por línea: nombre; importe; salarial|no salarial)</small>
        <textarea name="conceptos" rows="2">${esc((e.conceptos || []).map(k => `${k.nombre}; ${k.importe}; ${k.salarial === false ? "no salarial" : "salarial"}`).join("\n"))}</textarea></label>
      <div class="full nom-acciones">
        <button class="btn-export" type="submit">Guardar</button>
        ${e.id ? `<button type="button" class="btn-export-sec nom-borrar" onclick="nomBorrarEmpleado('${esc(e.id)}')">Eliminar</button>` : ""}
        <button type="button" class="btn-export-sec" onclick="nomEmpEditando=null;renderNominas()">Cancelar</button>
      </div>
    </form>
  </div>`;
}

function nomParseConceptos(txt) {
  return String(txt || "").split("\n").map(l => l.split(";").map(s => s.trim())).filter(p => p[0]).map(([nombre, importe, tipo]) => {
    const noSal = /^no/i.test(tipo || "");
    return { nombre, importe: num(importe), salarial: !noSal, cotiza: true, tributa: true };
  });
}

function nomGuardarEmpleado() {
  const v = Object.fromEntries(new FormData(document.getElementById("nom-emp")).entries());
  const conv = NOM.convenios.find(c => c.id === v.convenioId);
  if (!conv?.categorias.find(c => c.id === v.categoriaId)) v.categoriaId = conv?.categorias[0]?.id;
  const e = {
    ...v,
    id: nomEmpEditando || nomUid("emp"),
    jornadaPct: num(v.jornadaPct, 100), complementoPersonal: num(v.complementoPersonal),
    situacionFamiliar: num(v.situacionFamiliar, 3), hijos: num(v.hijos), hijosMenores3: num(v.hijosMenores3),
    discapacidad: num(v.discapacidad), prorrateo: !!v.prorrateo, hijosCompartidos: !!v.hijosCompartidos,
    conceptos: nomParseConceptos(v.conceptos),
  };
  const i = NOM.empleados.findIndex(x => x.id === e.id);
  if (i >= 0) NOM.empleados[i] = e; else NOM.empleados.push(e);
  nomEmpEditando = null;
  nomGuardar();
  renderNominas();
  showToast("Empleado guardado.");
}

function nomBorrarEmpleado(id) {
  if (!confirm("¿Eliminar este empleado?")) return;
  NOM.empleados = NOM.empleados.filter(e => e.id !== id);
  nomEmpEditando = null;
  nomGuardar();
  renderNominas();
}

// ── Convenios ──────────────────────────────────────────────────
function nomRenderConvenios() {
  return NOM.convenios.map((c, ci) => `<div class="nom-card">
    <form class="nom-form" id="nom-conv-${ci}" onsubmit="event.preventDefault();nomGuardarConvenio(${ci})">
      <label class="full">Nombre del convenio<input name="nombre" value="${esc(c.nombre)}"/></label>
      <label>Código de convenio (REGCON)<input name="codigo" value="${esc(c.codigo)}"/></label>
      <label>Jornada anual (horas)<input name="jornadaAnual" type="number" step="0.01" value="${esc(c.jornadaAnual)}"/></label>
      <label>Nº pagas extraordinarias<input name="pagasNumero" type="number" min="0" value="${esc(c.pagas.numero)}"/></label>
      <label>Meses de las pagas <small>(p. ej. 6,12)</small><input name="pagasMeses" value="${esc((c.pagas.meses || []).join(","))}"/></label>
      <label>Pagas prorrateadas<select name="pagasProrrateo"><option value="">No</option><option value="1" ${c.pagas.prorrateo ? "selected" : ""}>Sí</option></select></label>
      <label>La paga incluye plus convenio<select name="pagasPlus"><option value="">No</option><option value="1" ${c.pagas.incluyePlus ? "selected" : ""}>Sí</option></select></label>
      <label>La paga incluye antigüedad<select name="pagasAnt"><option value="">No</option><option value="1" ${c.pagas.incluyeAntiguedad ? "selected" : ""}>Sí</option></select></label>
      <label>Antigüedad<select name="antPeriodo">${[[0, "No tiene"], [2, "Bienios"], [3, "Trienios"], [5, "Quinquenios"]].map(([k, l]) => `<option value="${k}" ${num(c.antiguedad.periodoAnios) === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <label>Máximo de periodos <small>(0 = sin límite)</small><input name="antMax" type="number" min="0" value="${esc(c.antiguedad.maxPeriodos)}"/></label>
      <label>Nombre del plus<input name="nombrePlus" value="${esc(c.nombrePlus || "Plus convenio")}"/></label>
      <label>Recargo hora extra (%)<input name="recargoHoraExtra" type="number" step="0.01" value="${esc(c.recargoHoraExtra || 0)}"/></label>
      <div class="full">
        <div class="section-title" style="margin-top:6px">Tablas salariales (importes mensuales)</div>
        <div class="nom-scroll"><table class="nom-table nom-edit">
          <thead><tr><th>Categoría</th><th>Grupo cot.</th><th>Salario base</th><th>Plus</th><th>€ por periodo antig.</th><th>€/hora</th><th></th></tr></thead>
          <tbody>${c.categorias.map(k => nomFilaCategoria(k)).join("")}</tbody>
        </table></div>
        <button type="button" class="btn-mini" onclick="nomAddCategoria(${ci})">+ Añadir categoría</button>
      </div>
      <label class="full">Conceptos comunes a todo el convenio <small>(uno por línea: nombre; importe; salarial|no salarial)</small>
        <textarea name="conceptos" rows="2">${esc((c.conceptos || []).map(k => `${k.nombre}; ${k.importe}; ${k.salarial === false ? "no salarial" : "salarial"}`).join("\n"))}</textarea></label>
      <button class="btn-export full" type="submit">Guardar convenio</button>
    </form>
  </div>`).join("") + `<div class="nom-card nom-acciones">
    <button class="btn-export-sec" onclick="nomExportar()">Exportar datos (.json)</button>
    <label class="btn-export-sec nom-file">Importar datos (.json)<input type="file" accept=".json,application/json" onchange="nomImportar(this)"/></label>
  </div>`;
}

function nomFilaCategoria(k) {
  return `<tr data-id="${esc(k.id)}">
    <td><input name="cnombre" value="${esc(k.nombre)}"/></td>
    <td><select name="cgrupo">${Array.from({ length: 11 }, (_, i) => `<option ${num(k.grupoCotizacion) === i + 1 ? "selected" : ""}>${i + 1}</option>`).join("")}</select></td>
    <td><input name="cbase" type="number" step="0.01" value="${esc(k.salarioBase)}"/></td>
    <td><input name="cplus" type="number" step="0.01" value="${esc(k.plusConvenio)}"/></td>
    <td><input name="cant" type="number" step="0.01" value="${esc(k.importeAntiguedad)}"/></td>
    <td><input name="chora" type="number" step="0.01" value="${esc(k.precioHora)}"/></td>
    <td><button type="button" class="btn-mini" onclick="this.closest('tr').remove()">✕</button></td>
  </tr>`;
}

function nomAddCategoria(ci) {
  const tb = document.querySelector(`#nom-conv-${ci} tbody`);
  tb.insertAdjacentHTML("beforeend", nomFilaCategoria({ id: nomUid("cat"), nombre: "", grupoCotizacion: 7, salarioBase: 0, plusConvenio: 0, importeAntiguedad: 0, precioHora: 0 }));
}

function nomGuardarConvenio(ci) {
  const form = document.getElementById(`nom-conv-${ci}`);
  const v = Object.fromEntries(new FormData(form).entries());
  const c = NOM.convenios[ci];
  const categorias = [...form.querySelectorAll("tbody tr")].map(tr => {
    const g = n => tr.querySelector(`[name=${n}]`).value;
    return { id: tr.dataset.id, nombre: g("cnombre"), grupoCotizacion: num(g("cgrupo"), 7), salarioBase: num(g("cbase")), plusConvenio: num(g("cplus")), importeAntiguedad: num(g("cant")), precioHora: num(g("chora")) };
  }).filter(k => k.nombre);
  NOM.convenios[ci] = {
    ...c,
    nombre: v.nombre, codigo: v.codigo, jornadaAnual: num(v.jornadaAnual, 1780), nombrePlus: v.nombrePlus, recargoHoraExtra: num(v.recargoHoraExtra),
    pagas: { numero: num(v.pagasNumero), meses: v.pagasMeses.split(/[,\s]+/).map(Number).filter(m => m >= 1 && m <= 12), prorrateo: !!v.pagasProrrateo, incluyePlus: !!v.pagasPlus, incluyeAntiguedad: !!v.pagasAnt },
    antiguedad: { ...c.antiguedad, periodoAnios: num(v.antPeriodo), maxPeriodos: num(v.antMax) },
    conceptos: nomParseConceptos(v.conceptos),
    categorias,
    ejemplo: false,
  };
  nomGuardar();
  renderNominas();
  showToast("Convenio guardado.");
}

// ── Empresa y parámetros ───────────────────────────────────────
function nomRenderParametros() {
  const anio = new Date().getFullYear();
  const p = parametrosAnio(anio, NOM.parametros);
  const em = NOM.empresa;
  return `<div class="nom-card">
    <div class="section-title">Datos de la empresa</div>
    <form id="nom-empresa" class="nom-form" onsubmit="event.preventDefault();nomGuardarEmpresa()">
      <label class="full">Razón social<input name="nombre" value="${esc(em.nombre)}"/></label>
      <label>CIF<input name="cif" value="${esc(em.cif)}"/></label>
      <label>Código cuenta cotización<input name="ccc" value="${esc(em.ccc)}"/></label>
      <label class="full">Domicilio<input name="domicilio" value="${esc(em.domicilio)}"/></label>
      <label>Tipo AT y EP (%) <small>(según CNAE, tarifa DA 4ª Ley 42/2006)</small><input name="atep" type="number" step="0.01" value="${esc(em.atep)}"/></label>
      <button class="btn-export full" type="submit">Guardar empresa</button>
    </form>
  </div>
  <div class="nom-card">
    <div class="section-title">Parámetros legales ${anio}${NOM.parametros[anio] ? " (modificados)" : ""}</div>
    <div class="nom-hint">Base máxima ${eur(p.baseMax)} · Contingencias comunes ${p.tipos.cc.emp} % + ${p.tipos.cc.trab} % · MEI ${p.tipos.mei.emp} % + ${p.tipos.mei.trab} % · Desempleo indefinido ${p.tipos.desempleoIndef.emp} % + ${p.tipos.desempleoIndef.trab} % · FP ${p.tipos.fp.emp} % + ${p.tipos.fp.trab} % · FOGASA ${p.tipos.fogasa.emp} %.<br/>
    Solo modifica estos valores cuando se publique una nueva orden de cotización o cambie la normativa del IRPF.</div>
    <textarea id="nom-params" rows="12" class="nom-code">${esc(JSON.stringify(p, null, 2))}</textarea>
    <div class="nom-acciones">
      <button class="btn-export" onclick="nomGuardarParametros(${anio})">Guardar parámetros ${anio}</button>
      ${NOM.parametros[anio] ? `<button class="btn-export-sec" onclick="delete NOM.parametros[${anio}];nomGuardar();renderNominas()">Restaurar valores por defecto</button>` : ""}
    </div>
  </div>
  <div class="nom-card">
    <div class="section-title">Copia de seguridad</div>
    <div class="nom-hint">Los datos de nóminas se guardan en este navegador. Guárdalos también en tu OneDrive (carpeta "${esc(ONEDRIVE_FOLDER)}") para no perderlos y usarlos desde otro equipo.</div>
    <div class="nom-acciones">
      <button class="btn-export" onclick="nomOneDrive('guardar')">Guardar en OneDrive</button>
      <button class="btn-export-sec" onclick="nomOneDrive('cargar')">Cargar desde OneDrive</button>
      <button class="btn-export-sec" onclick="nomExportar()">Exportar (.json)</button>
      <label class="btn-export-sec nom-file">Importar (.json)<input type="file" accept=".json,application/json" onchange="nomImportar(this)"/></label>
    </div>
  </div>`;
}

function nomGuardarEmpresa() {
  const v = Object.fromEntries(new FormData(document.getElementById("nom-empresa")).entries());
  NOM.empresa = { ...v, atep: num(v.atep, 1) };
  nomGuardar();
  showToast("Datos de empresa guardados.");
}

function nomGuardarParametros(anio) {
  try {
    const p = JSON.parse(document.getElementById("nom-params").value);
    if (!p.baseMax || !p.basesMin || !p.tipos || !p.irpf) throw new Error();
    NOM.parametros[anio] = p;
    nomGuardar();
    renderNominas();
    showToast("Parámetros guardados.");
  } catch { showToast("El texto de parámetros no es válido."); }
}

function nomExportar() {
  const blob = new Blob([JSON.stringify(NOM, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `nominas_tunivers_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

function nomImportar(input) {
  const file = input.files?.[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!Array.isArray(d.convenios) || !Array.isArray(d.empleados)) throw new Error();
      NOM = { ...nomDatosIniciales(), ...d };
      nomGuardar();
      renderNominas();
      showToast("Datos importados.");
    } catch { showToast("El archivo no es una copia de datos de nóminas."); }
  };
  rd.readAsText(file);
  input.value = "";
}

async function nomOneDrive(accion) {
  try {
    const token = await getToken();
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(ONEDRIVE_FOLDER)}/${encodeURIComponent(NOM_ONEDRIVE_FILE)}:/content`;
    if (accion === "guardar") {
      const resp = await fetch(url, { method: "PUT", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(NOM) });
      if (!resp.ok) throw new Error("Error " + resp.status);
      showToast("Datos de nóminas guardados en OneDrive.");
    } else {
      const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
      if (!resp.ok) throw new Error(resp.status === 404 ? "No hay copia en OneDrive" : "Error " + resp.status);
      NOM = { ...nomDatosIniciales(), ...(await resp.json()) };
      nomGuardar();
      renderNominas();
      showToast("Datos de nóminas cargados desde OneDrive.");
    }
  } catch (e) { showToast("OneDrive: " + e.message); }
}
