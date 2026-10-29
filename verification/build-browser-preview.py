"""Build an inspection-only single HTML from the exact static source.
Production source is unchanged. New scenery is embedded; unchanged public
portfolio images/documents use the existing production origin. CDN JS/fonts
still require internet. Contact delivery is deliberately disabled in preview.
"""
from pathlib import Path
import base64, json, mimetypes, re, sys, posixpath
ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://fardinflyrankai.vercel.app'
OUT = Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent/'Fardin-reference-browser-preview.html'
def data_uri(path):
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
embedded={ '/'+p.relative_to(ROOT).as_posix():data_uri(p) for pattern in ('about-summitscape.*','hero-portrait-light.*','hero-portrait-dark.*') for p in (ROOT/'assets/images').glob(pattern) }
asset=re.compile(r'''(["'])(/?(?:assets/|Anthropic_Certificates_Images/|Fardin_Hossain_Resume\.pdf|paper\.pdf)[^"']*)\1''')
def assets(text, js=False):
    def replace(m):
        value='/'+m[2].lstrip('/')
        if js and value in embedded:
            return 'window.__portfolioPreviewAssets['+json.dumps(value)+']'
        value=embedded.get(value,ORIGIN+value)
        return m[1]+value+m[1]
    return asset.sub(replace,text)
html=(ROOT/'index.html').read_text()
imports=json.loads(re.search(r'<script type="importmap">(.*?)</script>',html,re.S)[1])['imports']
for path in sorted((ROOT/'assets/js').rglob('*')):
    if path.suffix not in ('.js','.mjs'):continue
    rel=path.relative_to(ROOT).as_posix();code=path.read_text()
    def module(m):
        local=posixpath.normpath(posixpath.join(posixpath.dirname(rel),m[2]))
        if not (ROOT/local).is_file():raise RuntimeError('Missing module '+local)
        return m[1]+'@portfolio/'+local+m[1]
    code=re.sub(r'''(["'])(\.{1,2}/[^"']+\.(?:js|mjs))\1''',module,code)
    code=assets(code, js=True)
    imports['@portfolio/'+rel]='data:text/javascript;base64,'+base64.b64encode(code.encode()).decode()
html=re.sub(r'<script type="importmap">.*?</script>',lambda m:'<script type="importmap">'+json.dumps({'imports':imports})+'</script>',html,flags=re.S)
def css(m):
    p=ROOT/m[1].lstrip('/')
    return '<style>\n'+assets(p.read_text())+'\n</style>'
html=re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/>',css,html)
html=html.replace('<script type="module" src="/assets/js/app.js"></script>','<script type="module">import "@portfolio/assets/js/app.js";</script>')
# Root-relative icons/attachments become real public URLs in this private preview.
html=assets(html)
# Preview-only safety/iframe adaptation. No fake backend results.
adapter='''<script>
window.addEventListener('submit', event => {
  event.preventDefault(); event.stopImmediatePropagation();
  let note=document.getElementById('preview-form-note');
  if(!note){note=document.createElement('div');note.id='preview-form-note';note.setAttribute('role','status');note.style.cssText='position:fixed;bottom:80px;left:20px;right:20px;z-index:99999;padding:18px;background:#14191c;color:#fff;border:1px solid #ff7048;border-radius:6px;font:14px/1.6 sans-serif';document.body.append(note)}
  note.textContent='Inspection preview: contact delivery is disabled. Use the source project to test submission.';
},true);
const push=history.pushState.bind(history);
history.pushState=(s,t,u)=>push(s,t,u==='/experience/flyrank-ai'?'#preview-journey':u==='/'?'#home':u);
function links(node){
 if(node.nodeType!==1)return;
 const nodes=node.matches('a[href]')?[node]:[];
 nodes.push(...node.querySelectorAll('a[href]'));
 nodes.forEach(a=>{if(/^https?:/.test(a.href)){a.target='_blank';a.rel='noopener noreferrer'}});
}
new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(links))).observe(document.documentElement,{childList:true,subtree:true});
</script>'''
adapter=adapter.replace('<script>', '<script>window.__portfolioPreviewAssets='+json.dumps(embedded)+';',1)
html=html.replace('</head>',adapter+'</head>')
OUT.write_text(html)
print('Preview:',OUT,'bytes:',OUT.stat().st_size)
