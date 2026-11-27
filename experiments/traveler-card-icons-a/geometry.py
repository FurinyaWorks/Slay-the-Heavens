"""Shared 5-step Geo palette and ear-clip triangulation for experimental illustrations."""
INK={'u':'#FFF2D6','p':'#E2D0AF','s':'#9C928A','h':'#B6A39A','f':'#F7E2B1'}
def cross(a,b,c): return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def tris(p):
 # Eliminate degenerate seams, then ear clip concave native paths.
 p=[v for i,v in enumerate(p) if i==0 or p[i-1]!=v]
 if len(p)>1 and p[0]==p[-1]:p.pop()
 if len(p)<3:return []
 # Split self-touching ring seams to preserve independent lobes.
 for i in range(len(p)):
  for j in range(i+2,len(p)):
   if p[i]==p[j]:return tris(p[i:j])+tris(p[j:]+p[:i])
 if sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(p,p[1:]+p[:1]))<0:p.reverse()
 arr=[]
 while len(p)>3:
  for i,b in enumerate(p):
   a,c=p[i-1],p[(i+1)%len(p)]
   if cross(a,b,c)==0:
    p.pop(i);break
   if cross(a,b,c)<0:continue
   if any(cross(a,b,x)>=0 and cross(b,c,x)>=0 and cross(c,a,x)>=0 for x in p if x not in (a,b,c)):continue
   arr.append([a,b,c]);p.pop(i);break
  else:raise ValueError(p)
 if len(p)==3 and cross(*p)!=0:arr.append(p)
 return arr
def parse(s):return [tuple(map(int,p.split(','))) for p in s.split(' ')]
