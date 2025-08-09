<?php

/**
 * 미디어 파일 처리 유틸리티
 * 이미지, 영상 업로드 및 썸네일 생성 기능
 */

class MediaHandler
{
    private $upload_dir;
    private $thumbnail_dir;
    private $max_file_size = 10485760; // 10MB
    private $allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $allowed_video_types = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];

    public function __construct()
    {
        $this->upload_dir = '/Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/media/';
        $this->thumbnail_dir = '/Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/thumbnails/';

        // 디렉토리 생성
        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
        if (!is_dir($this->thumbnail_dir)) {
            mkdir($this->thumbnail_dir, 0755, true);
        }
    }

    /**
     * 파일 업로드 처리
     */
    public function uploadFiles($files)
    {
        $uploaded_files = [];
        $errors = [];

        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                $errors[] = "파일 업로드 오류: " . $files['name'][$i];
                continue;
            }

            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'size' => $files['size'][$i]
            ];

            $result = $this->processFile($file);
            if ($result['success']) {
                $uploaded_files[] = $result['data'];
            } else {
                $errors[] = $result['error'];
            }
        }

        return [
            'success' => empty($errors),
            'files' => $uploaded_files,
            'errors' => $errors
        ];
    }

    //  개별 파일 처리
    private function processFile($file)
    {
        if ($file['size'] > $this->max_file_size) {
            return ['success' => false, 'error' => '파일 크기가 너무 큽니다: ' . $file['name']];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $file_type = $this->getFileType($mime_type);
        if (!$file_type) {
            return ['success' => false, 'error' => '지원하지 않는 파일 형식입니다: ' . $file['name']];
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $this->upload_dir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'error' => '파일 저장 실패: ' . $file['name']];
        }

        $thumbnail_path = null;
        if ($file_type === 'image') {
            $thumbnail_path = $this->createImageThumbnail($filepath, $filename);
            error_log("이미지 썸네일 생성 결과: " . ($thumbnail_path ? $thumbnail_path : "실패"));
        } elseif ($file_type === 'video') {
            $thumbnail_path = $this->createVideoThumbnail($filepath, $filename);
            error_log("비디오 썸네일 생성 결과: " . ($thumbnail_path ? $thumbnail_path : "실패"));
        }

        return [
            'success' => true,
            'data' => [
                'filename' => $filename,
                'original_name' => $file['name'],
                'file_type' => $file_type,
                'file_size' => $file['size'],
                'file_path' => 'uploads/media/' . $filename,
                'thumbnail_path' => $thumbnail_path,
                'mime_type' => $mime_type
            ]
        ];
    }

    /**
     * 파일 타입 결정
     */
    private function getFileType($mime_type)
    {
        if (in_array($mime_type, $this->allowed_image_types)) {
            return 'image';
        } elseif (in_array($mime_type, $this->allowed_video_types)) {
            return 'video';
        } elseif ($mime_type === 'image/gif') {
            return 'gif';
        }
        return false;
    }

    /**
     * 이미지 썸네일 생성
     */
    private function createImageThumbnail($source_path, $filename)
    {
        error_log("썸네일 생성 시작 - 원본: $source_path");

        $thumbnail_filename = 'thumb_' . $filename;
        $thumbnail_path = $this->thumbnail_dir . $thumbnail_filename;

        error_log("썸네일 저장 경로: $thumbnail_path");

        // 이미지 정보 가져오기
        $image_info = getimagesize($source_path);
        if (!$image_info) {
            error_log("이미지 정보 가져오기 실패: $source_path");
            return null;
        }

        error_log("이미지 정보: " . print_r($image_info, true));

        $width = $image_info[0];
        $height = $image_info[1];
        $mime_type = $image_info['mime'];

        // 썸네일 크기 계산 (최대 200x200)
        $thumb_width = 200;
        $thumb_height = 200;

        if ($width > $height) {
            $thumb_height = ($height / $width) * $thumb_width;
        } else {
            $thumb_width = ($width / $height) * $thumb_height;
        }

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
                return null;
        }

        if (!$source) {
            return null;
        }

        // 썸네일 이미지 생성
        $thumbnail = imagecreatetruecolor($thumb_width, $thumb_height);

        // PNG 투명도 처리
        if ($mime_type === 'image/png') {
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefill($thumbnail, 0, 0, $transparent);
        }

        // 이미지 리사이즈
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $thumb_width, $thumb_height, $width, $height);

        // 썸네일 저장
        switch ($mime_type) {
            case 'image/jpeg':
                imagejpeg($thumbnail, $thumbnail_path, 85);
                break;
            case 'image/png':
                imagepng($thumbnail, $thumbnail_path, 8);
                break;
            case 'image/gif':
                imagegif($thumbnail, $thumbnail_path);
                break;
            case 'image/webp':
                imagewebp($thumbnail, $thumbnail_path, 85);
                break;
        }

        // 메모리 정리
        imagedestroy($source);
        imagedestroy($thumbnail);

        // 썸네일 파일이 실제로 생성되었는지 확인
        if (file_exists($thumbnail_path)) {
            error_log("썸네일 생성 성공: uploads/thumbnails/$thumbnail_filename");
            return 'uploads/thumbnails/' . $thumbnail_filename;
        } else {
            error_log("썸네일 파일 생성 실패: $thumbnail_path");
            return null;
        }
    }

    /**
     * 영상 썸네일 생성 (FFmpeg가 설치된 경우)
     */
    private function createVideoThumbnail($source_path, $filename)
    {
        $thumbnail_filename = 'thumb_' . pathinfo($filename, PATHINFO_FILENAME) . '.jpg';
        $thumbnail_path = $this->thumbnail_dir . $thumbnail_filename;

        // FFmpeg 명령어로 썸네일 생성 시도
        $ffmpeg_cmd = "ffmpeg -i " . escapeshellarg($source_path) . " -ss 00:00:01 -vframes 1 -vf scale=200:200:force_original_aspect_ratio=decrease " . escapeshellarg($thumbnail_path) . " 2>/dev/null";

        exec($ffmpeg_cmd, $output, $return_code);

        if ($return_code === 0 && file_exists($thumbnail_path)) {
            return 'uploads/thumbnails/' . $thumbnail_filename;
        }

        // FFmpeg가 실패하면 기본 영상 아이콘 썸네일 생성
        return $this->createDefaultVideoThumbnail($thumbnail_filename);
    }

    /**
     * 기본 영상 썸네일 생성
     */
    private function createDefaultVideoThumbnail($filename)
    {
        $thumbnail_path = $this->thumbnail_dir . $filename;

        // 200x200 기본 영상 썸네일 생성
        $thumbnail = imagecreatetruecolor(200, 200);
        $bg_color = imagecolorallocate($thumbnail, 64, 64, 64);
        $text_color = imagecolorallocate($thumbnail, 255, 255, 255);

        imagefill($thumbnail, 0, 0, $bg_color);

        // 재생 아이콘 그리기 (간단한 삼각형)
        $points = array(
            80,
            60,   // 상단
            80,
            140,  // 하단
            140,
            100  // 우측
        );
        imagefilledpolygon($thumbnail, $points, 3, $text_color);

        // 썸네일 저장
        imagejpeg($thumbnail, $thumbnail_path, 85);
        imagedestroy($thumbnail);

        return 'uploads/thumbnails/' . $filename;
    }
}
