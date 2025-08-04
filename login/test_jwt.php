<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'vendor/autoload.php';
echo "Autoload OK\n";

use Firebase\JWT\JWT;

try {
    echo "JWT class loaded\n";
    
    $key = 'your_secret_key';
    $payload = [
        'id' => 'guest',
        'exp' => time() + 3600
    ];
    
    $jwt = JWT::encode($payload, $key, 'HS256');
    echo "JWT created: " . $jwt . "\n";
    
    $decoded = JWT::decode($jwt, new Firebase\JWT\Key($key, 'HS256'));
    echo "JWT decoded: " . json_encode($decoded) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?> 