# Paint Master · 정원 웹 체험판

작성·수정: Hermes Agent · 2026-10-10 · 승인30색 그림의 tiny 제거 및 경계 재작성.

- `exact30-v9`: 30RGB 시안 기반, 너무 작은 조각과 거기에만 쓰이던3색을 정리해 실제27RGB/27선택색/955연결칸.
- 실제 색면으로 ownerRuns를 만들고 같은 지도에서 guide 생성. 번호와 실제 드러나는 RGB의 픽셀 불일치0. 예전 geometry를 새 그림에 붙이지 않음.
- 주황 처마/파란 지붕, 갈색 가지/초록 잎, 창틀/유리 실제색 분리. 창문 작은 구조는 보호.
- source/guide/level은 SHA256 manifest로 함께 로딩. 기존 원본과flat-v8은 Git 및 Unity 프로젝트의history에 보존.
- 확대 붓축소, release-only 완료, 번호색 전체 ✓/숨김/차임 및 반복 붓 소리 유지.
- Unity WebGL/APK가 아닌 JS/Canvas 체험판. Unity도 같은 그림·level·guide 사용하나 실제 Editor Play는 미검증.
- 전체 완주 검사는 사용자 지시로 생략. 새로고침하면 진행률 초기화.
