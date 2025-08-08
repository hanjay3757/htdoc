mkdir -p /Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/media
sudo chmod -R 777 /Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/media
ㄴ 이건 하지 말것 보안이슈로 위험

권한 없어서 업로드 안됨 


 daemon을 소유자로 바꾸고 쓰기 권한 부여
bash
복사
편집
sudo chown -R daemon:daemon /Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/media
sudo chmod -R 755 /Applications/XAMPP/xamppfiles/htdocs/boardtest/testing2/uploads/media
755이면 daemon은 쓰기 가능, 다른 사용자들은 읽기만 가능

🧠 일반적인 권장 방식
✅ 실제 파일은 디렉토리에 저장하고, DB에는 "파일 경로와 메타데이터"만 저장한다.

예:

필드명	내용
comment_id	38
file_path	/uploads/media/6895c12c70ca5_1754644780.png
original_name	user_uploaded.png
uploaded_at	2025-08-08 11:19:40

이렇게 하면:

PHP에서는 move_uploaded_file()로 저장하고

DB에는 파일 정보만 저장

클라이언트는 <img src="/uploads/media/..." /> 로 접근

📌 정리하면
목적	추천 방식
이미지, 영상, 문서 등 크고 많은 파일	✅ 파일로 저장 + DB에는 경로만 저장
작은 텍스트, 이진 파일 (예: 프로필 썸네일, 작은 JSON)	가능하면 DB도 고려
이중화, 백업, 클라우드 전송이 필수	✅ S3, Cloud Storage 등으로 전송하고 DB에는 URL 저장