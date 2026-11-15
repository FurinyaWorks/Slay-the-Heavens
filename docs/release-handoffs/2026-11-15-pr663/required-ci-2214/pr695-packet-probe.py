import subprocess,gzip,json,hashlib
from pathlib import Path
root=Path(__file__).parent
head='350c447c96dc65c1b48c48c3e0e24a3b627e4b2f';base='1cc5479b713edab6fd26db4e20f8eb22b7401cb2'
def git(rev,path):return subprocess.check_output(['git','-C','wake-1314/merge-rehearsal','show',rev+':'+path])
def sha(b):return hashlib.sha256(b).hexdigest()
b=(root/'packet.json.gz').read_bytes();assert sha(b)=='cef63cfac0c079e6f95a913c20a897464833bac8012404c4062fbb7ddebf87eb'
p=json.loads(gzip.decompress(b)); rows=[]
for path,row in p['files'].items():
 live=git(head,path).decode().replace('\r\n','\n');old=git(base,path).decode().replace('\r\n','\n')
 assert sha(live.encode())==row['current']['sha256'];assert live==row['current']['source'];assert old==row['before']['source'];assert sha(old.encode())==row['before']['sha256']
 rows.append({'path':path,'rawCurrentSha256':sha(live.encode()),'releaseBeforeSha256':sha(old.encode()),'projectByExistingHelper':row['project']})
s=git(head,'tests/ci-complete-calibration.test.mjs').decode()
assert 'pc06CiRead' not in s and 'assertPc06CiCurrent' not in s
assert 'assertReleaseBootstrapCiCurrent(rawBootstrapReadFileSync)' in s
assert "const nativeCloseoutRead=runHudPriorRead(liveDiskReadFileSync)" in s
assert "priorRead=stsStylePriorRead(menuRedPriorRead(liveDiskReadFileSync))" in s
out={'head':head,'base':base,'pc06PacketHash':sha(b),'packetExactCurrentAndPredecessorVerified':rows,'calibrationMissingPc06Boundary':True,'fullTestsRun':False,'productionUnchanged':True}
(root/'proof.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
