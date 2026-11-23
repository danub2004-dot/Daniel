# Склейка голоса: начало (до «спит.») + новый хвост, ужатие пауз, ускорение.
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
A=json.load(open('words.json')); cut=[i for i,w in enumerate(A) if w[0]=='спит.'][0]; A=A[:cut+1]
B=words_from(json.load(open('voice_tail_timing.json'))); B=B[:[i for i,w in enumerate(B) if w[0]=='Пиздец.'][0]+1]
G=0.5; KEEP={'Пиздец.':0.85,'Виорел.':0.7}
def plan(W,src,lead,tail):
  segs=[];start=max(0,W[0][1]-lead)
  for i in range(1,len(W)):
    gap=W[i][1]-W[i-1][2]; g=KEEP.get(W[i][0],G)
    if gap>g:
      segs.append((src,start,W[i-1][2]+g/2)); start=W[i][1]-g/2
  segs.append((src,start,W[-1][2]+tail)); return segs
segs=plan(A,0,0.11,0.35)+plan(B,1,0.2,0.3)
# пересчёт времени слов
out=[];T=0;allw=[(0,w) for w in A]+[(1,w) for w in B]
for src,a,b in segs:
  for s,w in allw:
    if s==src and w[1]>=a-1e-6 and w[2]<=b+1e-6: out.append([w[0],T+w[1]-a,T+w[2]-a])
  T+=b-a
TEMPO=1.05
out=[[w,s/TEMPO,e/TEMPO] for w,s,e in out]
json.dump(out,open('words_final.json','w'),ensure_ascii=False)
open('art/words.js','w').write('window.WORDS='+json.dumps(out,ensure_ascii=False)+';')
f=[];lab=[]
for k,(src,a,b) in enumerate(segs):
  f.append(f"[{src}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b-a-0.03:.3f}:d=0.03[s{k}]");lab.append(f"[s{k}]")
f.append(''.join(lab)+f"concat=n={len(segs)}:v=0:a=1,atempo={TEMPO}[o]")
subprocess.run(['ffmpeg','-v','error','-y','-i','voice.mp3','-i','voice_tail.mp3','-filter_complex',';'.join(f),'-map','[o]','-ar','48000','voice_final.wav'],check=True)
print('len',T/TEMPO,'words',len(out),'last',out[-1])
