/* Image-space zooming; all controls stay local to the Preview window. */
(() => {
  'use strict';
  class PreviewZoom {
    static clampPan(pan, imageSize, scale, viewportSize) {
      const limit=Math.max(0,(imageSize*scale-viewportSize)/2);
      return Math.max(-limit,Math.min(limit,pan));
    }
    static anchorPan(pan, before, after, ratio) { return after-(before-pan)*ratio; }
    constructor(root) {
      this.root=root;this.viewport=root.querySelector('.preview-viewport');this.image=root.querySelector('.preview-image');
      this.output=root.querySelector('.preview-zoom-value');this.buttons=[...root.querySelectorAll('[data-zoom]')];
      this.scale=1;this.x=0;this.y=0;this.fitMode=true;this.loaded=false;this.pointers=new Map();this.lastTap=null;this.lastTouch=0;
      this.abort=new AbortController();const options={signal:this.abort.signal};
      this.image.addEventListener('load',()=>this.load(),options);
      this.image.addEventListener('error',()=>{this.loaded=false;root.querySelector('.preview-image-error').hidden=false;this.output.textContent='Unavailable';this.buttons.forEach(b=>b.disabled=true);},options);
      root.addEventListener('click',event=>{const button=event.target.closest('[data-zoom]');if(button)this.command(button.dataset.zoom);},options);
      this.viewport.addEventListener('wheel',event=>{
        if(!this.loaded)return;event.preventDefault();
        const unit=event.deltaMode===1?16:event.deltaMode===2?this.viewport.clientHeight:1;
        const delta=Math.max(-240,Math.min(240,event.deltaY*unit));
        this.zoom(this.scale*Math.exp(-delta*(event.ctrlKey ? .006 : .0025)),this.point(event));
      },{...options,passive:false});
      this.viewport.addEventListener('dblclick',event=>{if(Date.now()-this.lastTouch>700&&!this.moved){event.preventDefault();this.toggle(this.point(event));}},options);
      this.viewport.addEventListener('pointerdown',event=>this.down(event),options);
      this.viewport.addEventListener('pointermove',event=>this.move(event),options);
      this.viewport.addEventListener('pointerup',event=>this.up(event),options);
      this.viewport.addEventListener('pointercancel',event=>this.up(event,true),options);
      this.viewport.addEventListener('lostpointercapture',event=>this.up(event,true),options);
      this.observer=new ResizeObserver(()=>{if(this.loaded){if(this.fitMode)this.fit();else this.paint();}});
      this.observer.observe(this.viewport);
      if(this.image.complete&&this.image.naturalWidth)this.load();
    }
    load(){if(this.loaded)return;this.loaded=true;this.width=this.image.naturalWidth;this.height=this.image.naturalHeight;this.image.style.width=`${this.width}px`;this.image.style.height=`${this.height}px`;this.root.querySelector('.preview-image-error').hidden=true;this.fit();this.image.style.opacity='1';}
    fitScale(){return Math.min(1,Math.max(1,this.viewport.clientWidth-24)/this.width,Math.max(1,this.viewport.clientHeight-24)/this.height);}
    fit(){if(!this.loaded)return;this.fitMode=true;this.scale=this.fitScale();this.x=0;this.y=0;this.paint();}
    point(event){const r=this.viewport.getBoundingClientRect();return {x:(event.clientX-r.left)*this.viewport.clientWidth/(r.width||1),y:(event.clientY-r.top)*this.viewport.clientHeight/(r.height||1)};}
    zoom(value,before,after=before){
      if(!this.loaded)return;
      const width=this.viewport.clientWidth,height=this.viewport.clientHeight;
      before=before||{x:width/2,y:height/2};after=after||before;
      const next=Math.max(Math.min(.1,this.fitScale()),Math.min(8,value)),ratio=next/this.scale;
      this.x=PreviewZoom.anchorPan(this.x,before.x-width/2,after.x-width/2,ratio);
      this.y=PreviewZoom.anchorPan(this.y,before.y-height/2,after.y-height/2,ratio);
      this.scale=next;this.fitMode=false;this.paint();
    }
    paint(){
      const width=this.viewport.clientWidth,height=this.viewport.clientHeight;
      this.x=PreviewZoom.clampPan(this.x,this.width,this.scale,width);this.y=PreviewZoom.clampPan(this.y,this.height,this.scale,height);
      this.image.style.transform=`translate(${(width-this.width*this.scale)/2+this.x}px, ${(height-this.height*this.scale)/2+this.y}px) scale(${this.scale})`;
      const percent=this.scale*100;this.output.textContent=`${percent<10?percent.toFixed(1):Math.round(percent)}%`;
      this.viewport.dataset.zoom=String(this.scale);this.viewport.dataset.panX=String(this.x);this.viewport.dataset.panY=String(this.y);
      this.viewport.classList.toggle('can-pan',this.width*this.scale>width+.5||this.height*this.scale>height+.5);
      this.buttons.forEach(button=>{
        const action=button.dataset.zoom;
        button.disabled=action==='in'?this.scale>=8:action==='out'?this.scale<=Math.min(.1,this.fitScale())+.000001:false;
        if(action==='fit')button.setAttribute('aria-pressed',String(this.fitMode));
        if(action==='actual')button.setAttribute('aria-pressed',String(Math.abs(this.scale-1)<.0001&&!this.fitMode));
      });
    }
    command(action){if(action==='fit')this.fit();else if(action==='actual')this.zoom(1);else if(action==='in')this.zoom(this.scale*1.25);else if(action==='out')this.zoom(this.scale/1.25);}
    key(key){const action={'+':'in','=':'in','-':'out','0':'fit','1':'actual'}[key];if(!action)return false;this.command(action);return true;}
    toggle(point){if(!this.loaded)return;if(Math.abs(this.scale-this.fitScale())<.001)this.zoom(Math.max(1,this.scale*2),point);else this.fit();}
    down(event){
      if(!this.loaded||(event.pointerType==='mouse'&&event.button!==0))return;
      event.preventDefault();this.viewport.focus({preventScroll:true});
      if(!this.pointers.size){this.moved=false;this.start=this.point(event);}
      this.pointers.set(event.pointerId,this.point(event));
      if(this.pointers.size>1){this.moved=true;this.lastTap=null;}
      if(event.pointerType==='touch')this.lastTouch=Date.now();
      this.viewport.setPointerCapture(event.pointerId);this.viewport.classList.add('is-panning');
    }
    move(event){
      if(!this.pointers.has(event.pointerId))return;
      const old=[...this.pointers.values()],point=this.point(event),previous=this.pointers.get(event.pointerId);
      this.pointers.set(event.pointerId,point);
      if(Math.hypot(point.x-this.start.x,point.y-this.start.y)>4)this.moved=true;
      if(this.pointers.size>=2){
        const now=[...this.pointers.values()],mid=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}),distance=points=>Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
        if(distance(old)>1)this.zoom(this.scale*distance(now)/distance(old),mid(old),mid(now));
      }else{this.x+=point.x-previous.x;this.y+=point.y-previous.y;this.paint();}
    }
    up(event,cancelled=false){
      if(!this.pointers.has(event.pointerId))return;
      this.pointers.delete(event.pointerId);
      if(event.pointerType==='touch'){
        const now=Date.now(),point=this.point(event);this.lastTouch=now;
        if(!cancelled&&!this.moved&&!this.pointers.size){
          if(this.lastTap&&now-this.lastTap.time<320&&Math.hypot(point.x-this.lastTap.x,point.y-this.lastTap.y)<24){this.toggle(point);this.lastTap=null;}
          else this.lastTap={...point,time:now};
        }else this.lastTap=null;
      }
      if(!this.pointers.size)this.viewport.classList.remove('is-panning');
      if(this.viewport.hasPointerCapture(event.pointerId))this.viewport.releasePointerCapture(event.pointerId);
    }
    destroy(){this.abort.abort();this.observer.disconnect();this.pointers.clear();}
  }
  window.PreviewZoom=PreviewZoom;
})();
