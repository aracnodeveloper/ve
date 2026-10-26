# Electromaps vs. puntos de carga de la web

Cruce de `electromaps.txt` (229 registros) con los tres listados del mapa (propios, Kia y Chevrolet), por distancia y nombre, revisado a mano.

- Ya están en la web: **todos** salvo los 3 por confirmar
- Faltan: **0**
- Por confirmar (mismo sitio o muy cerca, otro nombre): **3**
- Fuera de Ecuador (Perú y Colombia): **8**

Electromaps no trae la ciudad: la de los puntos importados sale de sus coordenadas (OpenStreetMap).

## Faltan

Ninguno: los que faltaban se importaron al mapa con `scripts/importarPuntosElectromaps.js`
(96 puntos: los que faltaban más 11 de Mavesa y Automekano; "Mavesa Ecuador" y "Asiauto Riobamba" resultaron duplicados). Van sin conectores, potencia
ni tarifa porque Electromaps no los publica en este listado; el cantón sale de las coordenadas.

## Por confirmar (3)

No se importaron para no duplicar: están a menos de 70 m de un punto nuestro con otro nombre.

| id Electromaps | Nombre | Coordenadas | Ciudad aprox. | Punto de la web más cercano |
|---|---|---|---|---|
| 661236 | Mall del Norte | -2.094169, -79.913259 | Guayaquil | PROMART a 61 m |
| 805198 | BYD - Evinka - PD | -0.262111, -79.114708 | Santo Domingo | KFC a 41 m |
| 583223 | MegaKywi - Tumbaco | -0.215445, -78.395175 | Quito | Supermaxi La Ceramica a 35 m |

## Fuera de Ecuador (8)

- Punta Sal Suites & Bungalows Resort (-3.9567, -80.9560)
- Hotel Punta Sal (-3.9563, -80.9560)
- Casa Andina Zorritos (-3.7107, -80.7248)
- Éxito Ipiales (0.8306, -77.6363)
- Exito Pasto Panamericana, Nariño (1.2064, -77.2860)
- Palermo Imagen (1.2238, -77.2862)
- MotorKia Pasto (1.2254, -77.2861)
- Hostal Padua (1.3441, -77.2840)
