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

