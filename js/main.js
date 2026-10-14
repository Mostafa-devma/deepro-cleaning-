/* DeepPro — shared behaviour for every page. Product data lives in js/catalog-data.js */
const PHONE='96176997610';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const icon=n=>`<svg class="ico" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function normalize(s){return s.replace(/[ً-ْ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase().trim()}
function link(message){return 'https://wa.me/'+PHONE+'?text='+encodeURIComponent(message)}
function catUrl(c){return 'catalog-'+c.id+'.html'}
function countLabel(n){return n===1?'منتج واحد':n===2?'منتجان':n<=10?n+' منتجات':n+' منتجًا'}
function money(n){const r=Math.round(n*100)/100;return r%1?r.toFixed(2):String(r)}

/* every product, flattened, with its category */
const ALL=categories.flatMap(c=>c.products.map(p=>({...p,cat:c,key:c.id+'::'+p.name})));
ALL.forEach((p,i)=>p.i=i);
const byKey=new Map(ALL.map(p=>[p.key,p]));
const isPriced=p=>p.price!==null;
const unitOf=p=>p.priceUnit||(p.size?'للعبوة':'للقطعة الواحدة');
function directMsg(p){return 'مرحبا DeepPro، حابب '+(isPriced(p)?'اطلب '+p.name+(p.size?' — '+p.size:'')+' بسعر '+p.price+' دولارات '+(p.priceUnit||(p.size?'للعبوة':'للقطعة'))+'. الكمية: ':'استفسر عن '+p.name+'. شو الأصناف والأسعار المتوفرة؟')}
function priceHtml(p){return isPriced(p)?`<p class="price"><b dir="ltr">${esc(p.priceDisplay||p.price)}<small>USD</small></b><span>${esc(unitOf(p))}</span></p>`:'<p class="ask">السعر عند الطلب، اسألنا عبر واتساب</p>'}
function descHtml(p){return p.description?`<p class="p-desc">${esc(p.description)}${p.size?`، ${esc(p.size)}`:''}</p>`:(p.size?`<p class="p-desc">${esc(p.size)}</p>`:'')}

function productCard(p,showCat=true){
  return `<article class="p-card">${p.image?`<button class="p-img" type="button" data-quick="${p.i}" aria-label="عرض ${esc(p.name)} بالكبير"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" decoding="async"><span class="zoom">${icon('zoom')}</span></button>`:'<div class="p-noimg">صورة المنتج قيد الإضافة</div>'}<div class="p-body">${showCat?`<a class="p-cat" href="${catUrl(p.cat)}">${esc(p.cat.title)}</a>`:''}<h3>${esc(p.name)}</h3>${descHtml(p)}${p.imageCaption?`<small class="p-note">${esc(p.imageCaption)}</small>`:''}${priceHtml(p)}<div class="p-actions"><button class="btn btn-blue btn-add" type="button" data-add="${p.i}">${icon('bag')}أضف للسلة</button><a class="icon-btn" href="${link(directMsg(p))}" target="_blank" rel="noopener noreferrer" aria-label="${isPriced(p)?'اطلب':'استفسر عن'} ${esc(p.name)} مباشرة عبر واتساب" title="مباشرة عبر واتساب">${icon('wa')}</a></div></div></article>`;
}
function categoryCard(c){
  return `<a class="cat-card" href="${catUrl(c)}"><div class="img">${c.image?`<img src="${esc(c.image)}" alt="" loading="lazy" decoding="async" style="object-position:${esc(c.imagePosition||'center 55%')}">`:''}</div><div class="body"><h3>${esc(c.title)}</h3><span class="count">${countLabel(c.products.length)}<span class="go">${icon('arrow')}</span></span></div></a>`;
}

/* ---------- basket (saved in this browser) ---------- */
const Cart={
  items:[],
  load(){try{const d=JSON.parse(localStorage.getItem('deeppro-cart')||'[]');this.items=Array.isArray(d)?d.filter(x=>byKey.has(x.key)&&x.qty>0):[]}catch(e){this.items=[]}},
  save(){try{localStorage.setItem('deeppro-cart',JSON.stringify(this.items))}catch(e){}},
  add(p,q=1){const it=this.items.find(x=>x.key===p.key);if(it)it.qty=Math.min(it.qty+q,99);else this.items.push({key:p.key,qty:q});this.save();renderCart()},
  set(key,q){const it=this.items.find(x=>x.key===key);if(!it)return;if(q<=0)this.items=this.items.filter(x=>x!==it);else it.qty=Math.min(q,99);this.save();renderCart()},
  clear(){this.items=[];this.save();renderCart()},
  count(){return this.items.reduce((n,x)=>n+x.qty,0)}
};
function cartMessage(){
  let total=0,unpriced=false;
  const lines=Cart.items.map((it,n)=>{const p=byKey.get(it.key);if(isPriced(p))total+=p.price*it.qty;else unpriced=true;return `${n+1}) ${p.name}${p.size?' — '+p.size:''} × ${it.qty}`+(isPriced(p)?` = ${money(p.price*it.qty)} USD`:' (بدي اعرف السعر)')});
  let m='مرحبا DeepPro، بدي اطلب:\n'+lines.join('\n');
  if(total>0)m+='\n\nالمجموع التقريبي: '+money(total)+' USD'+(unpriced?' + المنتجات يلي سعرها عند الطلب':'');
  const notes=$('#cart-notes')?.value.trim();if(notes)m+='\nملاحظات: '+notes;
  return m+'\n\nبتأكّدولي التوفّر والسعر؟';
}
function renderCart(){
  const count=Cart.count();
  $$('.cart-count').forEach(b=>{b.textContent=count;b.classList.toggle('show',count>0)});
  const list=$('#cart-items');if(!list)return;
  const empty=Cart.items.length===0;
  $('#cart-empty').hidden=!empty;list.hidden=empty;$('#cart-foot').hidden=empty;
  list.innerHTML=Cart.items.map(it=>{const p=byKey.get(it.key);return `<li class="cart-item">${p.image?`<img src="${p.image}" alt="">`:'<span></span>'}<div><h3>${esc(p.name)}</h3><span class="unit">${isPriced(p)?`${esc(p.priceDisplay||p.price)} USD ${esc(unitOf(p))}`:'السعر عند الطلب'}${p.size?`، ${esc(p.size)}`:''}</span><div class="line"><span class="qty"><button type="button" data-qty="${esc(it.key)}" data-step="1" aria-label="زيد واحد">+</button><output aria-live="polite">${it.qty}</output><button type="button" data-qty="${esc(it.key)}" data-step="-1" aria-label="نقّص واحد">−</button></span>${isPriced(p)?`<span class="sum" dir="ltr">${money(p.price*it.qty)} USD</span>`:''}</div><button class="remove" type="button" data-remove="${esc(it.key)}">شيل من السلة</button></div></li>`}).join('');
  const total=Cart.items.reduce((n,it)=>{const p=byKey.get(it.key);return n+(isPriced(p)?p.price*it.qty:0)},0);
  const unpriced=Cart.items.some(it=>!isPriced(byKey.get(it.key)));
  $('#cart-total').textContent=money(total)+' USD';
  $('#cart-total-note').textContent=unpriced?'في منتجات سعرها عند الطلب، منأكّدلك المجموع النهائي عبر واتساب.':'منأكّدلك التوفّر والمجموع النهائي عبر واتساب.';
  $('#cart-send').href=link(cartMessage());
}
let lastFocus=null;
function openCart(){lastFocus=document.activeElement;$('#cart').classList.add('open');$('#overlay').classList.add('show');document.body.classList.add('locked');$('#cart').setAttribute('aria-hidden','false');setTimeout(()=>$('#cart .cart-head .icon-btn').focus(),50)}
function closeCart(){$('#cart').classList.remove('open');$('#overlay').classList.remove('show');document.body.classList.remove('locked');$('#cart').setAttribute('aria-hidden','true');if(lastFocus)lastFocus.focus()}

let toastTimer;
function toast(text){
  const t=$('#toast');$('#toast-text').textContent=text;t.hidden=false;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}
function addToCart(p,q=1,btn){
  Cart.add(p,q);
  $$('.cart-btn').forEach(b=>{b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')});
  if(btn&&!btn.dataset.busy){const card=btn.closest('.p-card');const old=btn.innerHTML;btn.dataset.busy=1;btn.innerHTML=icon('check')+'انضاف';card&&card.classList.add('added');setTimeout(()=>{btn.innerHTML=old;delete btn.dataset.busy;card&&card.classList.remove('added')},1400)}
  toast('انضاف «'+p.name+'» للسلة');
}

/* ---------- quick view ---------- */
let quickProduct=null,quickQty=1;
function openQuick(p){
  const d=$('#quick');if(!d||!d.showModal)return;
  quickProduct=p;quickQty=1;
  $('#quick-img').src=p.image;$('#quick-img').alt=p.name;
  $('#quick-cat').textContent=p.cat.title;$('#quick-cat').href=catUrl(p.cat);
  $('#quick-title').textContent=p.name;
  $('#quick-body').innerHTML=descHtml(p)+(p.imageCaption?`<small class="p-note">${esc(p.imageCaption)}</small>`:'')+priceHtml(p);
  $('#quick-qty').textContent=1;
  $('#quick-wa').href=link(directMsg(p));
  d.showModal();
}

/* ---------- header, menu, basket, shared buttons ---------- */
function initChrome(){
  const head=$('.head'),toggle=$('#menu-toggle');
  const onScroll=()=>{head.classList.toggle('scrolled',scrollY>8);$('#to-top')?.classList.toggle('show',scrollY>700)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(toggle){
    const setOpen=open=>{head.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open)};
    toggle.addEventListener('click',()=>setOpen(!head.classList.contains('open')));
    $$('#site-nav a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&head.classList.contains('open')){setOpen(false);toggle.focus()}});
  }
  $('#to-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));
  $$('.wa').forEach(a=>{if(a.dataset.message)a.href=link(a.dataset.message);a.target='_blank';a.rel='noopener noreferrer'});
  $$('[data-total-products]').forEach(el=>{el.textContent=ALL.length;if(el.dataset.count!==undefined)el.dataset.count=ALL.length});
  $$('[data-total-categories]').forEach(el=>{el.textContent=categories.length;if(el.dataset.count!==undefined)el.dataset.count=categories.length});
  const year=$('#year');if(year)year.textContent=new Date().getFullYear();
  const footCats=$('#foot-cats');if(footCats)footCats.innerHTML=categories.map(c=>`<li><a href="${catUrl(c)}">${esc(c.title)}</a></li>`).join('');

  // one listener for every add / quick-view / basket button on the page
  document.addEventListener('click',e=>{
    const add=e.target.closest('[data-add]');if(add){addToCart(ALL[+add.dataset.add],1,add);return}
    const quick=e.target.closest('[data-quick]');if(quick){openQuick(ALL[+quick.dataset.quick]);return}
    if(e.target.closest('[data-open-cart]')){openCart();return}
    if(e.target.closest('[data-close-cart]')){closeCart();return}
    const q=e.target.closest('[data-qty]');if(q){const it=Cart.items.find(x=>x.key===q.dataset.qty);if(it)Cart.set(it.key,it.qty+ +q.dataset.step);return}
    const rm=e.target.closest('[data-remove]');if(rm){Cart.set(rm.dataset.remove,0);return}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#cart')?.classList.contains('open'))closeCart()});
  $('#cart-clear')?.addEventListener('click',()=>{if(confirm('أكيد بدك تفضّي السلة؟'))Cart.clear()});
  $('#cart-notes')?.addEventListener('input',()=>{$('#cart-send').href=link(cartMessage())});
  $('#toast-open')?.addEventListener('click',()=>{$('#toast').classList.remove('show');openCart()});
  addEventListener('storage',e=>{if(e.key==='deeppro-cart'){Cart.load();renderCart()}});

  const d=$('#quick');
  if(d){
    d.addEventListener('click',e=>{if(e.target===d)d.close()});
    $('#quick-close').addEventListener('click',()=>d.close());
    $('#quick-plus').addEventListener('click',()=>{quickQty=Math.min(quickQty+1,99);$('#quick-qty').textContent=quickQty});
    $('#quick-minus').addEventListener('click',()=>{quickQty=Math.max(quickQty-1,1);$('#quick-qty').textContent=quickQty});
    $('#quick-add').addEventListener('click',()=>{addToCart(quickProduct,quickQty);d.close()});
  }
}

/* ---------- scroll reveal + counters ---------- */
function initReveal(){
  const items=$$('[data-reveal]'),counters=$$('[data-count]');
  const countUp=el=>{const end=+el.dataset.count;if(reduceMotion){el.textContent=end;return}const t0=performance.now();const tick=t=>{const k=Math.min((t-t0)/1200,1);el.textContent=Math.round(end*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};
  if(!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('in'));counters.forEach(el=>el.textContent=el.dataset.count);return}
  const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);if(el.dataset.count!==undefined)countUp(el);else el.classList.add('in')}),{rootMargin:'0px 0px -8% 0px'});
  items.forEach(el=>io.observe(el));counters.forEach(el=>io.observe(el));
}

/* ---------- home ---------- */
const PROBLEMS=[
  {label:'دهون وشحوم',icon:'drop',name:'Deep cleaning',why:'للمطبخ، الأفران والشفاطات: بيفكّك الزيوت والشحوم المتراكمة.'},
  {label:'كلس وصدأ',icon:'spark',name:'مزيل التكلسات والصدأ',why:'للحنفيات، الركوات والمغاسل: بيشيل الكلس والصدأ.'},
  {label:'روائح كريهة',icon:'wind',name:'Magic Touch — قاتل الروائح',why:'للحمّامات، السيارات والسجّاد: بيقتل الريحة الكريهة.'},
  {label:'بقع على القماش',icon:'shirt',name:'Magic Touch — مزيل بقع الأقمشة',why:'للكنبايات، الثياب والسجّاد: بيشيل البقع عن الأقمشة.'},
  {label:'أسطح باهتة',icon:'shine',name:'Magic Touch — ملمّع الأسطح',why:'للبلاستيك، الخشب والجلود: بيرجّعلها لمعتها.'}
];
function initHome(){
  if(location.hash.startsWith('#category-')){const c=categories.find(x=>x.id===location.hash.slice(10));if(c){location.replace(catUrl(c));return}}
  const cats=$('#home-cats');if(cats)cats.innerHTML=categories.map(categoryCard).join('');

  const tabs=$('#problems'),panel=$('#solution');
  if(tabs&&panel){
    const list=PROBLEMS.map(x=>({...x,p:ALL.find(p=>p.name===x.name)})).filter(x=>x.p);
    tabs.innerHTML=list.map((x,n)=>`<button class="problem-btn" type="button" role="tab" id="pb-${n}" aria-controls="solution" aria-selected="${n===0}" tabindex="${n===0?0:-1}" data-problem="${n}"><span class="badge">${icon(x.icon)}</span>${x.label}</button>`).join('');
    const show=n=>{const x=list[n],p=x.p;
      $$('.problem-btn',tabs).forEach((b,i)=>{b.setAttribute('aria-selected',i===n);b.tabIndex=i===n?0:-1});
      panel.setAttribute('aria-labelledby','pb-'+n);
      panel.innerHTML=`<div class="solution"><button class="p-img img" type="button" data-quick="${p.i}" aria-label="عرض ${esc(p.name)} بالكبير"><img src="${p.image}" alt="${esc(p.name)}"><span class="zoom">${icon('zoom')}</span></button><div><span class="tag">الحل لـ${x.label}</span><h3>${p.name}</h3><p>${x.why}</p>${p.size?`<p>الحجم: ${p.size}</p>`:''}${priceHtml(p)}<div class="row-actions"><button class="btn btn-blue" type="button" data-add="${p.i}">${icon('bag')}أضف للسلة</button><a class="btn btn-ghost" href="${link(directMsg(p))}" target="_blank" rel="noopener noreferrer">${icon('wa')}اطلب مباشرة</a></div></div></div>`;
    };
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-problem]');if(b)show(+b.dataset.problem)});
    tabs.addEventListener('keydown',e=>{const keys={ArrowDown:1,ArrowLeft:1,ArrowUp:-1,ArrowRight:-1};if(!(e.key in keys))return;e.preventDefault();const cur=$$('.problem-btn',tabs).findIndex(b=>b.getAttribute('aria-selected')==='true');const n=(cur+keys[e.key]+list.length)%list.length;show(n);$('#pb-'+n).focus()});
    show(0);
  }

  const rail=$('#rail');
  if(rail){
    rail.innerHTML=ALL.filter(isPriced).map(p=>productCard(p)).join('');
    const prev=$('#rail-prev'),next=$('#rail-next');
    const step=()=>rail.clientWidth*.9;
    const update=()=>{const max=rail.scrollWidth-rail.clientWidth,pos=Math.abs(rail.scrollLeft);prev.disabled=pos<4;next.disabled=pos>max-4};
    // RTL: moving forward means scrolling to the left
    next.addEventListener('click',()=>rail.scrollBy({left:-step()}));
    prev.addEventListener('click',()=>rail.scrollBy({left:step()}));
    rail.addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  }
}

/* ---------- catalog + category pages ---------- */
function initShop(catId){
  const cat=catId?categories.find(c=>c.id===catId):null;
  const grid=$('#grid'),search=$('#shop-search'),count=$('#result-count'),empty=$('#empty');
  const sorts=$$('.sort'),pricedBoxes=$$('.priced-only');
  const nav=categories.map(c=>({href:catUrl(c),title:c.title,n:c.products.length,current:!!cat&&c.id===cat.id}));
  nav.unshift({href:'catalog.html',title:'كل المنتجات',n:ALL.length,current:!cat});
  $('#cat-list').innerHTML=nav.map(x=>`<li><a href="${x.href}"${x.current?' aria-current="page"':''}>${esc(x.title)}<em>${x.n}</em></a></li>`).join('');
  const scroller=$('#cat-scroll');
  scroller.innerHTML=nav.map(x=>`<a class="chip${x.current?' active':''}" href="${x.href}"${x.current?' aria-current="page"':''}>${esc(x.title)}</a>`).join('');
  const activeChip=$('.active',scroller);if(activeChip)scroller.scrollLeft=activeChip.offsetLeft-scroller.clientWidth/2+activeChip.clientWidth/2;
  if(cat){
    document.title=cat.title+' — DeepPro';
    [['#cat-title',cat.title],['#cat-crumb',cat.title],['#cat-desc',cat.description],['#cat-count',cat.products.length]].forEach(([s,v])=>{const el=$(s);if(el)el.textContent=v});
    const img=$('#cat-image');if(img){if(cat.image){img.src=cat.image;img.style.objectPosition=cat.imagePosition||'center 55%'}else img.closest('.head-img').hidden=true}
    const note=$('#catalog-note');
    if(note)note.textContent=cat.id==='soap'?'كل صابونة بـ 5 دولارات. متوفّر أكثر من 20 صنف بالمحل، اسألنا عن باقي التشكيلة.':'نضيف صور وتفاصيل باقي المنتجات تباعًا. تواصل معنا لتأكيد التوفر والسعر.';
  }
  const params=new URLSearchParams(location.search);
  if(params.get('q'))search.value=params.get('q');
  let sort='default',pricedOnly=false;
  function render(){
    const q=normalize(search.value);
    let items=(cat?ALL.filter(p=>p.cat===cat):ALL).filter(p=>!q||normalize(p.cat.title+' '+p.name+' '+(p.description||'')+' '+(p.size||'')).includes(q));
    if(pricedOnly)items=items.filter(isPriced);
    if(sort==='low'||sort==='high')items=[...items].sort((a,b)=>isPriced(a)!==isPriced(b)?(isPriced(a)?-1:1):(sort==='low'?a.price-b.price:b.price-a.price));
    grid.innerHTML=items.map(p=>productCard(p,!cat)).join('');
    count.innerHTML=`عم نعرض <b>${countLabel(items.length)}</b>`;
    empty.hidden=items.length>0;grid.hidden=items.length===0;
    const url=new URL(location.href);if(search.value.trim())url.searchParams.set('q',search.value.trim());else url.searchParams.delete('q');
    try{history.replaceState(null,'',url)}catch(e){}
  }
  search.addEventListener('input',render);
  sorts.forEach(s=>s.addEventListener('change',()=>{sort=s.value;sorts.forEach(o=>o.value=sort);render()}));
  pricedBoxes.forEach(b=>b.addEventListener('change',()=>{pricedOnly=b.checked;pricedBoxes.forEach(o=>o.checked=pricedOnly);render()}));
  $('#reset')?.addEventListener('click',()=>{search.value='';pricedOnly=false;pricedBoxes.forEach(o=>o.checked=false);render();search.focus()});
  render();
}

/* ---------- FAQ search ---------- */
function initFaq(){
  const input=$('#faq-search');if(!input)return;
  const items=$$('.faq details'),none=$('#faq-empty');
  input.addEventListener('input',()=>{const q=normalize(input.value);let shown=0;items.forEach(d=>{const hit=!q||normalize(d.textContent).includes(q);d.hidden=!hit;if(hit)shown++;if(q&&hit)d.open=true});none.hidden=shown>0});
}

/* ---------- contact form → WhatsApp message ---------- */
function initContactForm(){
  const form=$('#wa-form');if(!form)return;
  const f=form.elements;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=f.name.value.trim(),about=f.about.value.trim(),msg=f.message.value.trim();
    let text='مرحبا DeepPro،'+(name?' أنا '+name+'.':'')+'\nالموضوع: '+f.topic.value;
    if(about)text+='\nالمنتج أو نوع السطح: '+about;
    if(msg)text+='\n'+msg;
    window.open(link(text),'_blank','noopener');
  });
}

Cart.load();
initChrome();
renderCart();
const page=document.body.dataset.page;
if(page==='home')initHome();
if(page==='catalog'||page==='category')initShop(document.body.dataset.category);
initFaq();
initContactForm();
initReveal();
