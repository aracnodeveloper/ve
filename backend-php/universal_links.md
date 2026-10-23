# iPhone abre la app en lugar del administrador

## Qué pasa

`https://visitaecuador.com/.well-known/apple-app-site-association` (AASA) declara
hoy:

```json
{ "appID": "37NBZZTJYT.com.visitaEcuador.ec", "paths": [ "*" ] }
```

`"*"` significa **todas las rutas del dominio**, así que iOS trata cualquier URL de
visitaecuador.com como universal link y la abre en la app: el administrador, el
administrador beta (`/administrador2/`), la web nueva, todo.

Y una vez dentro, la app no sabe qué hacer con esa ruta. En `lib/root_ui.dart`
solo se atienden `/compra`, `/pack/`, `/suscripcion` y `/ugkL`; el resto cae en el
`else`, que reabre el link en el navegador (y en arranque en frío ni eso: ahí no
hay `else`, así que la app se queda en el inicio).

En Android no pasa porque el `AndroidManifest.xml` sí acota las rutas
(`pathPrefix="/pack"` y `/compra`). El AASA de iOS quedó con el comodín.

## Arreglo

`apple-app-site-association` (en este mismo directorio) deja en iOS el mismo
alcance que ya tiene Android: solo las rutas que la app realmente atiende, y
además excluye explícitamente `/administrador*`.

Trae las dos formas a propósito:

- `components` — iOS 13+, es la que manda. Primero la regla `exclude` del
  administrador, después las rutas permitidas.
- `paths` por cada `appID` — iOS 12 y anteriores, que ignoran `components`.
  (En ese formato el `NOT` tiene que ir **antes** de las reglas que permiten.)

### Desplegar

1. Subir el archivo a `/.well-known/apple-app-site-association` en la raíz de
   visitaecuador.com (**sin extensión**, reemplazando el actual).
2. Servirlo como JSON: hoy la respuesta no trae `Content-Type` (Apache no lo
   deduce porque el archivo no tiene extensión). En el vhost o en el `.htaccess`
   de la raíz:

   ```apache
   <Files "apple-app-site-association">
       ForceType application/json
   </Files>
   ```

3. Comprobar: `curl -sI https://visitaecuador.com/.well-known/apple-app-site-association`
   debe responder `200` y `Content-Type: application/json`.

### Importante sobre la caché

iOS no relee el AASA al instante: lo sirve la CDN de Apple y la app se queda con
la copia que bajó al instalarse. Para verificar en el iPhone, después de subir el
archivo hay que **desinstalar y reinstalar la app** (o esperar a la siguiente
actualización). Que siga abriéndose la app el mismo día no significa que el
archivo esté mal.

Mientras tanto, para entrar al administrador desde el iPhone: mantener pulsado el
enlace y elegir *Abrir en Safari*, o escribir la URL directamente en la barra de
direcciones (lo que se teclea en Safari nunca dispara un universal link).

## Si prefieren un cambio mínimo

Dejar el comodín y solo excluir el administrador:

```json
"paths": [ "NOT /administrador*", "*" ]
```

Funciona para este caso, pero deja todo lo demás (web nueva, blog, checkout)
abriendo la app para después rebotar al navegador. Por eso la versión que dejé
acota a las rutas reales.
