// One bounded sheen buffer for every completion; previous owner is erased.
export class CompletionMask{
 constructor(width,height,runs){this.data=new Uint8ClampedArray(width*height*4);this.runs=runs;this.last=0;}
 use(id){if(this.last)for(const [a,n] of this.runs[this.last])this.data.fill(0,a*4,(a+n)*4);for(const [a,n] of this.runs[id])this.data.fill(255,a*4,(a+n)*4);this.last=id;return this.data;}
}
