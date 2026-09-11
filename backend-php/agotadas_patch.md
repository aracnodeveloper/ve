# Ofertas agotadas — RANGO de fechas (`fecha_hora` … `fecha_hora_fin`)

**Regla única:** la oferta está agotada si la fecha evaluada cae **dentro del rango**:

| `fecha_hora` (inicio) | `fecha_hora_fin` (fin) | Resultado |
|---|---|---|
| vacío | vacío | Disponible siempre |
| 06/08 00:00 | 06/08 23:59 | Agotada **solo** ese día |
| vacío | 10/08 | Agotada hasta el 10/08 (comportamiento anterior) |
| 06/08 | vacío | Agotada del 06/08 en adelante |

En `ve` la comparación se hace contra el **día de check-in** que busca el cliente
(no contra "hoy"), así que agotar el jueves no afecta a quien reserva el lunes.

## 1) SQL requerido en la BD (ejecutar ANTES de desplegar)

```sql
ALTER TABLE tbl_oferta
  ADD COLUMN fecha_hora_fin DATETIME NULL DEFAULT NULL AFTER fecha_hora;
```

## 2) Migración de los datos existentes (IMPORTANTE)

Hasta ahora `fecha_hora` significaba **"agotada hasta"** (fin). Con el nuevo modelo
pasa a significar **inicio**, así que los registros actuales deben moverse al campo
nuevo o quedarían agotados indefinidamente:

```sql
UPDATE tbl_oferta
   SET fecha_hora_fin = fecha_hora,
       fecha_hora     = NULL
 WHERE fecha_hora IS NOT NULL;
```

(Esto conserva exactamente el comportamiento previo: agotada hasta esa fecha.)

## 3) Archivos modificados (desplegar)

### Servidor `ve`
- `hotelesNew.php`
  - `selectOfertas`: + `of.fecha_hora_fin fechaHoraAgotadoFin`.
  - `verOfertas` / `verROfertas`: exponen `fecha_hora` y `fecha_hora_fin`.
  - Nuevo helper `ofertaAgotadaAhora()`; los recomendados excluyen las agotadas.
  - `addReserva()`: rechaza reservar si AHORA cae dentro del rango.

### Frontend `ve` (rebuild)
- `ofertasPricing.js` → `esOfertaAgotada()` evalúa el rango contra el día de check-in.
- `establecimientoController.jsx` → mapea `fecha_hora_fin` → `Oferta.FechaHoraAgotadoFin`.
- `HotelOfertas.jsx` / `HotelRoomItem.jsx` → cartel con la fecha de fin y selector bloqueado.

### Servidor admin (apidev)
- `gestionarOfertas.php` → guarda ambas fechas y valida fin > inicio (también en `accion:"agotar"`).
- `getOfertas.php` / `getOferta.php` → devuelven `fecha_hora_fin`.

### Frontend admin (rebuild)
- `TabOfertasEstablecimiento.jsx` → dos `datetime-local` (desde / hasta) en el formulario
  y en el quick-toggle del listado; badge rojo "Agotada hasta …" cuando está vigente y
  badge ámbar "Agotamiento programado: …" cuando el rango aún no empieza.
