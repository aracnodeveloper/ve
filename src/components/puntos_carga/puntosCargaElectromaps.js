/**
 * Puntos de carga de Electromaps que no estaban en nuestro listado ni en los de Kia y Chevrolet.
 *
 * ARCHIVO GENERADO por scripts/importarPuntosElectromaps.js a partir de backend-php/electromaps.txt:
 * no editar a mano. Volver a correr el script (después de los de Kia y Chevrolet) cuando cambie.
 *
 * 229 registros -> 96 puntos nuevos (Mavesa 6, Automekano 5; el resto sin convenio).
 * Ya estaban (125): Kia - Motricentro Loja, terminal terrestre binacional de santa rosa, troncal de la costa, BYD MACHALA, terminal de machala, Mall del Alto, Wayra Plaza, Parque de la Madre, Regional Centro Sur, Portal Artesanal, Mavesa Ecuador, BYD Cuenca, Mirasol Chevrolet - Matriz, Supermaxi Challuabamba, Automotores Continental Salinas, Supermaxi Salinas, Hotel Colón Salinas, Primax Alpaso Puerto Azul, Supermaxi Urdesa, Kia Motor, taller Servicentenario, BYD Auto Guayaquil, BYD Auto - Av. de las Americas, City Mall Guayaquil, Automotores Continental Orellana, Márbol Green Plaza, Av. Narcisa de Jesús Condor Charge, Parque Samanes, PLAZA LAGOS, Mall del Norte, Promart Guayaquil, Piazza Batan, Promart Samborondon, Gasolinera P&S, Estación MultiPlaza, Asiauto Riobamba, ASSA RIOBAMBA, Gasolinera Panamericana, Universidad Técnica de Ambato, Mall de Los Andes, ASSA Chevrolet Ambato, Concesionario Kia Ambato, Supermaxi Ficoa, Estación P&S El Jardín, Kia - Asiauto Portoviejo, Kia - Asiauto Manta 4 de Noviembre, MetroCar, Manta, Kia Asiauto Barbasquillo, Mall del Pacífico Manta, Maltearía Plaza, Kia - Asiauto Latacunga, Segurillanta Chone, San Luis Shopping, Byd San Rafael, EcuaAuto - Chevrolet - Valle de los Chillos, Supermaxi San Gabriel, Quicentro Sur, Estacionamiento Parque Carolo, Las Cuadras, Energycar Supermaxi San Bartolo, BYD - Evinka - PD, Hotel Santo Domingo, C.C. BOMBOLI AC, CC Bomboli DC, P&S Puerta de Oro, Carga Rápida Kia (Santo Domingo), Induauto Chevrolet Santo Domingo, Kia Empromotor vía Quito, Universidad Internacional del Ecuador - UIDE Quito, Parqueadero La Ronda, Estacionamiento Montúfar 1, El Potrero de San Luis Cumbaya, Estacionamiento Cadisan, Parqueadero San Blas, MegaKywi - Tumbaco, Asiauto Cumbayá, Hospital de los Valles, Scala Shopping Mall, KIA E-GROUND, Pilisimas Power Port - La Tejedora, Paseo San Francisco, BYD PASEO SAN FRANCISCO, Centro Comercial Villa Cumbayá, KIA Quito, BYD Cumbayá, Conectz, Parque la Carolina, Mall El Jardín, Plaza Marquesina, Parque de la Mujer, Rancho San Francisco, Plaza del Rancho, Megamaxi 6 de Diciembre, Centro Comercial Iñaquito, Plug and Drive - Evinka CCI, Quicentro Shopping, Plaza Las Américas, Pilisimas Power Port - Tofino, Supermaxi Granada Centeno, Granados Outlet Kia, BYD, Parqueadero Produbanco Clientes, CC El Bosque, Arrayanes Country Club, Automotores Continental Labrador - Chevrolet, MCDonald Av. de la Prensa, Galo Plaza Lasso parqueadero superior, Supermaxi Plaza Norte, McDonald's, Consecionario BYD Pananorte, Supermaxi San Carlos, Aeropuerto Mariscal Sucre, El Portal, Condado Shopping, Quito Tenis y Golf Club El Condado, Gasolinera Ultra NRG, BYD - EVINKA - Tierras Altas - Tabacundo, Plug and Drive - Tierras Altas - Tabacundo, Choco 112, Hosteria Balcon Alcala, Primax Puerto Quito, Hotel Restaurante Andy, P&S La Union, Hotel Puerto Lago, Pys electrolinera, Plug & Drive Hosteria el Prado - Ibarra, Hotel Kemarios.
 * Fuera de Ecuador (8): Punta Sal Suites & Bungalows Resort, Hotel Punta Sal, Casa Andina Zorritos, Éxito Ipiales, Exito Pasto Panamericana, Nariño, Palermo Imagen, MotorKia Pasto, Hostal Padua.
 * Conectores, potencia y costo de 8 de ellos: Open Charge Map (CC BY 4.0), de backend-php/chargemaps.txt.
 * Del resto, Electromaps no publica conectores, potencia, tarifa ni dirección. El cantón y
 * la provincia salen de las coordenadas (OpenStreetMap), ver geocodificarElectromaps.js.
 */
export const PUNTOS_ELECTROMAPS = [
    {
        "id": "em-454253",
        "categoria": "puntos",
        "nombre": "Automekano Ambato",
        "ciudad": "Ambato",
        "provincia": "Tungurahua",
        "convenio": "Automekano",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.234965,
            -78.611172
        ]
    },
    {
        "id": "em-884025",
        "categoria": "puntos",
        "nombre": "CONECTZ KFC Ambato",
        "ciudad": "Ambato",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.287046,
            -78.607286
        ]
    },
    {
        "id": "em-307334",
        "categoria": "puntos",
        "nombre": "ELECTROLINIERA ISTT",
        "ciudad": "Ambato",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.268386,
            -78.611416
        ]
    },
    {
        "id": "em-824315",
        "categoria": "puntos",
        "nombre": "Paredes Car Service",
        "ciudad": "Ambato",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.270375,
            -78.630605
        ]
    },
    {
        "id": "em-849479",
        "categoria": "puntos",
        "nombre": "Plug and Drive - Atuntaqui - Hotel Royal",
        "ciudad": "Antonio Ante",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.329259,
            -78.213153
        ]
    },
    {
        "id": "em-454422",
        "categoria": "puntos",
        "nombre": "Club del Pacífico",
        "ciudad": "Atacames",
        "provincia": "Esmeraldas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.899207,
            -79.801883
        ]
    },
    {
        "id": "em-239202",
        "categoria": "puntos",
        "nombre": "Hotel Club del Sol",
        "ciudad": "Atacames",
        "provincia": "Esmeraldas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.868858,
            -79.855373
        ]
    },
    {
        "id": "em-844609",
        "categoria": "puntos",
        "nombre": "Instituto Superior Tecnológico del Austro",
        "ciudad": "Azogues",
        "provincia": "Cañar",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.751839,
            -78.845663
        ]
    },
    {
        "id": "em-728755",
        "categoria": "puntos",
        "nombre": "Casa Verde",
        "ciudad": "Baños",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "",
        "conectores": [
            {
                "conector": "",
                "tipoCarga": "ESTANDAR",
                "potencia": "3 kW",
                "cantidad": 1
            },
            {
                "conector": "",
                "tipoCarga": "ESTANDAR",
                "potencia": "1 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "NO",
        "app": "",
        "direccion": "Calle Camino Real",
        "coords": [
            -1.394421,
            -78.405477
        ],
        "nota": "Solo para clientes o huéspedes",
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-674197",
        "categoria": "puntos",
        "nombre": "Hotel Spa Miramelindo",
        "ciudad": "Baños",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.40015,
            -78.30048
        ]
    },
    {
        "id": "em-517324",
        "categoria": "puntos",
        "nombre": "Samari Spa Resort",
        "ciudad": "Baños",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.395274,
            -78.408175
        ]
    },
    {
        "id": "em-820103",
        "categoria": "puntos",
        "nombre": "Centro Comercial Milenium Plaza",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.905754,
            -79.002434
        ]
    },
    {
        "id": "em-879679",
        "categoria": "puntos",
        "nombre": "Dos chorreras Cajas",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TIPO 2",
        "conectores": [
            {
                "conector": "TIPO 2",
                "tipoCarga": "ESTANDAR",
                "potencia": "7 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "NO",
        "app": "",
        "direccion": "Vía Cuenca - Molleturo - Puerto Inca",
        "coords": [
            -2.78913,
            -79.165572
        ],
        "nota": "Solo para clientes o huéspedes",
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-879680",
        "categoria": "puntos",
        "nombre": "Hostería Capillapamba",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.801136,
            -79.290543
        ]
    },
    {
        "id": "em-346508",
        "categoria": "puntos",
        "nombre": "Mavesa Cuenca",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.893618,
            -78.962332
        ]
    },
    {
        "id": "em-316956",
        "categoria": "puntos",
        "nombre": "Punto Mestizo",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.75849,
            -79.402136
        ]
    },
    {
        "id": "em-692496",
        "categoria": "puntos",
        "nombre": "Universidad del Azuay",
        "ciudad": "Cuenca",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.919745,
            -79.001242
        ]
    },
    {
        "id": "em-323924",
        "categoria": "puntos",
        "nombre": "Parque de la paz",
        "ciudad": "Daule",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.049876,
            -79.89887
        ]
    },
    {
        "id": "em-852798",
        "categoria": "puntos",
        "nombre": "JAC",
        "ciudad": "Esmeraldas",
        "provincia": "Esmeraldas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.923371,
            -79.670718
        ]
    },
    {
        "id": "em-517322",
        "categoria": "puntos",
        "nombre": "Hostería La Andaluza",
        "ciudad": "Guano",
        "provincia": "Chimborazo",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TIPO 2",
        "conectores": [
            {
                "conector": "TIPO 2",
                "tipoCarga": "ESTANDAR",
                "potencia": "7 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "",
        "app": "",
        "direccion": "Panamericana Sur",
        "coords": [
            -1.538376,
            -78.732695
        ],
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-451256",
        "categoria": "puntos",
        "nombre": "Automekano Guayaquil",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "Automekano",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.16663,
            -79.892231
        ]
    },
    {
        "id": "em-595599",
        "categoria": "puntos",
        "nombre": "E.S. Terpel Domingo Comín",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.231822,
            -79.890529
        ]
    },
    {
        "id": "em-319032",
        "categoria": "puntos",
        "nombre": "Grupo Mavesa Matriz Guayaquil",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.14618,
            -79.911849
        ]
    },
    {
        "id": "em-846542",
        "categoria": "puntos",
        "nombre": "Line Saes",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.169077,
            -79.889375
        ]
    },
    {
        "id": "em-651027",
        "categoria": "puntos",
        "nombre": "Primax (Carlos julio Arosemena)",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.175289,
            -79.912716
        ]
    },
    {
        "id": "em-239321",
        "categoria": "puntos",
        "nombre": "Supermaxi vía a la Costa",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.182516,
            -79.985671
        ]
    },
    {
        "id": "em-266173",
        "categoria": "puntos",
        "nombre": "Terpel Av. de las Americas y Juan Tanca Marengo",
        "ciudad": "Guayaquil",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.163218,
            -79.891638
        ]
    },
    {
        "id": "em-875585",
        "categoria": "puntos",
        "nombre": "Caranqui",
        "ciudad": "Ibarra",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.314561,
            -78.128621
        ]
    },
    {
        "id": "em-452330",
        "categoria": "puntos",
        "nombre": "La Plaza Shopping Center - Ibarra",
        "ciudad": "Ibarra",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.345674,
            -78.135677
        ]
    },
    {
        "id": "em-450624",
        "categoria": "puntos",
        "nombre": "Laguna Mall Ibarra",
        "ciudad": "Ibarra",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.349141,
            -78.125285
        ]
    },
    {
        "id": "em-874890",
        "categoria": "puntos",
        "nombre": "TUNAS Y CABRAS HOTEL",
        "ciudad": "Ibarra",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.426546,
            -78.055036
        ]
    },
    {
        "id": "em-858953",
        "categoria": "puntos",
        "nombre": "Mavesa Manta - Vía a Montecristi",
        "ciudad": "Jaramijó",
        "provincia": "Manabí",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.968143,
            -80.661455
        ]
    },
    {
        "id": "em-884889",
        "categoria": "puntos",
        "nombre": "CONECTZ Lago Agrio",
        "ciudad": "Lago Agrio",
        "provincia": "Sucumbíos",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.083823,
            -76.886554
        ]
    },
    {
        "id": "em-876102",
        "categoria": "puntos",
        "nombre": "ISUC",
        "ciudad": "Latacunga",
        "provincia": "Cotopaxi",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.799424,
            -78.619563
        ]
    },
    {
        "id": "em-671269",
        "categoria": "puntos",
        "nombre": "Pepas Restaurante",
        "ciudad": "Latacunga",
        "provincia": "Cotopaxi",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.922722,
            -78.622641
        ]
    },
    {
        "id": "em-239209",
        "categoria": "puntos",
        "nombre": "Estadio Reina del Cisne",
        "ciudad": "Loja",
        "provincia": "Loja",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -4.001887,
            -79.195629
        ]
    },
    {
        "id": "em-884024",
        "categoria": "puntos",
        "nombre": "CONECTZ KFC Machachi",
        "ciudad": "Machachi",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.508153,
            -78.574619
        ]
    },
    {
        "id": "em-830654",
        "categoria": "puntos",
        "nombre": "DePrati Machala",
        "ciudad": "Machala",
        "provincia": "El Oro",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -3.283251,
            -79.925815
        ]
    },
    {
        "id": "em-447387",
        "categoria": "puntos",
        "nombre": "E.MAMUEL CHEVROLET MACHALA",
        "ciudad": "Machala",
        "provincia": "El Oro",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -3.266077,
            -79.951594
        ]
    },
    {
        "id": "em-844605",
        "categoria": "puntos",
        "nombre": "Garaje 24/7",
        "ciudad": "Machala",
        "provincia": "El Oro",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -3.265045,
            -79.944081
        ]
    },
    {
        "id": "em-661491",
        "categoria": "puntos",
        "nombre": "Mantahost Hotel",
        "ciudad": "Manta",
        "provincia": "Manabí",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.944326,
            -80.748886
        ]
    },
    {
        "id": "em-858956",
        "categoria": "puntos",
        "nombre": "Mavesa Manta - Barbasquillo",
        "ciudad": "Manta",
        "provincia": "Manabí",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.950468,
            -80.741989
        ]
    },
    {
        "id": "em-661239",
        "categoria": "puntos",
        "nombre": "Teojama Comercial",
        "ciudad": "Manta",
        "provincia": "Manabí",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.976085,
            -80.699358
        ]
    },
    {
        "id": "em-884890",
        "categoria": "puntos",
        "nombre": "CONECTZ KFC Coca",
        "ciudad": "Orellana",
        "provincia": "Orellana",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.472151,
            -76.985921
        ]
    },
    {
        "id": "em-421836",
        "categoria": "puntos",
        "nombre": "Hosteria Cabañas del Lago",
        "ciudad": "Otavalo",
        "provincia": "Imbabura",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.210367,
            -78.211322
        ]
    },
    {
        "id": "em-882487",
        "categoria": "puntos",
        "nombre": "Quinta La Virginia",
        "ciudad": "Patate",
        "provincia": "Tungurahua",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.34575,
            -78.502222
        ]
    },
    {
        "id": "em-728754",
        "categoria": "puntos",
        "nombre": "Cargador 7Kw/H Karibao",
        "ciudad": "Playas",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -2.60712,
            -80.461606
        ]
    },
    {
        "id": "em-688366",
        "categoria": "puntos",
        "nombre": "Cargador Novedades Karen",
        "ciudad": "Portoviejo",
        "provincia": "Manabí",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.057174,
            -80.455494
        ]
    },
    {
        "id": "em-858957",
        "categoria": "puntos",
        "nombre": "Mavesa Portoviejo",
        "ciudad": "Portoviejo",
        "provincia": "Manabí",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.071994,
            -80.4918
        ]
    },
    {
        "id": "em-314664",
        "categoria": "puntos",
        "nombre": "Salango",
        "ciudad": "Puerto López",
        "provincia": "Manabí",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.593366,
            -80.843863
        ]
    },
    {
        "id": "em-728752",
        "categoria": "puntos",
        "nombre": "The River House - Charging Station",
        "ciudad": "Puerto Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.110719,
            -79.228312
        ]
    },
    {
        "id": "em-827372",
        "categoria": "puntos",
        "nombre": "LLANTERA CUYUJA",
        "ciudad": "Quijos",
        "provincia": "Napo",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.413115,
            -78.027406
        ]
    },
    {
        "id": "em-530482",
        "categoria": "puntos",
        "nombre": "Autofenix taller",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.210487,
            -78.416145
        ]
    },
    {
        "id": "em-451706",
        "categoria": "puntos",
        "nombre": "Automekano Quito Norte",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "Automekano",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.127816,
            -78.480677
        ]
    },
    {
        "id": "em-453686",
        "categoria": "puntos",
        "nombre": "Automekano Quito Sur",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "Automekano",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.274038,
            -78.552665
        ]
    },
    {
        "id": "em-748664",
        "categoria": "puntos",
        "nombre": "Carolina 2",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.187117,
            -78.487185
        ]
    },
    {
        "id": "em-368206",
        "categoria": "puntos",
        "nombre": "Centro Comercial Artesanal Quitus",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.203933,
            -78.499573
        ]
    },
    {
        "id": "em-242354",
        "categoria": "puntos",
        "nombre": "Centro de convenciones",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.147561,
            -78.489508
        ]
    },
    {
        "id": "em-742034",
        "categoria": "puntos",
        "nombre": "Chery Cumbaya Maresa Center",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.208802,
            -78.425744
        ]
    },
    {
        "id": "em-796604",
        "categoria": "puntos",
        "nombre": "DC AUTOS",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.298239,
            -78.480282
        ]
    },
    {
        "id": "em-354754",
        "categoria": "puntos",
        "nombre": "Edificio Metropolitan",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.176019,
            -78.487372
        ]
    },
    {
        "id": "em-690798",
        "categoria": "puntos",
        "nombre": "ElectriMove",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.203301,
            -78.505594
        ]
    },
    {
        "id": "em-239236",
        "categoria": "puntos",
        "nombre": "Empresa Eléctrica Av. Morán Valverde Quito",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.284249,
            -78.542655
        ]
    },
    {
        "id": "em-187441",
        "categoria": "puntos",
        "nombre": "Fundeporte",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.284789,
            -78.551974
        ]
    },
    {
        "id": "em-707619",
        "categoria": "puntos",
        "nombre": "Garage Manuel Larrea",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.209118,
            -78.501912
        ]
    },
    {
        "id": "em-718898",
        "categoria": "puntos",
        "nombre": "Gasolinera Puma",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.109455,
            -78.457074
        ]
    },
    {
        "id": "em-175532",
        "categoria": "puntos",
        "nombre": "GIRO PERFORMANCE",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.165863,
            -78.484864
        ]
    },
    {
        "id": "em-818158",
        "categoria": "puntos",
        "nombre": "Grupo Mavesa Baker",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "Mavesa",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.137223,
            -78.482742
        ]
    },
    {
        "id": "em-220183",
        "categoria": "puntos",
        "nombre": "GrupoEntregas FedEx",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.120645,
            -78.471565
        ]
    },
    {
        "id": "em-519181",
        "categoria": "puntos",
        "nombre": "Hostería Colibrí Aeropuerto",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.179602,
            -78.349863
        ]
    },
    {
        "id": "em-523849",
        "categoria": "puntos",
        "nombre": "Llano grande",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.119546,
            -78.432731
        ]
    },
    {
        "id": "em-879642",
        "categoria": "puntos",
        "nombre": "Marco",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.278336,
            -78.543928
        ]
    },
    {
        "id": "em-532865",
        "categoria": "puntos",
        "nombre": "Mega Santa Maria Tumbaco",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.215965,
            -78.406354
        ]
    },
    {
        "id": "em-315435",
        "categoria": "puntos",
        "nombre": "Plaza Coelho",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.201181,
            -78.4281
        ]
    },
    {
        "id": "em-458779",
        "categoria": "puntos",
        "nombre": "Produbanco",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.17839,
            -78.486428
        ]
    },
    {
        "id": "em-722263",
        "categoria": "puntos",
        "nombre": "Pululahua Ecolodge",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TOMACORRIENTE x2",
        "conectores": [
            {
                "conector": "TOMACORRIENTE",
                "tipoCarga": "ESTANDAR",
                "potencia": "3.5 kW",
                "cantidad": 1
            },
            {
                "conector": "TOMACORRIENTE",
                "tipoCarga": "ESTANDAR",
                "potencia": "1.5 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "",
        "app": "",
        "direccion": "Crater Del Pululahua",
        "coords": [
            0.033923,
            -78.486126
        ],
        "nota": "Solo para clientes o huéspedes",
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-547549",
        "categoria": "puntos",
        "nombre": "Punto El Chaquiñan",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.199861,
            -78.431525
        ]
    },
    {
        "id": "em-419019",
        "categoria": "puntos",
        "nombre": "S2 20",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TOMACORRIENTE x4",
        "conectores": [
            {
                "conector": "TOMACORRIENTE",
                "tipoCarga": "ESTANDAR",
                "potencia": "1.6 kW",
                "cantidad": 4
            },
            {
                "conector": "",
                "tipoCarga": "ESTANDAR",
                "potencia": "15.2 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "SI",
        "app": "",
        "direccion": "28 de Agosto, 27 de Febrero",
        "coords": [
            -0.294394,
            -78.400065
        ],
        "nota": "Solo para clientes o huéspedes",
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-690893",
        "categoria": "puntos",
        "nombre": "SERES Cumbaya - Automekano",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "Automekano",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.196033,
            -78.440963
        ]
    },
    {
        "id": "em-187450",
        "categoria": "puntos",
        "nombre": "Techniprinter",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.115634,
            -78.436222
        ]
    },
    {
        "id": "em-537354",
        "categoria": "puntos",
        "nombre": "Tensortec Quito",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            0.000589,
            -78.504812
        ]
    },
    {
        "id": "em-135999",
        "categoria": "puntos",
        "nombre": "Terminal Terrestre Quitumbe",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.297069,
            -78.558553
        ]
    },
    {
        "id": "em-447558",
        "categoria": "puntos",
        "nombre": "Terpel Voltex Charging Station",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.162092,
            -78.48562
        ]
    },
    {
        "id": "em-531673",
        "categoria": "puntos",
        "nombre": "Terrazas de la Ceramica",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.221136,
            -78.392895
        ]
    },
    {
        "id": "em-457163",
        "categoria": "puntos",
        "nombre": "UrbaPark EEQ",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.197522,
            -78.430776
        ]
    },
    {
        "id": "em-584096",
        "categoria": "puntos",
        "nombre": "Ventura Mall",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.211211,
            -78.415544
        ]
    },
    {
        "id": "em-873159",
        "categoria": "puntos",
        "nombre": "Hotel Hacienda Abraspungo",
        "ciudad": "Riobamba",
        "provincia": "Chimborazo",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.640103,
            -78.640705
        ]
    },
    {
        "id": "em-820786",
        "categoria": "puntos",
        "nombre": "LLANTICENTRO P Y R",
        "ciudad": "Riobamba",
        "provincia": "Chimborazo",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.690147,
            -78.632997
        ]
    },
    {
        "id": "em-447957",
        "categoria": "puntos",
        "nombre": "Village Plaza, Samborondón",
        "ciudad": "Samborondon",
        "provincia": "Guayas",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TIPO 2, TIPO 1 x2",
        "conectores": [
            {
                "conector": "TIPO 2",
                "tipoCarga": "ESTANDAR",
                "potencia": "3.5 kW",
                "cantidad": 1
            },
            {
                "conector": "TIPO 1",
                "tipoCarga": "ESTANDAR",
                "potencia": "3.5 kW",
                "cantidad": 2
            }
        ],
        "tarifado": "NO",
        "app": "",
        "direccion": "Avenida Samborondón, Samborondón",
        "coords": [
            -2.140031,
            -79.864487
        ],
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-239237",
        "categoria": "puntos",
        "nombre": "Estacion de Servicio los Arrayanes",
        "ciudad": "San Miguel",
        "provincia": "Bolívar",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.815962,
            -79.07471
        ]
    },
    {
        "id": "em-671644",
        "categoria": "puntos",
        "nombre": "MegaKywi - Los Chillos",
        "ciudad": "Sangolqui",
        "provincia": "Pichincha",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TIPO 1",
        "conectores": [
            {
                "conector": "TIPO 1",
                "tipoCarga": "ESTANDAR",
                "potencia": "5 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "",
        "app": "",
        "direccion": "Av. Gral. Rumiñahui 840",
        "coords": [
            -0.308262,
            -78.447121
        ],
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-880418",
        "categoria": "puntos",
        "nombre": "Hotel Inti Kamari",
        "ciudad": "Santa Isabel",
        "provincia": "Azuay",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -3.268184,
            -79.294428
        ]
    },
    {
        "id": "em-134027",
        "categoria": "puntos",
        "nombre": "Terminal Terrestre Binacional de Santa Rosa (EMOVTT)",
        "ciudad": "Santa Rosa",
        "provincia": "El Oro",
        "convenio": "",
        "tipoCarga": "ESTANDAR",
        "conector": "TIPO 1",
        "conectores": [
            {
                "conector": "TIPO 1",
                "tipoCarga": "ESTANDAR",
                "potencia": "10 kW",
                "cantidad": 1
            }
        ],
        "tarifado": "",
        "app": "",
        "direccion": "Eje Vial E25 y Av. Eloy Alfaro",
        "coords": [
            -3.447826,
            -79.974985
        ],
        "fuenteDetalle": "Open Charge Map"
    },
    {
        "id": "em-238695",
        "categoria": "puntos",
        "nombre": "Megamodelauto",
        "ciudad": "Santo Domingo",
        "provincia": "Santo Domingo de los Tsáchilas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.254814,
            -79.179517
        ]
    },
    {
        "id": "em-706617",
        "categoria": "puntos",
        "nombre": "Plug & Drive Santo Domingo",
        "ciudad": "Santo Domingo",
        "provincia": "Santo Domingo de los Tsáchilas",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -0.265092,
            -79.111423
        ]
    },
    {
        "id": "em-517323",
        "categoria": "puntos",
        "nombre": "Hamadryade Lodge",
        "ciudad": "Tena",
        "provincia": "Napo",
        "convenio": "",
        "tipoCarga": "",
        "conector": "",
        "conectores": [],
        "tarifado": "",
        "app": "",
        "direccion": "",
        "coords": [
            -1.038103,
            -77.708932
        ]
    }
];
