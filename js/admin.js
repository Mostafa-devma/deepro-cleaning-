/* DeepPro admin dashboard.
   Edits the catalog and writes it back into the site folder:
   js/catalog-data.js, catalog-data.json, new photos in assets/, and catalog-<id>.html for new categories.
   Direct saving needs Chrome or Edge (File System Access API); other browsers download the files instead. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const icon=n=>`<svg class="ico" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const norm=s=>String(s||'').replace(/[ً-ْ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase().trim();
const CAN_WRITE='showDirectoryPicker' in window;
const IMG_EXT=/\.(jpe?g|png|webp|gif|avif)$/i;
// on the published site (/admin) saving goes through /api/admin to GitHub; opened from the folder it writes files directly
const ONLINE=location.protocol!=='file:'&&!new URLSearchParams(location.search).has('local');
let password='';

let data=JSON.parse(JSON.stringify(categories));   // working copy
let saved=JSON.stringify(data);                     // last saved state
let root=null;                                      // site folder handle
const pending=new Map();                            // 'assets/x.jpg' -> Blob, uploaded but not written yet
const blobUrls=new Map();
let assets=[];                                      // known image paths
const undoStack=[];
let current=null;                                   // selected category id, null = all
let editing=null;                                   // {ci,pi} or {ci:null} for new

const isDirty=()=>JSON.stringify(data)!==saved;
const catIndex=id=>data.findIndex(c=>c.id===id);
const priced=p=>p.price!==null&&p.price!==undefined;
const unitOf=p=>p.priceUnit||(p.size?'للعبوة':'للقطعة الواحدة');
const imgSrc=path=>blobUrls.get(path)||path;
function countLabel(n){return n===1?'منتج واحد':n===2?'منتجان':n<=10?n+' منتجات':n+' منتجًا'}

function collectAssets(){
  const s=new Set(assets);
  data.forEach(c=>{if(c.image)s.add(c.image);c.products.forEach(p=>{if(p.image)s.add(p.image)})});
  pending.forEach((_,k)=>s.add(k));
  assets=[...s].sort();
}

/* ---------- edits + undo ---------- */
function mutate(fn){undoStack.push(JSON.stringify(data));if(undoStack.length>80)undoStack.shift();fn();render()}
function undo(){if(!undoStack.length)return;data=JSON.parse(undoStack.pop());if(current&&catIndex(current)<0)current=null;render();toast('رجّعنا آخر تعديل')}

/* ---------- rendering ---------- */
function render(){
  const dirty=isDirty();
  $('#save').disabled=!dirty;$('#save').classList.toggle('dirty',dirty);
  $('#save-text').textContent=dirty?'حفظ التغييرات':'كل شي محفوظ';
  $('#undo').disabled=!undoStack.length;
  renderStatus();renderStats();renderCats();renderHead();renderList();
}
function renderStatus(){
  if(ONLINE){
    $('#status').classList.toggle('ok',!!password);
    $('#status-text').textContent=password?'متصل بالموقع المنشور':'مش داخل';
    $('#banner').hidden=true;return;
  }
  const st=$('#status');st.classList.toggle('ok',!!root);
  $('#status-text').textContent=root?'مربوط بمجلد «'+root.name+'»':'مش مربوط بمجلد';
  const banner=$('#banner');
  if(root){banner.hidden=true;return}
  banner.hidden=false;
  if(!CAN_WRITE){
    banner.classList.add('warn');$('#connect').hidden=true;
    $('#banner-title').textContent='متصفّحك ما بيقدر يحفظ مباشرة بالملفات';
    $('#banner-text').textContent='افتح admin.html بـ Chrome أو Edge لتحفظ مباشرة. هون، «حفظ» رح ينزّلك الملفات لتحطّها بمجلد الموقع.';
  }else if(!$('#connect').dataset.reconnect){
    $('#banner-title').textContent='اربط مجلد الموقع مرّة وحدة';
    $('#banner-text').textContent='اختار مجلد DeepPro_Complete_Website (المجلد يلي فيه index.html)، وبعدها «حفظ» بيكتب التعديلات مباشرة.';
  }
}
function renderStats(){
  const all=data.flatMap(c=>c.products);
  const unp=all.filter(p=>!priced(p)).length,noimg=all.filter(p=>!p.image).length;
  $('#stats').innerHTML=`<div class="stat"><b>${all.length}</b><span>منتج</span></div><div class="stat"><b>${data.length}</b><span>أقسام</span></div><button class="stat${unp?' warn':''}" type="button" data-filter="unpriced"><b>${unp}</b><span>بلا سعر</span></button><button class="stat${noimg?' warn':''}" type="button" data-filter="noimg"><b>${noimg}</b><span>بلا صورة</span></button>`;
}
function renderCats(){
  const total=data.reduce((n,c)=>n+c.products.length,0);
  $('#cat-nav').innerHTML=`<li><button class="sel" type="button" data-cat="" aria-current="${current===null}">كل المنتجات<em>${total}</em></button></li>`+
    data.map((c,i)=>`<li><button class="sel" type="button" data-cat="${esc(c.id)}" aria-current="${current===c.id}">${esc(c.title)}<em>${c.products.length}</em></button><button class="mini" type="button" data-cat-move="${i}" data-dir="-1" aria-label="طلّع ${esc(c.title)} لفوق" ${i===0?'disabled':''}>${icon('up')}</button><button class="mini" type="button" data-cat-move="${i}" data-dir="1" aria-label="نزّل ${esc(c.title)} لتحت" ${i===data.length-1?'disabled':''}>${icon('down')}</button></li>`).join('');
}
function renderHead(){
  const head=$('#cat-head'),ci=current?catIndex(current):-1;
  if(ci<0){head.innerHTML=`<div><h1>كل المنتجات</h1><p>كل المنتجات من كل الأقسام. اختار قسم من الجنب لتعدّله أو لترتّب منتجاته.</p></div>`;return}
  const c=data[ci];
  head.innerHTML=`${c.image?`<img class="thumb" src="${esc(imgSrc(c.image))}" alt="">`:'<span class="thumb"></span>'}<div><h1>${esc(c.title)}</h1><p>${esc(c.description||'')}</p><a class="page-link" href="catalog-${esc(c.id)}.html" target="_blank" rel="noopener">${icon('link')}catalog-${esc(c.id)}.html</a></div><div class="acts"><button class="btn btn-ghost btn-sm" type="button" data-edit-cat="${ci}">${icon('edit')}تعديل القسم</button><button class="btn btn-ghost btn-sm" type="button" data-del-cat="${ci}">${icon('trash')}حذف القسم</button></div>`;
}
function visibleRows(){
  const q=norm($('#q').value),f=$('#filter').value;
  const rows=[];
  data.forEach((c,ci)=>{if(current&&c.id!==current)return;c.products.forEach((p,pi)=>rows.push({c,ci,p,pi}))});
  return rows.filter(({c,p})=>(!q||norm(c.title+' '+p.name+' '+(p.description||'')+' '+(p.size||'')).includes(q))&&(f==='all'||(f==='priced'&&priced(p))||(f==='unpriced'&&!priced(p))||(f==='noimg'&&!p.image)));
}
function renderList(flashKey){
  const rows=visibleRows(),filtered=!!$('#q').value.trim()||$('#filter').value!=='all';
  const canMove=!!current&&!filtered;
  $('#count').textContent='عم نعرض '+countLabel(rows.length)+(canMove?'. استعمل الأسهم لترتيب المنتجات على الموقع.':'');
  if(!rows.length){
    $('#list').innerHTML=`<div class="a-empty"><b>${filtered?'ما في منتجات بهالبحث':'ما في منتجات هون بعد'}</b>${filtered?'جرّب كلمة ثانية أو غيّر الفلتر.':'زيد أول منتج بهالقسم.'}<br><button class="btn btn-blue btn-sm" type="button" data-add-product>+ منتج جديد</button></div>`;return;
  }
  $('#list').innerHTML=rows.map(({c,ci,p,pi})=>{
    const last=pi===c.products.length-1;
    return `<div class="a-row" data-key="${ci}:${pi}">
      ${p.image?`<img class="thumb" src="${esc(imgSrc(p.image))}" alt="" loading="lazy">`:'<span class="thumb noimg">بلا صورة</span>'}
      <div class="info"><b>${esc(p.name)}</b><span class="sub">${esc([p.description,p.size].filter(Boolean).join('، ')||'بلا وصف')}</span>${current?'':`<em class="tag">${esc(c.title)}</em>`}${p.image?'':'<em class="tag warn">بلا صورة</em>'}${pending.has(p.image)?'<em class="tag warn">صورة جديدة، بتنحفظ مع «حفظ»</em>':''}</div>
      <div class="pr">${priced(p)?`<b dir="ltr">${esc(p.priceDisplay||p.price)} USD</b>${esc(unitOf(p))}`:'<p class="ask">السعر عند الطلب</p>'}</div>
      <div class="acts">${canMove?`<button class="mini" type="button" data-move="${ci}:${pi}" data-dir="-1" aria-label="طلّع ${esc(p.name)} لفوق" ${pi===0?'disabled':''}>${icon('up')}</button><button class="mini" type="button" data-move="${ci}:${pi}" data-dir="1" aria-label="نزّل ${esc(p.name)} لتحت" ${last?'disabled':''}>${icon('down')}</button>`:''}<button class="icon-btn" type="button" data-edit="${ci}:${pi}" aria-label="عدّل ${esc(p.name)}" title="تعديل">${icon('edit')}</button><button class="icon-btn" type="button" data-copy="${ci}:${pi}" aria-label="انسخ ${esc(p.name)}" title="نسخة">${icon('copy')}</button><button class="icon-btn del" type="button" data-del="${ci}:${pi}" aria-label="احذف ${esc(p.name)}" title="حذف">${icon('trash')}</button></div>
    </div>`}).join('');
  if(flashKey){const r=$(`.a-row[data-key="${flashKey}"]`);if(r){r.classList.add('flash');r.scrollIntoView({block:'nearest',behavior:'smooth'})}}
}

/* ---------- image picker (shared by both editors) ---------- */
function makePicker(box,select){
  let value='';
  const prev=$('.prev',box),file=$('input[type=file]',box);
  const show=()=>{prev.innerHTML=value?`<img src="${esc(imgSrc(value))}" alt="">`:'بلا صورة';select.value=value};
  const fill=()=>{collectAssets();select.innerHTML='<option value="">اختار صورة موجودة…</option>'+assets.map(a=>`<option value="${esc(a)}">${esc(a.replace('assets/',''))}${pending.has(a)?' (جديدة)':''}</option>`).join('')};
  select.addEventListener('change',()=>{value=select.value;show()});
  $('[data-clear]',box).addEventListener('click',()=>{value='';show()});
  const take=async f=>{if(!f||!f.type.startsWith('image/'))return toast('اختار ملف صورة (JPG أو PNG)');prev.textContent='عم نجهّز الصورة…';value=await addUpload(f);fill();show()};
  file.addEventListener('change',()=>{take(file.files[0]);file.value=''});
  box.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('drag')});
  box.addEventListener('dragleave',()=>box.classList.remove('drag'));
  box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('drag');take(e.dataTransfer.files[0])});
  return {get:()=>value,set:v=>{value=v||'';fill();show()}};
}
async function addUpload(file){
  let blob=file,ext=(file.name.match(/\.([a-z0-9]+)$/i)||[,'jpg'])[1].toLowerCase();
  try{
    const bmp=await createImageBitmap(file);
    if(bmp.width>1600||bmp.height>1600||file.size>700000){
      const k=Math.min(1,1600/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');
      cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);
      const ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(bmp,0,0,cv.width,cv.height);
      blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.86));ext='jpg';
    }
  }catch(e){}
  if(!/^(jpe?g|png|webp|gif|avif)$/.test(ext))ext='jpg';
  const base=file.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'product-'+Date.now().toString(36);
  collectAssets();
  let path=`assets/${base}.${ext}`,n=2;
  while(assets.includes(path))path=`assets/${base}-${n++}.${ext}`;
  pending.set(path,blob);blobUrls.set(path,URL.createObjectURL(blob));assets.push(path);
  return path;
}

/* ---------- product editor ---------- */
const pForm=$('#product-form'),pDlg=$('#product-dlg');
const pPick=makePicker($('#pd-img'),$('#pd-img-select'));
function openProduct(ci,pi){
  editing={ci,pi};
  const p=pi===null?{name:'',price:null}:data[ci].products[pi];
  $('#pd-title').textContent=pi===null?'منتج جديد':'تعديل منتج';
  const f=pForm.elements;
  f.cat.innerHTML=data.map((c,i)=>`<option value="${i}">${esc(c.title)}</option>`).join('');
  f.cat.value=ci;
  f.name.value=p.name||'';f.size.value=p.size||'';f.description.value=p.description||'';
  f.price.value=priced(p)?p.price:'';f.priceUnit.value=p.priceUnit||'';f.imageCaption.value=p.imageCaption||'';
  pPick.set(p.image);
  clearErrors(pForm);pDlg.showModal();f.name.focus();
}
pForm.addEventListener('submit',e=>{
  e.preventDefault();clearErrors(pForm);
  const f=pForm.elements,name=f.name.value.trim(),priceRaw=f.price.value.trim();
  let ok=true;
  if(!name){fieldError(f.name);ok=false}
  const price=priceRaw===''?null:Number(priceRaw);
  if(price!==null&&(!isFinite(price)||price<0)){fieldError(f.price);ok=false}
  if(!ok)return;
  const old=editing.pi===null?{}:data[editing.ci].products[editing.pi];
  const p={...old,name};
  const set=(k,v)=>{if(v)p[k]=v;else delete p[k]};
  set('description',f.description.value.trim());set('size',f.size.value.trim());set('priceUnit',f.priceUnit.value.trim());
  set('imageCaption',f.imageCaption.value.trim());set('image',pPick.get());
  p.price=price===null?null:Math.round(price*100)/100;
  if(p.price!==null&&p.price%1)p.priceDisplay=p.price.toFixed(2);else delete p.priceDisplay;
  const target=+f.cat.value;let key;
  mutate(()=>{
    if(editing.pi!==null&&target===editing.ci){data[target].products[editing.pi]=p;key=target+':'+editing.pi;return}
    if(editing.pi!==null)data[editing.ci].products.splice(editing.pi,1);
    data[target].products.push(p);key=target+':'+(data[target].products.length-1);
  });
  if(current&&data[target].id!==current){current=data[target].id;render()}
  renderList(key);pDlg.close();
  toast(editing.pi===null?'انضاف «'+name+'». ما تنسى تحفظ.':'تعدّل «'+name+'». ما تنسى تحفظ.');
});

/* ---------- category editor ---------- */
const cForm=$('#cat-form'),cDlg=$('#cat-dlg');
const cPick=makePicker($('#cd-img'),$('#cd-img-select'));
let editingCat=null;
function openCategory(ci){
  editingCat=ci;
  const c=ci===null?{title:'',description:'',id:'',imagePosition:'center 55%'}:data[ci];
  $('#cd-title').textContent=ci===null?'قسم جديد':'تعديل القسم';
  const f=cForm.elements;
  f.title.value=c.title;f.description.value=c.description||'';f.id.value=c.id;
  f.id.readOnly=ci!==null;
  $('#cd-id-hint').textContent=ci===null?'بيصير رابط الصفحة: catalog-…html':'الرابط ثابت لأن صفحة القسم موجودة.';
  f.imagePosition.value=['center 20%','center 55%','center 80%'].includes(c.imagePosition)?c.imagePosition:'center 55%';
  cPick.set(c.image);clearErrors(cForm);cDlg.showModal();f.title.focus();
}
cForm.elements.title.addEventListener('input',()=>{
  const f=cForm.elements;if(editingCat!==null||f.id.dataset.touched)return;
  const latin=f.title.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  f.id.value=latin||'';
});
cForm.elements.id.addEventListener('input',e=>{e.target.dataset.touched=1});
cForm.addEventListener('submit',e=>{
  e.preventDefault();clearErrors(cForm);
  const f=cForm.elements,title=f.title.value.trim();
  let ok=true;
  if(!title){fieldError(f.title);ok=false}
  let id=f.id.value.trim().toLowerCase();
  if(editingCat===null){
    if(!id)id='section-'+(data.length+1);
    if(!/^[a-z0-9-]+$/.test(id)||data.some(c=>c.id===id)){fieldError(f.id);ok=false}
  }
  if(!ok)return;
  mutate(()=>{
    if(editingCat===null){
      const c={id,title,description:f.description.value.trim(),products:[],imagePosition:f.imagePosition.value};
      if(cPick.get())c.image=cPick.get();
      data.push(c);current=id;
    }else{
      const c=data[editingCat];c.title=title;c.description=f.description.value.trim();c.imagePosition=f.imagePosition.value;
      if(cPick.get())c.image=cPick.get();else delete c.image;
    }
  });
  cDlg.close();
  toast(editingCat===null?'انضاف القسم «'+title+'». صفحته بتنعمل لما تحفظ.':'تعدّل القسم. ما تنسى تحفظ.');
});

function fieldError(input){input.setAttribute('aria-invalid','true');const err=input.parentElement.querySelector('.err');if(err)err.hidden=false;input.focus()}
function clearErrors(form){$$('[aria-invalid]',form).forEach(i=>i.removeAttribute('aria-invalid'));$$('.err',form).forEach(e=>e.hidden=true);delete form.elements.id?.dataset.touched}

/* ---------- saving ---------- */
function dataFileText(){return '/* DeepPro catalog data — edit products, prices and photos here, or use admin.html. Every page reads from this file. */\nconst categories='+JSON.stringify(data,null,2)+';\n'}
async function writeFile(dir,name,content){const fh=await dir.getFileHandle(name,{create:true});const w=await fh.createWritable();await w.write(content);await w.close()}
function download(name,content){const a=document.createElement('a');a.href=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type:'text/plain;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function usedImages(){const s=new Set();data.forEach(c=>{if(c.image)s.add(c.image);c.products.forEach(p=>{if(p.image)s.add(p.image)})});return s}

async function save(){
  if(!isDirty())return;
  const before=JSON.parse(saved).map(c=>c.id),after=data.map(c=>c.id);
  const added=after.filter(id=>!before.includes(id)),removed=before.filter(id=>!after.includes(id));
  const used=usedImages(),newImages=[...pending].filter(([p])=>used.has(p));
  const kept=after.filter(x=>before.includes(x));
  if(ONLINE)return saveOnline(newImages,added,removed,kept);
  if(root&&!(await ensurePermission()))root=null;
  if(!root){
    if(CAN_WRITE){await connect();if(!root)return}
    else return manualSave(newImages,added,removed);
  }
  const btn=$('#save');btn.disabled=true;$('#save-text').textContent='عم نحفظ…';
  let missingPages=[];
  try{
    if(newImages.length){const dir=await root.getDirectoryHandle('assets',{create:true});for(const [path,blob] of newImages)await writeFile(dir,path.replace('assets/',''),blob)}
    await writeFile(await root.getDirectoryHandle('js'),'catalog-data.js',dataFileText());
    await writeFile(root,'catalog-data.json',JSON.stringify(data,null,2)+'\n');
    if(added.length){
      // copy any existing category page as the template for the new one
      let tpl=null;
      for(const id of [...kept,...removed]){try{tpl=await (await (await root.getFileHandle(`catalog-${id}.html`)).getFile()).text();break}catch(e){}}
      if(!tpl)missingPages=added;
      else for(const id of added)await writeFile(root,`catalog-${id}.html`,categoryPage(tpl,id));
    }
    for(const id of removed){try{await root.removeEntry(`catalog-${id}.html`)}catch(e){}}
    newImages.forEach(([p])=>pending.delete(p));
    [...pending.keys()].forEach(p=>{if(!used.has(p))pending.delete(p)});
    saved=JSON.stringify(data);render();
    toast(missingPages.length?'انحفظت التعديلات، بس ما لقينا صفحة قسم لننسخ منها. انسخ أي catalog-….html وسمّيه catalog-'+missingPages[0]+'.html.':'انحفظت التعديلات. حدّث صفحة الموقع لتشوفها.');
  }catch(err){
    console.error(err);render();
    toast('ما قدرنا نحفظ: '+(err.message||err)+'. تأكّد إنك اخترت مجلد الموقع الصح.');
  }
}
function categoryPage(tpl,id){
  const c=data[catIndex(id)];
  return tpl.replace(/data-category="[^"]*"/,`data-category="${id}"`).replace(/<title>[^<]*<\/title>/,`<title>${esc(c.title)} — DeepPro</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${esc(c.description||c.title)}`);
}

/* ---------- online mode: password login + saving through /api/admin ---------- */
async function api(action,payload={}){
  const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,password,...payload})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(j.error||'HTTP '+r.status);e.code=j.code||(r.status===404?'no_api':'http_'+r.status);throw e}
  return j;
}
const toBase64=blob=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=()=>rej(fr.error);fr.readAsDataURL(blob)});
const ERRORS={
  bad_password:'كلمة السر غلط.',
  not_configured:'لوحة التحكم مش مفعّلة بعد: لازم تزيد ADMIN_PASSWORD وGITHUB_TOKEN بإعدادات المشروع على Vercel، وبعدين تعمل Redeploy.',
  github_auth:'GitHub رفض الحفظ: الـ GITHUB_TOKEN غلط، انتهت صلاحيته، أو ما إلو صلاحية «Contents: Read and write» على الـ repo.',
  github_repo:'ما لقينا الـ repo على GitHub. تأكّد من GITHUB_REPO أو صلاحيات الـ token.',
  no_api:'ما لقينا خدمة الحفظ (/api/admin). تأكّد إن الموقع منشور على Vercel مع مجلد api.'
};
const errorText=err=>ERRORS[err.code]||('ما قدرنا نكمّل: '+err.message);
function storeGet(){try{return sessionStorage.getItem('deeppro-admin')||localStorage.getItem('deeppro-admin')||''}catch(e){return ''}}
function storeSet(v,remember){try{sessionStorage.removeItem('deeppro-admin');localStorage.removeItem('deeppro-admin');if(v)(remember?localStorage:sessionStorage).setItem('deeppro-admin',v)}catch(e){}}
function showLogin(msg){
  password='';document.body.classList.remove('loading');render();
  $('#login').hidden=false;const err=$('#login-err');err.hidden=!msg;err.textContent=msg||'';
  setTimeout(()=>$('#login-form').elements.password.focus(),30);
}
async function loadOnline(){
  const {text,assets:list}=await api('load');
  data=JSON.parse(text.slice(text.indexOf('['),text.lastIndexOf(']')+1));
  saved=JSON.stringify(data);undoStack.length=0;
  if(current&&catIndex(current)<0)current=null;
  assets=(list||[]).filter(a=>IMG_EXT.test(a)&&!/logo/i.test(a));
  collectAssets();$('#login').hidden=true;document.body.classList.remove('loading');render();
}
async function initOnline(){
  document.body.classList.add('loading'); // hide the deployed copy until the latest data arrives from GitHub
  $('#connect').hidden=true;$('#logout').hidden=false;
  $('#help-steps').innerHTML='<li>عدّل، زيد أو احذف المنتجات والأقسام.</li><li>اضغط «حفظ». التعديلات بتنحفظ على GitHub.</li><li>Vercel بيحدّث الموقع خلال دقيقة تقريبًا.</li>';
  const stored=storeGet();
  if(stored){password=stored;try{await loadOnline();return}catch(err){storeSet('');return showLogin(err.code==='bad_password'?'':errorText(err))}}
  showLogin();
}
$('#login-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const f=e.target.elements,btn=$('button[type=submit]',e.target);
  password=f.password.value;if(!password)return;
  btn.disabled=true;btn.textContent='عم نتحقّق…';
  try{
    await api('check');storeSet(password,f.remember.checked);
    // signing in again mid-session keeps the unsaved edits instead of reloading from GitHub
    if(isDirty()){$('#login').hidden=true;render();toast('رجعت. تعديلاتك بعدها هون، اضغط «حفظ».')}
    else{await loadOnline();toast('أهلا فيك! فيك تبلّش تعدّل.')}
  }
  catch(err){showLogin(errorText(err));f.password.select()}
  finally{btn.disabled=false;btn.textContent='دخول'}
});
$('#logout').addEventListener('click',()=>{if(isDirty()&&!confirm('في تعديلات مش محفوظة. أكيد بدك تطلع؟'))return;storeSet('');data=JSON.parse(saved);undoStack.length=0;$('#login-form').elements.password.value='';showLogin()});

async function saveOnline(newImages,added,removed,kept){
  const btn=$('#save');btn.disabled=true;
  try{
    const files=[];let n=0;
    for(const [path,blob] of newImages){$('#save-text').textContent=`عم نرفع الصور ${++n}/${newImages.length}…`;const {sha}=await api('blob',{base64:await toBase64(blob)});files.push({path,sha})}
    $('#save-text').textContent='عم نحفظ…';
    files.push({path:'js/catalog-data.js',content:dataFileText()},{path:'catalog-data.json',content:JSON.stringify(data,null,2)+'\n'});
    let missing=false;
    if(added.length){
      let tpl=null;
      for(const id of [...kept,...removed]){try{const r=await fetch(`catalog-${id}.html`,{cache:'no-store'});if(r.ok){tpl=await r.text();break}}catch(e){}}
      if(tpl)added.forEach(id=>files.push({path:`catalog-${id}.html`,content:categoryPage(tpl,id)}));else missing=true;
    }
    const summary=added.length||removed.length?'Update catalog and categories from admin':'Update catalog from admin';
    await api('commit',{files,deletes:removed.map(id=>`catalog-${id}.html`),message:summary});
    newImages.forEach(([p])=>pending.delete(p));
    saved=JSON.stringify(data);render();
    toast(missing?'انحفظت التعديلات، بس صفحة القسم الجديد ما انعملت. خبّر المطوّر.':'انحفظت التعديلات. الموقع بيتحدّث خلال دقيقة تقريبًا.');
  }catch(err){
    console.error(err);render();
    if(err.code==='bad_password'){storeSet('');showLogin('انتهت الجلسة. فوت من جديد، تعديلاتك بعدها هون.')}
    else toast(errorText(err));
  }
}

function manualSave(newImages,added,removed){
  download('catalog-data.js',dataFileText());
  newImages.forEach(([p,blob])=>download(p.replace('assets/',''),blob));
  let html=`<ol><li>حط الملف <code>catalog-data.js</code> بمجلد <code>js</code> داخل مجلد الموقع (استبدل القديم).</li>`;
  if(newImages.length)html+=`<li>حط ${newImages.length===1?'الصورة الجديدة':'الصور الجديدة ('+newImages.length+')'} بمجلد <code>assets</code>.</li>`;
  if(added.length)html+=`<li>للقسم الجديد: انسخ أي ملف <code>catalog-….html</code> وسمّيه ${added.map(id=>`<code>catalog-${id}.html</code>`).join('، ')}، وغيّر فيه <code>data-category</code> للاسم الجديد.</li>`;
  if(removed.length)html+=`<li>فيك تحذف ${removed.map(id=>`<code>catalog-${id}.html</code>`).join('، ')}.</li>`;
  html+='</ol><p>لتوفّر هالخطوات، افتح لوحة التحكم بـ Chrome أو Edge واربط مجلد الموقع.</p>';
  $('#manual-body').innerHTML=html;$('#manual-dlg').showModal();
  newImages.forEach(([p])=>pending.delete(p));
  saved=JSON.stringify(data);render();
}

/* ---------- folder connection (remembered between visits) ---------- */
function idb(mode,fn){return new Promise((res,rej)=>{const r=indexedDB.open('deeppro-admin',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onerror=()=>rej(r.error);r.onsuccess=()=>{const tx=r.result.transaction('kv',mode),q=fn(tx.objectStore('kv'));tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error)}})}
const idbGet=k=>idb('readonly',s=>s.get(k)).catch(()=>null),idbSet=(k,v)=>idb('readwrite',s=>s.put(v,k)).catch(()=>null);
async function ensurePermission(){if(!root)return false;try{if(await root.queryPermission({mode:'readwrite'})==='granted')return true;return await root.requestPermission({mode:'readwrite'})==='granted'}catch(e){return false}}
async function isSiteFolder(dir){try{await (await dir.getDirectoryHandle('js')).getFileHandle('catalog-data.js');return true}catch(e){return false}}
async function useFolder(dir){
  root=dir;await idbSet('root',dir);
  try{
    const assetsDir=await dir.getDirectoryHandle('assets');
    for await(const [name,h] of assetsDir.entries())if(h.kind==='file'&&IMG_EXT.test(name)&&!/logo/i.test(name))assets.push('assets/'+name);
  }catch(e){}
  if(!isDirty()){
    try{const t=await (await (await (await dir.getDirectoryHandle('js')).getFileHandle('catalog-data.js')).getFile()).text();data=JSON.parse(t.slice(t.indexOf('['),t.lastIndexOf(']')+1));saved=JSON.stringify(data);undoStack.length=0;if(current&&catIndex(current)<0)current=null}catch(e){console.error(e)}
  }
  collectAssets();render();toast('انربط المجلد «'+dir.name+'»');
}
async function connect(){
  const btn=$('#connect');
  if(btn.dataset.reconnect){const h=await idbGet('root');if(h){root=h;if(await ensurePermission()){delete btn.dataset.reconnect;btn.textContent='ربط مجلد الموقع';return useFolder(h)}root=null}}
  let dir;
  try{dir=await showDirectoryPicker({id:'deeppro-site',mode:'readwrite'})}catch(e){return}
  if(!(await isSiteFolder(dir))){toast('هيدا مش مجلد الموقع. اختار المجلد يلي فيه index.html ومجلد js.');return}
  try{if(await dir.requestPermission({mode:'readwrite'})!=='granted')return}catch(e){}
  delete btn.dataset.reconnect;btn.textContent='ربط مجلد الموقع';
  await useFolder(dir);
}
async function restoreFolder(){
  if(!CAN_WRITE)return;
  const h=await idbGet('root');if(!h)return;
  try{if(await h.queryPermission({mode:'readwrite'})==='granted')return useFolder(h)}catch(e){return}
  const btn=$('#connect');btn.dataset.reconnect=1;btn.textContent='كمّل مع «'+h.name+'»';
  $('#banner-title').textContent='كمّل من وين وقفت';
  $('#banner-text').textContent='اضغط لتسمح للوحة التحكم تكتب بمجلد «'+h.name+'» مرّة ثانية.';
}

/* ---------- toast ---------- */
let toastTimer;
function toast(text){const t=$('#toast');$('#toast-text').textContent=text;t.hidden=false;requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3600)}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-cat]');if(!t)return;
  const ds=t.dataset,pair=v=>v.split(':').map(Number);
  if('cat' in ds&&t.classList.contains('sel')){current=ds.cat||null;$('#q').value='';render();return}
  if('filter' in ds){$('#filter').value=ds.filter;current=null;render();return}
  if('catMove' in ds){const i=+ds.catMove,j=i+ +ds.dir;mutate(()=>{[data[i],data[j]]=[data[j],data[i]]});return}
  if('move' in ds){const [ci,pi]=pair(ds.move),pj=pi+ +ds.dir,arr=data[ci].products;mutate(()=>{[arr[pi],arr[pj]]=[arr[pj],arr[pi]]});renderList(ci+':'+pj);return}
  if('edit' in ds){const [ci,pi]=pair(ds.edit);openProduct(ci,pi);return}
  if('copy' in ds){const [ci,pi]=pair(ds.copy);const p=JSON.parse(JSON.stringify(data[ci].products[pi]));p.name+=' (نسخة)';mutate(()=>data[ci].products.splice(pi+1,0,p));renderList(ci+':'+(pi+1));toast('انعملت نسخة. عدّلها وغيّر اسمها.');return}
  if('del' in ds){const [ci,pi]=pair(ds.del),p=data[ci].products[pi];if(confirm('أكيد بدك تحذف «'+p.name+'»؟'))mutate(()=>data[ci].products.splice(pi,1)),toast('انحذف. فيك ترجّعه بزر «تراجع».');return}
  if('editCat' in ds){openCategory(+ds.editCat);return}
  if('delCat' in ds){const ci=+ds.delCat,c=data[ci];if(confirm(c.products.length?`القسم «${c.title}» فيه ${countLabel(c.products.length)}، رح ينحذفوا معه. أكيد؟`:`أكيد بدك تحذف القسم «${c.title}»؟`)){mutate(()=>data.splice(ci,1));current=null;render();toast('انحذف القسم. صفحته بتنشال لما تحفظ.')}return}
  if('addProduct' in ds){addProduct();return}
  if('close' in ds){t.closest('dialog').close();return}
});
function addProduct(){if(!data.length){toast('زيد قسم أول');return openCategory(null)}const ci=current?catIndex(current):0;openProduct(ci<0?0:ci,null)}
$('#add-product').addEventListener('click',addProduct);
$('#add-cat').addEventListener('click',()=>openCategory(null));
$('#q').addEventListener('input',()=>renderList());
$('#filter').addEventListener('change',()=>renderList());
$('#save').addEventListener('click',save);
$('#undo').addEventListener('click',undo);
$('#connect').addEventListener('click',connect);
$('#backup').addEventListener('click',()=>{const d=new Date().toISOString().slice(0,10);download(`catalog-data-backup-${d}.js`,dataFileText());toast('نزلت نسخة احتياطية من البيانات.')});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.target.closest('input,textarea')&&!$('dialog[open]')){e.preventDefault();undo()}
});
addEventListener('beforeunload',e=>{if(isDirty()){e.preventDefault();e.returnValue=''}});

collectAssets();render();
if(ONLINE)initOnline();else restoreFolder();
