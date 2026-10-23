<?php
/**
 *  subirFotoPuntoCarga.php
 *  Ruta: /var/www/html/api/apiv1.7/subirFotoPuntoCarga.php
 *
 *  Recibe la foto que adjunta quien llena "Agregar tu punto de carga" en el
 *  mapa de la web, la guarda y devuelve su URL publica. Esa URL viaja despues
 *  en el formulario (campo fotoUrl) y el correo la muestra y la adjunta.
 *
 *  Mismo esquema que subirComprobante.php, con dos diferencias: carpeta propia
 *  y solo imagenes (sin PDF), porque lo que se pide es una foto del punto.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carpeta fisica (junto a este script) y URL publica desde donde se sirve.
$carpeta = __DIR__ . '/fotos-puntos-carga';
$baseUrl = 'https://' . $_SERVER['HTTP_HOST']
    . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/')
    . '/fotos-puntos-carga';

if (!isset($_FILES['foto'])) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "No se recibió ninguna foto."]);
    exit;
}

$file = $_FILES['foto'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "Error al subir la foto (código " . $file['error'] . ")."]);
    exit;
}

// Limite de 10 MB: las fotos de celular rondan los 3-5 MB.
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "La foto supera el límite de 10 MB."]);
    exit;
}

// Se valida el tipo real por contenido, no por la extension que venga.
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$permitidos = [
    "image/jpeg" => "jpg",
    "image/png"  => "png",
    "image/webp" => "webp",
    "image/gif"  => "gif",
    "image/heic" => "heic",
];

if (!isset($permitidos[$mime])) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "Formato no permitido. Usa JPG, PNG, WEBP o GIF."]);
    exit;
}

$ext = $permitidos[$mime];

// La carpeta debe existir y ser escribible por el usuario de Apache. Si PHP no puede
// crearla (permisos de la carpeta padre o SELinux), se dice cuál es el problema en
// lugar de fallar más abajo con un mensaje genérico; el detalle va al log de Apache.
if (!is_dir($carpeta) && !@mkdir($carpeta, 0755, true)) {
    $e = error_get_last();
    error_log('subirFotoPuntoCarga: no se pudo crear ' . $carpeta . ': ' . ($e ? $e['message'] : 'sin detalle'));
    http_response_code(500);
    echo json_encode(["estado" => false, "msj" => "La carpeta de fotos no existe en el servidor y no se pudo crear."]);
    exit;
}
if (!is_writable($carpeta)) {
    error_log('subirFotoPuntoCarga: sin permiso de escritura en ' . $carpeta);
    http_response_code(500);
    echo json_encode(["estado" => false, "msj" => "La carpeta de fotos no tiene permiso de escritura en el servidor."]);
    exit;
}
// Un index.html vacío evita que Apache liste las fotos si el listado de carpetas está activo.
if (!file_exists($carpeta . '/index.html')) {
    @file_put_contents($carpeta . '/index.html', '');
}

$nombre = "punto_carga_" . date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . "." . $ext;
$destino = $carpeta . "/" . $nombre;

if (!move_uploaded_file($file['tmp_name'], $destino)) {
    $e = error_get_last();
    error_log('subirFotoPuntoCarga: move_uploaded_file a ' . $destino . ' falló: ' . ($e ? $e['message'] : 'sin detalle'));
    http_response_code(500);
    echo json_encode(["estado" => false, "msj" => "No se pudo guardar la foto en el servidor."]);
    exit;
}

echo json_encode([
    "estado"  => true,
    "msj"     => "Foto subida correctamente.",
    "url"     => $baseUrl . "/" . $nombre,
    "archivo" => $nombre,
]);
