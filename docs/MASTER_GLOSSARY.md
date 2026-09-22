# Glosario maestro

Cada entrada contiene una definición sencilla, una definición técnica, dónde aparece en el proyecto, un ejemplo y un error común.

## RNA-seq
**Sencilla:** técnica para estimar qué RNAs están presentes y en qué cantidad relativa.
**Técnica:** secuenciación de bibliotecas de RNA convertido a cDNA; las lecturas se asignan o cuantifican contra una referencia.
**Proyecto:** GSE98923 y PRJNA260535.
**Ejemplo:** el baseline usa RPKM publicado de GSE98923.
**Error común:** tratar RNA como proteína o actividad enzimática.

## RPKM
**Sencilla:** medida histórica de expresión normalizada por longitud génica y tamaño de biblioteca.
**Técnica:** reads per kilobase of transcript per million mapped reads.
**Proyecto:** `data/processed/expression_rpkm.tsv`.
**Error común:** asumir que es la normalización ideal para cualquier comparación moderna.

## CPM / log2CPM
**Sencilla:** lecturas por millón; log2CPM es una versión logarítmica.
**Proyecto:** PRJNA260535 externo se distribuyó como log2CPM.
**Error común:** comparar magnitudes RPKM y log2CPM como si fueran la misma escala.

## log2(RPKM+1)
**Sencilla:** comprime valores grandes y deja cero en cero.
**Proyecto:** matriz principal.
**Ejemplo:** RPKM 0→0; RPKM 7→3.
**Error común:** pensar que la transformación crea nuevos reads.

## Correlación de Pearson
**Sencilla:** mide cuánto dos perfiles cambian linealmente juntos.
**Técnica:** covarianza estandarizada entre -1 y +1.
**Proyecto:** base de la red.
**Error común:** correlación ≠ causalidad.

## Red unsigned
**Sencilla:** considera fuerte tanto una correlación positiva como una negativa.
**Proyecto:** `network_type="unsigned"`.
**Error común:** interpretar una arista como activación.

## Adjacency
**Sencilla:** peso de conexión entre dos genes.
**Proyecto:** aproximadamente `|r|^10` en beta10.
**Error común:** confundirla con correlación cruda.

## Beta / soft threshold
**Sencilla:** exponente que acentúa correlaciones fuertes y debilita las moderadas.
**Proyecto:** beta10 principal; beta7 sensibilidad.
**Error común:** creer que hay un beta “verdadero” universal.

## Scale-free topology / R²
**Sencilla:** diagnóstico de cuánto la conectividad se parece a una distribución tipo scale-free.
**Proyecto:** beta7≈0,55; beta10≈0,706.
**Error común:** usar R²≥0,8 como regla absoluta.

## Connectivity
**Sencilla:** cuán conectado está un gen.
**Técnica:** suma de pesos de aristas.
**Proyecto:** kWithin restringe esa suma al módulo.

## TOM
**Sencilla:** mide cuánto dos genes comparten vecinos además de su enlace directo.
**Técnica:** topological overlap measure.
**Proyecto:** `tom_type="signed"` dentro de CEMiTool.
**Error común:** asumir que TOM signed convierte la red unsigned en una inferencia causal.

## Módulo
**Sencilla:** grupo de genes con perfiles de coexpresión relacionados.
**Proyecto:** M1…M10 en beta10.
**Error común:** asumir que M5 beta7 = M5 beta10.

## Not.Correlated
Genes filtrados que no quedaron en un módulo biológico asignado por la corrida.

## PCA
**Sencilla:** resume variación multivariable en ejes.
**Técnica:** descomposición lineal ortogonal de máxima varianza.
**Proyecto:** PC1 de cada módulo.

## PC1
Primera componente principal. En este proyecto se usa como eigengene y se orienta de signo para correlacionar positivamente con la media del módulo.

## Eigengene
**Sencilla:** resumen numérico de la actividad conjunta de un módulo por muestra.
**Técnica:** aquí, PC1 de genes estandarizados.
**Error común:** pensar que es un gen real o comparar magnitudes absolutas entre módulos.

## ANOVA
Familia de pruebas que reparte variación entre efectos de un modelo.

## ANOVA tipo III
Prueba cada efecto ajustando por los demás términos del modelo. Con interacciones requiere contrastes y lectura cuidadosa.

## Contrastes suma-a-cero
Codificación factorial usada para que las pruebas tipo III sean interpretables de forma marginal/simétrica en el diseño balanceado.

## Interacción
**Sencilla:** el efecto de una variable depende de otra.
**Proyecto:** Cultivar×Stage pregunta si Cabernet−Pinot cambia según etapa.

## Interacción de tres vías
Cultivar×Stage×Year pregunta si la interacción Cultivar×Stage cambia según año.

## Contraste
Comparación lineal entre medias estimadas.
**Proyecto:** Cabernet Sauvignon − Pinot noir.
**Error común:** un contraste negativo de eigengene no implica que cada gen sea menor.

## Residuo
Diferencia entre valor observado y valor predicho por el modelo.

## Residuo estandarizado
Residuo reescalado por su variabilidad estimada; ayuda a detectar observaciones inusuales.

## Outlier / influencia
Una observación extrema o capaz de cambiar un ajuste. No se elimina automáticamente.

## Shapiro-Wilk
Prueba de normalidad de residuos.
**Error común:** tratar un p pequeño como prueba de que todo análisis es inválido; es un diagnóstico que debe contextualizarse.

## R² del modelo
Fracción de variación explicada por el modelo lineal.
**Error común:** confundir R² de modelo con R² scale-free.

## p-value
Probabilidad, bajo la hipótesis nula y modelo asumido, de observar una señal al menos tan extrema.
**Error común:** “probabilidad de que la hipótesis nula sea cierta”.

## FDR
Tasa esperada de falsos descubrimientos entre resultados declarados significativos en una familia de pruebas.

## Benjamini-Hochberg (BH)
Procedimiento que ajusta p-valores para controlar FDR.
**Proyecto:** ANOVA, contrastes, ORA y validación.

## ORA
**Sencilla:** pregunta si un conjunto funcional aparece demasiado dentro de un módulo.
**Técnica:** over-representation analysis; aquí hipergeométrica unilateral.
**Error común:** enriquecimiento ≠ mecanismo ni regulación.

## Distribución hipergeométrica
Modelo de muestreo sin reemplazo usado para calcular la probabilidad de observar k o más genes de una categoría dado el universo, categoría y módulo.

## Fisher exact test
Prueba exacta 2×2. Se usó como verificación independiente de algunos ORA.

## Universo / background
Genes que podían razonablemente entrar en la prueba. En ORA se restringe a genes con anotación válida de la fuente.

## Fold enrichment
Proporción observada de una categoría en el módulo dividida por la esperada en el background.

## MapMan
Sistema jerárquico de anotación funcional vegetal.
**Proyecto:** v3 principal por cobertura; v5.1 secundaria.

## Gene Ontology (GO)
Ontología formal de funciones moleculares, procesos biológicos y componentes celulares.

## go.obo
Archivo oficial de la ontología GO usado para auditar IDs vigentes/obsoletos.

## Término GO obsoleto
ID marcado `is_obsolete: true`; no debe tratarse como categoría vigente sin revisión.

## Grapedia
Fuente de recursos/anotaciones de Vitis usada para equivalencias y MapMan/GO.

## PN40024
Genoma de referencia de vid usado por las anotaciones. No es el genoma individual de Cabernet ni Pinot.

## VIT_ / ID legado v1
Identificadores génicos de la anotación histórica usada por GSE98923.

## Mapeo one-to-one
Correspondencia no ambigua entre un gen legado y uno de anotación nueva.

## Strand
Hebra genómica. Se exigió concordancia en el mapeo de IDs.

## Gene overlap
Solapamiento físico de coordenadas entre modelos génicos; se exigió ≥50% en los mapeos aceptados.

## Hub
Gen altamente conectado dentro de un módulo.
**Error común:** hub ≠ regulador causal.

## kWithin
Suma de adyacencias de un gen hacia otros genes del mismo módulo.

## kME
Correlación entre expresión de un gen y eigengene del módulo. Secundaria a kWithin en T-006.

## Top decile
10% superior del ranking. Corte descriptivo, no p-valor.

## CHS
Chalcone synthase, enzima de la rama flavonoide de fenilpropanoides.

## STS
Stilbene synthase, enzima emparentada que forma estilbenos.

## Familia CHS/STS
Familia de enzimas altamente homólogas. Dominios compartidos no distinguen con certeza CHS de STS.

## PAL
Phenylalanine ammonia-lyase, enzima temprana de la vía fenilpropanoide.

## Fenilpropanoides
Familia amplia de metabolitos/rutas derivados de fenilalanina; incluye ramas hacia flavonoides, estilbenos y lignina.

## Flavonoides
Grupo de metabolitos fenólicos que incluye varias subclases. “Flavonoide” no equivale automáticamente a antocianina.

## Estilbenoides
Metabolitos fenólicos derivados de STS; en vid incluyen resveratrol y relacionados.

## Antocianinas
Pigmentos flavonoides. No hubo enriquecimiento establecido del tema antocianina en módulos prioritarios.

## CuAO
Copper amine oxidase; M5 `VIT_05s0020g03280` es hub rango 5 y tiene apoyo externo de expresión.

## NAC
Familia de factores de transcripción vegetal; `VIT_12s0028g00860` es hub M5 rango 7.
**Error común:** su centralidad no demuestra regulación directa de CHS/STS.

## MYB
Familia de factores de transcripción. Un MYB es hub prioritario de M2 y recibe apoyo externo.

## FAR1
Factor relacionado con respuesta a luz/señalización; un FAR1 es candidato M2.
**Error común:** trasladar automáticamente funciones de otros tejidos/especies a baya.

## bHLH
Familia de factores de transcripción basic helix-loop-helix. M10 tiene candidatos anotados bHLH.

## HAK/KUP/KT
Familia de transportadores de potasio. M10 rango 2 cae en esta familia.

## Parálogo
Copias relacionadas de un gen dentro del mismo genoma/linaje.
**Problema:** lecturas pueden no distinguirlas.

## Ortólogo
Genes relacionados por especiación entre especies/linajes.

## Multimapping
Lectura que puede alinearse igualmente a varios loci. Crítico en familias CHS/STS.

## Reference bias
Sesgo producido porque reads de un cultivar se alinean peor a una referencia que representa otra secuencia.

## Copy-number variation
Diferencia en número de copias génicas entre individuos/cultivares.

## Piel / berry skin
Tejido externo de la baya. Se usa solo en T-007 externo.

## Pericarpio
Conjunto de tejidos de la pared del fruto; incluye piel pero no es sinónimo de piel aislada.

## Cutícula
Capa extracelular hidrofóbica rica en cutina/ceras. No se estableció un enriquecimiento prioritario de cutícula/cera.

## Veraison
Inicio de maduración de la uva, asociado a cambios de color/ablandamiento/azúcares. En el baseline se ancla a day after veraison 0.

## FruitSet
Etapa temprana posterior a cuajado del fruto.

## Harvest
Etapa terminal/cosecha del diseño; en M5 el contraste Cabernet−Pinot es el subpatrón más estable.

## Validación externa
Comprobación de una señal en otro dataset sin incorporarlo como réplica del estudio primario.

## Microarray
Tecnología que mide hibridación a sondas predefinidas.
**Limitación:** cross-hybridization entre genes parecidos.

## Probe / sonda
Secuencia del microarray destinada a capturar transcritos específicos.

## Cross-hybridization
Una sonda se une a transcritos similares además del objetivo; problema en familias parálogas.

## FASTQ
Formato de lecturas crudas y sus calidades. T-008 deberá comenzar desde FASTQ para modernizar cuantificación.
