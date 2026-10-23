"""Write site/vercel.json from the root vercel.json.

The root file is the one to edit. It serves a Vercel project whose Root
Directory is left empty: it publishes site/. A project whose Root Directory
is set to `site` never reads the root file, only one inside site/, and then
every .html link 404s because cleanUrls, the redirects and the headers are
all missing. This writes that copy, identical except that it publishes its
own directory. Run it after any change to vercel.json:

    python tools/sync-vercel.py
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'vercel.json'), encoding='utf-8'))
cfg['buildCommand'] = 'echo "static site, nothing to build"'
cfg['outputDirectory'] = '.'
out = os.path.join(ROOT, 'site', 'vercel.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(cfg, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('wrote', os.path.relpath(out, ROOT))
