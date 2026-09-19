# 02 — Dataset y diseño experimental

## Dataset primario

- GEO: **GSE98923**
- Estudio: Fasoli et al.
- Material: baya de vid / pericarpio; las semillas fueron retiradas antes del procesamiento.
- Cultivares principales usados aquí: Cabernet Sauvignon y Pinot noir.
- Años: 2012, 2013, 2014.
- Serie completa: 219 muestras.
- Baseline principal: 54 muestras balanceadas.

## Diseño baseline

2 cultivares × 3 etapas × 3 años × 3 réplicas = **54 muestras**.

Clases:

- CS_FruitSet
- CS_Veraison
- CS_Harvest
- PN_FruitSet
- PN_Veraison
- PN_Harvest

Cada clase contiene 9 muestras.

## Selección exacta de GSM

### Cabernet Sauvignon — 2012
- FruitSet: GSM2627691, GSM2627692, GSM2627693
- Veraison: GSM2627709, GSM2627711, GSM2627713
- Harvest: GSM2627739, GSM2627740, GSM2627741

### Cabernet Sauvignon — 2013
- FruitSet: GSM2627742, GSM2627743, GSM2627744
- Veraison: GSM2627754, GSM2627755, GSM2627756
- Harvest: GSM2627781, GSM2627782, GSM2627783

### Cabernet Sauvignon — 2014
- FruitSet: GSM2627784, GSM2627785, GSM2627786
- Veraison: GSM2627793, GSM2627794, GSM2627795
- Harvest: GSM2627820, GSM2627821, GSM2627822

### Pinot noir — 2012
- FruitSet: GSM2627823, GSM2627824, GSM2627825
- Veraison: GSM2627835, GSM2627836, GSM2627837
- Harvest: GSM2627850, GSM2627851, GSM2627852

### Pinot noir — 2013
- FruitSet: GSM2627853, GSM2627854, GSM2627855
- Veraison: GSM2627862, GSM2627863, GSM2627864
- Harvest: GSM2627883, GSM2627884, GSM2627885

### Pinot noir — 2014
- FruitSet: GSM2627886, GSM2627887, GSM2627888
- Veraison: GSM2627895, GSM2627896, GSM2627897
- Harvest: GSM2627919, GSM2627920, GSM2627921

## Evidencia usada para las etapas

### Véraison
La serie GEO contiene muestras con `day after veraison = 0`; estas se trataron como el punto exacto de véraison.

### Fruit set
La asignación se deriva del protocolo temporal: el muestreo comienza en fruit set.

### Harvest
La asignación se deriva del punto temporal final del protocolo, que sigue la baya hasta cosecha/madurez (~24.5 °Brix).

Esta diferencia entre evidencia explícita GEO y asignación derivada del protocolo debe conservarse en el informe.

## Por qué no usar las 219 como réplicas de etapa

Los puntos temporales intermedios no son réplicas exactas de FruitSet/Veraison/Harvest. La serie completa puede ser útil para reconstrucción temporal exploratoria, pero no debe inflar artificialmente el N del contraste principal.
