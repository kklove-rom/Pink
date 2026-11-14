const I={
acc:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1"/>',
wish:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
set:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M15 5l-7 7 7 7"/>',
cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
out:'<path d="M12 4v11M7 9l5-5 5 5M5 20h14"/>',inn:'<path d="M12 15V4M7 10l5 5 5-5M5 20h14"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M12 8H8.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8zM12 8h3.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z"/><path d="M3 14h18"/>',
check:'<path d="M4 12l5 5L20 6"/>',
trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
grip:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
all:'<path d="M2.5 12.5l4 4 7-9M11 16l1.5 1.5 9-10.5"/>'};
const ic=n=>`<svg viewBox="0 0 24 24">${I[n]}</svg>`;
const $=s=>document.querySelector(s);
let D={profile:{name:'',bio:'',avatar:'',cover:''},accounts:[],wishes:[]};
try{const s=localStorage.getItem('pink-ledger');if(s)D=JSON.parse(s)}catch(e){}
const save=()=>{try{localStorage.setItem('pink-ledger',JSON.stringify(D))}catch(e){}};
const uid=()=>Math.random().toString(36).slice(2,9);
const cents=n=>Math.round((Number(n)||0)*100);
const r2=n=>cents(n)/100;
const sumItems=arr=>(arr||[]).reduce((t,i)=>t+cents(i&&i.amt),0)/100;
const fmt=n=>'¥'+(Number(n)||0).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum=a=>sumItems(a.items);
function normAcc(){
 if(!D.profile||typeof D.profile!=='object')D.profile={name:'',bio:'',avatar:'',cover:''};
 if(!Array.isArray(D.accounts))D.accounts=[];
 const base=Date.now()-D.accounts.length*1000;
 D.accounts.forEach((a,k)=>{if(!(a.created>0))a.created=base+k});
 if(!D.accSorted)D.accounts.sort((x,y)=>x.created-y.created);
 D.accounts.forEach(a=>{
  if(!a.id)a.id=uid();
  if(!Array.isArray(a.items))a.items=[];
  a.items.forEach(i=>{i.amt=r2(i.amt);i.y=parseInt(i.y)||new Date().getFullYear();i.m=Math.min(12,Math.max(1,parseInt(i.m)||1));if(!i.id)i.id=uid()});
 });
}
normAcc();
let tab='acc',cur=null;
let accMode='normal',hot=null,lpAt=0;const sel=new Set();
$('#nav').innerHTML=[['acc','账户'],['wish','心愿单'],['set','设置']].map(([k,t])=>`<button data-k="${k}">${ic(k)}<span>${t}</span></button>`).join('');
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b){tab=b.dataset.k;cur=null;w2closeDrawer();render()}};
function render(){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.k===tab));
 if(tab!=='acc'||cur){accMode='normal';hot=null;sel.clear()}
 const fab=$('#fab');fab.style.display='none';
 const m=$('#main');m.style.background='';$('#nav').style.display=(tab==='acc'&&cur)?'none':'flex';
 if(tab==='acc'){
  if(cur){const a=D.accounts.find(x=>x.id===cur);if(!a){cur=null;return render()}
   const nd=new Date(),nowY=nd.getFullYear(),nowM=nd.getMonth()+1;
   const rows=a.items.slice().sort((x,y)=>y.y-x.y||y.m-x.m);
   const byYear={};
   rows.forEach(i=>{
    const y=i.y;
    if(!byYear[y])byYear[y]={items:[],months:{}};
    byYear[y].items.push(i);
    (byYear[y].months[i.m]=byYear[y].months[i.m]||[]).push(i);
   });
   const years=Object.keys(byYear).sort((a,b)=>b-a);
   const body=years.length
    ?years.map(y=>{const g=byYear[y],s=sumItems(g.items);
      const months=Object.keys(g.months).map(Number).sort((a,b)=>b-a);
      return `<div class="yr"><div class="year-head open"><div class="year-left"><span class="fold">▸</span><span class="year">${y}</span></div><span class="total">${fmt(s)}</span></div><div class="items">`+
      months.map(mo=>{const list=g.months[mo];
       return `<div class="month-row"><div class="month-info"><div class="month-name">${mo}月${(+y===nowY&&mo===nowM)?'<span class="now-tag">本月</span>':''}</div><div class="month-sub">${list.length} 笔收入</div></div><div class="month-tap" data-y="${y}" data-m="${mo}" role="button" tabindex="0" title="双击查看明细"><div class="month-amt">${fmt(sumItems(list))}</div></div></div>`;
      }).join('')+`</div></div>`;
     }).join('')
    :'<div class="acc-empty">还没有收入记录</div>';
   m.innerHTML=`<div class="top"><button class="back" id="bk">${ic('back')}</button><h2>${esc(a.name)}</h2><b>${fmt(sum(a))}</b></div>`+body;
   $('#bk').onclick=()=>{cur=null;render()};
   m.querySelectorAll('.year-head').forEach(h=>h.onclick=()=>h.classList.toggle('open'));
   /* 双击月份右侧金额：打开该月明细弹窗A */
   m.querySelectorAll('.month-tap').forEach(el=>{
    let at=0;
    const open=()=>openMonthSheet(a,parseInt(el.dataset.y,10),parseInt(el.dataset.m,10));
    el.addEventListener('click',e=>{
     e.stopPropagation();
     const n=Date.now();
     if(n-at<400){at=0;open();}
     else{at=n;el.classList.add('tapped');setTimeout(()=>el.classList.remove('tapped'),160);}
    });
    el.addEventListener('keydown',e=>{
     if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}
    });
   });
   fab.innerHTML=ic('plus');fab.style.display='grid';fab.onclick=()=>incomeSheet(a);
  }else{
   const tot=r2(D.accounts.reduce((t,a)=>t+cents(sum(a)),0)/100);
   const none=!D.accounts.length;
   const hdr=accMode==='select'
    ?`<button class="ib" id="sa">${ic('all')}</button><button class="ib pk" id="dl" ${sel.size?'':'disabled'}>${ic('trash')}${sel.size?`<i class="bd">${sel.size}</i>`:''}</button><button class="ib" id="xx">${ic('close')}</button>`
    :accMode==='sort'
    ?`<button class="ib pk" id="dn">${ic('check')}</button>`
    :`<button class="ib" id="ad">${ic('plus')}</button><button class="ib" id="tr" ${none?'disabled':''}>${ic('trash')}</button>`;
   m.innerHTML=`<div class="hero"><small>总收入</small><b>${fmt(tot)}</b></div>
   <div class="row sec"><h3>账户管理</h3><div class="acts">${hdr}</div></div><div id="accl">`+
   D.accounts.map(a=>{
    const amt=`<span class="amt">${fmt(sum(a))}</span>`;
    if(accMode==='select')return `<div class="card row" data-id="${a.id}"><span class="lf"><i class="ck ${sel.has(a.id)?'on':''}">${ic('check')}</i><span>${esc(a.name)}</span></span>${amt}</div>`;
    if(accMode==='sort')return `<div class="card row${a.id===hot?' hot':''}" data-id="${a.id}"><span>${esc(a.name)}</span><span class="rt">${amt}<span class="gh">${ic('grip')}</span></span></div>`;
    return `<div class="card row" data-id="${a.id}"><span>${esc(a.name)}</span>${amt}</div>`;
   }).join('')+`</div>`;
   accBind();
  }
 }
 if(tab==='wish'){w2render()}
 if(tab==='set'){
  const p=D.profile;
  m.innerHTML=`<div class="cover" style="${p.cover?`background-image:url(${p.cover})`:''}"><button id="cv">${ic('cam')}</button></div>
  <div class="av" id="avt" style="${p.avatar?`background-image:url(${p.avatar})`:''}">${p.avatar?'':ic('set')}</div>
  <div class="nm">${esc(p.name||'Pink')}</div><div class="bio">${esc(p.bio||'')}</div>
  <div class="list"><button id="pf">${ic('edit')}<span class="sp">${'昵称 / 签名'}</span></button><button id="ex">${ic('out')}<span class="sp">导出账目</span></button><button id="im">${ic('inn')}<span class="sp">导入账目</span></button></div>`;
  $('#cv').onclick=()=>pick('cover');$('#avt').onclick=()=>pick('avatar');
  $('#pf').onclick=profSheet;$('#ex').onclick=exportD;$('#im').onclick=()=>$('#imp').click();
 }
}
function accBind(){
 const list=$('#accl');if(!list)return;
 const g=id=>document.getElementById(id);
 if(g('ad'))g('ad').onclick=accSheet;
 if(g('tr'))g('tr').onclick=()=>{if(!D.accounts.length)return;accMode='select';sel.clear();render()};
 if(g('xx'))g('xx').onclick=()=>{accMode='normal';sel.clear();render()};
 if(g('dn'))g('dn').onclick=()=>{accMode='normal';hot=null;render()};
 if(g('sa'))g('sa').onclick=()=>{
  if(sel.size===D.accounts.length)sel.clear();else D.accounts.forEach(a=>sel.add(a.id));
  render();
 };
 if(g('dl'))g('dl').onclick=()=>{
  if(!sel.size)return;
  open(`<div class="cf">${ic('trash')}</div><div class="two"><button class="btn ico" id="cn" style="background:var(--l);color:var(--t)">${ic('close')}</button><button class="btn ico" id="cok" style="background:var(--p)">${ic('check')}</button></div>`);
  $('#cn').onclick=close;
  $('#cok').onclick=()=>{
   D.accounts=D.accounts.filter(a=>!sel.has(a.id));
   sel.clear();accMode='normal';save();close();render();
  };
 };
 list.querySelectorAll('.card').forEach(c=>{
  c.oncontextmenu=e=>e.preventDefault();
  if(accMode==='select'){
   c.onclick=()=>{const id=c.dataset.id;sel.has(id)?sel.delete(id):sel.add(id);render()};
  }else if(accMode==='sort'){
   bindDrag(c,list);
  }else{
   c.onclick=()=>{if(Date.now()-lpAt<800)return;cur=c.dataset.id;render()};
   bindLong(c);
  }
 });
}
/* 长按约 5 秒进入排序模式 */
function bindLong(c){
 let t=null,sx=0,sy=0;
 const stop=()=>{clearTimeout(t);t=null;c.classList.remove('pressing')};
 c.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  sx=e.clientX;sy=e.clientY;
  c.classList.add('pressing');
  clearTimeout(t);
  t=setTimeout(()=>{
   t=null;lpAt=Date.now();accMode='sort';hot=c.dataset.id;render();
   try{navigator.vibrate&&navigator.vibrate(30)}catch(_){}
  },5000);
 });
 c.addEventListener('pointermove',e=>{
  if(t&&(Math.abs(e.clientX-sx)>8||Math.abs(e.clientY-sy)>8))stop();
 });
 ['pointerup','pointercancel','pointerleave'].forEach(n=>c.addEventListener(n,()=>{if(t)stop()}));
}
/* 拖拽图标排序 */
function bindDrag(c,list){
 const h=c.querySelector('.gh');if(!h)return;
 const main=$('#main');
 let active=false,sy=0;
 h.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  active=true;sy=e.clientY;
  c.classList.remove('hot');c.classList.add('dragging');
  try{h.setPointerCapture(e.pointerId)}catch(_){}
 });
 h.addEventListener('pointermove',e=>{
  if(!active)return;
  /* 靠近上下边缘时自动滚动，并补偿位移 */
  const mr=main.getBoundingClientRect();
  let d=0;
  if(e.clientY<mr.top+50)d=-10;else if(e.clientY>mr.bottom-110)d=10;
  if(d){const b=main.scrollTop;main.scrollTop=b+d;sy-=(main.scrollTop-b)}
  c.style.transform='translateY('+(e.clientY-sy)+'px)';
  const r=c.getBoundingClientRect(),cy=r.top+r.height/2;
  for(const o of [...list.children]){
   if(o===c)continue;
   const ro=o.getBoundingClientRect(),mid=ro.top+ro.height/2;
   const after=c.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_FOLLOWING;
   let moved=false;
   if(after&&cy>mid){list.insertBefore(c,o.nextSibling);moved=true}
   else if(!after&&cy<mid){list.insertBefore(c,o);moved=true}
   if(moved){
    c.style.transform='';
    const n=c.getBoundingClientRect(),need=r.top-n.top;
    c.style.transform='translateY('+need+'px)';
    sy=e.clientY-need;
    break;
   }
  }
 });
 const end=()=>{
  if(!active)return;
  active=false;
  c.classList.remove('dragging');c.style.transform='';
  const ids=[...list.children].map(x=>x.dataset.id);
  D.accounts.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
  D.accSorted=true;
  save();
 };
 h.addEventListener('pointerup',end);
 h.addEventListener('pointercancel',end);
}
function open(h,c){$('#sheet').className='sheet '+(c||'');$('#sheet').innerHTML=h;$('#mask').classList.add('on')}
function close(){$('#mask').classList.remove('on')}
$('#mask').onclick=e=>{if(e.target.id==='mask')close()};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function accSheet(){open(`<input id="an" placeholder="账户名称"><button class="btn" id="ok">确定</button>`);
 $('#ok').onclick=()=>{const n=$('#an').value.trim();if(!n)return;D.accounts.push({id:uid(),name:n,items:[],created:Date.now()});save();close();render()}}
function incomeSheet(a,it,opts){const d=new Date();const fromMonth=!!(opts&&opts.month);
 let y=it?it.y:(fromMonth?opts.y:d.getFullYear()),mo=it?it.m:(fromMonth?opts.m:d.getMonth()+1);
 open(`<i class="hd"></i><div class="big"><b>¥</b><input id="ia" type="number" inputmode="decimal" placeholder="0.00" value="${it?it.amt:''}"></div><div class="ys"><button id="yp">${ic('back')}</button><b id="yv">${y}</b><button id="yn" style="transform:scaleX(-1)">${ic('back')}</button></div><div class="mg">${Array.from({length:12},(_,i)=>`<button data-m="${i+1}" class="${i+1===mo?'on':''}">${i+1}月</button>`).join('')}</div><input id="in" placeholder="备注" value="${it?esc(it.note||''):''}">${it?`<div class="two"><button class="btn" id="bk2" style="background:var(--l);color:var(--t);flex:1">返回</button><button class="btn" id="ok" style="flex:1">确定修改</button></div>`:'<button class="btn" id="ok">确定</button>'}`);
 if(it)$('#bk2').onclick=close;
 const yv=$('#yv');$('#yp').onclick=()=>yv.textContent=--y;$('#yn').onclick=()=>yv.textContent=++y;
 document.querySelectorAll('.mg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mo=+b.dataset.m});
 $('#ok').onclick=()=>{const v=parseFloat($('#ia').value);if(!(v>0))return;
  if(it){it.amt=r2(v);it.y=y;it.m=mo;it.note=$('#in').value.trim()}
  else a.items.unshift({id:uid(),amt:r2(v),y,m:mo,note:$('#in').value.trim()});
  save();close();render();
  if(aCtx){aCtx={accId:a.id,y,m:mo};renderMonthSheet()}}}
function profSheet(){open(`<input id="pn" placeholder="昵称" value="${esc(D.profile.name)}"><input id="pb" placeholder="签名" value="${esc(D.profile.bio)}"><button class="btn" id="ok">确定</button>`);
 $('#ok').onclick=()=>{D.profile.name=$('#pn').value.trim();D.profile.bio=$('#pb').value.trim();save();close();render()}}
let target='';
function pick(t){target=t;$('#file').value='';$('#file').click()}
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{const im=new Image();im.onload=()=>{const mx=target==='cover'?900:300,s=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');
  c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  D.profile[target]=c.toDataURL('image/jpeg',.75);save();render()};im.src=r.result};r.readAsDataURL(f)};
function exportD(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:'application/json'}));a.download='pink-ledger.json';a.click()}
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const j=JSON.parse(r.result);if(j.accounts&&j.wishes&&j.profile){D=j;normAcc();save();render();toast('导入成功')}else toast('文件格式不正确')}catch(x){toast('导入失败')}$('#imp').value=''};r.readAsText(f)};

/* ===================== 心愿单：由「心愿单.html」完整迁入 ===================== */
const w2Gift='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12M12 8l-4-4M12 8l4-4"/></svg>';
const w2Check='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>';
const w2$=id=>document.getElementById(id);
const w2today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const w2banner=()=>{const e=w2$('banner');e.classList.add('on');clearTimeout(w2banner._t);w2banner._t=setTimeout(()=>e.classList.remove('on'),3200)};
let w2tab='ing';

/* 数据统一落在 D.wishes（随 Pink 一起导入 / 导出）；
   若 Pink 尚无心愿数据，则吸收原独立页面 localStorage('wishes') 里的记录 */
if(!Array.isArray(D.wishes))D.wishes=[];
if(D.wishes.length===0){
 try{const s=localStorage.getItem('wishes');if(s){const a=JSON.parse(s);if(Array.isArray(a)&&a.length)D.wishes=a}}catch(e){}
}
function w2normalize(){
 D.wishes.forEach(x=>{
  x.amt=r2(typeof x.amt==='number'?x.amt:(Number(x.amt)||Number(x.budget)||0));
  x.saved=r2(x.saved);
  if(!Array.isArray(x.logs))x.logs=Array.isArray(x.log)?x.log.map(l=>({d:l.d,v:Number(l.a)||0})):[];
  x.logs.forEach(l=>{l.v=r2(l.v)});
  if(typeof x.note!=='string')x.note=typeof x.msg==='string'?x.msg:'';
  if(x.status!=='done')x.status=x.saved>=x.amt?'done':'ing';
  if(!x.id)x.id=uid();
  if(!x.cat)x.cat='虚拟物品';
 });
}

/* 键盘适配：抽屉锚定到 visualViewport 可视区域，键盘弹起时自动上移 */
const w2vv=window.visualViewport;
let w2drawerScrollTimer=null;
function w2fitDrawer(){
 const d=w2$('dmask');
 if(!d||!d.classList.contains('on'))return;
 if(w2vv){
  d.style.top=w2vv.offsetTop+'px';
  d.style.height=w2vv.height+'px';
  d.style.bottom='auto';
 }
 clearTimeout(w2drawerScrollTimer);
 w2drawerScrollTimer=setTimeout(()=>{const ok=w2$('dok');if(ok)ok.scrollIntoView({block:'end',behavior:'smooth'})},300);
 setTimeout(()=>{const ok=w2$('dok');if(ok)ok.scrollIntoView({block:'end'})},650);
}
if(w2vv){w2vv.addEventListener('resize',w2fitDrawer);w2vv.addEventListener('scroll',w2fitDrawer)}
window.addEventListener('resize',w2fitDrawer);

/* ---------- 列表渲染 ---------- */
function w2render(){
 w2normalize();
 const ing=D.wishes.filter(x=>x.status!=='done');
 const done=D.wishes.filter(x=>x.status==='done');
 const m=$('#main');
 m.innerHTML=`<div class="w2"><div class="tabs"><button class="tab ${w2tab==='ing'?'on':''}" data-w2="ing">心愿中 (${ing.length})</button><button class="tab ${w2tab==='done'?'on':''}" data-w2="done">已实现 (${done.length})</button></div><div id="w2list"></div></div>`;
 const box=w2$('w2list');
 const arr=w2tab==='ing'?ing:done;
 if(arr.length===0){
  box.innerHTML=w2tab==='ing'
  ?`<div class="empty"><div class="empty-ic">${w2Gift}</div><div class="empty-t">暂无心愿物品</div><button class="empty-btn" id="eb">+ 记下第一个心愿</button></div>`
  :`<div class="empty"><div class="empty-ic">${w2Check}</div><div class="empty-t">暂无已实现的心愿</div></div>`;
 }else{
  box.innerHTML=arr.map(x=>`<div class="swipe" data-id="${x.id}">
<button class="del" data-del="${x.id}">删除</button>
<div class="wo-row" data-id="${x.id}">
<div class="icon">${w2Gift}</div>
<div class="info"><b>${esc(x.name)}</b><span>${esc(x.cat)}</span></div>
<div class="amt">${fmt(x.amt)}</div>
</div></div>`).join('')
  +(w2tab==='ing'?`<button class="add-bottom" id="ab">+ 记下新心愿</button>`:'');
 }
 m.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{w2tab=b.dataset.w2;w2OpenRow=null;w2render()});
 if(w2tab==='ing'){
  const eb=w2$('eb');if(eb)eb.onclick=w2openForm;
  const ab=w2$('ab');if(ab)ab.onclick=w2openForm;
 }
 m.querySelectorAll('.wo-row').forEach(w2bindSwipe);
 m.querySelectorAll('.del').forEach(b=>b.onclick=e=>{
  e.stopPropagation();
  D.wishes=D.wishes.filter(o=>o.id!==b.dataset.del);
  save();w2render();toast('已删除');
 });
}

/* ---------- 左滑删除 / 点击进入详情 ---------- */
const w2W=80;
let w2OpenRow=null;
function w2closeOpenRow(except){
 if(w2OpenRow&&w2OpenRow!==except){w2OpenRow.style.transform='';w2OpenRow._x=0}
 if(!except)w2OpenRow=null;
}
function w2bindSwipe(row){
 let sx=0,sy=0,base=0,moved=false,tracking=false,dir=null;
 row._x=0;
 row.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  tracking=true;moved=false;row._moved=false;dir=null;sx=e.clientX;sy=e.clientY;base=row._x||0;
  w2closeOpenRow(row);
 });
 row.addEventListener('pointermove',e=>{
  if(!tracking)return;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(!dir){
   if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
   dir=Math.abs(dx)>Math.abs(dy)?'h':'v';
   if(dir==='h'){moved=true;row.classList.add('drag');try{row.setPointerCapture(e.pointerId)}catch(_){}}
  }
  if(dir!=='h')return;
  row._x=Math.max(-w2W,Math.min(0,base+dx));
  row.style.transform='translateX('+row._x+'px)';
 });
 const end=e=>{
  if(!tracking)return;
  tracking=false;row.classList.remove('drag');row._moved=moved;
  if(!moved)return;
  const open=row._x<-w2W/2;
  row._x=open?-w2W:0;
  row.style.transform=open?'translateX(-'+w2W+'px)':'';
  w2OpenRow=open?row:null;
 };
 row.addEventListener('click',()=>{
  if(row._moved){row._moved=false;return}
  if(row._x<0){row._x=0;row.style.transform='';w2OpenRow=null;return}
  w2openDrawer(row.dataset.id);
 });
 row.addEventListener('pointerup',end);
 row.addEventListener('pointercancel',end);
}
document.addEventListener('pointerdown',e=>{
 if(w2OpenRow&&!e.target.closest('.swipe'))w2closeOpenRow();
});

/* ---------- 详情抽屉 ---------- */
let w2curId=null;
function w2openDrawer(id){
 const x=D.wishes.find(o=>o.id===id);if(!x)return;
 w2curId=id;
 const left=Math.max(0,(cents(x.amt)-cents(x.saved))/100);
 const isDone=x.status==='done';
 w2$('drawer').innerHTML=
`<div class="d-head"><div class="icon">${w2Gift}</div><div class="t"><b>${esc(x.name)}</b><span>${esc(x.cat)}</span></div><div class="d-amt">${fmt(x.amt)}</div><button class="d-x" id="dx">✕</button></div>
<div class="d-left"><small>${isDone?'已达成目标':'还差'}</small><strong>${isDone?fmt(x.amt):fmt(left)}</strong></div>
<div class="d-stat"><small>已存入</small><b>${fmt(x.saved)}</b></div>
${x.note?`<div class="d-note">${esc(x.note)}</div>`:''}
${x.logs.length?`<div class="logs"><div class="lh">存入记录</div><div class="box">${x.logs.slice().reverse().map(l=>`<div class="li"><span>${l.d}</span><b>+${fmt(l.v)}</b></div>`).join('')}</div></div>`:''}
${isDone?'':`<div class="dep"><span>¥</span><input id="dv" type="number" inputmode="decimal" placeholder="今天存入多少？" min="0"></div>
<button class="btn pink" id="dok" disabled>存入</button>`}`;
 w2$('dmask').classList.add('on');
 w2$('dx').onclick=w2closeDrawer;
 if(w2vv)w2fitDrawer();
 if(!isDone){
  const dv=w2$('dv'),dok=w2$('dok');
  dv.oninput=()=>{dok.disabled=!(parseFloat(dv.value)>0)};
  dv.onkeydown=e=>{if(e.key==='Enter'&&!dok.disabled)dok.click()};
  dok.onclick=()=>w2deposit(dv);
  /* 聚焦时重新定位抽屉并延迟滚动，确保按钮不被键盘遮挡、可点击 */
  dv.addEventListener('focus',()=>{
   w2fitDrawer();
   setTimeout(w2fitDrawer,300);
   setTimeout(w2fitDrawer,650);
  });
 }
}
function w2closeDrawer(){
 const d=w2$('dmask');
 if(!d)return;
 d.classList.remove('on');
 d.style.top='';d.style.height='';d.style.bottom='';
 w2curId=null;
}
let w2pending=null,syncAcc=null;
function w2deposit(input){
 const x=D.wishes.find(o=>o.id===w2curId);if(!x)return;
 const v=Math.round(parseFloat(input.value)*100)/100;
 if(!(v>0))return;
 w2pending={id:x.id,amount:v};
 syncAcc=D.accounts.length?D.accounts[0].id:null;
 openSyncSheet();
}
function monthIncomeOf(a){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;
 return sumItems(a.items.filter(i=>i.y===y&&i.m===m));
}
function openSyncSheet(){
 if(!w2pending)return;
 w2$('syncAmt').textContent=fmt(w2pending.amount);
 renderSyncAccounts();
 w2$('syncMask').classList.add('on');
 w2$('syncMask').setAttribute('aria-hidden','false');
}
function closeSyncSheet(){
 w2$('syncMask').classList.remove('on');
 w2$('syncMask').setAttribute('aria-hidden','true');
}
function renderSyncAccounts(){
 const list=w2$('syncList');
 const pv=w2$('syncPreview');
 if(!D.accounts.length){
  syncAcc=null;
  list.innerHTML='<div class="sync-empty">暂无账户，本次仅存入心愿单</div>';
  pv.textContent='';
  return;
 }
 if(!D.accounts.some(a=>a.id===syncAcc))syncAcc=D.accounts[0].id;
 list.innerHTML=D.accounts.map(a=>{
  const cur=monthIncomeOf(a);
  return `<button class="sync-row${a.id===syncAcc?' on':''}" data-sync="${a.id}" type="button">
   <span class="pk-av">${esc(a.name.slice(0,1))}</span>
   <span class="pk-main"><b>${esc(a.name)}</b><small>本月收入 ${fmt(cur)} → ${fmt(r2(cur+w2pending.amount))}</small></span>
   <span class="sync-radio"></span>
  </button>`;
 }).join('');
 const a=D.accounts.find(x=>x.id===syncAcc);
 const cur=monthIncomeOf(a);
 pv.innerHTML=esc(a.name)+' 本月收入 <b>'+fmt(cur)+'</b> → <b>'+fmt(r2(cur+w2pending.amount))+'</b>';
}
function confirmWishDeposit(skipAccount){
 const x=D.wishes.find(o=>o.id===(w2pending&&w2pending.id));
 if(!x||!w2pending)return;
 const v=w2pending.amount;
 const acc=skipAccount?null:(D.accounts.find(a=>a.id===syncAcc)||null);
 x.saved=(cents(x.saved)+cents(v))/100;
 const d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;
 if(acc){acc.items.unshift({id:uid(),amt:r2(v),y,m,note:'心愿单存入 · '+x.name})}
 x.logs.push({d:w2today(),v});
 const done=cents(x.saved)>=cents(x.amt);
 if(done)x.status='done';
 w2pending=null;
 save();
 closeSyncSheet();
 w2closeDrawer();
 render();
 if(done){toast('哇塞你好厉害，已将此物收入囊中!');w2banner()}
 else{w2openDrawer(x.id);toast(skipAccount&&D.accounts.length?'已存入 '+fmt(v)+'，未计入账户':(acc?'已存入 '+fmt(v)+'，已同步至 '+acc.name:'已存入 '+fmt(v)))}
}
w2$('syncList').onclick=e=>{
 const b=e.target.closest('[data-sync]');if(!b)return;
 syncAcc=b.dataset.sync;renderSyncAccounts();
};
w2$('syncCancel').onclick=()=>{w2pending=null;closeSyncSheet()};
w2$('syncSkip').onclick=()=>confirmWishDeposit(true);
w2$('syncOk').onclick=()=>confirmWishDeposit(false);
w2$('syncMask').onclick=e=>{if(e.target.id==='syncMask'){w2pending=null;closeSyncSheet()}};
w2$('dmask').onclick=e=>{if(e.target.id==='dmask')w2closeDrawer()};

/* ---------- 新增心愿表单 ---------- */
function w2openForm(){
 let cat='虚拟物品';
 open(`<div class="wo-title">记下新心愿</div>
<div class="row-line"><div class="ic">${w2Gift}</div><div class="main"><small>心愿物品名称</small><input id="wn" placeholder="请输入名称" autocomplete="off"></div></div>
<div class="budget"><small>目标预算</small><div class="price"><span>¥</span><input id="wb" type="number" inputmode="decimal" placeholder="请输入金额"></div></div>
<span class="cat-label">所属品类</span>
<div class="cats"><button class="on" data-c="虚拟物品">虚拟物品</button><button data-c="实物资产">实物资产</button></div>
<div class="msg-row"><small>愿望寄语 选填</small><textarea id="wm" placeholder="写点什么吧"></textarea></div>
<button class="btn" id="ok" disabled>确定加入心愿单</button>`,'w2sheet');
 const wn=w2$('wn'),wb=w2$('wb'),ok=w2$('ok');
 const chk=()=>{ok.disabled=!(wn.value.trim()&&parseFloat(wb.value)>0)};
 wn.oninput=chk;wb.oninput=chk;
 w2$('sheet').querySelectorAll('.cats button').forEach(b=>b.onclick=()=>{
  w2$('sheet').querySelectorAll('.cats button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');cat=b.dataset.c;
 });
 ok.onclick=()=>{
  const n=wn.value.trim(),v=parseFloat(wb.value);
  if(!n||!(v>0))return;
  D.wishes.unshift({id:uid(),name:n,amt:r2(v),cat,note:w2$('wm').value.trim(),status:'ing',saved:0,logs:[]});
  save();close();w2render();toast('心愿已添加 ♡');
 };
 wn.focus();
}

/* ===================== 弹窗A：月份收入明细 ===================== */
let aCtx=null,aEditTap=0,aEditEl=null,aOpenRow=null;
function monthRecordsOf(a,y,m){return a.items.filter(i=>i.y===y&&i.m===m)}
function openMonthSheet(a,y,m){
 aCtx={accId:a.id,y,m};
 renderMonthSheet();
 const mask=w2$('aMask');
 mask.classList.add('on');
 mask.setAttribute('aria-hidden','false');
}
function closeMonthSheet(){
 const mask=w2$('aMask');if(!mask)return;
 if(aOpenRow){aOpenRow.style.transform='';aOpenRow._x=0;aOpenRow=null}
 mask.classList.remove('on');
 mask.setAttribute('aria-hidden','true');
 aCtx=null;aEditTap=0;aEditEl=null;
}
function renderMonthSheet(){
 if(!aCtx)return;
 aOpenRow=null;
 const a=D.accounts.find(x=>x.id===aCtx.accId);
 if(!a){closeMonthSheet();return}
 const y=aCtx.y,m=aCtx.m;
 const list=monthRecordsOf(a,y,m);
 w2$('aTitle').textContent=y+'年'+m+'月收入';
 w2$('aSum').textContent=fmt(sumItems(list));
 w2$('aCnt').textContent=list.length?'共 '+list.length+' 笔':'暂无记录';
 w2$('aList').innerHTML=list.length
  ?list.map(i=>`<div class="a-swipe" data-id="${i.id}"><button class="a-del" type="button" data-del="${i.id}">删除</button><div class="a-row" data-id="${i.id}"><span class="a-note">${i.note?esc(i.note):'未备注'}</span><span class="a-amt" role="button" tabindex="0" title="双击修改" data-id="${i.id}">${fmt(i.amt)}</span></div></div>`).join('')
  :'<div class="a-empty">这个月还没有收入记录<br>双击上方金额记一笔</div>';
 w2$('aList').querySelectorAll('.a-row').forEach(aBindSwipe);
}
function openMonthIncome(){
 if(!aCtx)return;
 const a=D.accounts.find(x=>x.id===aCtx.accId);if(!a)return;
 incomeSheet(a,null,{y:aCtx.y,m:aCtx.m,month:true});
}
/* 左滑删除明细 */
const A_SWIPE_W=80;
function aCloseOpenRow(){
 if(aOpenRow){aOpenRow.style.transform='';aOpenRow._x=0;aOpenRow=null}
}
function aBindSwipe(row){
 let sx=0,sy=0,base=0,moved=false,tracking=false,dir=null;
 row._x=0;
 row.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  tracking=true;moved=false;row._moved=false;dir=null;sx=e.clientX;sy=e.clientY;base=row._x||0;
  if(aOpenRow&&aOpenRow!==row)aCloseOpenRow();
 });
 row.addEventListener('pointermove',e=>{
  if(!tracking)return;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(!dir){
   if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
   dir=Math.abs(dx)>Math.abs(dy)?'h':'v';
   if(dir==='h'){moved=true;row.classList.add('drag');try{row.setPointerCapture(e.pointerId)}catch(_){}}
  }
  if(dir!=='h')return;
  row._x=Math.max(-A_SWIPE_W,Math.min(0,base+dx));
  row.style.transform='translateX('+row._x+'px)';
 });
 const end=()=>{
  if(!tracking)return;
  tracking=false;row.classList.remove('drag');row._moved=moved;
  if(!moved)return;
  const open=row._x<-A_SWIPE_W/2;
  row._x=open?-A_SWIPE_W:0;
  row.style.transform=open?'translateX(-'+A_SWIPE_W+'px)':'';
  aOpenRow=open?row:null;
 };
 row.addEventListener('pointerup',end);
 row.addEventListener('pointercancel',end);
}
function deleteMonthItem(id){
 if(!aCtx)return;
 const a=D.accounts.find(x=>x.id===aCtx.accId);
 if(!a)return;
 const it=a.items.find(x=>x.id===id);
 if(!it)return;
 a.items=a.items.filter(x=>x.id!==id);
 save();
 render();
 renderMonthSheet();
 toast('已删除');
}
document.addEventListener('pointerdown',e=>{
 if(aOpenRow&&!e.target.closest('.a-swipe'))aCloseOpenRow();
});
w2$('aBack').onclick=closeMonthSheet;
w2$('aOk').onclick=closeMonthSheet;
w2$('aMask').onclick=e=>{if(e.target.id==='aMask')closeMonthSheet()};
/* 双击明细金额：编辑该笔明细（弹窗B） */
function openMonthEdit(row){
 if(!row||!aCtx)return;
 const a=D.accounts.find(x=>x.id===aCtx.accId);
 if(!a)return;
 const it=a.items.find(x=>x.id===row.dataset.id);
 if(!it)return;
 incomeSheet(a,it,{y:it.y,m:it.m,month:true});
}
w2$('aList').addEventListener('click',e=>{
 const del=e.target.closest('.a-del');
 if(del){e.stopPropagation();deleteMonthItem(del.dataset.del);return}
 const row=e.target.closest('.a-row');
 if(row){
  if(row._moved){row._moved=false;return}
  if(row._x<0){row._x=0;row.style.transform='';if(aOpenRow===row)aOpenRow=null;return}
 }
 const am=e.target.closest('.a-amt');
 if(!am)return;
 const n=Date.now();
 if(aEditEl===am&&n-aEditTap<420){
  aEditTap=0;aEditEl=null;
  openMonthEdit(am.closest('.a-row'));
 }else{
  aEditTap=n;aEditEl=am;
  am.classList.add('tapped');
  setTimeout(()=>am.classList.remove('tapped'),160);
 }
});
w2$('aList').addEventListener('keydown',e=>{
 if(e.key!=='Enter'&&e.key!==' ')return;
 const am=e.target.closest('.a-amt');
 if(!am)return;
 e.preventDefault();
 openMonthEdit(am.closest('.a-row'));
});
let aSumTap=0;
w2$('aSum').addEventListener('click',()=>{
 const n=Date.now();
 if(n-aSumTap<420){aSumTap=0;openMonthIncome()}
 else{aSumTap=n;const el=w2$('aSum');el.classList.add('tapped');setTimeout(()=>el.classList.remove('tapped'),160)}
});
w2$('aSum').addEventListener('keydown',e=>{
 if(e.key==='Enter'||e.key===' '){e.preventDefault();openMonthIncome()}
});

render();
