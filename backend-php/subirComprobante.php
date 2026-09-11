<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carpeta física donde se guardan los comprobantes (junto a este script) y
// URL pública desde donde se sirven. Ajusta si el hosting usa otra ruta.
$carpeta = __DIR__ . '/comprobantes';
$baseUrl = 'https://' . $_SERVER['HTTP_HOST']
    . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/')
    . '/comprobantes';

if (!isset($_FILES['comprobante'])) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "No se recibió ningún archivo."]);
    exit;
}

$file = $_FILES['comprobante'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "Error al subir el archivo (código " . $file['error'] . ")."]);
    exit;
}

// Límite de 10 MB.
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "El archivo supera el límite de 10 MB."]);
    exit;
}

// Validar el tipo real por contenido (no confiar en la extensión enviada).
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$permitidos = [
    "image/jpeg"      => "jpg",
    "image/png"       => "png",
    "image/webp"      => "webp",
    "image/gif"       => "gif",
    "application/pdf" => "pdf",
];

if (!isset($permitidos[$mime])) {
    http_response_code(400);
    echo json_encode(["estado" => false, "msj" => "Formato no permitido. Usa JPG, PNG, WEBP, GIF o PDF."]);
    exit;
}

$ext = $permitidos[$mime];

if (!is_dir($carpeta)) {
    @mkdir($carpeta, 0755, true);
}

$nombre = "comprobante_" . date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . "." . $ext;
$destino = $carpeta . "/" . $nombre;

if (!move_uploaded_file($file['tmp_name'], $destino)) {
    http_response_code(500);
    echo json_encode(["estado" => false, "msj" => "No se pudo guardar el archivo en el servidor."]);
    exit;
}

echo json_encode([
    "estado"  => true,
    "msj"     => "Comprobante subido correctamente.",
    "url"     => $baseUrl . "/" . $nombre,
    "archivo" => $nombre,
]);
