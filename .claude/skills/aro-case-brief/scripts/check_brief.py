"""완성된 HTML 브리프의 규칙 위반을 점검한다.
사용: python3 check_brief.py brief.html
"""
import sys, re, html as H
s = open(sys.argv[1], encoding='utf-8').read()
body = s.split('<body>')[1] if '<body>' in s else s
text = H.unescape(re.sub(r'<[^>]+>', ' ', body))
issues = []
if '—' in text: issues.append('em dash(—) 사용 %d회' % text.count('—'))
if re.search(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]', text): issues.append('이모지 포함')
if re.search(r'serif|Noto Serif|명조', s, re.I) and 'sans-serif' not in s: issues.append('세리프 폰트 의심')
if 'word-break:keep-all' not in s: issues.append('줄바꿈 규칙 위반: word-break:keep-all 이 없음 (단어 중간에서 끊김)')
if re.search(r'word-break\s*:\s*normal', s): issues.append('줄바꿈 규칙 위반: word-break:normal 사용')
if re.search(r'text-align\s*:\s*justify', s): issues.append('줄바꿈 규칙 위반: text-align:justify 사용')
left = re.findall(r'\{\{[^}]*\}\}', body)
if left: issues.append('미치환 플레이스홀더 %d개: %s' % (len(left), ', '.join(left[:5])))
for key in ['한 줄 결론', 'HR POINT', '읽는 법', 'FINAL INSIGHT', '자료 출처 및 해석 유의사항']:
    if key not in text: issues.append('필수 요소 누락: ' + key)
if '확인' not in text.split('자료 출처')[-1]: issues.append('출처 섹션에 해석 한계 서술이 없음')
print('\n'.join(issues) if issues else 'OK: 규칙 위반 없음')
