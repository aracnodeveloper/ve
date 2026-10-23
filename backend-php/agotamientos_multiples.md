# Agotamiento de ofertas con VARIAS fechas (`tbl_oferta_agotada`)

Antes una oferta tenía **un** rango de agotamiento, en `tbl_oferta.fecha_hora`
(inicio) y `tbl_oferta.fecha_hora_fin` (fin). Ahora puede tener **N rangos**, en
la tabla nueva `tbl_oferta_agotada`.

**Regla:** la oferta está agotada si la fecha evaluada cae dentro de **alguno**
de sus rangos. Dentro de cada rango se mantiene la regla de siempre: un extremo
vacío deja ese lado abierto; sin fechas, disponible.

En `ve` la comparación se hace contra el **día de check-in** que busca el cliente
(no contra "hoy"), así que agotar el jueves no afecta a quien reserva el lunes.

## 1) SQL (ejecutar ANTES de desplegar el PHP)

`oferta_agotada.sql`: crea la tabla, migra los rangos que ya existían en
`tbl_oferta` y deja esas dos columnas en NULL.

## 2) Compatibilidad con los clientes viejos

Las columnas `fecha_hora` / `fecha_hora_fin` **no se eliminan** y el API las
sigue publicando en el payload de cada oferta, pero ya no se leen de la BD: se
calculan con el rango **vigente** y, si no hay ninguno vigente, con el **próximo**
(`rangoAgotamientoPrincipal`). Así la app móvil y cualquier cliente que todavía
lea un solo rango siguen funcionando sin cambios; solo no ven los rangos que
vienen después del primero.

Para que la app evalúe también la lista completa habría que leer `agotamientos`
en `lib/global/ofertas_pricing.dart` (pendiente, no es bloqueante).

## 3) Archivos

### Servidor `ve` (apiv1.7/hoteles/)
- `oferta_agotada.sql` — tabla + migración.
- `hotelesNew.php`
  - `getAgotamientosOfertas($ids)` — rangos de varias ofertas en una consulta.
  - `rangoAgotamientoPrincipal($rangos)` — el vigente o el próximo (compatibilidad).
  - `listarAgotamientosOferta`, `guardarAgotamientosOferta`, `eliminarAgotamientoOferta`,
    `rangosSeSolapan` — alta/baja desde el administrador.
  - `ofertaAgotadaAhora()` evalúa la lista (y cae al rango único si no la recibe).
  - `verOfertas` / `verROfertas`: publican `agotamientos` y calculan
    `fecha_hora` / `fecha_hora_fin`.
  - `addReserva()`: bloquea la reserva si algún rango está vigente.
- `gestionarAgotamientos.php` **(nuevo)** — `POST /v1.7/est/gestionarAgotamientos/`
  con `accion`: `listar` (por `id_tbl_oferta` o por lote con `ids_ofertas`),
  `guardar` (lista completa de `rangos`) y `eliminar` (`id_tbl_oferta_agotada`).

### Frontend `ve` (rebuild)
- `global/ofertasPricing.js` — `esOfertaAgotada()` evalúa todos los rangos;
  `rangoAgotamientoAplicable()` devuelve la ventana que bloquea la búsqueda,
  `proximaFechaDisponible()` encadena ventanas pegadas y `textoAgotada(oferta, checkIn)`
  arma el cartel; `periodosAgotados()` lista todas las ventanas vigentes o futuras.
- `controllers/establecimiento/establecimientoController.jsx` — mapea
  `agotamientos` → `Oferta.Agotamientos`.
- `HotelOfertas.jsx` / `HotelRoomItem.jsx` — pasan el check-in al cartel y, cuando
  hay más de una ventana, muestran la lista completa debajo.

### App móvil (`visita_ecuador_app`, rebuild)
- `lib/global/ofertas_pricing.dart` — port exacto del web: `rangosAgotamiento`,
  `esOfertaAgotada` sobre todas las ventanas, `rangoAgotamientoAplicable`,
  `proximaFechaDisponible`, `textoAgotada(oferta, [checkIn])` y `periodosAgotados`.
  Si el payload no trae `agotamientos`, sigue usando `fecha_hora`/`fecha_hora_fin`.
- `lib/ui/hotel/habitaciones/habitacion_Item.dart` — cartel con la ventana que
  bloquea y, con varias, la lista completa.

### Frontend administrador (rebuild)
- `AgotamientosOferta.jsx` **(nuevo)** — editor de N rangos por oferta.
- `TabOfertasEstablecimiento.jsx` — carga los rangos del establecimiento en una
  sola llamada, badges ("Agotada hasta …", "Agotamiento programado: …", "N fechas")
  y botón `Agotamiento (N)` que abre el editor. El formulario de la oferta ya no
  edita el agotamiento.
- `EstablecimientosController.jsx` / `EstablecimientosService.jsx` —
  `listarAgotamientosOfertas`, `listarAgotamientosOferta`, `guardarAgotamientosOferta`.

`gestionarOfertas.php` no se tocó: su `accion: "agotar"` escribe las columnas
viejas, que ya nadie lee. Conviene quitarla cuando se despliegue esto.

## 4) Validaciones

En el servidor (y repetidas en el admin para avisar antes): cada rango necesita
al menos una fecha, el fin debe ser posterior al inicio y los rangos de una
misma oferta no pueden cruzarse entre sí.
