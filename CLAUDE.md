# aro-briefs

ARO의 HR 스터디용 "Case Brief" 아카이브. GitHub Pages로 공개됨: https://aro-deeply.github.io/aro-briefs/

## 여기서 하는 일
- 새 브리프 제작: `.claude/skills/aro-case-brief/SKILL.md`의 순서를 그대로 따른다. 입력물(초안 docx, 링크 메모)은 보통 `../inbox/`에 있다.
- 산출물 배치: `briefs/YYYY-MM-DD-slug/index.html`(웹 판) + `brief.pdf`. 목록 `index.html`의 `<div id="list">` 맨 위에 카드 추가. 세부 규칙은 스킬의 `references/archive.md`.
- 커밋 메시지: `brief: <slug>` / 도구 수정은 `reader: ...`, `site: ...`
- 푸시 후 1~2분 뒤 공개 주소에서 새 페이지가 열리는지 확인하고 URL을 보고한다.

## 하지 말 것
- 디자인(색, 폰트, 크기) 변경. 템플릿 CSS는 손대지 않는다.
- em dash(—), 이모지, 세리프 폰트. 한국어 본문은 `word-break: normal`(줄 끝까지 채움).
- 검증 안 된 수치 수록. 확인 못 한 수치는 빼고 출처 섹션에 명시.
- `assets/reader.js`, `assets/reader.css`는 모든 브리프에 공통이므로 특정 편 때문에 고치지 않는다.

## 환경
- PDF 렌더: `python .claude/skills/aro-case-brief/scripts/render_pdf.py 파일.html` (Playwright + Chromium 필요)
- 규칙 점검: `python .claude/skills/aro-case-brief/scripts/check_brief.py 파일.html`
