# Método de comparación cartográfica (primera fase)

## Insumos reales utilizados

**POT 2014 actualizado:** se leyeron directamente las tablas físicas de la FileGeodatabase `POT_2014.gdb` usando el catálogo interno `GDB_SystemCatalog` y las geometrias de sus capas. La base está referida a EPSG:6249. Correspondencias de nombres y tablas en esta versión:

| Capa lógica de 2014 | Archivo interno | Registros | Utilización |
|---|---|---:|---|
| `nur_tratamientos_urbanisticos` | `a00000321.gdbtable` | 135 | Mapa y transiciones de tratamiento |
| `nur_areas_actividad` | `a00000340.gdbtable` | 21.037 | Superficie por categoría de uso en cada barrio |
| `nur_planes_parciales` | `a00000315.gdbtable` | 51 | Presencia cartográfica de planes parciales |
| `nur_edificabilidad` | `a00000330.gdbtable` | 14.595 | ICB/ICA vigentes por barrio |
| `nur_edificabilidad_zonas` | `a00000320.gdbtable` | 569 | Visualización simplificada |
| `amb_ari_efectos_sismicos` | `a000000a0.gdbtable` | 2 | Condiciones sísmicas georreferenciadas |
| `amb_ari_inundacion_fluvial` | `a0000021b.gdbtable` | 423 | Mapas de amenaza 2014 |

**Propuesta 2026:** `norma_ot.gdb`, `amb_amenaza_riesgo.gdb`, `mot.gdb`; exportaciones simplificadas. Se emplearon 102 polígonos de tratamientos, 624 áreas de actividad, 42 de planes parciales propuestos y otras capas. Los códigos se decodificaron leyendo dominios de `GDB_Items`.

**Barrios:** el zip `pdt_dpa_barrios_sectores.zip` se convirtió a 342 polígonos en WGS84 para visualización.

## Procedimiento

1. Transformar todos los datos a **EPSG:6249** (metros en el área de Cali).
2. Hacer `spatial join` por intersección entre polígonos normativos y barrios; calcular el área de la geometría intersecada, no únicamente el centroide.
3. Agrupar por nombre de categoría, calcular hectáreas y proporciones de barrio.
4. Para transiciones de tratamientos, intersectar `tratamiento 2014 ∩ tratamiento propuesta 2026 ∩ barrio`, calcular área y listar los emparejamientos más extensos.
5. Publicar resultados en `data/resumen_barrios.json`. La cartografía visual se simplifica solo después del análisis.

## Límites sustantivos

No equivale jurídicamente un cambio de nombre ni de polígono. Una diferencia cartográfica requiere comprobar normas, sistemas de reparto, obligaciones, planes parciales, licencias e incentivos antes de declarar quién se beneficia o si la edificabilidad aumenta. No se deben comparar como categorías idénticas fenómenos de amenaza y áreas con condición de riesgo. La cartografía de 2014 recibida fue modificada en años posteriores a 2014 y representa el POT vigente actualizado.
