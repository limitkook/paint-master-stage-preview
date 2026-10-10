# Paint Master · 플랫 정원 웹 체험판

작성/수정: Hermes Agent · 2026-10-10 · 승인된 창문/문 수정 플랫 시안을 게임에 적용.

- `flat-v7`: 596칸/30색, 배경14연결면 포함. Unity WebGL/APK가 아닌 JS/Canvas 체험판.
- 승인된1254 PNG bytes 그대로 source-reveal. 노란 얼룩 없는 청회색 창, 불투명 초록 목재문, 은은한 지붕 햇빛.
- 새 그림용 source-bound object atlas/owner/guide를 다시 작성. 이전 그림용 좌표를 붙이지 않음. 각 owner는 단일 연결면, 실제 선과 brush clip/release 완료가 같은 raster ownership을 사용.
- 꽃/나무의 작은 명암은 source detail로 남기고 큰 색 덩어리 위주 분할. 일부 자연물/얇은 구조의 실루엣 근사는 남음; 전체 개별 잎/꽃 자동검출을 주장하지 않음.
- 붓 절반 크기, 더 확대 후 번호, 손을 놓은 뒤90%완료, owner-clipped광택/효과음 유지.
- `stage-manifest.json`으로 source/guide/level SHA256 일치 확인. GitHub Pages main/root에 정적 스테이지 파일만 공개. 서버 서비스/포트 변경 없음.
- 기존 그림/도안은 Unity 저장소와 Git 이력에 보존. 실제 Unity 실행/휴대폰/APK는 미검증.
