<?php

function getDbConnection() {
    $servername = 'fabigler.mysql.db.internal';
    $username = 'fabigler_fabian';
    $password = 'yeUt39N2';
    $dbname = 'fabigler_maribelle';
    
    $con = new mysqli($servername, $username, $password, $dbname);
    
    if (mysqli_connect_errno()) {
        die("Connection failed: " . $con->connect_error);
    }
    
    if ($con->connect_error) {
        die("Connection failed: " . $con->connect_error);
    }

    return $con;
}

function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

function getStringFromUrl($name) {
    return htmlspecialchars($_GET[$name]);
}

function getLangFromCookie() {
    if (isset($_COOKIE["currentLang"])) {
        return htmlspecialchars($_COOKIE["currentLang"]);
    }
    else {
        return 'DE';
    }
}

function setJsonResponse($result) {
    header("Content-Type: application/json; charset=UTF-8;");
    echo json_encode($result);
}

function setNotFoundResponse() {
    http_response_code(404);
    exit();
}

function setForbiddenResponse() {
    setErrorResponse(null, "Forbidden!", 403);
}

function setErrorResponse($errorDetails, $errorMessage = "An error occured!", $httpErrorCode = 500) {
    $error = new stdClass;
    $error->errorMessage = $errorMessage;
    $error->errorDetails = $errorDetails;
    setJsonResponse($error);
    http_response_code($httpErrorCode);
    exit();
}

function setFatalErrorResponse() {
    $lastError = error_get_last();
    if ($lastError !== null) {
        ob_clean();
        setErrorResponse($lastError);
    }
}

?>