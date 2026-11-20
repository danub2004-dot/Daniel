import json,urllib.request,base64,subprocess
VO={'N':'ogi2DyUAKJb7CEdqqvlU','V':'pM78bgjPVk0JXtaEnFoj'}
B=json.load(open('blocks.json'));out=[]
for i,(who,txt) in enumerate(B):
  body=json.dumps({'text':txt,'model_id':'eleven_v3','language_code':'ru'}).encode()
  r=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VO[who]}/with-timestamps?output_format=mp3_44100_192',body,{'Content-Type':'application/json','xi-api-key':'x'})
  d=json.load(urllib.request.urlopen(r,timeout=300))
  open(f'build/b{i}.mp3','wb').write(base64.b64decode(d['audio_base64']))
  json.dump(d['alignment'],open(f'build/b{i}.json','w'),ensure_ascii=False)
  print(i,who,len(txt),d['alignment']['character_end_times_seconds'][-1])
