# WEB Information Architecture V2 — flujo científico y navegación

**Proyecto:** CEMiTool Cabernet Sauvignon × Pinot noir Explorer  
**Fecha:** 2026-09-22  
**Estado:** PROPUESTA PARA APROBACIÓN — no implementar hasta revisar este flujo  
**Objetivo:** reducir destinos, eliminar navegación duplicada y asegurar que cada pantalla contenga la información científica necesaria para entenderla sin saltos arbitrarios.

---

# 1. Problema que resolvemos

La web actual mezcla tres lógicas:

1. navegación por features técnicas (módulos, función, validación, genes);
2. navegación por entidades científicas (M5, M10, genes);
3. navegación por auditoría (métodos, evidencia, T-008).

Eso produce:
- demasiadas barras y pestañas;
- información del mismo módulo repartida en páginas lejanas;
- destinos globales que duplican información ya vista dentro de módulos;
- dificultad para saber si una vista es resumen, comparación o detalle;
- una sensación de “herramientas pegadas” más que de una historia científica coherente.

## Principio V2

> Cada pantalla debe ser científicamente autosuficiente a su nivel.

Ejemplos:
- Resultados debe permitir entender y comparar M1–M10 sin abrir diez módulos.
- M5 debe permitir entender trayectoria, función, hubs y validación sin salir de M5.
- Gene Detail debe permitir entender por qué un gen fue priorizado sin abrir tres páginas.
- Reproducibilidad debe auditar evidencia, no repetir interpretación científica.

---

# 2. Navegación global definitiva

Solo cuatro destinos primarios:

- **Resumen**
- **Resultados**
- **Métodos**
- **Reproducibilidad**

Utilidades:
- Buscar
- Preguntar

Fuera de navegación principal:
- Estado T-008
- GitHub

## Regla

No poner en navegación global:
- Módulos;
- Función;
- Validación;
- Genes;
- T-008.

Son subflujos, no destinos de primer nivel.

---

# 3. Sitemap V2

```text
Resumen
│
├── Resultados
│   ├── Overview M1–M10
│   │   ├── M1
│   │   ├── M2
│   │   ├── ...
│   │   └── M10
│   │
│   ├── Comparación funcional     [avanzado]
│   ├── Validación externa global [comparativo]
│   └── Genes
│
├── Métodos
├── Reproducibilidad
│
└── Utilidades
    ├── Buscar
    ├── Preguntar
    └── Estado T-008
```

La página /results es el Overview M1–M10. No hay landing intermedia.

---

# 4. Pantalla 1 — RESUMEN

## Pregunta que responde

**¿Qué estudia este proyecto y cuál es la conclusión general hasta ahora?**

## Debe contener

### A. Pregunta científica
Una frase clara:
- identificar programas de coexpresión cuyas trayectorias divergen entre Cabernet Sauvignon y Pinot noir durante maduración;
- evaluar robustez entre años;
- buscar apoyo independiente en piel.

### B. Diseño experimental
Visible sin abrir Métodos:
- GSE98923;
- 54 muestras;
- 2 cultivares;
- 3 etapas;
- 3 años;
- 3 réplicas/celda;
- pericarpio completo;
- log2(RPKM+1).

### C. Qué hizo CEMiTool
En una frase:
- red de coexpresión;
- beta10 principal;
- beta7 sensibilidad.

No explicar algoritmos aquí.

### D. Hallazgos principales
Máximo 4 bloques:

1. **10 módulos beta10**
2. **M10 reproducible** bajo la regla preespecificada de robustez anual.
3. **M5/M2/M3/M1 muestran dependencia anual a nivel de módulo**, con señales stage-specific que pueden conservarse.
4. **Validación en piel es externa y separada del baseline**, no aumenta N=54.

### E. Resultado destacado
M5 como caso de estudio, pero sin convertirlo en “el ganador”.

Mostrar:
- por qué se estudia más;
- señal Cultivar×Stage;
- Harvest;
- dependencia anual;
- botón “Ver M5”.

### F. Qué NO demuestra
Siempre visible:
- eigengene ≠ gen individual;
- hub ≠ regulador causal;
- expresión ≠ actividad proteica;
- baseline pericarpio ≠ piel aislada;
- T-008 no está terminado mientras no esté terminado.

## No debe contener

- tablas largas;
- ranking de hubs;
- ORA detallado;
- network;
- ledger T-008;
- catálogo de archivos.

---

# 5. Pantalla 2 — RESULTADOS / OVERVIEW M1–M10

## Esta debe ser la pantalla principal de Resultados

No otra landing antes.

## Pregunta que responde

**¿Qué módulos encontró CEMiTool y cómo se comparan entre sí?**

## Orden de contenido

### A. Figura global M1–M10

Una sola figura visual.

Importante:
- CEMiTool produjo los profiles por módulo y un PDF multipágina;
- la web puede construir una **composición M1–M10** usando las salidas originales;
- debe etiquetarse como “Composición de perfiles originales CEMiTool beta10”;
- no llamarla “figura original única de CEMiTool”.

La composición debe mostrar los diez módulos simultáneamente.

### B. Tabla comparativa M1–M10

Inmediatamente debajo de la figura.

Columnas recomendadas:

| Módulo | Genes | Cultivar×Stage | Robustez anual | Señal stage-specific | Función | Piel externa |
|---|---:|---|---|---|---|---|

### Qué significa cada columna

**Cultivar×Stage**
- FDR del efecto global.

**Robustez anual**
- reproducible;
- year-dependent;
- sin clasificación prioritaria.

**Señal stage-specific**
- resumen de contrastes importantes, no todos los números.

Ejemplos conocidos:
- M10: reproducible.
- M5: year-dependent; Harvest conserva señal significativa de misma dirección en los tres años.
- M2: year-dependent; Veraison/Harvest conservan señal significativa de misma dirección en los tres años.
- M3: year-dependent; Harvest dominado en magnitud por 2013.
- M1: no establecido como estable.

**Función**
- número de términos relevantes + 1 tema principal si corresponde;
- no volcar toda la ORA.

**Piel externa**
- “evaluado” / “no priorizado para validación externa”;
- no usar “sin evidencia” cuando no fue evaluado.

### C. “Cómo leer esta tabla”

Un callout pequeño:
- FDR global ≠ reproducibilidad anual;
- year-dependent ≠ artefacto;
- no significancia ≠ ausencia biológica;
- prioridad ≠ score.

### D. Acceso al módulo

Cada fila abre el módulo.

## No debe haber aquí

- cards gigantes M1–M10;
- hubs completos;
- red Cytoscape;
- términos GO completos;
- scatter de validación;
- otra pestaña “Módulos” que lleve a lo mismo.

---

# 6. Pantalla 3 — MODULE WORKSPACE

Ruta conceptual:

`/results/modules/:moduleId`

## Regla clave

El módulo debe contar su historia completa **sin obligar a salir del módulo**.

## Header persistente

Ejemplo:

```text
Módulos / M5

M5
108 genes
Year-dependent
Cultivar×Stage FDR ...
[← M4] [Todos los módulos] [M6 →]
```

Debajo, solo 4 vistas locales:

1. **Resumen**
2. **Trayectoria**
3. **Biología y red**
4. **Validación**

No usar:
- 7 tabs;
- Evidence como tab;
- Hubs separado de Network;
- Function global como requisito.

Evidence siempre es acción contextual.

---

# 7. MÓDULO — vista RESUMEN

## Pregunta

**¿Qué debo entender de este módulo antes de mirar detalles?**

## Debe contener todo el contexto mínimo

### A. Estado científico
- genes;
- FDR Cultivar×Stage;
- clasificación de robustez;
- stage-specific signal;
- cobertura funcional;
- cobertura externa.

### B. Profile CEMiTool original del módulo

Mostrar el plot original individual del módulo.

Al lado:
- 2–4 frases de lectura;
- no inferir función por forma del profile.

### C. Resumen de trayectoria
Una mini gráfica / takeaway.

### D. Resumen funcional
Top 3 temas/terms.

### E. Resumen de hubs
Top 3–5 genes por kWithin.

### F. Resumen validación externa
Si existe:
- dataset;
- genes evaluables;
- concordancia.

Si no existe:
- “Este módulo no fue incluido en la validación externa prioritaria congelada.”
- no “sin validación”.

### G. Límite de interpretación
Una única caja al final.

## Objetivo

El lector debe poder cerrar la página aquí y aun así entender el módulo.

---

# 8. MÓDULO — vista TRAYECTORIA

## Pregunta

**¿Cómo cambia el eigengene entre cultivares, etapas y años?**

## Debe contener junto

1. profile CEMiTool / trayectoria global;
2. trayectoria interactiva por año;
3. réplicas opcionales;
4. contrast matrix Stage × Year;
5. resumen del efecto Cultivar×Stage;
6. robustez anual;
7. sensibilidades relevantes.

### M5
Aquí debe vivir la sensibilidad al GSM2627837 cuando corresponda.

No mandar la sensibilidad a una página remota.

## Caveat fijo

“Eigengene = resumen del módulo; no es expresión de un gen.”

## Ver datos

La tabla de 90 contrastes es auditoría secundaria.

---

# 9. MÓDULO — vista BIOLOGÍA Y RED

## Pregunta

**¿Qué procesos están sobrerrepresentados y qué genes ocupan posiciones centrales?**

## Debe juntar

### A. Función
- MapMan v3;
- MapMan v5 cuando aporte;
- GO vigente de results/go_ora_beta10;
- top términos;
- temas preespecificados.

### B. Annotation audit
Solo si existe conflicto relevante.

Para M5:
- CHS/STS debe aparecer aquí;
- explicar que es conflicto de anotación;
- no esconderlo en Reproducibilidad.

### C. Hubs
- top 5 visibles;
- ranking completo en disclosure;
- kWithin;
- kME;
- “hub ≠ causal”.

### D. Network
- preview;
- búsqueda de gen;
- inspector;
- Abrir red completa.

No hacer que Cytoscape ocupe toda la pantalla por defecto.

### E. Locus
Solo cuando haya una historia espacial/genómica concreta, por ejemplo chr16.

## Qué NO hacer

No obligar a:
- salir a /results/function;
- abrir Hubs en otra tab;
- abrir Gene Detail para conocer la anotación mínima.

Gene Detail es para profundizar, no para completar la historia básica.

---

# 10. MÓDULO — vista VALIDACIÓN

## Pregunta

**¿Encuentra este módulo apoyo independiente en piel?**

## Siempre empezar con contexto

```text
BASELINE
GSE98923
pericarpio
54 muestras

↓ comparación observacional

EXTERNAL
GSE72421 / PRJNA260535
piel aislada
```

## Si el módulo fue evaluado

Mostrar en la misma pantalla:
- cobertura;
- datasets;
- condiciones;
- concordancia de dirección;
- genes/hubs evaluables;
- scatter/concordance;
- tabla opcional.

## Si NO fue evaluado

No enviar a otra página.

Mostrar:
- “No fue parte del set prioritario preespecificado para validación externa.”
- qué módulos sí fueron evaluados;
- enlace a comparación global.

## Caveat

- no metaanálisis;
- no sumar N;
- plataformas distintas;
- evidencia observacional.

---

# 11. Comparación funcional GLOBAL

Ruta:
`/results/function`

## Esta página NO es necesaria para entender un módulo

Es una herramienta comparativa avanzada.

## Pregunta

**¿Cómo se distribuyen los temas funcionales entre M1–M10?**

## Contenido

- matrix/module × theme;
- selector MapMan/GO;
- módulos lado a lado;
- términos compartidos vs específicos;
- annotation audit global;
- tabla completa bajo disclosure.

## En módulo

La función específica del módulo ya debe estar resumida y explorable.

---

# 12. Validación externa GLOBAL

Ruta:
`/results/validation`

## Pregunta

**¿Cómo se comparan globalmente los módulos prioritarios frente a los datasets de piel?**

No debe ser el único lugar donde aparece validation.

## Contenido

- baseline vs external;
- datasets y propósito;
- M5/M10/M2 lado a lado;
- cobertura;
- concordancia;
- scatter comparativo;
- genes compartidos;
- límites.

Desde aquí se puede entrar:
- a un módulo;
- a un gen.

---

# 13. GEN DETAIL

## Una sola pantalla, sin tabs

Un gen no necesita un workspace complejo.

## Orden

1. Identidad
   - VIT ID;
   - alias;
   - módulo;
   - rank kWithin.
2. Por qué está aquí
   - hub/priorización;
   - función/anotación.
3. Contexto de red
   - kWithin;
   - kME;
   - vecinos principales.
4. Baseline
   - contrastes/etapas relevantes.
5. Piel externa
   - si fue evaluable;
   - dataset/dirección/FDR.
6. Conflictos de anotación
   - si existen.
7. Límite
   - prioridad/centralidad ≠ causalidad.
8. Volver a módulo.

## Regla

Nunca dejar una ficha gen sin el módulo del que viene.

---

# 14. MÉTODOS

## Pregunta

**¿Cómo se produjo cada resultado?**

## Navegación interna por pipeline

1. Diseño y datos
2. Preprocesamiento
3. CEMiTool
4. Estadística de módulos
5. Robustez anual
6. Enriquecimiento
7. Hubs/red
8. Validación externa
9. Reprocesamiento T-008

## Cada sección debe tener

- pregunta metodológica;
- input;
- método;
- parámetros;
- output;
- caveat;
- enlace a script;
- enlace a evidencia.

## Información científica que debe estar aquí

CEMiTool:
- beta10 primary;
- beta7 sensitivity;
- network unsigned;
- TOM signed;
- min module size;
- filter configuration.

Estadística:
- eigengene factorial models;
- Cultivar×Stage;
- Stage×Year contrasts;
- FDR families.

Enrichment:
- MapMan v3/v5;
- GO vigente;
- indicar qué capa supersede a cuál.

External:
- datasets;
- tejido;
- condición;
- comparación observacional.

---

# 15. REPRODUCIBILIDAD

## Pregunta

**¿Qué archivo/script/commit sostiene una afirmación?**

No debe explicar la biología otra vez.

## Dos modos

### Hallazgos
Lista de claims:
- módulos;
- M5 interaction;
- M10 reproducibility;
- enrichment;
- external validation;
- T-008 readiness.

Cada claim abre:
- source files;
- script;
- parameters;
- commit/hash.

### Artefactos
Búsqueda técnica:
- TSV;
- JSON;
- R script;
- figure;
- provenance.

## Evidence Drawer

Desde cualquier pantalla científica:
- Evidence
- abre panel contextual;
- no navega fuera por defecto;
- “Ver en Reproducibilidad” solo si se quiere auditoría profunda.

---

# 16. T-008 STATUS

No navegación principal.

## Pregunta

**¿Está listo el reprocesamiento moderno?**

Orden:
1. READY / NOT READY
2. x/54
3. blockers
4. design coverage
5. failed/problem runs
6. ledger desplegable
7. eventos desplegables

## Regla

Nunca convertir el estado parcial en resultado biológico.

---

# 17. BUSCAR

Utilidad, no sección científica.

Agrupar resultados:
- módulos;
- genes;
- métodos;
- artefactos.

No duplicar una página “Genes” independiente si el objetivo es simplemente encontrar un gen.

La vista /results/genes puede ser un filtro especializado del buscador.

---

# 18. PREGUNTAR

Utilidad transversal.

Debe recibir contexto explícito:

```text
Contexto: M5 · Biología y red
```

El usuario puede quitarlo.

Fuentes:
- clickeables;
- abren Evidence Drawer;
- no simples chips de filename.

---

# 19. Matriz: dónde vive cada tipo de información

| Información | Pantalla primaria | Preview en |
|---|---|---|
| Diseño GSE98923 | Resumen / Métodos | Resultados |
| 10 módulos | Resultados | Resumen |
| Profile CEMiTool M1–M10 | Resultados | — |
| Profile de M5 | M5 Resumen/Trayectoria | Resultados |
| Cultivar×Stage | Resultados + módulo | Resumen |
| Robustez anual | Resultados + Trayectoria | Resumen |
| Contrastes stage×year | Trayectoria | Resultados resumido |
| Enrichment | Biología y red | Resultados resumido |
| GO audit | Biología y red / Function global | Métodos |
| Hubs | Biología y red | Resumen módulo |
| Network | Biología y red | Resumen módulo |
| CHS/STS conflict | M5 Biología y red | Gene detail si aplica |
| Skin validation | Módulo Validation | Resultados / global validation |
| Gene evidence | Gene Detail | módulo |
| Scripts/files/hash | Reproducibilidad | Evidence Drawer |
| T-008 progress | Status | Métodos solo referencia |

---

# 20. Qué páginas eliminar como concepto duplicado

No necesariamente borrar rutas legacy inmediatamente, pero no deben aparecer como destinos de navegación:

- Story;
- landing intermedia Results;
- Hubs como página separada;
- Network como página separada;
- Evidence como tab del módulo;
- T-008 en nav principal;
- Function global como requisito para entender un módulo;
- Validation global como requisito para entender un módulo.

---

# 21. Flujo principal esperado

## Lector científico

```text
Resumen
→ Resultados M1–M10
→ M5
→ Resumen
→ Trayectoria
→ Biología y red
→ Validación
```

## Comparación rápida

```text
Resultados
→ figura M1–M10
→ tabla
→ M10 / M5 / M2
```

## Auditor

```text
Resultado
→ Evidence Drawer
→ Reproducibilidad
```

## Gen

```text
Módulo
→ gen
→ Gene Detail
→ volver al módulo
```

## Equipo

```text
Footer / utilidad
→ T-008 Status
```

---

# 22. Regla de diseño para el siguiente wireframe

Antes de volver a tocar React:

1. aprobar esta arquitectura;
2. dibujar solo cinco wireframes clave:
   - Resumen;
   - Resultados M1–M10;
   - Module Summary;
   - Module Biology & Network;
   - Module Validation;
3. después extender a Methods/Reproducibility/Gene;
4. recién entonces implementar.

---

# 23. Decisión propuesta

La web deja de organizarse por “features del pipeline” y pasa a organizarse por:

**Estudio → Resultados → Entidad científica → Evidencia**

Eso elimina la mayor parte de los saltos actuales y mantiene la interpretación cerca del dato que la necesita.
