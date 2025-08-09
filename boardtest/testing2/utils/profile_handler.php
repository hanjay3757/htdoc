<?php
class ProfileHandler
{
    private $upload_dir;
    private $allowed_types;
    private $max_file_size;

    public function __construct()
    {
        $this->upload_dir = __DIR__ . '/../uploads/profiles/';
        $this->allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $this->max_file_size = 5 * 1024 * 1024; // 5MB

        // 디렉토리가 없으면 생성
        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
    }

    /**
     * 프로필 이미지 업로드
     */
    public function uploadProfileImage($file, $user_id)
    {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => '파일 업로드 오류'];
        }

        // 파일 크기 검증
        if ($file['size'] > $this->max_file_size) {
            return ['success' => false, 'error' => '파일 크기가 너무 큽니다 (최대 5MB)'];
        }

        // 파일 타입 검증
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime_type, $this->allowed_types)) {
            return ['success' => false, 'error' => '지원하지 않는 이미지 형식입니다'];
        }

        // 기존 프로필 이미지 삭제
        $this->deleteOldProfileImage($user_id);

        // 새 파일명 생성
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'profile_' . $user_id . '_' . uniqid() . '.' . $extension;
        $filepath = $this->upload_dir . $filename;

        // 파일 저장
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'error' => '파일 저장 실패'];
        }

        // 이미지 리사이즈 (프로필용)
        $resized_path = $this->resizeProfileImage($filepath, $filename);
        if (!$resized_path) {
            unlink($filepath);
            return ['success' => false, 'error' => '이미지 처리 실패'];
        }

        return [
            'success' => true,
            'file_path' => 'uploads/profiles/' . $filename,
            'filename' => $filename
        ];
    }

    /**
     * 기존 프로필 이미지 삭제
     */
    private function deleteOldProfileImage($user_id)
    {
        global $con;

        $query = "SELECT profile_image FROM users WHERE id = '$user_id'";
        $result = mysqli_query($con, $query);

        if ($result && mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            if ($user['profile_image'] && file_exists(__DIR__ . '/../' . $user['profile_image'])) {
                unlink(__DIR__ . '/../' . $user['profile_image']);
            }
        }
    }

    /**
     * 프로필 이미지 리사이즈 (200x200)
     */
    private function resizeProfileImage($source_path, $filename)
    {
        $image_info = getimagesize($source_path);
        if (!$image_info) {
            return false;
        }

        $width = $image_info[0];
        $height = $image_info[1];
        $mime_type = $image_info['mime'];

        // 원본 이미지 로드
        switch ($mime_type) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($source_path);
                break;
            case 'image/png':
                $source = imagecreatefrompng($source_path);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($source_path);
                break;
            case 'image/webp':
                $source = imagecreatefromwebp($source_path);
                break;
            default:
                return false;
        }

        if (!$source) {
            return false;
        }

        // 200x200 정사각형으로 리사이즈
        $target_size = 200;
        $target = imagecreatetruecolor($target_size, $target_size);

        // PNG 투명도 처리
        if ($mime_type === 'image/png') {
            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 255, 255, 255, 127);
            imagefilledrectangle($target, 0, 0, $target_size, $target_size, $transparent);
        }

        // 중앙 크롭을 위한 계산
        $size = min($width, $height);
        $x = ($width - $size) / 2;
        $y = ($height - $size) / 2;

        // 리샘플링
        imagecopyresampled($target, $source, 0, 0, $x, $y, $target_size, $target_size, $size, $size);

        // 저장
        $success = false;
        switch ($mime_type) {
            case 'image/jpeg':
                $success = imagejpeg($target, $source_path, 90);
                break;
            case 'image/png':
                $success = imagepng($target, $source_path, 9);
                break;
            case 'image/gif':
                $success = imagegif($target, $source_path);
                break;
            case 'image/webp':
                $success = imagewebp($target, $source_path, 90);
                break;
        }

        imagedestroy($source);
        imagedestroy($target);

        return $success ? $filename : false;
    }

    /**
     * 사용자 프로필 이미지 URL 가져오기
     */
    public static function getUserProfileImage($user_id, $profile_image_path = null)
    {
        if ($profile_image_path && file_exists(__DIR__ . '/../' . $profile_image_path)) {
            return $profile_image_path;
        }

        // 기본 아바타 반환
        return 'assets/default-avatar-40.png';
    }

    /**
     * 작은 아바타용 (32px)
     */
    public static function getUserAvatarSmall($user_id, $profile_image_path = null)
    {
        if ($profile_image_path && file_exists(__DIR__ . '/../' . $profile_image_path)) {
            return $profile_image_path;
        }

        // 기본 아바타 반환
        return 'assets/default-avatar-32.png';
    }
}
