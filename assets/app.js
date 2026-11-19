/* Cali: ¿Qué cambia en mi territorio? — sitio estático, sin backend. */
'use strict';
const CODIGOS_2026={"tratamientos2026":{"10":"Renovación - Redensificación alta (R1)","11":"Renovación - Redensificación media (R2)","12":"No aplica","1":"Conservación de sectores urbanos","2":"Conservación contextual","3":"Consolidación urbanística (C1)","4":"Consolidación básica (C2)","5":"Consolidación moderada (C3)","6":"Consolidación cambio de patrón (C4)","7":"Desarrollo suelo de expansión (D1)","8":"Desarrollo suelo urbano (D2)","9":"Mejoramiento Integral"},"actividad2026":{"1":"Área de Proximidad","2":"Área de Integración","3":"Área Multifuncional","4":"Área de Dinamización Económica","5":"Área de Manejo Especial","6":"PEMP Centro Histórico","7":"PEMP Plaza de Toros","8":"PEMP Cañas Gordas","9":"PEMP Piedragrandre"}};
const LAYER_CONFIG = [
 {key:'tratamientos2014',label:'Tratamientos urbanísticos · 2014',color:'#326C88',n:135,default:false,group:'2014',period:'2014'},
 {key:'planes2014',label:'Planes parciales · 2014',color:'#554E98',n:51,default:false,group:'2014',period:'2014'},
 {key:'edificabilidad_zonas2014',label:'Edificabilidad · 2014',color:'#327865',n:569,default:false,group:'2014',period:'2014'},
 {key:'efectos_sismicos2014',label:'Efectos sísmicos · 2014',color:'#B15D71',n:2,default:false,group:'2014',period:'2014'},
 {key:'inundacion_fluvial2014',label:'Inundación fluvial · 2014',color:'#4E93B0',n:423,default:false,group:'2014',period:'2014'},
 {key:'clasificacion',label:'Clasificación del suelo',color:'#84aa84',n:7,default:false,group:'norma'},
 {key:'amenaza',label:'Amenazas: zonificación',color:'#d77260',n:229,default:false,group:'riesgo'},
 {key:'condicion_riesgo',label:'Áreas con condición de riesgo',color:'#b44e56',n:526,default:false,group:'riesgo'},
 {key:'condicion_amenaza',label:'Áreas con condición de amenaza',color:'#dba968',n:759,default:false,group:'riesgo'},
 {key:'asentamientos',label:'Asentamientos identificados',color:'#86a8a0',n:258,default:false,group:'vivienda'},
 {key:'tratamientos',label:'Tratamientos urbanísticos',color:'#c58e5a',n:102,default:true,group:'norma'},
 {key:'areas_actividad',label:'Áreas de actividad y usos',color:'#6297bd',n:624,default:false,group:'norma'},
 {key:'planes_parciales',label:'Planes parciales propuestos',color:'#9a67a4',n:42,default:false,group:'gestion'},
 {key:'planes_previos',label:'Planes parciales preexistentes',color:'#ad82bf',n:24,default:false,group:'gestion'},
 {key:'instrumentos',label:'Instrumentos de planificación',color:'#ce9e50',n:107,default:false,group:'gestion'},
 {key:'centros_poblados',label:'Centros poblados rurales',color:'#549d76',n:21,default:false,group:'rural'},
 {key:'norma_rural',label:'Categorías normativas rurales',color:'#7eac6b',n:123,default:false,group:'rural'},
 {key:'redensificacion',label:'Áreas de redensificación',color:'#cb7d75',n:5,default:false,group:'propuesta'},
];
const GEODB2014_URL='https://drive.google.com/drive/folders/1SA5nS9Rf-7zp8-j0Vf7KuEQotfKeEqG4';
const GEODB_URL='https://drive.google.com/drive/folders/1Sydz1ahyHOcWgw5WrFsMjUJkDCQZ85Fr';
const BARRIOS_URL='https://services7.arcgis.com/fHfQ8qeNWagUQB9e/ArcGIS/rest/services/Sitios_de_Inter%C3%A9s_en_Cali_WFL1/FeatureServer/5/query?where=1%3D1&outFields=id_barrio%2Cbarrio%2Ccomuna&outSR=4326&f=geojson';
const SOURCE_BARRIOS='https://mg-idesc.cali.gov.co/geonetwork/geonetwork/api/records/143f3807-37e5-4a59-8fcb-547ea7023c33';
const state={map:null,base:null,layers:{},geo:{},barrios:null,barriosGeo:null,barriosVersion:'sin cargar',barriosResumen:null,normasGestion:null,barrioMap:new WeakMap(),active:new Set(),selected:null,tab:'data',featureIndex:[],featureLayers:new Map(),searchTimer:null,globalSismo:false,highlight:null,selectedLabel:null,calibounds:null,barriosVisible:true};
const el=(id)=>document.getElementById(id);
const escapeHtml=(v)=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function short(v){if(v==null||v==='')return 'Sin dato';return String(v).length>180?String(v).slice(0,180)+'…':String(v)}
function findTitle(key,p){
 if(key==='tratamientos2014')return p.TRATAMIENT||'Tratamiento POT 2014';
 if(key==='planes2014')return p.DppNombre||'Plan parcial POT 2014';
 if(key==='edificabilidad_zonas2014')return 'Edificabilidad POT 2014 · ICB '+(p.ICB??'sin dato');
 if(key==='efectos_sismicos2014')return p.Tipo||'Efectos sísmicos POT 2014';
 if(key==='inundacion_fluvial2014')return 'Amenaza inundación POT 2014 · '+(p.tipo_amena??'sin dato');

 if(key==='condicion_riesgo')return p.acrdetalle||'Área con condición de riesgo';
 if(key==='condicion_amenaza')return p.acadetalle||'Área con condición de amenaza';
 if(key==='amenaza')return p.zadesc||'Zonificación de amenaza';
 if(key==='asentamientos')return p.ahdinomcom||p.ahdinomof||'Asentamiento identificado';
 if(key==='planes_parciales')return p.planpnombre||p.planpnombren||'Plan parcial propuesto';
 if(key==='centros_poblados')return p.cpnombre||'Centro poblado rural';
 if(key==='norma_rural')return p.cnrnombre||'Categoría normativa rural';
 if(key==='clasificacion')return p.csnombre||`Clasificación (código ${p.cstipo??'—'})`;
 if(key==='tratamientos')return CODIGOS_2026.tratamientos2026[String(p.tutipo)]||`Tratamiento urbanístico · código ${p.tutipo??'—'}`;
 if(key==='areas_actividad')return CODIGOS_2026.actividad2026[String(p.aatipo)]||`Área de actividad · código ${p.aatipo??'—'}`;
 if(key==='planes_previos')return 'Plan parcial preexistente · delimitación';
 if(key==='instrumentos')return p.ipobserv||`Instrumento de planificación · código ${p.ipcateg??'—'}`;
 if(key==='redensificacion')return p.me3Nmb||'Área de redensificación y renovación';
 return key.replaceAll('_',' ');
}
function categoryDescription(key,p){
 if(key.endsWith('2014'))return 'Polígono de la geodatabase POT 2014 vigente, en la versión actualizada disponible en 2026. La capa identifica una condición cartográfica de 2014; para acreditar una modificación normativa es necesario contrastar el articulado y la delimitación de la propuesta.';

 if(key==='condicion_riesgo')return `El polígono pertenece a la capa de áreas con condición de riesgo. Condición indicada: ${short(p.acrdetmi)}. No equivale automáticamente a riesgo no mitigable.`;
 if(key==='condicion_amenaza')return `El polígono pertenece a la capa de áreas con condición de amenaza. Condición indicada: ${short(p.acadetmi)}. No equivale automáticamente a prohibición absoluta de construir.`;
 if(key==='amenaza')return `Área clasificada en la cartografía temática de amenaza de la propuesta. Descripción del estudio: ${short(p.zadetalle)}. Las categorías numéricas exigen corroboración normativa y técnica.`;
 if(key==='asentamientos')return 'Área inventariada como asentamiento humano de desarrollo incompleto en la propuesta. No implica por sí misma reconocimiento, legalización o un cambio normativo aprobado.';
 if(key==='planes_parciales')return `Figura en la capa de planes parciales de la propuesta, estado registrado: ${short(p.Estado)}. Estar dentro del polígono no demuestra por sí solo cuál trámite urbanístico es obligatorio.`;
 if(key==='instrumentos')return `El polígono forma parte de la capa de instrumentos de planificación de 2026. Su campo de observaciones dice «${short(p.ipobserv)}». Los requisitos y excepciones deben cotejarse con el articulado.`;
 if(key==='tratamientos')return 'El polígono está identificado en la capa de tratamiento urbanístico de la propuesta de 2026. Falta confirmar la equivalencia jurídica del código y su correspondencia con 2014.';
 if(key==='areas_actividad')return 'La propuesta contiene esta zona de actividad. Los códigos deben interpretarse con el articulado y tablas de usos, no como permisos automáticos de construir.';
 if(key==='clasificacion')return 'La propuesta delimita esta clasificación del suelo. Para confirmar un cambio respecto de 2014 falta superponer la capa histórica equivalente.';
 if(key==='centros_poblados'||key==='norma_rural')return 'Información rural de la propuesta de 2026, sin equivalencia espacial 2014 procesada todavía.';
 if(key==='redensificacion')return 'Área identificada en el modelo de ordenamiento territorial propuesto; no equivale por sí sola a un incremento comprobado de edificabilidad.';
 return 'Zona identificada en la cartografía de la propuesta de POT de 2026.';
}
function displayAttributes(props){const omit=new Set(['_key','_uid','Shape_Length','Shape_Area','SHAPE_Length','SHAPE_Area']);let entries=Object.entries(props||{}).filter(([k,v])=>!omit.has(k)&&v!==null&&v!==''&&typeof v!=='object');return entries.slice(0,13).map(([k,v])=>`<div class="info-pair"><span>${escapeHtml(k)}</span><strong>${escapeHtml(short(v))}</strong></div>`).join('')}
function showTab(tab){state.tab=tab;['data','compare','benefits'].forEach(t=>{el('tab-'+t).setAttribute('aria-selected',String(t===tab))});renderDetail()}
// Highlight rendered in a separate high-priority pane: visible above all zoning layers.
function clearHighlight(){if(state.highlight){state.map.removeLayer(state.highlight);state.highlight=null}el('map-barrio-pill').hidden=true;el('clear-selection').hidden=true;el('selection-card').hidden=true}
function setHighlight(feature){
 clearHighlight();
 state.highlight=L.geoJSON(feature,{pane:'selectedBarrioPane',interactive:false,style:{color:'#9e600d',weight:4.5,opacity:1,fillColor:'#ffd24a',fillOpacity:.42,dashArray:null}}).addTo(state.map);
 const p=feature.properties||{};
 el('map-barrio-name').textContent=p.barrio||'Barrio seleccionado';el('map-barrio-pill').hidden=false;el('clear-selection').hidden=false;
 el('selection-card-title').textContent=p.barrio||'Barrio';
 el('selection-card-meta').textContent=`Comuna ${p.comuna||'—'} · código ${p.codigo||'—'} · fuente cartográfica 2026`;
 el('selection-card').hidden=false;
}
function focusBarrio(layer){
 const bounds=layer?.getBounds?.();if(!bounds?.isValid())return;
 state.map.invalidateSize({pan:false});
 state.map.fitBounds(bounds,{paddingTopLeft:[45,48],paddingBottomRight:[45,48],maxZoom:15,animate:true,duration:.5});
}
function resetTerritoryView(){
 const bounds=state.calibounds;
 state.map.invalidateSize({pan:false});
 if(bounds?.isValid())state.map.fitBounds(bounds,{padding:[24,24],maxZoom:12,animate:true});
 else state.map.setView([3.43,-76.54],12);
}
function clearSelection(){
 state.selected=null;state.globalSismo=false;clearHighlight();
 el('detail-title').textContent='Selecciona un polígono';
 el('detail-subtitle').textContent='Busca o haz clic en un barrio para ver su comparación territorial.';
 el('search').value='';el('search-results').innerHTML='';renderDetail();
}
function selectFeature(key,feature,layer){
 clearHighlight();state.selected={key,feature,layer};state.globalSismo=false;
 el('detail-title').textContent=findTitle(key,feature.properties||{});
 el('detail-subtitle').textContent='Ficha cartográfica · '+(key.endsWith('2014')?'POT 2014 vigente':'Propuesta 2026');renderDetail();
}
function selectBarrio(feature,layer){
 state.selected={key:'barrio',feature,layer};state.globalSismo=false;
 const p=feature.properties||{};
 el('detail-title').textContent=p.barrio||'Barrio';
 el('detail-subtitle').textContent=`Comuna ${p.comuna||'—'} · cartografía oficial ${state.barriosVersion}`;
 setHighlight(feature);showTab('compare');focusBarrio(layer);
}
function allBarrioEntries(clave,take=5){const codigo=String(state.selected?.feature?.properties?.codigo??'');const b=state.barriosResumen?.barrios?.[codigo];return b?.capas?.[clave]?.categorias?.slice(0,take)||[]}
function listBarrioEntries(clave,year){
 const records=allBarrioEntries(clave,5);
 if(!state.barriosResumen)return '<p class="small-wait">Cargando cruces espaciales del POT…</p>';
 if(!records.length)return '<p class="no-coverage">No se identificó intersección en esta capa. Esto no equivale a ausencia de regulación.</p>';
 return `<ul class="spatial-list">${records.map(x=>`<li><strong>${escapeHtml(x.nombre)}${x.codigo_original?` <small>(código ${escapeHtml(x.codigo_original)})</small>`:''}</strong><span>${escapeHtml(String(x.hectareas))} ha · ${escapeHtml(String(x.porcentaje_barrio))}% del barrio</span>${clave==='edificabilidad2014'&&x.atributos?.ICA?`<small>Índice adicional registrado: ${escapeHtml(x.atributos.ICA)}</small>`:''}</li>`).join('')}</ul>`;
}
function compareBarrioRow(title,a,b,notes){
 return `<div class="record barrio-card"><span class="kicker">${escapeHtml(title)}</span><div class="comparison-grid"><div class="period"><b>POT 2014 · vigente</b>${listBarrioEntries(a,'2014')}</div><div class="period next"><b>Propuesta POT 2026</b>${b?listBarrioEntries(b,'2026'):'<p class="no-coverage">La capa equivalente no contiene información para una comparación verificada.</p>'}</div></div><p class="compare-caution">${escapeHtml(notes)}</p></div>`;
}
function renderTransicionesBarrio(info){
 const tran=info?.transiciones_tratamiento||[];
 if(!tran.length)return '<div class="record"><strong>Transiciones de tratamiento</strong><p>Sin cruces suficientes para mostrar una transición territorial.</p></div>';
 return `<div class="record"><span class="kicker">Misma área · dos cartografías</span><strong>Transiciones espaciales de tratamiento</strong><p>Esta tabla cruza geometrías del POT 2014 vigente y de la propuesta 2026, dentro del barrio seleccionado.</p><div class="transition-list">${tran.filter(x=>x.hectareas>=0.02).slice(0,7).map(x=>`<div class="transition"><div><span>2014</span><strong>${escapeHtml(x.desde)}</strong></div><div class="transition-arrow">→</div><div><span>Propuesta 2026</span><strong>${escapeHtml(x.hacia)}</strong><small>${x.hectareas} ha · ${x.porcentaje_barrio}% del barrio</small></div></div>`).join('')}</div><p class="compare-caution">Una transición cartográfica no prueba por sí sola un aumento de edificabilidad, un incentivo ni la eliminación de la obligación de plan parcial. Se deben verificar las normas y excepciones.</p></div>`;
}

/** Reglas generales de los articulados; nunca constituyen certificado predial. */
function codigoTratamiento(c,periodo){
 if(periodo==='2026'){
  const map={'1':'CON','2':'CON','3':'C1','4':'C2','5':'C3','6':'C4','7':'D1','8':'D2','9':'MI','10':'R1','11':'R2'};
  return map[String(c.codigo_original)]||null;
 }
 const cod=String(c.atributos?.CODIGO||'').toUpperCase().trim();
 if(['C1','C2','C3','R1','R2','R3','DE'].includes(cod))return cod;
 const n=String(c.nombre||'').toUpperCase();
 if(n.startsWith('CONSERVACION'))return 'CON';
 if(n.startsWith('DESARROLLO'))return 'DE';
 return null;
}
function referenciasRegla(r){return `${escapeHtml(r.fuente)}, art. ${escapeHtml(r.articulos)} · págs. ${escapeHtml(r.pagina_documento)}.`}
function renderReglasBarrio(info){
 if(!state.normasGestion)return '<div class="record"><strong>Verificando artículos y modalidades…</strong><p>Cargando matriz normativa.</p></div>';
 const n=state.normasGestion;
 if(!info)return '<div class="record"><strong>Sin análisis territorial cargado</strong><p>Primero se deben cargar los cruces geográficos del barrio.</p></div>';
 const present=[];
 for(const [p,k] of [['2014','tratamientos2014'],['2026','tratamientos2026']]){
   const cats=info.capas?.[k]?.categorias||[];
   for(const c of cats){const cd=codigoTratamiento(c,p);if(!cd||c.hectareas<0.03)continue;present.push({periodo:p,codigo:cd,ha:c.hectareas,nombre:c.nombre})}
 }
 const blocks=['2014','2026'].map(year=>{
  const selected=present.filter(x=>x.periodo===year);
  if(!selected.length)return `<div class="record"><strong>${year==='2014'?'POT 2014 vigente':'Propuesta 2026'}</strong><p>No se identificaron tratamientos codificables en el resumen espacial.</p></div>`;
  const rules=n.reglas.filter(r=>r.anio===year&&r.codigos.some(t=>selected.some(c=>c.codigo===t)));
  const descriptions=selected.slice(0,8).map(c=>`<li><b>${escapeHtml(c.nombre)}</b> · ${escapeHtml(String(c.ha))} ha</li>`).join('');
  return `<div class="record"><span class="kicker">${year==='2014'?'Normativa vigente':'Propuesta, no vigente'}</span><strong>Tratamientos identificados · ${year}</strong><ul class="compact-conditions">${descriptions}</ul>${rules.map(r=>`<div class="regla-card"><span class="rule-type">${escapeHtml(r.tipo)}</span><b>${escapeHtml(r.titulo)}</b><p>${escapeHtml(r.condicion)}</p><small>${referenciasRegla(r)}</small></div>`).join('')}</div>`;
 }).join('');
 return `<div class="record norm-alert"><strong>¿Es obligatorio un plan parcial en este barrio?</strong><p><b>No se puede responder con una sola regla para todo el barrio.</b> Las siguientes condiciones están asociadas a tratamientos que intersectan su área; cada predio puede tener otra situación de urbanización, delimitación y obligaciones.</p><span class="tag">Lectura de artículos verificada · aplicación por predio pendiente</span></div>`+blocks;
}
function renderHomologacionBarrio(info){
 const n=state.normasGestion;
 if(!n)return '<div class="record"><p>Cargando homologación normativa…</p></div>';
 const p14=(info?.capas?.tratamientos2014?.categorias||[]).map(x=>codigoTratamiento(x,'2014'));
 const p26=(info?.capas?.tratamientos2026?.categorias||[]).map(x=>codigoTratamiento(x,'2026'));
 const families=new Set();
 const check=(c)=>{if(!c)return;if(c.startsWith('C')&&c!=='CON')families.add('Consolidación');else if(c.startsWith('R'))families.add('Renovación');else if(['D1','D2','DE'].includes(c))families.add('Desarrollo');else if(c==='MI')families.add('Mejoramiento integral');else if(c==='CON')families.add('Conservación')};
 [...p14,...p26].forEach(check);
 const rows=n.homologacion.filter(r=>families.has(r.familia));
 if(!rows.length)return '';
 return `<div class="record"><span class="kicker">Homologación por familias · lectura del articulado</span><strong>¿Significan lo mismo los códigos?</strong><p>Los siguientes grupos aparecen en los tratamientos que intersectan el barrio. La coincidencia de código no significa identidad jurídica.</p>${rows.map(r=>`<div class="regla-card"><b>${escapeHtml(r.familia)}</b><div class="comparison-grid"><div class="period"><b>2014</b><p>${escapeHtml(r['2014'])}</p></div><div class="period next"><b>2026</b><p>${escapeHtml(r['2026'])}</p></div></div><p>${escapeHtml(r.lectura)}</p><small>2014: arts. ${escapeHtml(r.arts2014)} · propuesta 2026: arts. ${escapeHtml(r.arts2026)}</small></div>`).join('')}</div>`;
}
function renderClavesGenerales(){
 const n=state.normasGestion;
 if(!n)return '';
 return `<div class="record"><span class="kicker">Comparación general de los articulados</span><strong>Cambios procedimentales para investigar</strong>${n.comparaciones.map(c=>`<details class="norm-detail"><summary>${escapeHtml(c.tema)}</summary><div class="comparison-grid"><div class="period"><b>2014</b><p>${escapeHtml(c.antes)}</p></div><div class="period next"><b>Propuesta 2026</b><p>${escapeHtml(c.propuesta)}</p></div></div><p>${escapeHtml(c.interpretacion)}</p><small>${escapeHtml(c.ref2014)}. ${escapeHtml(c.ref2026)}</small></details>`).join('')}</div>`;
}
function renderGlosarioGestion(){return `<div class="record"><span class="kicker">Evitar confusión tributaria</span><strong>ICA tiene dos significados distintos</strong><p><b>ICA urbanístico</b> = Índice de Construcción Adicional, previsto en instrumentos del POT propuesto (arts. 616 y 620).</p><p><b>ICA tributario</b> = Impuesto de Industria y Comercio. Una exención de este impuesto requiere una disposición tributaria expresa y no surge de mencionar el índice urbanístico.</p><p><b>ICP</b> = Índice de Construcción Progresivo; su utilización puede implicar cesiones adicionales.</p></div>`}
async function loadNormativaGestion(){try{const r=await fetch('data/normativa_gestion.json');if(!r.ok)throw Error('catálogo normativo no disponible');state.normasGestion=await r.json();renderDetail()}catch(e){console.warn('Catálogo normativo',e)}}

function renderBarrioTabs(p){
 const codigo=String(p.codigo??''); const info=state.barriosResumen?.barrios?.[codigo];
 if(state.tab==='data'){
  return `<div class="record"><span class="kicker">División territorial · capa oficial de barrios y sectores</span><strong>${escapeHtml(p.barrio||'Barrio o sector')} · comuna ${escapeHtml(p.comuna??'—')}</strong><p>Código: ${escapeHtml(codigo)} · Tipo: ${escapeHtml(p.tipo||'—')}.</p><p>Los límites de barrio permiten consultar qué normas <em>intersectan</em> el territorio, pero no determinan una única norma para todas sus edificaciones.</p><span class="tag">Cartografía 2014 y propuesta 2026 disponibles</span></div>`+
   (info?`<div class="record"><span class="kicker">Resumen geográfico</span><strong>Tratamientos por periodo</strong><div class="comparison-grid"><div class="period"><b>2014</b>${listBarrioEntries('tratamientos2014','2014')}</div><div class="period next"><b>Propuesta 2026</b>${listBarrioEntries('tratamientos2026','2026')}</div></div></div>`:'<div class="record"><strong>Cargando intersecciones por barrio…</strong></div>');
 }
 if(state.tab==='compare'){
  return `<div class="record"><span class="kicker">Comparación espacial calculada</span><strong>${escapeHtml(p.barrio||'Sector')} · POT 2014 / propuesta 2026</strong><p>Superficies calculadas por intersección espacial en hectáreas. Las categorías propuestas de 2026 se muestran con sus nombres, recuperados del dominio de valores de la geodatabase. <strong>No se consideran jurídicamente equivalentes</strong> a las de 2014 sin homologación del articulado.</p><span class="tag">Comparación cartográfica · revisión jurídica en curso</span></div>`+
  renderHomologacionBarrio(info)+renderTransicionesBarrio(info)+
  compareBarrioRow('Tratamientos urbanísticos','tratamientos2014','tratamientos2026','Se muestran los tratamientos identificados en ambas cartografías. Las diferencias espaciales no implican por sí mismas equivalencia jurídica ni cambio de obligaciones.')+
  compareBarrioRow('Áreas de actividad y usos','actividad2014','actividad2026','La categoría urbana 2014 no puede equipararse automáticamente a la nueva categoría 2026. No implica habilitación automática de usos.')+
  compareBarrioRow('Edificabilidad','edificabilidad2014',null,'La GDB 2014 contiene índices ICB/ICA; la capa de edificabilidad urbana 2026 consultada no registra polígonos. No se concluye aumento o reducción de aprovechamientos.')+
  compareBarrioRow('Planes parciales y condiciones de desarrollo','planes2014','planes2026','Que un plan parcial de 2014 no aparezca en la capa de propuestas 2026 NO significa que haya dejado de ser obligatorio. La exigencia, vigencia y trámite requieren revisión artículo por artículo.')+
  compareBarrioRow('Condicionamientos sísmicos y de riesgo','efectos_sismicos2014','condicion_riesgo2026','Son capas con conceptos y escalas diferentes; su comparación NO demuestra aumento ni reducción del riesgo. Verificar efectos de sitio, amenaza y estudios disponibles.')+
  renderClavesGenerales();
 }
  return `<div class="record"><span class="kicker">Gestión urbana y planes parciales</span><strong>¿Cambian los requisitos para desarrollar el suelo?</strong><p>Las normas generales del tratamiento ayudan a entender requisitos y alternativas. Un barrio puede contener distintos tratamientos y planes parciales. Eliminar un polígono del mapa no demuestra que se haya eliminado una obligación urbanística.</p><div class="comparison-grid"><div class="period"><b>Planes parciales POT 2014</b>${listBarrioEntries('planes2014','2014')}</div><div class="period next"><b>Planes parciales propuestos 2026</b>${listBarrioEntries('planes2026','2026')}</div></div></div>`+
   renderReglasBarrio(info)+
   `<div class="record"><span class="kicker">Instrumentos cartográficos de 2026</span>${listBarrioEntries('instrumentos2026','2026')}<p>En los ámbitos concretos hay que verificar mapa CU-02, CG-12, situación de urbanización, licencias y régimen de transición.</p></div>`+
   renderClavesGenerales()+renderGlosarioGestion();
}
async function loadBarrioResumen(){
 try{const response=await fetch('data/resumen_barrios.json');if(!response.ok)throw new Error('Archivo de cruces no disponible');state.barriosResumen=await response.json();if(state.selected?.key==='barrio')renderDetail();}
 catch(e){console.warn('Comparación de barrios:',e)}
}
function renderDetail(){let html='';const s=state.selected;
 if(state.globalSismo){html=renderSismo();el('detail-content').innerHTML=html;return}
 if(!s){el('detail-content').innerHTML='<div class="empty"><div class="empty-icon">◎</div><strong>Empieza por el mapa</strong><p>Haz clic en un polígono para consultar su ficha.</p></div>';return}
 const p=s.feature.properties||{};const barrio=s.key==='barrio';const year2014=s.key.endsWith('2014');if(barrio){el('detail-content').innerHTML=renderBarrioTabs(p)+`<div class="ref"><strong>Fuentes:</strong> GDB 2014 vigente actualizada; GDB propuesta 2026; barrios/sectores 2026. Cruces EPSG:6249 · noviembre 2026.<br><a href="${GEODB2014_URL}" target="_blank" rel="noopener">GDB POT 2014</a> · <a href="${GEODB_URL}" target="_blank" rel="noopener">GDB propuesta 2026</a></div>`;return}const typeLabel=LAYER_CONFIG.find(x=>x.key===s.key)?.label||s.key;
 if(state.tab==='data'){
  html=`<div class="record"><span class="kicker">${escapeHtml(typeLabel)}</span><strong>${escapeHtml(barrio?'División político-administrativa de referencia':(year2014?'POT 2014 vigente':'Propuesta POT 2026'))}</strong><p>${escapeHtml(categoryDescription(s.key,p))}</p>${year2014?'<span class="tag">POT 2014 · vigente</span>':'<span class="tag">Propuesta, no vigente</span>'}</div>`;
  html+=`<div class="record"><span class="kicker">Atributos disponibles</span><strong>Datos de la capa geográfica</strong>${displayAttributes(p)}</div>`;
 } else if(state.tab==='compare'){
  html=`<div class="record"><span class="kicker">Comparación 2014 / 2026</span><strong>${escapeHtml(barrio?'Barrio completo':'Polígono en estudio')}</strong><div class="comparison-grid"><div class="period"><b>POT 2014 · vigente</b><p>Información pendiente de revisión: falta cargar y cruzar la capa normativa homóloga.</p></div><div class="period next"><b>Propuesta 2026</b><p>${escapeHtml(barrio?'Aún no se ha efectuado la intersección del barrio con las zonas de norma.':findTitle(s.key,p))}</p></div></div><p><strong>Estado:</strong> diferencia normativa no calculada ni verificada. Los códigos de las capas de 2026 no demuestran por sí solos un cambio con respecto a 2014.</p></div>`;
 } else {
  html=`<div class="record"><span class="kicker">Instrumentos, condiciones y beneficios</span><strong>Verificación jurídica pendiente</strong><p>La presencia en una capa de plan parcial, tratamiento o área de actividad <strong>no prueba</strong> que se haya eliminado un requisito de plan parcial, que cambien las cesiones, o que exista una exención de ICA o plusvalía.</p><p>Para afirmar un cambio debe verificarse su artículo en 2014, el artículo propuesto en 2026, su aplicabilidad al polígono, las excepciones y las obligaciones que permanecen.</p><span class="tag">Sin beneficio comprobado en esta ficha</span></div>`;
 }
 html+=`<div class="ref"><strong>Fuente cartográfica:</strong> ${year2014?'GDB POT 2014, capa '+escapeHtml(s.key):'GDB propuesta POT 2026, capa '+escapeHtml(s.key)}.<br><strong>Fecha y estado:</strong> noviembre de 2026 · revisión en curso.${!barrio?`<br><a target="_blank" rel="noopener" href="${year2014?GEODB2014_URL:GEODB_URL}">Consultar carpeta de origen ↗</a>`:`<br><a target="_blank" rel="noopener" href="${SOURCE_BARRIOS}">Ver metadatos oficiales de barrios 2026 ↗</a>`}</div>`;
 el('detail-content').innerHTML=html;
}
function renderSismo(){
 if(state.tab==='data')return '<div class="record"><span class="kicker">Comparación normativa general</span><strong>Microzonificación sísmica de Cali</strong><p>Las dos disposiciones mantienen la aplicación del Decreto municipal 0158 de 2014 para parámetros de diseño sismorresistente.</p><p>Esta lectura es de alcance distrital y no localiza la zona 4C ni identifica normas diferenciadas de edificabilidad.</p><span class="tag">Artículos verificados</span></div>';
 if(state.tab==='compare')return '<div class="record"><strong>Obligaciones expresamente enunciadas</strong><div class="comparison-grid"><div class="period"><b>POT 2014 · art. 55</b><p>Ordena gestionar la actualización cuando exista información derivada de la Red de Acelerógrafos de Cali (RAC) o de estudios técnicos.</p></div><div class="period next"><b>Propuesta 2026 · art. 80</b><p>Mantiene actualización con nueva información técnica de estudios públicos, académicos y privados, sin mencionar expresamente la RAC.</p></div></div><p>No significa que la red haya sido derogada: indica una diferencia en la redacción de estos artículos.</p><div class="ref">Acuerdo 0373 de 2014, p. 51 (art. 55). Proyecto de Acuerdo 2026, pp. 78-79 (art. 80).</div></div>';
 return '<div class="record"><strong>¿Quién gana o pierde?</strong><p>No es posible atribuir un beneficio económico o una flexibilización de exigencias de diseño por el cambio de redacción del artículo 80. Hacen falta estudios específicos y la revisión de otros artículos y normas complementarias.</p></div>';
}
function layerStyle(config){return {color:config.color,fillColor:config.color,fillOpacity:config.key==='clasificacion'?.16:.25,weight:config.key==='clasificacion'?1.2:1.6,opacity:.94}}
function getFeatureBounds(layer){try{return layer.getBounds()}catch{return null}}
async function loadLayer(config){
 if(state.geo[config.key])return state.geo[config.key];
 const resp=await fetch('data/'+config.key+'.geojson');if(!resp.ok)throw Error('No disponible: '+config.key);
 const geo=await resp.json();state.geo[config.key]=geo;
 const group=L.geoJSON(geo,{style:()=>layerStyle(config),onEachFeature:(feature,layer)=>{
   layer.on('click',e=>{L.DomEvent.stopPropagation(e);selectFeature(config.key,feature,layer);});
   const title=findTitle(config.key,feature.properties||{});layer.bindTooltip(escapeHtml(title),{sticky:true,direction:'top'});
   if(['planes_parciales','centros_poblados','norma_rural','instrumentos','asentamientos'].includes(config.key)){
     state.featureIndex.push({label:title,secondary:config.label,feature,layer,key:config.key});
   }
 }});
 state.layers[config.key]=group;if(state.active.has(config.key))group.addTo(state.map);
 return geo;
}
async function toggleLayer(key,yes){const config=LAYER_CONFIG.find(x=>x.key===key);if(!config)return;const item=document.querySelector('[data-key="'+key+'"]');item?.classList.toggle('active',yes);if(yes){state.active.add(key);try{await loadLayer(config);state.layers[key]?.addTo(state.map)}catch(e){el('map-status').textContent='No se pudo cargar '+config.label;console.error(e)}}else{state.active.delete(key);if(state.layers[key])state.map.removeLayer(state.layers[key])}}
function createToggles(){
 const groups=[
  {title:'POT 2014 · vigente',description:'Cartografía normativa y amenazas',keys:['tratamientos2014','planes2014','edificabilidad_zonas2014','efectos_sismicos2014','inundacion_fluvial2014'],open:false},
  {title:'Propuesta 2026 · norma y gestión',description:'Tratamientos, usos y planes parciales',keys:['clasificacion','tratamientos','areas_actividad','planes_parciales','planes_previos','instrumentos','redensificacion'],open:true},
  {title:'Propuesta 2026 · riesgo y hábitat',description:'Amenaza, riesgo y asentamientos',keys:['amenaza','condicion_riesgo','condicion_amenaza','asentamientos'],open:false},
  {title:'Propuesta 2026 · rural',description:'Centros poblados y categorías rurales',keys:['centros_poblados','norma_rural'],open:false}
 ];
 const item=(c)=>`<label class="layer-item ${c.default?'active':''}" data-key="${c.key}"><input type="checkbox" data-layer="${c.key}" ${c.default?'checked':''}><i class="layer-mark" style="background:${c.color}"></i><span><strong>${escapeHtml(c.label.replace(' · 2014',''))}</strong><small>${c.n} polígonos · ${c.period==='2014'?'vigente':'propuesta'}</small></span></label>`;
 el('layers').innerHTML=groups.map(g=>`<details class="layer-group" ${g.open?'open':''}><summary><span class="layer-group-icon" aria-hidden="true">▸</span><span class="layer-group-label"><strong>${escapeHtml(g.title)}</strong><small>${escapeHtml(g.description)}</small></span><span class="group-count">${g.keys.length}</span></summary><div class="layer-group-content">${g.keys.map(k=>item(LAYER_CONFIG.find(c=>c.key===k))).join('')}</div></details>`).join('');
 el('layer-count').textContent=LAYER_CONFIG.length+' capas';
 document.querySelectorAll('[data-layer]').forEach(box=>box.addEventListener('change',e=>toggleLayer(e.currentTarget.dataset.layer,e.currentTarget.checked)));
}
function selectSearchItem(item){el('search-results').innerHTML='';el('search').value=item.label;
 if(item.key==='barrio'){const layer=state.barrioMap.get(item.feature);if(layer){selectBarrio(item.feature,layer);if(window.innerWidth<=970)el('map').scrollIntoView({behavior:'smooth',block:'center'})}}
 else {if(!state.active.has(item.key)){const checkbox=document.querySelector('[data-layer="'+item.key+'"]');if(checkbox){checkbox.checked=true;toggleLayer(item.key,true)}}selectFeature(item.key,item.feature,item.layer);state.map.fitBounds(item.layer.getBounds(),{padding:[32,32]})}
}
function showResults(q){const normalized=q.trim().toLocaleLowerCase('es');if(normalized.length<2){el('search-results').innerHTML='';return}
 const combined=[...(state.barrios||[]),...state.featureIndex];const selected=combined.filter(x=>`${x.label} ${x.secondary}`.toLocaleLowerCase('es').includes(normalized)).slice(0,9);
 const holder=el('search-results');holder.replaceChildren();if(!selected.length){holder.textContent='No se encontraron coincidencias con las capas cargadas.';return}selected.forEach(item=>{const btn=document.createElement('button');btn.type='button';btn.className='search-result';const span=document.createElement('span');const strong=document.createElement('strong');strong.textContent=item.label;const small=document.createElement('small');small.textContent=item.secondary;span.append(strong,small);btn.append(span);btn.addEventListener('click',()=>selectSearchItem(item));holder.append(btn)});
}
async function loadNeighborhoods(){
 try{
   // If the official 2026 layer is downloaded into this file, it takes priority over the remote historical reference.
   let response=await fetch('data/barrios.geojson');let geo=null;let version='2026';
   if(response.ok){geo=await response.json()}
   else {const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);try{response=await fetch(BARRIOS_URL,{signal:controller.signal});if(response.ok)geo=await response.json();version='2024'}finally{clearTimeout(timer)}}
   if(!geo||!Array.isArray(geo.features)||!geo.features.length)return;
   const layer=L.geoJSON(geo,{pane:'barriosPane',style:{color:'#275b64',weight:1.15,opacity:.76,fillOpacity:.025,fillColor:'#eaf4ec'},onEachFeature:(feature,sub)=>{sub.on('click',e=>{L.DomEvent.stopPropagation(e);selectBarrio(feature,sub)});state.barrioMap.set(feature,sub);sub.bindTooltip(escapeHtml(feature.properties?.barrio||'Barrio'),{sticky:true})}});
   state.barriosVersion=version;state.barriosGeo=layer;
   state.barrios=geo.features.filter(f=>f.properties?.barrio).map(f=>({label:f.properties.barrio,secondary:'Barrio · comuna '+(f.properties.comuna||'—')+' · referencia '+version,feature:f,key:'barrio'}));
   state.calibounds=layer.getBounds();
   if(state.barriosVisible)layer.addTo(state.map);
   // Initial view is the city itself, not the larger rural extent of some planning layers.
   if(!state.selected)resetTerritoryView();
   el('map-status').textContent=`${state.barrios.length} barrios y sectores · cartografía ${version}`;
 }catch(e){el('map-status').textContent='Mapa de zonas normativas · descarga de barrios no disponible';console.warn('Consulta opcional de barrios:',e)}
}
async function init(){
 if(!window.L){document.getElementById('map').innerHTML='<div style="padding:24px;color:#783e32">No se pudo cargar la biblioteca gratuita Leaflet. Comprueba tu conexión y vuelve a abrir la página.</div>';return}
 state.map=L.map('map',{zoomControl:true,preferCanvas:true,maxZoom:19}).setView([3.43,-76.54],12);state.map.attributionControl.setPrefix(false);
 state.map.createPane('barriosPane');state.map.getPane('barriosPane').style.zIndex=455;
 state.map.createPane('selectedBarrioPane');state.map.getPane('selectedBarrioPane').style.zIndex=685;state.map.getPane('selectedBarrioPane').style.pointerEvents='none';
 const tileUrl='https://tile.openstreetmap.org/{z}/{x}/{y}.png';state.base=L.tileLayer(tileUrl,{maxZoom:19,attribution:'© OpenStreetMap contributors',crossOrigin:true}).addTo(state.map);
 createToggles();LAYER_CONFIG.filter(c=>c.default).forEach(c=>state.active.add(c.key));
 const statuses=await Promise.allSettled(LAYER_CONFIG.filter(c=>c.default).map(c=>loadLayer(c)));
 if(statuses.every(s=>s.status==='rejected'))el('map-status').textContent='No se pudieron cargar las capas. Abre el sitio mediante un servidor HTTP.';
 else{el('map-status').textContent='Capas listas · busca un barrio o haz clic sobre el mapa';}
 // Fetch remote barrio dataset only as an optional reference. Local cartography remains usable without it.
 loadNeighborhoods();loadBarrioResumen();loadNormativaGestion();
 el('search').addEventListener('input',event=>showResults(event.target.value));
 ['data','compare','benefits'].forEach(t=>el('tab-'+t).addEventListener('click',()=>showTab(t)));
 el('seismic-btn').addEventListener('click',()=>{clearHighlight();state.globalSismo=true;state.selected=null;el('detail-title').textContent='Microzonificación sísmica';el('detail-subtitle').textContent='Comparación distrital verificada · artículos 55 y 80';showTab('compare')});
 el('base-toggle').addEventListener('click',()=>{state.map.hasLayer(state.base)?state.map.removeLayer(state.base):state.base.addTo(state.map)});
 el('reset-map').addEventListener('click',resetTerritoryView);
 el('clear-selection').addEventListener('click',clearSelection);
 el('barrios-visible').addEventListener('change',(event)=>{state.barriosVisible=event.currentTarget.checked;if(!state.barriosGeo)return;if(state.barriosVisible)state.barriosGeo.addTo(state.map);else state.map.removeLayer(state.barriosGeo)});
 window.addEventListener('resize',()=>state.map.invalidateSize({pan:false}));
 const mapContainer=el('map');if(window.ResizeObserver){new ResizeObserver(()=>state.map.invalidateSize({pan:false})).observe(mapContainer);}
}
window.addEventListener('DOMContentLoaded',init);
