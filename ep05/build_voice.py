import json,subprocess
def words_from(al):
  ch,st,en=al['characters'],al['character_start_times_seconds'],al['character_end_times_seconds']
  W=[];cur='';tag=False
  for c,s,e in zip(ch,st,en):
    if c=='[':tag=True;continue
    if c==']':tag=False;continue
    if tag:continue
    if c.isspace():
      if cur:W.append([cur,s0,pe]);cur=''
      continue
    if not cur:s0=s
    cur+=c;pe=e
  if cur:W.append([cur,s0,pe])
  return W
BL=json.load(open('blocks.json'));G=0.4;TEMPO=1.03;KEEP={'Пиздец.':0.7}
segs=[];spk=[]
for i,(who,_) in enumerate(BL):
  W=words_from(json.load(open(f'build/b{i}.json')))
  start=max(0,W[0][1]-0.12)
  for k in range(1,len(W)):
    g=KEEP.get(W[k][0].strip('«'),G)
    if W[k][1]-W[k-1][2]>g: segs.append((i,start,W[k-1][2]+g/2,who)); start=W[k][1]-g/2
  segs.append((i,start,W[-1][2]+0.22,who))
out=[];T=0
for src,a,b,who in segs:
  W=words_from(json.load(open(f'build/b{src}.json')))
  for w in W:
    if w[1]>=a-1e-6 and w[2]<=b+1e-6: out.append([w[0],(T+w[1]-a)/TEMPO,(T+w[2]-a)/TEMPO,who])
  T+=b-a
json.dump(out,open('words.json','w'),ensure_ascii=False)
open('art/words.js','w').write('window.WORDS='+json.dumps(out,ensure_ascii=False)+';')
f=[];lab=[]
for k,(src,a,b,who) in enumerate(segs):
  vol='1.0' if who=='N' else '1.15'
  f.append(f"[{src}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,volume={vol},afade=t=in:d=0.02,afade=t=out:st={b-a-0.03:.3f}:d=0.03[s{k}]");lab.append(f"[s{k}]")
f.append(''.join(lab)+f"concat=n={len(segs)}:v=0:a=1,atempo={TEMPO}[o]")
cmd=['ffmpeg','-v','error','-y']
for i in range(len(BL)): cmd+=['-i',f'build/b{i}.mp3']
subprocess.run(cmd+['-filter_complex',';'.join(f),'-map','[o]','-ar','48000','voice_final.wav'],check=True)
print('len',T/TEMPO)
for w in out: print(f"{w[1]:6.2f} {w[3]} {w[0]}")
