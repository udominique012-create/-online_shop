import {L} from "./i18n.js";
{const b=document.getElementById("boot");if(b)b.remove()}
const BASE=location.pathname.replace(/(?:admin(?:\.html)?\/?|index\.html)$/,"").replace(/\/?$/,"/"),API=BASE+"api/";
const U=u=>u&&u.startsWith("/uploads/")?BASE+u.slice(1):u;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const R=n=>Number(n).toLocaleString("en-US")+" RWF";
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},del(k){try{localStorage.removeItem(k)}catch{}}};
const post=(u,b)=>fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),keepalive:true});

window.addEventListener("error",e=>{let b=document.getElementById("errbar");if(!b){b=document.createElement("div");b.id="errbar";b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:9999;background:#B42318;color:#fff;padding:10px 16px;font:600 14px system-ui";document.body.appendChild(b)}b.textContent="Ikosa: "+(e.message||"JavaScript")+" — vugurura urupapuro (Ctrl+F5)"});

/* ===== HINDURA HANO ===== */
const CREATOR={name:"Dominique Xavier"};
const SHOP={
  name:"FRANCOIS SHOES & CLOTHES STORE",
  whatsapp:"+250784292599",
  momoCode:"2316145",
  momoName:"NIYOGISUBIZO Francais",
  sendPhone:"0784292599",
  deliveryKigali: 0,


  deliveryOutside: 0,
  freeOver: 0,
  transportOutside: 0
};
const CONTACT = {
  whatsapp: "+250784292599",
  phone:    "+250784292599",
  email:    "niyogisubizofrancois@gmail.com",
  address:  "Kigali, Nyarugenge — DOWTOWN_house"
};

/* ============================================================
   ===== BACK TO ADMIN BUTTON (SERVER-VERIFIED) =====
   ============================================================ */
let _adminVerified = null;

async function checkAdminSession(){
  const btn = document.getElementById("back-admin");
  if (!btn) return;
  try {
    const r = await fetch(API + "admin/check", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (r.ok) {
      const j = await r.json();
      _adminVerified = !!j.admin;
    } else {
      _adminVerified = false;
    }
  } catch (e) {}

  if (_adminVerified === false) {
    btn.classList.remove("on");
    btn.onclick = null;
    try { localStorage.removeItem("admin-back"); } catch {}
    return;
  }

  let isAdminBack = false;
  try { isAdminBack = localStorage.getItem("admin-back") === "1"; } catch {}

  if (_adminVerified === true && isAdminBack) {
    btn.classList.add("on");
    btn.onclick = () => {
      try { localStorage.setItem("admin-return", "1"); } catch {}
      try { localStorage.removeItem("admin-back"); } catch {}
      const adminUrl = BASE + "admin.html#dashboard";
      window.location.href = adminUrl;
    };
  } else {
    btn.classList.remove("on");
    btn.onclick = null;
  }
}

checkAdminSession();
setInterval(checkAdminSession, 3000);
window.addEventListener("focus", checkAdminSession);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkAdminSession();
});
/* ============================================================ */

const SH={shirt:'<path d="M32 18 48 10Q60 22 72 10L88 18 102 40 88 47 84 42V90H36V42L32 47 18 40Z"/>',dress:'<path d="M48 8H72L70 32 92 92H28L50 32Z"/>',pants:'<path d="M38 10H82L88 92H66L60 40 54 92H32Z"/>',shoe:'<path d="M14 62V46Q28 44 36 34L46 40Q58 46 70 48Q96 50 106 66V74H14Z"/><rect x="14" y="74" width="92" height="7" rx="3" opacity=".45"/>',boot:'<path d="M40 10H68V50Q84 54 96 66V80H34Z"/><rect x="34" y="80" width="62" height="7" rx="3" opacity=".45"/>'};
const art=p=>`<svg viewBox="0 0 120 100" fill="${esc(p.col)}" aria-hidden="true">${SH[p.t]||""}</svg>`;
const thumb=p=>p.img?`<img src="${U(p.img)}" alt="${esc(p.n)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`:art(p);

const ussd = t => `*182*8*1*${SHOP.momoCode}*${t}#`;
const ussdSend = t => `*182*1*1*${SHOP.sendPhone}*${t}#`;

let lang=store.get("os-lang","")||(navigator.language||"").slice(0,2); if(!L[lang])lang="rw";
const tr=(k,v={})=>{let x=L[lang][k]??L.rw[k]??k;for(const y in v)x=x.replace("{"+y+"}",v[y]);return x};

const PAGES = ["home","about","contact"];
function showPage(id){
  PAGES.forEach(p => { const el = document.getElementById("page-"+p); if(el) el.hidden = (p !== id); });
  document.querySelectorAll("[data-nav]").forEach(a => { a.classList.toggle("on", a.dataset.nav === id); });
  document.documentElement.setAttribute("data-page", id);
}
function route(){
  const h = location.hash.replace("#","") || "home";
  const id = PAGES.includes(h) ? h : "home";
  showPage(id);
  window.scrollTo({top:0, behavior:"instant"});
}
window.addEventListener("hashchange", route);

let cat="Byose",term="",sort="",page=1,total=0,P=[],loading=false,seq=0,apiErr=false;
let lastSig="";const sigOf=d=>d.total+"|"+d.items.map(x=>x.id+":"+x.p+":"+(x.img||"")+(x.v?"v":"")).join(",");

async function load(reset){
  if(reset)page=1; 
  const my=++seq; 
  loading=true; 
  renderGrid();
  
  try{
    const r=await fetch(`${API}products?page=${page}&cat=${cat==="Byose"?"":cat}&q=${encodeURIComponent(term)}&sort=${sort}`);
    const d=await r.json();
    if(my!==seq)return;
    total=d.total;
    
    if(page === 1){
      P = d.items;
      lastSig = sigOf(d);
    } else {
      const existingIds = new Set(P.map(x => x.id));
      const newItems = d.items.filter(x => !existingIds.has(x.id));
      P = P.concat(newItems);
    }
    
    apiErr = false;
  } catch {
    apiErr = true;
  }
  
  if(my === seq){ 
    loading = false; 
    renderGrid(); 
  }
}

function renderGrid(){
  const el=$("#grid"); if(!el)return;
  el.innerHTML=P.length
    ? P.map((p,i)=>`<button class="p" data-i="${i}"><div class="im" style="background:${esc(p.bg)}">${p.b?`<span class="badge">${esc(p.b)}</span>`:""}${p.v?'<span class="vb">▶ Video</span>':""}${thumb(p)}</div><div class="t"><h3>${esc(p.n)}</h3><div class="pr">${R(p.p)}${p.o?`<s>${R(p.o)}</s>`:""}</div></div></button>`).join("")
    : (loading?"":`<p class="empty">${apiErr?tr("apiErr"):tr("none")}</p>`);
    
  const m=$("#more");
  const l=$("#less");
  
  const hasMore = P.length < total;
  const hasLess = P.length > 10 && page > 1;
  
  if(m){
    m.hidden = !hasMore;
    m.disabled = loading;
    m.textContent = loading ? "…" : tr("more");
  }
  if(l){
    l.hidden = !hasLess;
  }
}

function chips(){const el=$("#chips");if(!el)return;el.innerHTML=["Byose","Imyenda","Inkweto"].map(c=>`<button data-c="${c}" aria-pressed="${c===cat}">${tr("c_"+c)}</button>`).join("")}

const chipsEl=$("#chips");
if(chipsEl) chipsEl.onclick=e=>{const b=e.target.closest("button");if(!b)return;cat=b.dataset.c;chips();load(true)};

let tm;
const qEl=$("#q");
if(qEl) qEl.oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{term=e.target.value.trim();load(true)},350)};

const soEl=$("#so");
if(soEl) soEl.onchange=e=>{sort=e.target.value;load(true)};

const moreEl=$("#more");
if(moreEl) moreEl.onclick=async ()=>{
  page++;
  await load(false);
  const g=$("#grid");
  if(g) g.scrollIntoView({behavior:"smooth", block:"start"});
};

const lessEl=$("#less");
if(lessEl) lessEl.onclick=()=>{
  page = 1;
  load(true);
  const g = $("#grid");
  if(g) g.scrollIntoView({behavior:"smooth", block:"start"});
};

const ctaEl=$("#cta");
if(ctaEl) ctaEl.onclick=()=>{const g=$("#grid");if(g)g.scrollIntoView({behavior:"smooth"})};

let sel=null,size=null,color=null;
const gridEl=$("#grid");
if(gridEl) gridEl.onclick=e=>{const b=e.target.closest("[data-i]");if(b)openP(P[+b.dataset.i])};

function openP(p){
  sel=p;size=null;color=null;
  const media=p.v?`<video src="${U(p.v)}" ${p.img?`poster="${U(p.img)}"`:""} controls playsinline preload="metadata" style="width:100%;max-height:380px;background:#000"></video>`:thumb(p);
  const colors=(p.vr||[]);
  $("#pd").innerHTML=`<div class="im" style="background:${esc(p.bg)}">${media}</div><div class="in"><h2>${esc(p.n)}</h2><div class="pr" style="font-size:20px">${R(p.p)}${p.o?`<s>${R(p.o)}</s>`:""}</div>
  <div><span class="lbl">${tr("pickSize")}</span><div class="opts" id="sz">${p.s.map(s=>`<button aria-pressed="false">${esc(s)}</button>`).join("")}</div></div>
  ${colors.length?`<div><span class="lbl">${tr("pickColor")}</span><div class="opts" id="clr">${colors.map(c=>`<button aria-pressed="false">${esc(c)}</button>`).join("")}</div></div>`:""}
  <button class="btn" id="add" disabled>${tr("pickFirst")}</button><button class="btn o" id="askp">💬 ${tr("ask")}</button></div>`;
  $("#dlg").showModal();
}

const pdEl=$("#pd");
if(pdEl) pdEl.onclick=e=>{
  const sb=e.target.closest("#sz button");
  if(sb){size=sb.textContent;$$("#sz button").forEach(x=>x.setAttribute("aria-pressed",x===sb));checkCanAdd();return}
  const cb=e.target.closest("#clr button");
  if(cb){color=cb.textContent;$$("#clr button").forEach(x=>x.setAttribute("aria-pressed",x===cb));checkCanAdd();return}
  if(e.target.closest("#add")&&size){
    const k=cart.find(c=>c.id===sel.id&&c.size===size&&(c.color||"")===(color||""));
    if(k)k.qty++;else cart.push({id:sel.id,size,color,qty:1,p:sel});
    saveCart();$("#dlg").close();openCart();
  }
  if(e.target.closest("#askp")){const pr=sel.n+(size?` (${tr("size")} ${size})`:"")+(color?` (${color})`:"");$("#dlg").close();chatOpen(pr)}
};

function checkCanAdd(){
  const hasColors=sel&&sel.vr&&sel.vr.length>0;
  const ok=size&&(!hasColors||color);
  const b=$("#add");if(!b)return;
  b.disabled=!ok;
  b.textContent=ok?tr("add"):(size?tr("pickColor"):tr("pickFirst"));
}

const dlgEl=$("#dlg");
if(dlgEl){
  dlgEl.addEventListener("close",()=>{$("#pd").innerHTML=""});
  dlgEl.addEventListener("click",e=>{if(e.target.id==="dlg")e.target.close()});
}

let cart=(store.get("os-cart",[])||[]).filter(c=>c&&c.p&&c.id&&c.qty>0);
let payMethod = null;
const saveCart=()=>{store.set("os-cart",cart);updateCart()};

const shipFor = sub => {
  const md = $("#md");
  if (!md) return 0;
  const mode = md.value;
  if (mode === "pick") return 0;
  if (!sub) return 0;
  if (mode === "kgl") return 0;
  if (mode === "out") return Number(SHOP.transportOutside) || 0;
  return 0;
};

function updateCart(){
  const count=cart.reduce((s,c)=>s+c.qty,0);
  const cn=$("#cn"); if(cn) cn.textContent=count;
  const ce=$("#cempty"), cf=$("#cfull");
  if(ce) ce.hidden=cart.length>0;
  if(cf) cf.hidden=!cart.length;
  const ci=$("#citems");
  if(ci) ci.innerHTML=cart.map((c,i)=>`<div class="ci"><div class="th" style="background:${esc(c.p.bg)}">${thumb(c.p)}</div><div class="m"><b>${esc(c.p.n)}</b>${tr("size")}: ${esc(c.size)}${c.color?" · "+esc(c.color):""} · ${R(c.p.p)}</div><div class="q"><button data-m="${i}" aria-label="−">−</button>${c.qty}<button data-p="${i}" aria-label="+">+</button></div></div>`).join("");

  const subtotal = cart.reduce((s,c)=>s+c.p.p*c.qty, 0);
  const mdEl = $("#md");
  const mode = mdEl ? mdEl.value : "kgl";
  const shipAmt = shipFor(subtotal);
  const totalAmt = subtotal + shipAmt;

  let shipLabel = tr("ship") || "Kugeza";
  let shipText = shipAmt > 0 ? R(shipAmt) : (tr("free") || "Ubuntu");

  if(mode === "out"){
    shipLabel = tr("transport") || "Transport";
    shipText = (Number(SHOP.transportOutside) > 0)
      ? R(SHOP.transportOutside) + " (" + (tr("payOnDelivery") || "Wiyishyura") + ")"
      : (tr("payOnDelivery") || "Wiyishyura");
  } else if(mode === "pick"){
    shipLabel = tr("ship") || "Kugeza";
    shipText = tr("free") || "Ubuntu";
  }

  const sb=$("#sb"),sh=$("#sh"),tt=$("#tt");
  if(sb) sb.textContent = R(subtotal);
  if(sh) sh.textContent = shipText;
  if(tt) tt.textContent = R(totalAmt);

  const shRow = sh ? sh.parentElement : null;
  if(shRow){
    const labelSpan = shRow.querySelector("span");
    if(labelSpan) labelSpan.textContent = shipLabel;
  }

  const codeMM = ussdSend(totalAmt);
  const codeMP = ussd(totalAmt);

  const btnMM = document.querySelector('.pay-opt[data-method="mm"]');
  const btnMP = document.querySelector('.pay-opt[data-method="mp"]');
  if(btnMM){
    const span = btnMM.querySelector("span");
    if(span) span.textContent = (tr("mobileMoney") || "Mobile Money") + " — " + R(totalAmt);
  }
  if(btnMP){
    const span = btnMP.querySelector("span");
    if(span) span.textContent = (tr("momoPay") || "MoMo Pay") + " — " + R(totalAmt);
  }

  const codeStep = $("#pay-code-step");
  const txStep = $("#pay-tx-step");
  const warn = $("#pay-warn");

  if(payMethod){
    const code = payMethod === "mm" ? codeMM : codeMP;
    const label = payMethod === "mm" ? (tr("mobileMoney") || "Mobile Money") : (tr("momoPay") || "MoMo Pay");

    const uc = $("#uc");
    if(uc){
      uc.innerHTML =
        `<small style="color:${payMethod === "mm" ? "#00A651" : "#0F5C4D"};font-weight:700">${label}:</small><br>` +
        `<b style="font-size:15px">${code}</b>`;
    }

    const tel = $("#tel");
    if(tel){
      tel.href = "tel:" + code.replace(/#/g, "%23");
      const span = tel.querySelector("span");
      if(span) span.textContent = (tr("payOnPhone") || "Kwishyura kuri telefoni") + " — " + R(totalAmt);
      else tel.textContent = "📞 " + (tr("payOnPhone") || "Kwishyura kuri telefoni") + " — " + R(totalAmt);
    }

    if(codeStep) codeStep.hidden = false;
    if(txStep) txStep.hidden = false;
    if(warn) warn.hidden = false;
  } else {
    if(codeStep) codeStep.hidden = true;
    if(txStep) txStep.hidden = true;
    if(warn) warn.hidden = true;
  }

  const ad=$("#ad");
  if(ad && mdEl) ad.hidden = mdEl.value === "pick";
  const nm=$("#nm"),ph=$("#ph"),ord=$("#ord"),er=$("#er");
  const ok = nm && ph && mdEl && ad && nm.value.trim() && ph.value.replace(/\D/g,"").length>=9 && (mdEl.value==="pick"||ad.value.trim());
  if(ord) ord.disabled = !ok || !cart.length;
  if(er) er.hidden = !!ok;
}

const ciEl=$("#citems");
if(ciEl) ciEl.onclick=e=>{
  const m=e.target.closest("[data-m]"),a=e.target.closest("[data-p]");
  if(a)cart[+a.dataset.p].qty++;
  else if(m){const c=cart[+m.dataset.m];c.qty--;if(c.qty<1)cart.splice(+m.dataset.m,1)}
  else return;
  saveCart();
};

["#nm","#ph","#ad","#md"].forEach(s=>{const el=$(s);if(el)el.addEventListener("input",updateCart)});

const payChoice = $("#pay-choice");
if(payChoice){
  payChoice.onclick = (e) => {
    const btn = e.target.closest(".pay-opt");
    if(!btn) return;
    payMethod = btn.dataset.method;
    payChoice.querySelectorAll(".pay-opt").forEach(b => {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    updateCart();
  };
}

const cpEl=$("#cp");
if(cpEl) cpEl.onclick = async () => {
  const uc=$("#uc");
  if(!uc) return;
  if(!payMethod){
    alert(tr("pickPayFirst") || "Hitamo uburyo bwo kwishyura mbere.");
    return;
  }
  const bEl = uc.querySelector("b");
  const code = bEl ? bEl.textContent.trim() : "";
  if(!code) return;
  const btnText = cpEl.querySelector("span") || cpEl;
  try{
    await navigator.clipboard.writeText(code);
    btnText.textContent = "✅ " + (tr("copied") || "Yakopowe!");
    setTimeout(()=>{ btnText.textContent = tr("copyCode") || "📋 Kopiya code" }, 2000);
  }catch{
    try{
      const range = document.createRange();
      range.selectNode(uc);
      const sel2 = window.getSelection();
      sel2.removeAllRanges();
      sel2.addRange(range);
      document.execCommand("copy");
      sel2.removeAllRanges();
      btnText.textContent = "✅ " + (tr("copied") || "Yakopowe!");
      setTimeout(()=>{ btnText.textContent = tr("copyCode") || "📋 Kopiya code" }, 2000);
    }catch{
      btnText.textContent = "❌ " + (tr("copyFail") || "Ntibyakunze");
    }
  }
};

function openCart(){
  const dr=$("#dr"),ov=$("#ov");
  if(dr)dr.classList.add("on");
  if(ov)ov.classList.add("on");
  payMethod = null;
  const pc = $("#pay-choice");
  if(pc) pc.querySelectorAll(".pay-opt").forEach(b => b.setAttribute("aria-pressed","false"));
  updateCart();
}

function closeCart(){
  const dr=$("#dr"),ov=$("#ov");
  if(dr)dr.classList.remove("on");
  if(ov)ov.classList.remove("on");
}

const cbEl=$("#cb");if(cbEl)cbEl.onclick=openCart;
const dcEl=$("#dc");if(dcEl)dcEl.onclick=closeCart;
const ovEl=$("#ov");if(ovEl)ovEl.onclick=closeCart;
const contEl=$("#cont");if(contEl)contEl.onclick=closeCart;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});

const ordEl=$("#ord");
if(ordEl) ordEl.onclick=()=>{
  const subtotal=cart.reduce((s,c)=>s+c.p.p*c.qty,0);
  const shipAmt=shipFor(subtotal);
  const totalAmt=subtotal+shipAmt;
  const mode = $("#md").value;
  const pick = mode === "pick";
  const isOutside = mode === "out";

  post(API+"order",{
    name:$("#nm").value,
    phone:$("#ph").value,
    address:$("#ad").value,
    mode:mode,
    txn:$("#tx").value,
    items:cart.map(({id,size,color,qty})=>({id,size,color:color||"",qty}))
  }).catch(()=>{});

  const lines=cart.map(c=>`• ${c.p.n} (${c.size}${c.color?", "+c.color:""}) x${c.qty} = ${R(c.p.p*c.qty)}`).join("\n");

  let delLine = "";
  if(pick){
    delLine = `\n🚚 Kubifata ku iduka: Ubuntu`;
  } else if(isOutside){
    delLine = (Number(SHOP.transportOutside) > 0)
      ? `\n🚚 Transport (Hanze ya Kigali): Wiyishyura (${R(SHOP.transportOutside)})`
      : `\n🚚 Transport (Hanze ya Kigali): Wiyishyura`;
  } else {
    delLine = `\n🚚 Kugeza i Kigali: Ubuntu (Free)`;
  }

  const payLabel = payMethod === "mm" ? "Mobile Money" : payMethod === "mp" ? "MoMo Pay" : "MoMo";
  const msg = `Muraho ${SHOP.name}, ndashaka gutumiza:\n${lines}${delLine}\n\nYose hamwe: ${R(totalAmt)}\nNishyuye kuri ${payLabel} (${SHOP.momoName}). ID: ${$("#tx").value||"—"}\n\nAmazina: ${$("#nm").value}\nTelefoni: ${$("#ph").value}\nAho: ${pick?"Ndaza kubifata":$("#ad").value}`;

  window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
  cart=[];saveCart();closeCart();alert(tr("sent"));
};

let annKey=null;
async function loadAnn(){
  const b=$("#bonus"); if(!b) return;
  try{const a=await (await fetch(API+"announcements")).json(),txt=a.join("   •   ");if(txt===annKey)return;annKey=txt;
    if(!a.length){b.hidden=true;b.innerHTML="";return}
    const t=esc(Array(3).fill(txt).join("   •   "));b.hidden=false;
    b.innerHTML=`<b>🎁</b><div class="mq"><div class="track" style="animation-duration:${Math.max(20,Math.round(t.length*0.12))}s"><span>${t}</span><span aria-hidden="true">${t}</span></div></div>`}catch{}
}

let tok=store.get("os-chat",null),last=0,chatIsOpen=false;
const chv=w=>{const cs=$("#cs"),ct=$("#ct");if(cs)cs.hidden=w!=="s";if(ct)ct.hidden=w!=="t"};

function cadd(s,b,img){
  const cl=$("#cl"); if(!cl) return;
  const d=document.createElement("div");
  d.className="cm "+s;
  if(b)d.appendChild(document.createTextNode(b));
  if(img){
    const im=document.createElement("img");
    im.src=U(img);im.alt="ifoto";im.loading="lazy";
    im.style.cssText="max-width:200px;max-height:200px;border-radius:10px;display:block;margin-top:4px;cursor:pointer";
    im.onclick=()=>window.open(U(img),"_blank");
    d.appendChild(im);
  }
  cl.appendChild(d);
  cl.scrollTop=1e9;
}

async function cpoll(){
  if(!tok)return;
  try{
    const r=await fetch(`${API}chat/poll?token=${tok}&after=${last}`);
    if(r.status===404){store.del("os-chat");tok=null;return}
    const j=await r.json();
    let n=0;
    j.m.forEach(m=>{last=Math.max(last,+m.id);cadd(m.s,m.b,m.i);if(m.s==="a")n++});
    if(n&&!chatIsOpen){const chb=$("#chb");if(chb)chb.classList.add("n")}
  }catch{}
}

async function csend(b){try{const r=await post(API+"chat/send",{token:tok,body:b});if(!r.ok)throw 0;cpoll()}catch{cadd("a",tr("sendFail"))}}

function uploadChatImage(file){
  return new Promise((res,rej)=>{
    const x=new XMLHttpRequest();
    x.open("POST",API+"chat/upload");
    const fd=new FormData();
    fd.append("file",file);fd.append("token",tok||"");
    x.onload=()=>x.status===200?res(JSON.parse(x.responseText).url):rej(x.status);
    x.onerror=()=>rej(0);
    x.send(fd);
  });
}

async function csendImg(file){
  if(!tok){alert(tr("startFail"));return}
  try{
    const url=await uploadChatImage(file);
    await post(API+"chat/send",{token:tok,body:"",image:url});
    cpoll();
  }catch(c){cadd("a","Ifoto ntiyoherejwe (HTTP "+c+").")}
}

function chatOpen(prod){
  chatIsOpen=true;
  const chp=$("#chp"),chb=$("#chb");
  if(chp)chp.classList.add("on");
  if(chb)chb.classList.remove("n");
  if(tok){chv("t");cpoll();if(prod)csend(tr("askMsg")+" "+prod)}
  else{const cp=$("#cprod");if(cp)cp.value=prod||"";chv("s")}
}

const chbEl=$("#chb");if(chbEl)chbEl.onclick=()=>chatOpen();
const chxEl=$("#chx");if(chxEl)chxEl.onclick=()=>{chatIsOpen=false;const chp=$("#chp");if(chp)chp.classList.remove("on")};

const csEl=$("#cs");
if(csEl) csEl.onsubmit=async e=>{e.preventDefault();
  try{const r=await post(API+"chat/start",{name:$("#cn2").value,phone:$("#cph").value,product:$("#cprod").value});if(!r.ok)throw 0;
    tok=(await r.json()).token;store.set("os-chat",tok);chv("t");cpoll()}catch{alert(tr("startFail"))}};

const cfEl=$("#cf");
if(cfEl) cfEl.onsubmit=e=>{e.preventDefault();const ci=$("#ci");const b=ci.value.trim();if(!b)return;ci.value="";csend(b)};

const cimgEl=$("#cimg");
if(cimgEl) cimgEl.onchange=e=>{const f=e.target.files[0];if(f)csendImg(f);e.target.value=""};

async function loadAbout(){
  const set = (id, key) => { const e = document.getElementById(id); if(e) e.textContent = tr(key); };
  set("about-text",     "aboutTextStore");
  set("about-loc",      "aboutLocVal");
  set("about-hours",    "aboutHoursVal");
  set("about-del",      "aboutDelVal");
  set("about-contact",  "aboutContactVal");
}

function applyLang(){
  document.documentElement.lang=lang;
  
  $$("[data-i18n]").forEach(e=>{ e.textContent=tr(e.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(e=>e.placeholder=tr(e.dataset.i18nPh));
  $$("[data-i18n-aria]").forEach(e=>e.setAttribute("aria-label",tr(e.dataset.i18nAria)));

  const promo=$("#promo");
  if(promo){
    promo.innerHTML =
      `📞 <a href="tel:+${SHOP.whatsapp}" style="color:inherit;font-weight:800;text-decoration:underline">+${SHOP.whatsapp}</a>` +
      ` &nbsp;·&nbsp; 💳 MoMo: <b>${SHOP.momoCode}</b> <small style="opacity:.9">(${SHOP.momoName})</small>` +
      ` &nbsp;·&nbsp; 🚚 ${tr("freeDeliveryKigali") || "Kigali: Ubuntu"} · ${tr("transportOutside") || "Hanze: Wiyishyura"}`;
  }

  const ft=$("#ft"); if(ft) ft.textContent=tr("foot",{y:new Date().getFullYear(),n:SHOP.name});
  const cr=$("#cr"); if(cr) cr.innerHTML=esc(tr("madeBy"))+" "+(CREATOR.link?`<a href="${esc(CREATOR.link)}" target="_blank" rel="noopener"><b>${esc(CREATOR.name)}</b></a>`:`<b>${esc(CREATOR.name)}</b>`);
  
  const optk=$("#optk"); if(optk) optk.textContent=tr("optKgl",{p:R(SHOP.deliveryKigali)});
  const optout=$("#optout"); if(optout) optout.textContent=tr("optOut",{p:R(SHOP.deliveryOutside)});
  const m2=$("#m2"); if(m2) m2.innerHTML=tr("momo2",{n:SHOP.momoName});
  const lg=$("#lg"); if(lg) lg.value=lang;
  
  chips();renderGrid();updateCart();
  const cgr=$("#cgr"); if(cgr) cgr.textContent=tr("greet");
  
  const wa=document.getElementById("c-wa"); if(wa) wa.href="https://wa.me/"+CONTACT.whatsapp;
  const wt=document.getElementById("c-wa-text"); if(wt) wt.textContent="+250 784 292 599";
  const tel=document.getElementById("c-tel"); if(tel) tel.href="tel:"+CONTACT.phone.replace(/\s/g,"");
  const tt=document.getElementById("c-tel-text"); if(tt) tt.textContent="+250 784 292 599";
  const mail=document.getElementById("c-mail"); if(mail) mail.href="mailto:"+CONTACT.email;
  const mt=document.getElementById("c-mail-text"); if(mt) mt.textContent="niyogisubizofrancais@gmail.com";
  const ad=document.getElementById("c-addr"); if(ad) ad.textContent="Kigali, Nyarugenge — DOWTOWN_house";
  
  loadAbout();
  
  const dlg=$("#dlg"); if(dlg&&dlg.open) dlg.close();
}

const lgEl=$("#lg");
if(lgEl) lgEl.onchange=e=>{lang=e.target.value;store.set("os-lang",lang);applyLang()};

const tbEl=$("#tb");
if(tbEl) tbEl.onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark";store.set("os-theme",r.dataset.theme)};

const th=store.get("os-theme",null); if(th) document.documentElement.dataset.theme=th;

async function refreshQuiet(){
  if(loading||page>1)return; const my=seq;
  try{const r=await fetch(`${API}products?page=1&cat=${cat==="Byose"?"":cat}&q=${encodeURIComponent(term)}&sort=${sort}`);if(!r.ok)return;const d=await r.json();
    if(my!==seq||loading||page>1)return; const s=sigOf(d); if(s===lastSig)return; lastSig=s; total=d.total; P=d.items; renderGrid()}catch{}
}

document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshQuiet()});
window.addEventListener("focus",refreshQuiet);
setInterval(()=>{if(!document.hidden)refreshQuiet()},window.REFRESH_MS||5000);

route();
applyLang();
chv("s");
load(true);
loadAnn();
cpoll();
setInterval(loadAnn,60000);
setInterval(cpoll,5000);