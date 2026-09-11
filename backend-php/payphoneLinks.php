<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "No se enviaron datos"]);
    exit;
}

/**
 * Token del lado del servidor. Si se llena aqui, ya no hace falta que el
 * frontend envie el header (y el token deja de viajar en el bundle publico).
 * Debe ser de una App tipo "API" en PayPhone.
 */
define('TOKEN_PAYPHONE', '');

/**
 * Obtiene el "Bearer xxx" de la peticion.
 *
 * Apache con PHP-FPM/CGI no expone la cabecera Authorization salvo que una
 * regla de reescritura la copie a HTTP_AUTHORIZATION, y la regla del .htaccess
 * se salta para archivos que existen (RewriteCond %{SCRIPT_FILENAME} !-f).
 * Por eso se revisan todas las fuentes posibles.
 */
function obtenerAuthorization()
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION']))
        return trim($_SERVER['HTTP_AUTHORIZATION']);

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION']))
        return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

    if (function_exists('apache_request_headers')) {
        foreach (apache_request_headers() as $k => $v) {
            if (strcasecmp($k, 'Authorization') === 0 && $v !== '')
                return trim($v);
        }
    }

    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp($k, 'Authorization') === 0 && $v !== '')
                return trim($v);
        }
    }

    return '';
}

$authHeader = obtenerAuthorization();

// Respaldo: token configurado en el servidor.
if ($authHeader === '' && TOKEN_PAYPHONE !== '')
    $authHeader = 'Bearer ' . TOKEN_PAYPHONE;

// Sin token PayPhone responde 401; se avisa aqui para no confundirlo con un
// problema de credenciales.
if ($authHeader === '') {
    http_response_code(401);
    echo json_encode(array(
        "message" => "No llego el token de autorizacion al servidor. Envie el header Authorization o configure TOKEN_PAYPHONE en payphoneLinks.php."
    ));
    exit;
}

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://pay.payphonetodoesposible.com/api/Links");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_POSTFIELDS, $inputJSON);    

$curlHeaders = array(
    'Content-Type: application/json',
    'Accept: application/json'
);
// El header debe ir completo: getallheaders() devuelve solo el valor
// ("Bearer xxx"), sin el nombre de la cabecera.
$curlHeaders[] = (stripos($authHeader, 'Authorization:') === 0)
    ? $authHeader
    : 'Authorization: ' . $authHeader;
curl_setopt($curl, CURLOPT_HTTPHEADER, $curlHeaders);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

$curl_response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Payphone devuelve un string plano con la URL si tiene éxito, 
// o un JSON de error en caso de fallo.
$result = json_decode($curl_response, true);

http_response_code($http_code);
if(is_string($result) || $result == null){
    // Si no es un JSON válido, asumimos que es el string de la URL
    echo json_encode(["url" => $curl_response]);
}else{
    // Si es JSON, hubo un error devuelto por Payphone
    echo json_encode($result);
}
?>
