from pathlib import Path
import subprocess,json,hashlib
old='86670bcfc6565153595abf2e0476bf70750fdc19';new='3650db918578f92aec3bd24a456572ca6b2cdb2f';freeze='f8acc21780b90712bffba383101e34fea3471bf8'
p='tests/helpers/release-ci.cases.mjs'
def binding(ref):
 b=subprocess.check_output(['git','show',ref+':'+p]);return {'source':b.decode(),'sha256':hashlib.sha256(b).hexdigest(),'gitBlob':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()}
packet={'schemaVersion':1,'parents':[new,freeze],'priorParents':[old,freeze],'priorPacketSha256':'60ed9b12e0bb15e69846473d4e45d9f72412cc2246b9d6430bea41d5956febb9','files':{p:{'before':binding(old),'current':binding(new)}}}
b=(json.dumps(packet,ensure_ascii=False,indent=2)+'\n').encode();Path('tests/helpers/release-fast-freeze-eol-continuation.json').write_bytes(b);print(hashlib.sha256(b).hexdigest())
