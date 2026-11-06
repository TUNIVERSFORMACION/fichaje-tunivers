# Especificación: app de nóminas (España 2026) integrada en una app de fichaje

Quiero que me ayudes a construir una aplicación web de nóminas para un centro de formación en España. A continuación tienes TODAS las reglas de negocio, importes y funcionalidades. Respeta los importes y fórmulas exactamente.

---

## 1. Contexto

- Empresa: **Funivers Formación S.L.** (marca Tunivers Formación). CIF B52548690. Régimen SS 0111. CCC 33 1183403 86. C/ Lope de Vega 4, bajo, 33204 Gijón (Asturias). Actividad: Educación (CNAE 85).
- Ya existe una app de fichaje (HTML + JavaScript, sin servidor) con login de Microsoft 365 (MSAL), que lee el calendario de Outlook del profesorado y guarda los fichajes en localStorage y en OneDrive (`/FICHAJES OUTLOOK/[Nombre]_[AAAA-MM].json`, con `dias[].eventos[]{inicio, fin, cancelado}`).
- La app de nóminas debe ser una pestaña "Nóminas" visible solo para las cuentas administradoras.
- Todo funciona en el navegador (localStorage), con copia de seguridad en OneDrive y exportar/importar JSON.
- Se aplican **dos convenios colectivos** y las **pagas extraordinarias se prorratean** en las 12 mensualidades.

---

## 2. Funcionalidades

1. **Empleados** (alta/edición/baja), con:
   - Nombre, NIF, nº afiliación SS, email de Microsoft 365 (para leer su fichaje).
   - Convenio y categoría; grupo de cotización SS (por defecto el de la categoría, editable).
   - Fecha de alta, fecha de antigüedad, nº de tramos de CPP reconocidos.
   - Clave de contrato (tabla T-19, ver §8): las que empiezan por 4 o 5 son temporales.
   - Duración del contrato, nivel formativo (§8), ocupación CNO-11 (§8).
   - Modalidad: salario mensual con % de jornada, o pago por horas trabajadas.
   - Complemento personal (€/mes) y otros conceptos fijos (nombre; importe; salarial/no salarial).
   - IRPF fijo manual (opcional) y datos del **modelo 145** (§5).
2. **Convenios** editables: tablas por categoría y parámetros (§4).
3. **Calcular nómina** de un empleado para un mes/año:
   - Entradas: días cotizados (0–30), horas fichadas, horas trabajadas (pago por horas), horas extra, horas extra por fuerza mayor, precio hora extra (vacío = automático), incentivos, dietas exentas, anticipos, retribución anual prevista (vacío = automático).
   - Horas fichadas: del propio navegador si es el usuario actual, leyendo el JSON del OneDrive del empleado (Graph `/users/{email}/drive/root:/FICHAJES OUTLOOK/{archivo}:/content`, permiso Files.Read.All) o importando el archivo JSON. Ignorar eventos cancelados. Avisar si superan la jornada mensual media del convenio (posibles horas extra).
   - Mostrar devengos, deducciones, aportación empresa, líquido, coste empresa y el detalle del cálculo de bases e IRPF. Guardar cada nómina en un histórico por empleado y mes.
4. **Recibo de salarios** imprimible con el modelo oficial (Orden ESS/2098/2014): cabecera empresa/trabajador, periodo, I. Devengos (salariales / no salariales), A. Total devengado, II. Deducciones (cotizaciones trabajador, IRPF, anticipos…), B. Total a deducir, líquido (A − B), y el bloque de bases de cotización y aportación empresarial.
5. **Certificado de empresa** (SEPE, mod. PR-AIN/01-277) en borrador imprimible: datos empresa y trabajador, causa de baja (§8), fechas, y tabla de bases de los **últimos 180 días** a partir del histórico (días naturales por mes desde la fecha de baja hacia atrás, limitados por la fecha de alta; el mes más antiguo se recorta y su base se prorratea para sumar 180 días; base de desempleo = base sin horas extra; la columna de contingencias comunes solo se rellena en causas 17, 18 y 19; fila de vacaciones no disfrutadas; avisar si falta algún mes).
6. **Empresa y parámetros**: datos de empresa, tipo AT/EP y parámetros legales del año editables (JSON) con opción de restaurar los valores por defecto.

---

## 3. Parámetros legales 2026 (Orden PJC/297/2026, BOE 31/3/2026)

- **Base máxima**: 5.101,20 €/mes.
- **Bases mínimas** (€/mes): grupo 1: 1.989,30 · grupo 2: 1.649,70 · grupo 3: 1.435,20 · grupos 4 a 7: 1.424,40 · grupos 8 a 11: 47,48 €/día (1.424,40 €/mes).
- **Tipos** (empresa + trabajador):
  - Contingencias comunes: 23,60 % + 4,70 %
  - MEI: 0,75 % + 0,15 % (sobre base de contingencias comunes)
  - Desempleo indefinido: 5,50 % + 1,55 % · temporal: 6,70 % + 1,60 %
  - Formación profesional: 0,60 % + 0,10 %
  - FOGASA: 0,20 % (empresa)
  - Horas extra por fuerza mayor: 12,00 % + 2,00 % · resto de horas extra: 23,60 % + 4,70 %
  - **AT y EP**: CNAE 85 Educación = IT 0,80 % + IMS 0,70 % = **1,50 %** (empresa). Tarifa vigente desde 1/1/2026 (BOE 24/12/2025).
- **Cotización de solidaridad** sobre lo que exceda de la base máxima:
  - de 5.101,21 a 5.611,32 €: 1,15 % (empresa 0,96 · trabajador 0,19)
  - de 5.611,33 a 7.651,80 €: 1,25 % (empresa 1,04 · trabajador 0,21)
  - más de 7.651,80 €: 1,46 % (empresa 1,22 · trabajador 0,24)
- SMI 2026: 1.221 €/mes en 14 pagas (17.094 €/año).

### Cálculo de bases (mensual)
- Remuneración mensual cotizable = devengos que cotizan, excepto horas extra y pagas extra no prorrateadas.
- Si las pagas NO están prorrateadas, sumar la prorrata: importe de la paga × nº pagas / 12 × días/30.
- **Base contingencias comunes (BCC)** = remuneración, limitada entre base mínima del grupo × % jornada × días/30 y base máxima × días/30. (En pago por horas, el % de jornada = horas / jornada mensual de referencia, máx. 1).
- **Base AT/EP y desempleo** = BCC + horas extra, con los mismos topes.
- Contingencias comunes y MEI sobre BCC; desempleo, FP, FOGASA y AT/EP sobre base AT; horas extra con su tipo adicional sobre su importe.

---

## 4. Convenios

### Reglas generales del motor
- **Salario base mensual**: si la categoría tiene salario anual → anual / (12 + nº pagas); si no, el salario mensual de tabla.
- Proporcional a % de jornada y a días/30.
- **Pago por horas**: si la categoría tiene €/hora fijo → horas × precio + prorrata de pagas; si no → % de jornada = horas / (jornada de referencia anual / 12), donde la referencia es la jornada lectiva si el convenio la fija, y se aplica todo el cálculo del convenio. Las pagas siempre prorrateadas.
- **CPP / antigüedad**: nº de tramos (manual, o automático por fecha de antigüedad y periodo en años) × importe por tramo (el de la categoría, o importe anual / (12 + nº pagas)), con un tope del X % del salario base según el grupo profesional.
- **Complemento por % de jornada**: tramos (% mínimo → importe), 12 o 15 pagas según convenio, opcionalmente proporcional por debajo del tramo mínimo.
- **Pagas extra prorrateadas**: prorrata mensual = importe de una paga × nº pagas / 12 × días/30.
- **Precio hora extra** = retribución anual a jornada completa / jornada anual × (1 + recargo %).
- Cada convenio guarda tablas por año (aplicar automáticamente las del año de la nómina).

### Convenio A: X Convenio colectivo de Enseñanza y formación no reglada
Código 99008825011994 · BOE-A-2025-14198 (9/7/2025) · vigente hasta 31/12/2027.
- **Salario base anual** (anexo 1) en **14 pagas** (2 extra), aquí **prorrateadas**.
- **Jornada anual**: grupo I (docentes) 1.446 h; grupos II, III y IV 1.715 h.
- **Complemento de dedicación** (12 pagas, no entra en las extras), según % de jornada anual:
  | | 2025 | 2026 | 2027 |
  |---|---|---|---|
  | ≥ 50 % | 121,91 | 126,17 | 130,59 |
  | > 25 % y < 50 % | 60,96 | 63,10 | 65,31 |
  | ≤ 25 % | 36,91 | 38,21 | 39,54 |
- **CPP** (complemento de desarrollo y perfeccionamiento profesional): por cada **3 años** con la formación acreditada (manual). Importe anual por tramo: 479,84 (2025) · **496,64 (2026)** · 514,02 (2027), en 14 pagas (entra en las extras). Tope: 30 % del salario base (grupos I y II), 40 % (grupo III), 50 % (grupo IV).
- **Puestos funcionales** (anual, como concepto del empleado): Director/a 3.031,59 €; Subdirector/a 2.842,33 €; Coordinador/a académico/a 2.653,06 €.
- **Tablas salariales anuales** (2025 / 2026 / 2027) · grupo prof. · grupo de cotización orientativo:
  | Categoría | GP | GC | 2025 | 2026 | 2027 |
  |---|---|---|---|---|---|
  | Profesor/a Titular | I | 2 | 17.580,05 | 18.459,05 | 19.382,01 |
  | Profesor/a de Taller | I | 2 | 17.580,05 | 18.459,05 | 19.382,01 |
  | Profesor/a Auxiliar o Adjunto/a | I | 2 | 15.423,76 | 15.963,59 | 16.522,31 |
  | Profesor/a Auxiliar «on-line» | I | 2 | 15.423,76 | 15.963,59 | 16.522,31 |
  | Instructor/a o Experto/a (a extinguir) | I | 2 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Educador/a social | I | 2 | 17.580,05 | 18.459,05 | 19.382,01 |
  | Director/a de Administración | II | 3 | 19.247,88 | 19.921,55 | 20.618,81 |
  | Técnico/a de Administración | II | 5 | 15.711,95 | 16.261,86 | 16.831,03 |
  | Oficial administrativo/a 1.ª (a extinguir) | II | 5 | 15.711,95 | 16.261,86 | 16.831,03 |
  | Oficial administrativo/a 2.ª (a extinguir) | II | 5 | 15.243,54 | 15.777,06 | 16.329,26 |
  | Orientador/a Profesional | II | 2 | 15.243,54 | 15.777,06 | 16.329,26 |
  | Prospector/a de Empleo | II | 5 | 15.243,54 | 15.777,06 | 16.329,26 |
  | Auxiliar Administrativo/a | II | 7 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Redactor/a-Corrector/a (a extinguir) | II | 5 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Agente comercial-Televendedor/a | II | 5 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Encargado/a de Almacén | III | 6 | 15.717,91 | 16.268,04 | 16.837,42 |
  | Empleado/a de Servicios Generales | III | 6 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Auxiliar no docente | III | 7 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Monitor/a-Animador/a | III | 7 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Titulado/a no docente | IV | 2 | 17.580,05 | 18.459,05 | 19.382,01 |
  | Social Media Manager | IV | 5 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Diseñador/a de contenidos | IV | 5 | 15.113,14 | 15.642,10 | 16.189,57 |
  | Dinamizador/a de cursos on-line | IV | 5 | 15.113,14 | 15.642,10 | 16.189,57 |

### Convenio B: XII Convenio nacional de enseñanza privada reglada sin concierto (anexo III)
Código 99001925011986 · BOE-A-2024-15501 (26/7/2024) · tablas hasta 2026.
- **15 pagas**: 12 + 3 extraordinarias (equivalen a salario base + CPP + complemento de cargo; la dedicación también se cobra en 15 pagas). Aquí **prorrateadas**.
- **Plus de productividad docente**: importe mensual en **11 mensualidades** (todas menos agosto); no entra en las extras.
- **Complemento temporal de cargo** (Director, Subdirector, Jefe de Estudios, Jefe de Departamento): 15 pagas.
- **Complemento de dedicación**: 124,03 €/mes en 15 pagas con jornada ≥ 60 %; por debajo, proporcional a la jornada.
- **CPP**: por cada **5 años** con formación acreditada (manual), importe mensual de la tabla × nº de quinquenios, en 15 pagas. Tope: 20 % del salario base (grupo I), 30 % (grupo II), 40 % (grupos III y IV).
- **Jornada anual**: docentes 1.376 h (1.089 lectivas + 237 no lectivas + 50 de formación); docentes con cargo 1.586 h; titulados de servicios complementarios 1.396 h; resto 1.724 h. El pago por horas de docentes se calcula sobre las **1.089 horas lectivas** anuales.
- **Tablas 2026 (importes mensuales)**: base (15) · productividad (11) · cargo (15) · CPP por quinquenio (15) · grupo de cotización orientativo:
  | Categoría | Base | Product. | Cargo | CPP | GC |
  |---|---|---|---|---|---|
  | CFGS · Director/a | 1.669,47 | 78,40 | 421,11 | 100,84 | 2 |
  | CFGS · Subdirector/a | 1.669,47 | 78,40 | 369,39 | 96,79 | 2 |
  | CFGS · Jefe/a de Estudios | 1.669,48 | 78,40 | 356,74 | 95,66 | 2 |
  | CFGS · Jefe/a de Departamento | 1.669,48 | 78,40 | 300,72 | 91,23 | 2 |
  | CFGS · Profesor/a titular / Titular de taller o laboratorio | 1.669,47 | 78,40 | – | 67,28 | 2 |
  | CFGS · Profesor/a adjunto/a, ayudante o auxiliar | 1.550,08 | 72,95 | – | 55,40 | 2 |
  | CFGS · Instructor/a | 1.425,24 | 67,23 | – | 54,12 | 2 |
  | CFGM · Director/a | 1.608,38 | 74,54 | 349,69 | 81,37 | 2 |
  | CFGM · Subdirector/a | 1.608,38 | 72,89 | 324,30 | 80,57 | 2 |
  | CFGM · Jefe/a de Estudios | 1.608,38 | 72,89 | 299,27 | 77,49 | 2 |
  | CFGM · Jefe/a de Departamento | 1.608,37 | 72,89 | 274,14 | 75,43 | 2 |
  | CFGM · Profesor/a titular / Titular de taller o laboratorio | 1.608,38 | 72,89 | – | 53,55 | 2 |
  | CFGM · Profesor/a adjunto/a, ayudante o auxiliar | 1.330,18 | 55,76 | – | 47,99 | 2 |
  | CFGM · Instructor/a | 1.179,55 | 46,47 | – | 43,36 | 2 |
  | Personal especializado · Nivel I (grupo II-A) | 1.628,28 | – | – | 69,87 | 2 |
  | Personal especializado · Nivel II (grupo II-A) | 1.546,09 | – | – | 55,75 | 2 |
  | Monitor/a de actividades extracurriculares (II-B) | 988,16 | – | – | 45,42 | 7 |
  | Vigilante educativo (II-B) | 988,16 | – | – | 45,42 | 7 |
  | Jefe/a de Administración o Secretaría (III) | 1.163,96 | – | – | 56,56 | 3 |
  | Jefe/a de Negociado (III) | 1.062,11 | – | – | 52,08 | 5 |
  | Oficial administrativo/a (III) | 988,16 | – | – | 47,69 | 5 |
  | Auxiliar administrativo/a o telefonista (III) | 988,16 | – | – | 47,69 | 7 |
  | Conserje / Gobernante (IV) | 988,16 | – | – | 47,69 | 6 |
  | Jefe/a de Cocina / Oficial (IV) | 988,16 | – | – | 47,69 | 8 |
  | Cocinero/a (IV) | 988,16 | – | – | 47,69 | 8 |
  | Celador/a / Portero/a y ordenanza (IV) | 988,16 | – | – | 47,69 | 6 |
  | Empleado/a de servicios generales (IV) | 988,16 | – | – | 47,69 | 10 |

  Comprobación: Profesor titular CFGS = 1.669,47×15 + 78,40×11 + 124,03×15 = 27.764,90 €/año (BOE: 27.764,97).

---

## 5. Retención de IRPF (algoritmo AEAT, arts. 80-86 RIRPF)

1. **R** = retribución íntegra anual prevista (fijos × 12 + plus × meses de cobro + pagas extra; o la indicada a mano).
2. **Cotizaciones anuales** = base mensual estimada (R/12 limitada a mínimo/máximo) × 12 × (4,70 + 0,15 + desempleo + 0,10) %.
3. **Rendimiento neto** = R − cotizaciones.
4. **Reducción art. 20 LIRPF**: RN ≤ 14.852 → 7.302; hasta 17.673,52 → 7.302 − 1,75 × (RN − 14.852); hasta 19.747,50 → 2.364,34 − 1,14 × (RN − 17.673,52); más → 0.
5. **Gastos**: 2.000 € (+2.000 por movilidad geográfica; +3.500 discapacidad 33-65 %; +7.750 si ≥ 65 % o ayuda de terceros).
6. **Base** = RN − reducción − gastos − pensión compensatoria al cónyuge (mín. 0).
7. **Mínimo personal y familiar**: personal 5.550 (+1.150 si > 65 años; +1.400 más si > 75). Descendientes < 25 que conviven: 2.400 / 2.700 / 4.000 / 4.500 (1.º/2.º/3.º/4.º y ss.) + 2.800 por cada menor de 3 años; mitad si se comparten con el otro progenitor. Ascendientes que conviven: 1.150 si > 65; 2.550 si > 75. Discapacidad (contribuyente, descendientes o ascendientes): 3.000 (33-65 %), 9.000 (≥ 65 %) + 3.000 de asistencia si ≥ 65 % o ayuda de terceros.
8. **Escala**: 0–12.450: 19 % · –20.200: 24 % · –35.200: 30 % · –60.000: 37 % · –300.000: 45 % · más: 47 %.
9. **Cuota** = escala(base) − escala(mínimo). Con **anualidades por alimentos a hijos** (< base): escala(base − anualidades) + escala(anualidades) − escala(mínimo + 1.980), sin mínimo por descendientes.
10. **Límite excluido de retención** (si R ≤ límite, cuota 0) según situación (1 monoparental, 2 cónyuge con rentas < 1.500 €, 3 resto) y nº de hijos [0 / 1 / 2+]: sit. 1: – / 17.644 / 18.694 · sit. 2: 17.197 / 18.130 / 19.262 · sit. 3: 15.876 / 16.342 / 16.867. Además la cuota no puede superar el 43 % de (R − límite).
11. **Tipo** = cuota / R × 100 (2 decimales). −2 puntos si tiene préstamo de vivienda habitual con deducción y R < 33.007,20 (mín. 0). Mínimo 2 % en contratos temporales (si R supera el límite).
12. IRPF del mes = base sujeta (devengos que tributan) × tipo. Permitir tipo manual.

**Datos del modelo 145 en la ficha del empleado**: situación familiar, año de nacimiento, discapacidad (y ayuda de terceros), movilidad geográfica, hijos (nº, menores de 3, con discapacidad 33-65 % y ≥ 65 %, computados por entero o mitad), ascendientes (65-75, > 75, con discapacidad), pensión compensatoria, anualidades por alimentos, préstamo de vivienda.

---

## 6. Ejemplos de comprobación (2026, pagas prorrateadas, situación 3 sin hijos)

- **No reglada, Profesor/a Titular, 100 %, 1 tramo CPP**: salario base 1.318,50 + CPP 35,47 + dedicación 126,17 + prorrata pagas 225,66 = **1.705,80 €** brutos/mes · BCC 1.705,80 · R anual 20.469,73 · IRPF 9,65 %.
- **Reglada, CFGS Profesor/a titular, 100 %, 1 quinquenio**: base 1.669,47 + productividad 78,40 + CPP 67,28 + dedicación 124,03 + prorrata 465,20 = **2.404,38 €** (agosto 2.325,98 €, sin productividad) · R anual 28.774,10 · IRPF 15,92 %.
- **Reglada, CFGS titular, pago por horas, 45 h lectivas/mes**: jornada = 45 / 90,75 → base 827,84 · productividad 38,88 · dedicación 61,50 (proporcional, < 60 %) · prorrata 222,33.

---

## 7. Interfaz

- Pestañas de primer nivel: Fichaje | Nóminas (solo admins).
- Subpestañas de Nóminas: Calcular nómina · Empleados · Convenios · Certificado de empresa · Empresa y parámetros.
- Editor de convenios: datos generales (nombre, código, año de tablas, jornada, nº y meses de pagas, prorrateo, qué entra en la paga, CPP/antigüedad, plus y sus meses, complemento de cargo, tramos de dedicación) y tabla de categorías editable (nombre, grupo cotización, salario anual, salario mensual, plus, cargo, € por tramo CPP, tope %, jornada anual, horas lectivas/año, €/hora).
- Diseño limpio, responsive (móvil), en español, importes con formato es-ES.

---

## 8. Tablas de códigos

- **Claves de contrato (T-19)**: 100 indefinido t. completo ordinario · 109 · 130 · 150 · 189 · 200 indefinido t. parcial ordinario · 209 · 230 · 250 · 289 · 300 fijo discontinuo · 389 · 402 duración determinada t. completo circunstancias de la producción · 410 sustitución · 420 prácticas · 421 formación en alternancia · 430 · 441 relevo · 500 temporal t. parcial ordinario · 502 circunstancias de la producción t. parcial · 510 sustitución t. parcial · 520 prácticas t. parcial · 521 · 530 · 540 jubilación parcial · 541 relevo t. parcial.
- **Niveles formativos (Contrat@)**: 80 sin estudios · 11/12 primarios · 21/22 1.ª etapa secundaria sin título · 23/31 graduado escolar · 33/34 grado medio · 32/41/52 bachillerato · 51/53 grado superior FP · 54/55/56 diplomados, licenciados · 59 grado · 60 máster · 61 doctorado.
- **Ocupaciones CNO-11 habituales**: 23291010 Formadores de formación no reglada · 23291029 Formadores ocupacionales · 23291038 Formadores-tutores de empresa · 23291047 Orientadores escolares · 23291056 Tutores de formación a distancia · 23251018 Instructores en TIC fuera del sistema educativo · 23221019 Profesores de idiomas · 23211070 Técnicos/coordinadores de formación · 23211016 Consultores/asesores de formación · 23211034 Formadores de formadores · 23211052 Pedagogos · 23111026 Profesores de educación de adultos.
- **Causas de baja (certificado de empresa)**: 01 despido · 02 despido objetivo (económicas…) · 07 / 09 cese en periodo de prueba (empresa / trabajador) · 11 fin de contrato temporal · 12 fin de contrato a instancia del trabajador · 15 fin de actividad fijos discontinuos · 16 ERE · 17 suspensión/ERTE · 18 reducción de jornada/ERTE · 21 baja voluntaria · 26 excedencia · 30 despido objetivo por ineptitud · 31 modificación sustancial · 33 resolución por causa justa.

---

## 9. Pendiente / a revisar

- Grupos de cotización por categoría: orientativos, ajustar con el alta de cada trabajador.
- Mes sin productividad en el convenio B: se supone agosto.
- Convenio B: no incluye el anexo IV (centros del antiguo anexo IV, 14 pagas) ni niveles de Infantil, Primaria, ESO o Bachillerato.
- No calcula incapacidad temporal, atrasos ni finiquitos.
- Revisar las primeras nóminas con una gestoría.
