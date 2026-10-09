// A versioned, hash-checked asset set prevents cached guide/owner geometry mixing.
export async function verifiedAsset(manifest,name,fetcher=fetch){
 const expected=manifest.assets[name];if(!/^[a-f0-9]{64}$/.test(expected||''))throw Error('리소스 해시 누락');
 const url=new URL('./'+name,import.meta.url);url.searchParams.set('v',expected);
 const response=await fetcher(url);if(!response.ok)throw Error('리소스 요청 실패: '+name);
 const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==expected)throw Error('리소스 버전 불일치: '+name+' · 새로고침하세요');return bytes;
}
export async function loadStageAssets(fetcher=fetch){
 const response=await fetcher(new URL('./stage-manifest.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('스테이지 버전 요청 실패');
 const manifest=await response.json();const [levelBytes,sourceBytes,guideBytes]=await Promise.all(['level.json','source.png','guide.png'].map(name=>verifiedAsset(manifest,name,fetcher)));
 const level=JSON.parse(new TextDecoder().decode(levelBytes));return {level,sourceBytes,guideBytes,manifest};
}
