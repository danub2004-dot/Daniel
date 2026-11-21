# Ищет на Freesound звуки ТОЛЬКО с лицензией CC0 и проверяет лицензию на странице каждого звука.
import re, sys, json, urllib.request, urllib.parse
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf8', 'ignore')
def find(q, n=6, extra=''):
    url = 'https://freesound.org/search/?' + urllib.parse.urlencode({'q': q, 'f': 'license:"Creative Commons 0"' + extra})
    ids = []
    for m in re.finditer(r'previews/\d+/(\d+)_(\d+)-lq\.mp3', get(url)):
        if m.group(1) not in [i for i, _ in ids]: ids.append((m.group(1), m.group(2)))
    out = []
    for sid, uid in ids[:n]:
        h = get(f'https://freesound.org/s/{sid}/')
        lic = set(re.findall(r'creativecommons\.org/[a-z/.0-9]+', h))
        if lic != {'creativecommons.org/publicdomain/zero/1.0/'}: continue
        title = re.search(r'<title>Freesound - (.*?)</title>', h, re.S).group(1).strip()
        dur = float(re.search(r'data-duration="([\d.]+)"', h).group(1))
        page = re.search(r'<link rel="canonical" href="([^"]+)"', h)
        hq = re.search(r'https://cdn\.freesound\.org/previews/[^"]+-hq\.mp3', h).group(0)
        out.append({'id': sid, 'title': title, 'dur': dur, 'page': page.group(1) if page else f'https://freesound.org/s/{sid}/', 'hq': hq})
    return out
if __name__ == '__main__':
    res = {}
    for q in sys.argv[1:]:
        res[q] = find(q)
        for r in res[q]: print(q, '|', r['id'], '|', round(r['dur'], 1), '|', r['title'][:80])
    json.dump(res, open('sound/candidates.json', 'w'), ensure_ascii=False, indent=1)
