# Cali: ¿Qué cambia en mi territorio?

**Versión de trabajo v3: cartografía POT 2014 + propuesta 2026, barrios de 2026 y lectura jurídica comparada de tratamientos, planes parciales y cargas.** Sitio web estático con Leaflet. No requiere backend, base de datos ni cuentas comerciales.

## Nueva etapa: homologación y condiciones de gestión

La pestaña **Gestión e incentivos** incluye reglas normativas verificadas por tratamiento presente en el barrio: requisitos y excepciones sobre planes parciales, licencias, planes manzana y condiciones de D1/D2, más referencias a artículos. También incluye un glosario que diferencia ICA (índice urbanístico) del ICA (impuesto).

**Limitación:** identificación de un tratamiento en el barrio no significa que esa norma aplique sin más a todos los predios; la necesidad de plan parcial puede depender de tamaño, número de predios, urbanización previa, PUI, delimitaciones y régimen transitorio.

Se incluyen `MATRIZ_HOMOLOGACION_TRATAMIENTOS.csv`, `MATRIZ_REGLAS_GESTION.csv`, `data/normativa_gestion.json` y `ANALISIS_NORMATIVO_TRATAMIENTOS.md` para revisar/actualizar la interpretación.

## Qué funciona

- **342 territorios buscables:** 324 barrios y 18 sectores de la capa `pdt_dpa_barrios_sectores.zip`, seleccionables en mapa y buscador.
- **Comparación espacial de ambas geodatabases**, calculada sobre el límite de cada barrio: tratamientos urbanísticos, áreas de actividad, planes parciales, información de edificabilidad 2014, y capas de riesgo.
- **Transiciones de tratamiento sobre la misma superficie:** para cada barrio, muestra qué tratamiento figura en la geodatabase POT 2014 y cuál aparece en la cartografía propuesta 2026, con hectáreas y proporción del barrio.
- **Códigos 2026 interpretados con sus dominios GDB:** por ejemplo, R1 significa renovación-redensificación alta; C2, consolidación básica. Las categorías se muestran con su nombre técnico y código.
- Mapas activables en la columna izquierda: tratamientos y planes parciales tanto 2014 como 2026; edificabilidad de 2014; efectos sísmicos e inundación fluvial de 2014, junto a capas de la propuesta.
- Pestañas: **Norma y mapa**, **Comparar** y **Beneficios**. La pestaña Beneficios indica requisitos, instrumentos e incentivos todavía no comprobados jurídicamente.
- Enlaces a los repositorios de origen y referencia general sobre microzonificación sísmica, artículos 55 del POT vigente y 80 de la propuesta.

## Precauciones de interpretación

1. **POT 2014 no significa fotografía de 2014:** la geodatabase del Acuerdo 0373 fue actualizada administrativamente en años siguientes (incluido 2026); la comparación enfrenta **POT 2014 vigente en su cartografía actualizada** con **propuesta de revisión de 2026**.
2. Los polígonos normativos pueden cambiar de perímetro y clasificación; un nombre distinto **no demuestra por sí solo** cambios de edificabilidad, intensidad de uso, cesiones, obligaciones ni derechos adquiridos.
3. La presencia o desaparición cartográfica de un plan parcial **no demuestra que el trámite deja de ser obligatorio**. Hace falta cotejar artículos y régimen de transición.
4. Las capas de amenaza de 2014 y condiciones de riesgo de 2026 son **conceptos diferentes** y no admiten comparación directa para afirmar mayor o menor riesgo.
5. La capa de **edificabilidad de la propuesta 2026 consultada contiene cero entidades**. Sí se integró edificabilidad 2014 (14.595 registros); **no se concluye** aumento ni disminución de índices entre años.
6. Las superficies se calcularon con las geometrías originales proyectadas en EPSG:6249. Solo los archivos GeoJSON visuales se simplificaron. Por superposición cartográfica y bordes de distintas fuentes, ciertas categorías pueden sumar más del 100%: no interpretarlas como cobertura exclusiva.
7. El sitio no equivale a certificado de norma urbanística ni a consulta predial oficial.

## Archivos

```
index.html                         Sitio web y navegador de barrios
assets/app.js                      Interfaz y comparador espacial
assets/styles.css                  Estilos y diseño adaptable
data/barrios.geojson               Polígonos de 324 barrios y 18 sectores
data/resumen_barrios.json          Cruces calculados para 342 territorios
data/dominios2026.json             Códigos de tratamiento y actividad (GDB)
data/tratamientos2014.geojson      Tratamientos vigentes
/data/planes2014.geojson           Planes parciales vigentes
/data/edificabilidad_zonas2014.geojson  Edificabilidad cartográfica 2014
/data/efectos_sismicos2014.geojson     Efectos sísmicos 2014
/data/inundacion_fluvial2014.geojson   Inundación fluvial 2014
data/*.geojson                     Otras capas de la propuesta 2026
scripts/                             Procesamiento opcional de capas
METODOLOGIA_COMPARACION.md          Procedencia y limitaciones
```

La aplicación usa **solo archivos estáticos locales** para la cartografía de barrios y las comparaciones 2014–2026. Leaflet se obtiene de una CDN gratuita y el mapa de fondo se consulta a OpenStreetMap; sin ese mapa base, el uso de capas cartográficas localmente servidas sigue siendo posible.

## Publicar gratuitamente en GitHub Pages

1. Descomprime el ZIP.
2. En GitHub, crea un repositorio **público** con un nombre como `pot-cali`.
3. Sube los archivos **dentro** de la carpeta descomprimida (en especial `index.html`, `assets` y `data`); no subas el ZIP cerrado.
4. En **Settings → Pages**, elige **Deploy from a branch → main → /(root)** y guarda.
5. GitHub te mostrará una URL gratuita bajo `github.io`.

Para pruebas locales ejecuta `python -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000`; al abrir `index.html` como `file://` algunos navegadores bloquean `fetch()` de GeoJSON.

## Fuentes y licencias

- **POT 2014 vigente:** [carpeta GDB POT_2014](https://drive.google.com/drive/folders/1SA5nS9Rf-7zp8-j0Vf7KuEQotfKeEqG4), catálogo de objetos y Acuerdo 0373 de 2014. También [portal oficial de descarga IDESC](https://www.cali.gov.co/planeacion/publicaciones/106497/pot-2014-idesc/).
- **Propuesta 2026:** [carpeta GDB radicada al CTP, 3 agosto de 2026](https://drive.google.com/drive/folders/1Sydz1ahyHOcWgw5WrFsMjUJkDCQZ85Fr), y `Proyecto_Acuerdo (1).pdf` del proyecto.
- **Barrios y sectores 2026:** `pdt_dpa_barrios_sectores.zip` aportado por la usuaria, 342 unidades. [Metadatos IDESC](https://mg-idesc.cali.gov.co/geonetwork/geonetwork/api/records/143f3807-37e5-4a59-8fcb-547ea7023c33).
- **Dominio de códigos de 2026:** tabla `GDB_Items` de `norma_ot.gdb`; dominios `25_pot_tratamientourbanisticotipo` y `26_pot_areaactividadtipo`.
- Código de la aplicación: licencia MIT en `LICENCIA_CODIGO.txt`.
- **Antes de hacer público el repositorio con sus GeoJSON**, verificar condiciones de redistribución, atribución y licenciamiento de las fuentes GDB, especialmente la de la propuesta 2026. La licencia MIT de la aplicación **no cubre automáticamente los datos cartográficos**.

## Próximos análisis normativos

- Homologar categorías y artículos de tratamientos 2014–2026.
- Verificar, por ámbito espacial, cuándo se requiere plan parcial y si una figura es sustituida o eliminada.
- Incorporar régimen de licenciamiento, cargas, cesiones, plusvalía y beneficios tributarios solo cuando tengan soporte expreso.
- Validar datos de edificabilidad 2026 y condiciones de riesgo comparables.

**No se han incluido modelaciones financieras ni beneficios supuestos.**


## Corrección de visualización v4 (mapa)

Se integraron estilos básicos locales de Leaflet en `assets/styles.css` y se actualizó la referencia de estilo en `index.html` para evitar mosaicos flotantes sobre las fichas en caso de que el CSS remoto falle. No se modificaron los GeoJSON ni las comparaciones normativas.


## Versión 5 · mejoras de navegación (19-11-2026)

- Selección de barrio por mapa o buscador: zoom automático (`fitBounds`, máximo nivel 15), marco amarillo/dorado y ficha destacada.
- Se conservan las 342 geometrías de barrios y sectores de referencia, así como las capas normativas y los cruces de 2014–2026.
- Capas organizadas en acordeones: POT 2014, propuesta 2026 (norma/gestión, riesgo y rural).
- El mapa abre centrado en la extensión de los barrios de Cali, no en los polígonos rurales extensos.
- Mapa contenido en columna central de altura controlada; eliminado el pie horizontal que interfería con la visualización.
- Botón “Limpiar selección”; botón “Ver Cali”; control para ocultar los límites de barrios y acceder a los polígonos normativos.
- No hay cambios en las tablas originales ni nuevos resultados normativos en esta actualización de interfaz.

### Publicación

Subir **todo el contenido** de esta carpeta (no la carpeta externa) a la raíz del repositorio público de GitHub Pages. Si ya hay una versión cargada, para actualizar la interfaz bastan `index.html`, `assets/app.js`, `assets/styles.css` (y este README si se quiere). En GitHub Pages: `Settings` → `Pages` → rama `main`, carpeta `/(root)`. Si se observa una versión antigua, refrescar con `Ctrl + Shift + R`.

El mapa base depende de OpenStreetMap y la librería Leaflet se carga desde CDN; requieren conexión. No se cargan datos cartográficos normativos desde API privadas. Se deben comprobar permisos de redistribución antes de publicar capas abiertas.
