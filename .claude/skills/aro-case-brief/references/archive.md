# 아카이브 운영

저장소 https://github.com/aro-deeply/aro-briefs · 공개 https://aro-deeply.github.io/aro-briefs/
GitHub Pages, main 브랜치 루트에서 배포. 빌드 없음, 정적 파일만.

## 로컬 작업

```bash
git clone https://github.com/aro-deeply/aro-briefs.git   # 처음 한 번
cd aro-briefs && git pull
mkdir briefs/YYYY-MM-DD-slug
# index.html, brief.pdf 배치 후
git add -A && git commit -m "brief: slug" && git push
```

## 웹 판 변환 규칙 (PDF용 HTML → 웹용 index.html)

1. `@font-face` 로컬 폰트 줄을 지우고 `<style>` 앞에 CDN 링크를 넣는다.
   `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">`
2. `<title>제목 · ARO Case Brief</title>`, viewport 메타 추가.
3. `html,body{` 앞에 화면용 스타일을 추가한다.
   `@media screen{body{max-width:860px;margin:0 auto;padding:40px 24px 80px;background:#FAFAF7}.pb{break-before:auto}.nav{display:flex;justify-content:space-between;font-size:9pt;color:var(--muted);margin-bottom:18px}.nav a{color:var(--accent-dark);text-decoration:none;border-bottom:1px solid var(--line)}}@media print{.nav{display:none}}`
4. `<body>` 바로 아래에 nav를 넣는다.
   `<div class="nav"><a href="../../">← ARO Case Brief 아카이브</a><a href="brief.pdf">PDF 내려받기</a></div>`
5. 읽기 도구를 붙인다. `</style>` 뒤에 `<link rel="stylesheet" href="../../assets/reader.css">`, `</body>` 앞에 `<script src="../../assets/reader.js"></script>`. (저장소 `assets/`에 있는 하이라이트·메모·AI용 복사 기능. 웹 판에만 넣고 PDF용 HTML에는 넣지 않는다.)
6. 출처 섹션 `</ul>` 뒤에 함께 읽기 문단을 넣는다 (관련 편이 있을 때).
   `<p style="margin-top:12px">함께 읽기: <a href="../다른-slug/" style="color:var(--accent-dark)">제목</a> (연월). 왜 함께 읽는지 한 문장.</p>`

## 목록 카드 양식 (index.html의 `<div id="list">` 맨 위에 삽입)

```html
<a class="brief" href="briefs/YYYY-MM-DD-slug/" data-tags="태그1,태그2">
<div class="meta"><b>CASE BRIEF 0N</b><span>YYYY.MM</span></div>
<h2>제목 (한 줄로)</h2>
<p class="sub">부제</p>
<div class="concl"><span>한 줄 결론</span>한 줄 결론 본문</div>
<div class="tags"><i>태그1</i><i>태그2</i><span class="pdf">PDF</span></div>
</a>
```

`data-tags`의 값과 `<i>` 태그 내용은 같아야 한다. 현재 필터 버튼: 전체, AI 도입, HRD, 채용, 노동시장, 조직설계. 새 태그를 쓰면 `<div class="filters">`에 `<button data-tag="새태그">새태그</button>`을 추가한다.

## 등록된 브리프

| 번호 | 폴더 | 제목 | 태그 |
|---|---|---|---|
| 01 | 2026-09-01-ai-agent-adoption | AI 교육의 다음 단계는 "직원이 직접 업무를 바꾸는 것"인가 | AI 도입, HRD, 조직설계 |
| 02 | 2026-09-07-career-ladder | AI가 먼저 없애는 것은 '사람'이 아니라 신입이 숙련자로 성장하던 과정일 수 있다 | 채용, HRD, 노동시장 |
| 03 | 2026-09-09-work-redesign | AI 도입 뒤의 문제는 '더 잘 쓰는 법'이 아니라 일을 그대로 둔 채 AI만 얹었다는 데 있을 수 있다 | AI 도입, 조직설계, HRD |

새 편을 등록하면 이 표에도 한 줄 추가한다. 함께 읽기 링크를 걸 때 참고한다.
