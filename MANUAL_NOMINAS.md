# Manual de la app de nóminas y obligaciones laborales

**Funivers Formación S.L. (TuniverS)** · App de fichaje con módulo de nóminas · Noviembre de 2026

Este manual explica qué hace la app, cómo usarla cada mes y qué tienes que presentar, dónde y cuándo. Úsalo como guía de consulta.

> **Importante:** la app calcula y prepara, pero **no presenta nada oficial**. Los seguros sociales los confirmas tú en SILTRA o RED Directo, las altas y bajas en Sistema RED, los contratos en Contrat@ y los modelos de IRPF en la Agencia Tributaria. Revisa las primeras nóminas con tu asesoría laboral.

---

## 1. Qué es y cómo se entra

- Es la misma app de fichaje del profesorado (inicio de sesión con Microsoft 365), con una pestaña nueva: **Nóminas**.
- La pestaña Nóminas **solo la ven las cuentas administradoras** (ahora la cuenta `centrofp`). Para añadir a otra persona hay que cambiar la lista `NOMINAS_ADMINS` en el archivo `index.html`.
- Junto al nombre de la pestaña aparece un **número en rojo** cuando hay avisos importantes.
- Dentro de Nóminas hay seis apartados: **Calcular nómina · Obligaciones y avisos · Empleados · Convenios · Certificado de empresa · Empresa y parámetros**.
- **Dónde está el código:** en GitHub, rama `claude/spanish-payroll-program-nlmvpo`. Para usarla en la app publicada hay que llevar esa rama a la rama principal (`main`).

### Dónde se guardan los datos
- Los datos de nóminas (empleados, convenios, nóminas calculadas) se guardan **en el navegador** del ordenador donde trabajas.
- Haz copia de seguridad en **Empresa y parámetros › Copia de seguridad**: "Guardar en OneDrive" (carpeta *FICHAJES OUTLOOK*) o "Exportar (.json)". Con "Cargar desde OneDrive" o "Importar" los recuperas en otro ordenador.
- **Hazlo después de cada mes de nóminas.** Si se borran los datos del navegador sin copia, se pierden.

---

## 2. Primera puesta en marcha (una sola vez)

1. **Empresa y parámetros › Datos de la empresa.** Ya vienen rellenos: razón social, CIF B52548690, régimen 0111, CCC 33 1183403 86, domicilio de Gijón y accidentes de trabajo al 1,50 %. Completa la **clave CNAE** (sale en el certificado de empresa) y confirma la **razón social** (en los documentos figura "Funivers Formación S.L.").
2. **Convenios.** Están cargados los dos convenios (ver apartado 4). Revisa:
   - el **mes de la 3.ª paga** del convenio de reglada (puesto septiembre; solo importa si alguna vez dejas de prorratear),
   - que el **mes sin plus de productividad** sea agosto.
3. **Empleados › + Añadir empleado.** Para cada persona rellena:
   - Nombre, **NIF**, **nº de afiliación**, email de Microsoft 365 (para leer su fichaje).
   - **Convenio** y **categoría**. El **grupo de cotización** viene sugerido por la categoría: cámbialo si en su alta en la Seguridad Social figura otro.
   - **Fecha de alta**, **fecha de fin de contrato** (temporales) y **fecha de baja** (si se va).
   - **Tramos de CPP** reconocidos (complemento de perfeccionamiento profesional).
   - **Clave de contrato** (100, 200, 402, 502…): las que empiezan por 4 o 5 son temporales y cotizan más por desempleo.
   - Nivel formativo y ocupación (CNO).
   - **% de jornada**, o "por horas trabajadas" si cobra según las horas fichadas.
   - **Datos del modelo 145** (para el IRPF): situación familiar, año de nacimiento, hijos, ascendientes, discapacidad, movilidad geográfica, pensión compensatoria, anualidades por alimentos y préstamo de vivienda. Pídele a cada persona el modelo 145 firmado.

---

## 3. Las nóminas de cada mes

1. Entra en **Calcular nómina**, elige la persona, el **mes** y el **año**.
2. **Horas:** la app trae las horas fichadas (del navegador, con "Leer fichaje del empleado en OneDrive" o importando su archivo de fichaje). Si superan la jornada del convenio, te avisa de posibles horas extra. Si la persona cobra por horas, se usan como horas trabajadas.
3. Rellena lo que haya ese mes: días cotizados (30 si es el mes completo), horas extra, incentivos, dietas exentas, anticipos.
4. Pulsa **Calcular nómina**. Verás devengos, deducciones (Seguridad Social e IRPF), aportación de la empresa, **líquido a percibir** y **coste empresa**.
5. Si aparece un **aviso amarillo** (por ejemplo, "no hay tablas salariales de 2027"), léelo: la nómina se ha calculado con datos de otro año.
6. **Ver / imprimir recibo de salarios** genera el recibo con el modelo oficial, para guardar en PDF o imprimir y firmar.
7. Cada nómina calculada queda guardada y alimenta los resúmenes de SILTRA, 111, 190 y el certificado de empresa. **Calcula las nóminas de todos cada mes.**

**Pagas extra:** en los dos convenios están **prorrateadas**: cada mes aparece la línea "Prorrata pagas extraordinarias" y no hay meses con paga aparte.

---

## 4. Los dos convenios

### X Convenio de Enseñanza y formación no reglada
BOE-A-2025-14198 · vigente hasta el **31/12/2027** · tablas de 2025, 2026 y 2027.
- Salario anual en 14 pagas (aquí prorrateadas).
- Jornada anual: **1.446 h** docentes; **1.715 h** el resto.
- **Complemento de dedicación** (12 pagas) según jornada: 126,17 € (50 % o más), 63,10 € (25-50 %) o 38,21 € (25 % o menos) en 2026.
- **CPP:** 496,64 €/año por cada tramo de 3 años con formación acreditada; tope del 30-50 % del salario base según grupo.
- Puestos de Director/a, Subdirector/a y Coordinador/a académico/a: su plus anual se añade como concepto en la ficha del empleado.
- Ejemplo 2026: profesor/a titular a jornada completa con 1 tramo → **1.705,80 € brutos/mes**.

### XII Convenio de enseñanza privada reglada sin concierto (anexo III)
BOE-A-2024-15501 · **vence el 31/12/2026** · tablas de 2026 (grado medio, grado superior y personal no docente).
- 15 pagas (aquí prorrateadas).
- **Plus de productividad docente** en 11 meses (todos menos agosto).
- **Complemento de cargo** para dirección, subdirección, jefatura de estudios y de departamento.
- **Complemento de dedicación** 124,03 €: completo con 60 % de jornada o más; proporcional por debajo.
- **CPP** por quinquenios (tramos de 5 años) con tope del 20-40 % del salario base.
- Jornada: 1.376 h docentes (1.586 con cargo); el pago por horas de docentes se calcula sobre 1.089 horas lectivas al año.
- Ejemplo 2026: profesor/a titular de grado superior a jornada completa con 1 quinquenio → **2.404,38 € brutos/mes** (2.325,98 € en agosto).

---

## 5. Obligaciones y avisos

Apartado **Nóminas › Obligaciones y avisos**. Tiene siete secciones:

| Sección | Para qué sirve |
|---|---|
| **Avisos** | Lo pendiente: plazos vencidos o próximos (en rojo si faltan 3 días o menos), novedades del BOE, convenios sin tablas o a punto de vencer, nóminas sin calcular y fichas incompletas. Botón "Marcar como hecho". |
| **Calendario** | Todos los plazos de los próximos 12 meses, con dónde se presenta cada cosa y una casilla "hecho". |
| **Resumen SILTRA** | Bases y cuotas del mes por persona y por concepto, para comprobar el borrador de la Seguridad Social. Se descarga en Excel. |
| **Modelo 111** | Retenciones del trimestre: nº de perceptores [01], percepciones [02] y retenciones [03]. |
| **Modelo 190** | Resumen anual por persona y **certificado de retenciones** para imprimir. Se descarga en Excel. |
| **Convenios y normativa** | Estado de cada convenio (hasta qué año hay tablas, cuándo vence), novedades del BOE y enlaces de búsqueda. |
| **Guía** | Qué se presenta en cada sitio, paso a paso. |

**Avisos en el móvil:** el botón **"Añadir los plazos a mi calendario (.ics)"** descarga todos los plazos del próximo año. Ábrelo en el móvil o en Outlook y te avisará **3 días antes y la víspera**. Vuelve a descargarlo cuando des de alta o de baja a alguien.

---

## 6. Calendario de tareas

### Cada mes (con las nóminas del mes anterior)

| Cuándo | Qué hacer | Dónde |
|---|---|---|
| Hasta el **día 5** | Pagar las nóminas y entregar los recibos | Empresa |
| Hacia el **día 10** | Comunicar los conceptos retributivos abonados (CRA) y **pedir el borrador** de cotización. Compararlo con el Resumen SILTRA de la app. | SILTRA / RED Directo |
| Hacia el **día 20** | **Confirmar** la liquidación si pagas por **domiciliación** (el cierre suele ser el 22, el 20 en algunos meses: mira el calendario del Sistema de Liquidación Directa). | SILTRA |
| **Penúltimo día** del mes | Último día para confirmar. Si no se domicilia, pagar con el recibo antes de fin de mes. Fuera de plazo hay recargo. | SILTRA |

**Si el borrador de SILTRA no cuadra** con la app, casi siempre es un dato de afiliación: días, grupo de cotización, clave de contrato o coeficiente de parcialidad. Corrígelo en Sistema RED y vuelve a pedir el borrador.

### Cada trimestre
| Cuándo | Qué | Dónde |
|---|---|---|
| **1-20 de abril, julio, octubre y enero** (hasta el 15 si lo domicilias) | **Modelo 111**: retenciones de IRPF del trimestre | Agencia Tributaria |

### Cada año
| Cuándo | Qué | Dónde |
|---|---|---|
| Principios de **enero** | Revisar la orden de cotización, el SMI, el IRPF, la tarifa de accidentes y las tablas de los convenios. Pedir el **modelo 145** actualizado. Preparar y exponer el **calendario laboral**. | Empresa / app |
| **1-31 de enero** | **Modelo 190**: resumen anual de retenciones | Agencia Tributaria |
| Antes del **31 de marzo** | Entregar el **certificado de retenciones** a cada persona | Empresa |

Si un plazo de Hacienda acaba en fin de semana o festivo, pasa al siguiente día hábil. La app cuenta los festivos nacionales: **revisa los de Asturias y Gijón**.

### Cuando entra, cambia o se va alguien
| Situación | Qué hacer | Plazo | Dónde |
|---|---|---|---|
| **Alta** | Dar de alta en la Seguridad Social | **Antes** de que empiece (hasta 60 días antes) | Sistema RED |
| **Contrato nuevo o prórroga** | Comunicar el contrato | 10 días desde la firma | Contrat@ (SEPE) |
| **Cambio** de jornada, grupo o contrato | Variación de datos | 3 días naturales | Sistema RED |
| **Fin de contrato temporal** | Decidir prórroga o extinción; preavisar si dura más de un año | 15 días antes | Empresa |
| **Baja** | Baja en la Seguridad Social y finiquito | 3 días naturales | Sistema RED |
| **Baja** | Certificado de empresa | El mismo día (o al día siguiente de que lo pida) | Certific@2 (SEPE) |
| **Baja médica** | Enviar los datos adicionales de la incapacidad temporal | 3 días hábiles desde que llega el parte | Sistema RED |
| **Fijos discontinuos** | Alta en cada llamamiento y baja al acabar cada periodo | Igual que alta y baja | Sistema RED |

**Para que la app te avise de estos plazos**, rellena en la ficha la fecha de alta, la fecha de fin de contrato y la fecha de baja.

---

## 7. Certificado de empresa (cuando alguien se va)

1. **Nóminas › Certificado de empresa**: elige la persona, la **fecha de baja** y la **causa** (fin de contrato, baja voluntaria, despido…).
2. Pulsa **Generar certificado**. Sale un borrador con los datos de la empresa y de la persona y las **bases de cotización de los últimos 180 días**, sacadas de las nóminas calculadas en la app.
3. Si falta algún mes sin calcular, el borrador lo marca en rojo: complétalo antes de presentarlo.
4. El envío oficial se hace en **Certific@2** del SEPE.

---

## 8. Cómo te avisa si cambia un convenio o la normativa

1. **En la app, cada día que abres Nóminas:** revisa el BOE desde la última vez. Si se publica una revisión salarial o un convenio nuevo de enseñanza reglada o no reglada, la orden de cotización, el SMI, cambios en el IRPF o en la tarifa de accidentes, te sale un **aviso en rojo** con el enlace. Si el navegador no puede conectar con el BOE, te lo dice y te da enlaces para buscarlo a mano.
2. **En cada nómina:** si el año no tiene tablas del convenio, si el convenio ha vencido o si faltan los parámetros de cotización del año, la nómina lleva un aviso amarillo.
3. **90 días antes y el día del vencimiento** de cada convenio sale un aviso en el calendario.
4. **Tarea semanal "Vigilancia BOE nóminas":** **cada lunes a las 8:37** busca novedades de la última semana y te manda una **notificación al móvil**. Si no hay nada, solo dice "Sin novedades". Se puede cambiar o parar desde tus tareas programadas en claude.ai.

**La app no cambia los importes sola.** Cuando haya una actualización, pásame el BOE y cargo las tablas o los parámetros nuevos. Si la subida es retroactiva, habrá **atrasos** que pagar y regularizar en las nóminas y en SILTRA.

**Lo más urgente ahora:** el convenio de enseñanza **reglada vence el 31/12/2026** y no tiene tablas de 2027. Desde enero la app usará las de 2026 y avisará en cada nómina hasta que se publique la revisión.

---

## 9. Qué no hace la app

- No presenta nada en RED, SILTRA, Contrat@, Certific@2 ni Hacienda: lo haces tú con tu autorización RED y tu certificado digital.
- No genera los ficheros para subir a SILTRA: te da el resumen para comprobar el borrador que calcula la Seguridad Social.
- No calcula **bajas médicas** (incapacidad temporal), **atrasos** ni **finiquitos** automáticamente.
- El **modelo 111** solo incluye las nóminas de la app: si pagas a profesionales o alquileres con retención, súmalos tú.
- No tiene en cuenta festivos autonómicos ni locales.

---

## 10. Pendiente de revisar

1. **Grupo de cotización** de cada persona: compruébalo con su alta en la Seguridad Social.
2. **Clave CNAE** y **razón social** de la empresa.
3. **Qué convenio aplica a cada persona** (en otra conversación se concluyó que el de reglada aplica a todo el personal).
4. **Anexo IV** del convenio de reglada y niveles de Infantil, Primaria, ESO o Bachillerato: no están cargados.
5. **Comprobar al céntimo** con nóminas reales (titular, adjunta, administración y fija discontinua). El caso de 2.447,16 €/mes no sale con las tablas de profesor titular de grado superior: hace falta la nómina para ver la diferencia.
6. **Tablas de 2027** del convenio de reglada, en cuanto se publiquen.

---

## Glosario

- **Sistema RED:** servicio de la Seguridad Social para altas, bajas, variaciones y comunicaciones de empresa.
- **SILTRA / Sistema de Liquidación Directa (SLD):** donde se calculan, confirman y pagan los seguros sociales de cada mes.
- **CRA:** comunicación de los conceptos retributivos abonados (los conceptos que has pagado en la nómina).
- **Contrat@:** aplicación del SEPE para comunicar contratos.
- **Certific@2:** aplicación del SEPE para enviar el certificado de empresa.
- **Modelo 111:** declaración trimestral de retenciones de IRPF.
- **Modelo 190:** resumen anual de retenciones de IRPF.
- **Modelo 145:** datos personales y familiares que la persona trabajadora comunica a la empresa para calcular su IRPF.
- **Base de cotización:** importe sobre el que se calculan las cuotas a la Seguridad Social.
- **CPP:** complemento de desarrollo y perfeccionamiento profesional (por tramos de formación).
- **Prorrata de pagas extra:** parte de las pagas extraordinarias que se cobra repartida cada mes.
- **MEI:** mecanismo de equidad intergeneracional, una cotización adicional (0,75 % empresa + 0,15 % trabajador).
