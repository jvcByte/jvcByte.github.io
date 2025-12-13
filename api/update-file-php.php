<?php
/**
 * PHP version for updating files via GitHub API
 * Use this if you prefer PHP over serverless functions
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$required = ['filename', 'content', 'token', 'repo', 'owner'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

$filename = $data['filename'];
$content = $data['content'];
$token = $data['token'];
$repo = $data['repo'];
$owner = $data['owner'];
$branch = $data['branch'] ?? 'main';

// Validate filename
$allowedFiles = [
    'personal.json', 'services.json', 'awards.json', 'skills.json',
    'experience.json', 'education.json', 'certifications.json',
    'projects.json', 'blog.json'
];

if (!in_array($filename, $allowedFiles)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid filename']);
    exit;
}

// Prepare JSON content
$jsonContent = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
$base64Content = base64_encode($jsonContent);

// Get current file SHA
$filePath = "data/$filename";
$getFileUrl = "https://api.github.com/repos/$owner/$repo/contents/$filePath?ref=$branch";

$ch = curl_init($getFileUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: token $token",
    "Accept: application/vnd.github.v3+json",
    "User-Agent: Portfolio-CMS"
]);
$fileResponse = curl_exec($ch);
$fileHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$fileSha = null;
if ($fileHttpCode === 200) {
    $fileData = json_decode($fileResponse, true);
    $fileSha = $fileData['sha'] ?? null;
}

// Update file
$updateUrl = "https://api.github.com/repos/$owner/$repo/contents/$filePath";
$updatePayload = [
    'message' => "Update $filename via CMS",
    'content' => $base64Content,
    'branch' => $branch
];

if ($fileSha) {
    $updatePayload['sha'] = $fileSha;
}

$ch = curl_init($updateUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updatePayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: token $token",
    "Accept: application/vnd.github.v3+json",
    "Content-Type: application/json",
    "User-Agent: Portfolio-CMS"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 && $httpCode !== 201) {
    $errorData = json_decode($response, true);
    http_response_code($httpCode);
    echo json_encode([
        'error' => $errorData['message'] ?? 'Failed to update file on GitHub'
    ]);
    exit;
}

$result = json_decode($response, true);
echo json_encode([
    'success' => true,
    'message' => "File $filename updated successfully",
    'commit' => $result['commit'] ?? null
]);
?>

