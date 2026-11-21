import json,sys,base64,urllib.request,os
V={"A":"ELWVgJ5Mo9lF5Tha9ahW","N":"pM78bgjPVk0JXtaEnFoj"}
seg=json.load(open('segments.json')); only=sys.argv[1:]
os.makedirs('voice',exist_ok=True); total=0
for s in seg:
    if only and s['id'] not in only: continue
    body=json.dumps({"text":s['t'],"model_id":"eleven_v3","voice_settings":{"stability":0.5}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[s['v']]}/with-timestamps?output_format=mp3_44100_192",data=body,headers={"xi-api-key":"dummy","Content-Type":"application/json"})
    d=json.load(urllib.request.urlopen(req,timeout=120))
    open(f"voice/{s['id']}.mp3","wb").write(base64.b64decode(d['audio_base64']))
    json.dump(d.get('alignment'),open(f"voice/{s['id']}.align.json","w"),ensure_ascii=False)
    total+=len(s['t']); print(s['id'],'ok',flush=True)
print('chars',total)
