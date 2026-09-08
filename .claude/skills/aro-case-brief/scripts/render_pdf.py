"""HTML 케이스 브리프를 A4 PDF로 렌더한다.
사용: python3 render_pdf.py brief.html [out.pdf]
- Pretendard Variable 폰트를 GitHub 릴리스에서 내려받아 로컬 @font-face로 주입 (CDN 차단 환경 대비)
- Playwright(Chromium) 필요: pip install playwright --break-system-packages && playwright install chromium
"""
import sys, os, re, urllib.request, zipfile, pathlib, tempfile
src = pathlib.Path(sys.argv[1]).resolve()
out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix('.pdf')
work = pathlib.Path(tempfile.gettempdir()) / 'aro_fonts'; work.mkdir(exist_ok=True)
ttf = work / 'PretendardVariable.ttf'
if not ttf.exists():
    url = 'https://github.com/orioncactus/pretendard/releases/download/v1.3.9/Pretendard-1.3.9.zip'
    z = work / 'pt.zip'; urllib.request.urlretrieve(url, z)
    with zipfile.ZipFile(z) as zf:
        for n in zf.namelist():
            if n.endswith('public/variable/PretendardVariable.ttf'):
                ttf.write_bytes(zf.read(n))
html = src.read_text(encoding='utf-8')
face = f"@font-face{{font-family:'Pretendard Variable';src:url('file://{ttf}') format('truetype');font-weight:100 900;}}"
html = html.replace('/*FONTFACE*/', face)
html = re.sub(r'<link rel="stylesheet" href="https://cdn.jsdelivr.net[^>]*>', '', html)
tmp = work / 'render.html'; tmp.write_text(html, encoding='utf-8')
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto(tmp.as_uri()); pg.wait_for_timeout(800)
    pg.pdf(path=str(out), format='A4', print_background=True, prefer_css_page_size=True)
    b.close()
print(out)
