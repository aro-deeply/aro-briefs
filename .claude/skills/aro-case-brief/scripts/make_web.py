"""PDF용 브리프 HTML을 아카이브 웹 판(index.html)으로 변환한다.
사용: python3 make_web.py ../work/<slug>/brief.html briefs/<slug>/ --title "제목" [--together together.html]
- 규칙은 references/archive.md "웹 판 변환 규칙"과 같다: title·viewport·PWA 메타, 화면용 스타일, nav, reader.css/js, 함께 읽기.
- --together: 함께 읽기 문단(<p style="margin-top:12px">함께 읽기: ...</p>)을 담은 파일. 생략하면 넣지 않는다.
- 출력 폴더가 없으면 만든다. brief.pdf는 복사하지 않는다(별도로 둔다).
"""
import argparse, pathlib, sys

CDN = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">'
FONT_COMMENT = '<!-- 웹 열람용 CDN. PDF 렌더 시 scripts/render_pdf.py가 로컬 폰트로 교체함 -->\n'
SCREEN = ('@media screen{body{max-width:860px;margin:0 auto;padding:40px 24px 80px;background:#FAFAF7}'
          '.pb{break-before:auto}.nav{display:flex;justify-content:space-between;font-size:9pt;color:var(--muted);margin-bottom:18px}'
          '.nav a{color:var(--accent-dark);text-decoration:none;border-bottom:1px solid var(--line)}}@media print{.nav{display:none}}\n')
NAV = '<div class="nav"><a href="../../">← ARO Case Brief 아카이브</a><a href="brief.pdf">PDF 내려받기</a></div>\n'

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('outdir')
ap.add_argument('--title', required=True, help='브리프 제목 (한 줄). " · ARO Case Brief"가 뒤에 붙는다')
ap.add_argument('--together', help='함께 읽기 문단 HTML 파일')
a = ap.parse_args()

s = pathlib.Path(a.src).read_text(encoding='utf-8')
def must(cond, msg):
    if not cond: sys.exit('make_web: ' + msg)

must(s.count(CDN) == 1, 'CDN 링크가 정확히 1개 있어야 한다 (템플릿 head)')
head = CDN + f'''
<title>{a.title} · ARO Case Brief</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="manifest" href="/aro-briefs/manifest.json">
<meta name="theme-color" content="#FAFAF7">
<link rel="apple-touch-icon" href="/aro-briefs/assets/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/aro-briefs/assets/icons/icon-192.png">
'''
s = s.replace(CDN, head).replace(FONT_COMMENT, '')

must(s.count('html,body{') == 1, 'html,body{ 규칙이 1개여야 한다')
s = s.replace('html,body{', SCREEN + 'html,body{')

must('</style></head><body>' in s, '</style></head><body> 를 찾지 못했다')
s = s.replace('</style></head><body>', '</style>\n<link rel="stylesheet" href="../../assets/reader.css">\n</head><body>\n' + NAV)

if a.together:
    tg = pathlib.Path(a.together).read_text(encoding='utf-8').strip()
    must(s.count('</ul>\n</div>\n</body>') == 1, '출처 섹션 끝(</ul>\\n</div>\\n</body>)을 찾지 못했다')
    s = s.replace('</ul>\n</div>\n</body>', '</ul>\n' + tg + '\n</div>\n</body>')

must(s.rstrip().endswith('</body></html>'), '</body></html> 로 끝나야 한다')
s = s.replace('</body></html>', '<script src="../../assets/reader.js"></script>\n</body></html>')

out = pathlib.Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
(out / 'index.html').write_text(s, encoding='utf-8', newline='\n')
print(out / 'index.html')
