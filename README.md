# Paint Master · 플랫 정원 웹 체험판

작성/수정: Hermes Agent · 2026-10-10 · 승인된 창문/문 수정 플랫 시안을 게임에 적용.

- `flat-v8-controls`: 596칸/30색, 배경14연결면 포함. Unity WebGL/APK가 아닌 JS/Canvas 체험판.
- 승인된1254 PNG bytes 그대로 source-reveal. 노란 얼룩 없는 청회색 창, 불투명 초록 목재문, 은은한 지붕 햇빛.
- 새 그림용 source-bound object atlas/owner/guide를 다시 작성. 이전 그림용 좌표를 붙이지 않음. 각 owner는 단일 연결면, 실제 선과 brush clip/release 완료가 같은 raster ownership을 사용.
- 꽃/나무의 작은 명암은 source detail로 남기고 큰 색 덩어리 위주 분할. 일부 자연물/얇은 구조의 실루엣 근사는 남음; 전체 개별 잎/꽃 자동검출을 주장하지 않음.
- 붓 절반 크기, 더 확대 후 번호, 손을 놓은 뒤90%완료, owner-clipped광택/효과음 유지.
- `stage-manifest.json`으로 source/guide/level SHA256 일치 확인. GitHub Pages main/root에 정적 스테이지 파일만 공개. 서버 서비스/포트 변경 없음.
- 2026-10-10 조작/피드백 후속: 확대 시 원화 기준 붓 범위가 점진 축소, 청회색 미채색 바탕, 색의 모든 칸 완료 시 ✓ → 페이드/숨김 및3음 차임, 실제 칠하기 중 반복 붓 소리. 취소/손놓기/이동/확대/리셋에서 붓 소리 정지.
- 사용자 재지적한 주황 용마루·나무3색·갈색에 녹색 팔레트가 붙는 결함은 이 controls 배포에서 해결했다고 주장하지 않는다. 실제30RGB색 별도 원화 시안을 제작했으며, 미술 확인 후 그 색면에서 새 geometry를 만든다. 현재 웹 자산은 이전 flat-v7 도안 그대로다.
- 전체 완주 검사는 사용자 지시로 중단; Unity Play/실기기/실제 스피커 재생은 미검증. 기존 그림/도안 보존.
