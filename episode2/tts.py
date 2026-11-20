import json,base64,urllib.request,sys
text=open('voice_elevenlabs.txt').read().strip()
body=json.dumps({"text":text,"model_id":"eleven_v3","language_code":"ru",
 "voice_settings":{"stability":0.5,"similarity_boost":0.8}}).encode()
req=urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/ogi2DyUAKJb7CEdqqvlU/with-timestamps?output_format=mp3_44100_192",
 data=body,headers={"xi-api-key":"dummy","Content-Type":"application/json"})
try: r=json.load(urllib.request.urlopen(req,timeout=300))
except urllib.error.HTTPError as e: print(e.code,e.read()[:500]); sys.exit(1)
open('voice.mp3','wb').write(base64.b64decode(r['audio_base64']))
json.dump({"alignment":r.get('alignment'),"normalized_alignment":r.get('normalized_alignment')},open('voice_alignment.json','w'),ensure_ascii=False)
print('ok')
