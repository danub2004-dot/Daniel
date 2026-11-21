# Собирает дорожку голоса из фрагментов: убирает тишину по краям, сокращает длинные паузы,
# ускоряет темп и пересчитывает тайминги каждого слова (из alignment ElevenLabs).
import json, subprocess, re, numpy as np
SR=48000; TEMPO=1.08; THR=10**(-42/20)
GAP_DEFAULT=0.22; GAP={'05':0.5,'08b':0.15,'08c':0.15,'09a':0.35,'14':0.15,'16':0.4,'19a':0.6,'19b':0.9,'20':0.6}
LEAD=0.3; TAIL=2.0
def load(p):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy()
seg=json.load(open('segments.json'))
out=[np.zeros(int(LEAD*SR),np.float32)]; t=LEAD; words=[]; segs=[]
for s in seg:
    if s['id'] in GAP or out[-1].size and len(segs): 
        g=GAP.get(s['id'],GAP_DEFAULT) if segs else 0
        out.append(np.zeros(int(g*SR),np.float32)); t+=g
    a=load(f"voice/{s['id']}.mp3")
    fr=int(0.01*SR); n=len(a)//fr
    rms=np.sqrt((a[:n*fr].reshape(n,fr)**2).mean(1)); loud=rms>THR
    idx=np.where(loud)[0]; first,last=idx[0],idx[-1]
    # интервалы, которые оставляем (в кадрах по 10 мс)
    keep=[]; i=max(first-3,0); end=min(last+8,n)
    cur=i
    while i<end:
        if not loud[i]:
            j=i
            while j<end and not loud[j]: j+=1
            if j-i>50: keep.append((cur,i+35)); cur=j  # пауза >0.5с -> 0.35с
            i=j
        else: i+=1
    keep.append((cur,end))
    pieces=[a[x*fr:y*fr] for x,y in keep]; seg_audio=np.concatenate(pieces)
    def tmap(sec):
        f=sec/0.01; acc=0
        for x,y in keep:
            if f<x: return acc*0.01
            if f<=y: return (acc+f-x)*0.01
            acc+=y-x
        return acc*0.01
    al=json.load(open(f"voice/{s['id']}.align.json"))
    ch=al['characters']; st=al['character_start_times_seconds']; en=al['character_end_times_seconds']
    text=''.join(ch); intag=False; w=None
    for k,c in enumerate(ch):
        if c=='[': intag=True
        if intag:
            if c==']': intag=False
            continue
        if re.match(r"[\wёЁ-]",c) and not (c=='-' and w is None):
            if w is None: w={'text':'','start':st[k]}
            w['text']+=c; w['end']=en[k]
        else:
            if w: words.append({'seg':s['id'],'voice':s['v'],'text':w['text'],'start':t+tmap(w['start']),'end':t+tmap(w['end'])}); w=None
    if w: words.append({'seg':s['id'],'voice':s['v'],'text':w['text'],'start':t+tmap(w['start']),'end':t+tmap(w['end'])})
    dur=len(seg_audio)/SR
    segs.append({'id':s['id'],'voice':s['v'],'start':t,'end':t+dur,'text':re.sub(r'\[[^\]]*\]\s*','',s['t'])})
    out.append(seg_audio); t+=dur
out.append(np.zeros(int(TAIL*SR),np.float32))
full=np.concatenate(out)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-af',f'atempo={TEMPO}','-c:a','pcm_s24le','voice_master.wav'],input=full.tobytes())
for x in words+segs:
    x['start']=round(x['start']/TEMPO,3); x['end']=round(x['end']/TEMPO,3)
json.dump({'duration':round(len(full)/SR/TEMPO,3),'segments':segs,'words':words},open('timeline.json','w'),ensure_ascii=False,indent=1)
print('duration',round(len(full)/SR/TEMPO,2),'words',len(words))
