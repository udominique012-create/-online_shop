{const b=document.getElementById("boot");if(b)b.remove()}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const BASE=location.pathname.replace(/(?:admin(?:\.html)?\/?|index\.html)$/,"").replace(/\/?$/,"/"),API=BASE+"api/";
const U=u=>u&&u.startsWith("/uploads/")?BASE+u.slice(1):u;
let CS="",ac=null,has=true,cur=null,after=0,prev=null,pg=1,eid=null,F={image:"",video:""},LP=[],tab="dashboard";

/* ===== THEME (LIGHT / DARK) ===== */
const atb = document.getElementById("atb");
if (atb) {
  const savedTheme = localStorage.getItem("admin-theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  atb.onclick = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("admin-theme", newTheme);
  };
}

/* ===== Ururimi rwa admin ===== */
const AT={
  rw:{login:"Injira muri Admin",setup:"Kora konti ya admin",user:"Izina",pass:"Ijambobanga (nibura inyuguti 8)",email:"Email",phone:"Telefoni",create:"Kora konti",enter:"Injira",
    noteSetup:"Konti ya admin ikorwa rimwe gusa. Nyuma yo kuyikora, iyi fomu ntizongera kugaragara; hazajya haboneka kwinjira gusa.",
    noteLogin:"",forgot:"Wibagiwe ijambobanga?",
    recTitle:"Garura ijambobanga",recIntro:"Andika email cyangwa telefoni yawe, uhitemo uburyo bwo kubona kode.",
    recIdent:"Email cyangwa telefoni",recEmail:"Ohereza link kuri email",recPhone:"Ohereza OTP kuri telefoni",recSend:"Ohereza kode",recBack:"Subira inyuma",
    resTitle:"Hindura ijambobanga",resIntro:"Injiza OTP (iyo ari telefoni) cyangwa ukoreshe link ya email, hanyuma ushyire ijambobanga rishya.",
    resOtp:"OTP (imibare 6)",resPass:"Ijambobanga rishya (nibura inyuguti 8)",resSend:"Hindura ijambobanga",
    codeTitle:"Bika kode yawe yo kugarura",codeIntro:"Iyi kode igaragara rimwe gusa. Yibike ahantu hizewe.",codeCopy:"Kopiya",codeOk:"Nayibitse neza",codeGo:"Komeza",
    chats:"Ibiganiro",products:"Ibicuruzwa",promo:"Bonus",orders:"Amatumizwa",tx:"Transaction",account:"Konti",dashboard:"Dashboard",
    dashStore:"Reba iduka ↗",dashNotif:"Emerera amatangazo",dashOut:"Sohoka",
    statProd:"Ibicuruzwa",statChat:"Abakiriya",statToday:"Amafaranga uyu munsi",statNew:"Amatumizwa mashya",
    chatTitle:"Ibiganiro n'abakiriya",chatEmpty:"Nta kiganiro kirahari.",chatReplyPh:"Subiza umukiriya…",chatSend:"Ohereza",
    pname:"Izina ry'igicuruzwa",price:"Igiciro (RWF)",old:"Igiciro cya kera (si ngombwa)",sizes:"Ingano: S,M,L cyangwa 40,41,42",variants:"Amabara (nka: Umukara,Umweru,Ugitukura)",badge:"Akarango (urugero Bishya)",
    imgLabel:"Ifoto (jpg/png/webp)",vidLabel:"Video (mp4/webm — ngufi, amasegonda 10–30)",colorsLabel:"Amabara y'ishusho:",
    save:"Shyiraho",saveEdit:"Bika impinduka",cancel:"Reka",searchAdmin:"Shakisha…",
    csvTitle:"Shyiramo ibicuruzwa byinshi icyarimwe (CSV)",csvHint:"Buri murongo: izina,icyiciro,ubwoko,igiciro,igiciro_cya_kera,ingano,akarango",
    productsTitle:"Ibicuruzwa",pnameEdit:"Hindura igicuruzwa",
    annTitle:"Itangazo rya Bonus",annPh:"BONUS: Ugura 2 ubone 1 ku buntu…",annBtn:"Shyiraho",
    txTitle:"Transaction — ubwishyu bwa MoMo",txAll:"Byose",txPaid:"Byishyuwe",txPending:"Bitegereje kwemezwa",txRejected:"Byanzwe",txRangeAll:"Igihe cyose",txRangeToday:"Uyu munsi",txRange7:"Iminsi 7",txRange30:"Iminsi 30",
    txOrders:"Amatumizwa",txCsv:"Kuramo CSV (Excel)",txSold:"Ibicuruzwa byishyuwe",
    ordersTitle:"Amatumizwa",ordersSent:"Byoherejwe",
    accTitle:"Konti n'umutekano",accOld:"Ijambobanga rya none",accNew:"Ijambobanga rishya (si ngombwa)",accRegen:"Kora kode nshya yo kugarura",accSave:"Bika",accEmail:"Email",accPhone:"Telefoni (+2507XXXXXXXX)",accContact:"Bika email na telefoni",accCode:"Kode yawe nshya (igaragara rimwe gusa):",
    paid:"Yishyuwe",pending:"Itegereje",rejected:"Ntiyishyuye",
    tableProd:"Igicuruzwa",tableQty:"Umubare",tableTotal:"Amafaranga",
    momo:"MoMo ID",
    aboutFormTitle:"About — Ubusobanuro burambuye bwa website",
    aboutFormNote:"Aya makuru agaragara kuri website mu gice cya About.",
    sLoc:"Aho dukorera",sHours:"Amasaha y'akazi",sDel:"Uburyo bwo kugeza",sContact:"Twandikire",sText:"Inyandiko About",sSave:"Bika",
    prevTitle:"Preview — uko umukiriya abona About",
    contactFormTitle:"Contact — Aho wahamagara",contactFormNote:"Email na telefoni yawe — kugira ngo umukiriya akumenye"
  },
  en:{login:"Login to Admin",setup:"Create admin account",user:"Username",pass:"Password (min 8)",email:"Email",phone:"Phone",create:"Create account",enter:"Login",
    noteSetup:"The admin account is created only once. After creation, this form won't appear again; only login will be shown.",
    noteLogin:"",forgot:"Forgot password?",
    recTitle:"Recover password",recIntro:"Enter your email or phone, choose how to receive the code.",
    recIdent:"Email or phone",recEmail:"Send link to email",recPhone:"Send OTP to phone",recSend:"Send code",recBack:"Back",
    resTitle:"Reset password",resIntro:"Enter the OTP (if phone) or use the email link, then set a new password.",
    resOtp:"OTP (6 digits)",resPass:"New password (min 8)",resSend:"Reset password",
    codeTitle:"Save your recovery code",codeIntro:"This code is shown only once. Keep it safe.",codeCopy:"Copy",codeOk:"I saved it",codeGo:"Continue",
    chats:"Chats",products:"Products",promo:"Promo",orders:"Orders",tx:"Transactions",account:"Account",dashboard:"Dashboard",
    dashStore:"View store ↗",dashNotif:"Allow notifications",dashOut:"Logout",
    statProd:"Products",statChat:"Customers",statToday:"Today's revenue",statNew:"New orders",
    chatTitle:"Chats with customers",chatEmpty:"No chats yet.",chatReplyPh:"Reply to customer…",chatSend:"Send",
    pname:"Product name",price:"Price (RWF)",old:"Old price (optional)",sizes:"Sizes: S,M,L or 40,41,42",variants:"Colors (e.g. Black,White,Red)",badge:"Badge (e.g. New)",
    imgLabel:"Image (jpg/png/webp)",vidLabel:"Video (mp4/webm — short, 10–30 seconds)",colorsLabel:"Card colors:",
    save:"Save",saveEdit:"Save changes",cancel:"Cancel",searchAdmin:"Search…",
    csvTitle:"Import multiple products (CSV)",csvHint:"Each line: name,category,type,price,old_price,sizes,badge",
    productsTitle:"Products",pnameEdit:"Edit product",
    annTitle:"Promo announcement",annPh:"BONUS: Buy 2 get 1 free…",annBtn:"Publish",
    txTitle:"Transactions — MoMo payments",txAll:"All",txPaid:"Paid",txPending:"Pending verification",txRejected:"Rejected",txRangeAll:"All time",txRangeToday:"Today",txRange7:"7 days",txRange30:"30 days",
    txOrders:"Orders",txCsv:"Download CSV (Excel)",txSold:"Products sold",
    ordersTitle:"Orders",ordersSent:"Shipped",
    accTitle:"Account security",accOld:"Current password",accNew:"New password (optional)",accRegen:"Generate new recovery code",accSave:"Save",accEmail:"Email",accPhone:"Phone (+2507XXXXXXXX)",accContact:"Save email and phone",accCode:"Your new recovery code (shown once):",
    paid:"Paid",pending:"Pending",rejected:"Rejected",
    tableProd:"Product",tableQty:"Quantity",tableTotal:"Amount",
    momo:"MoMo ID",
    aboutFormTitle:"About — Website details",
    aboutFormNote:"These details appear on the website in the About section.",
    sLoc:"Location",sHours:"Working hours",sDel:"Delivery",sContact:"Contact us",sText:"About text",sSave:"Save",
    prevTitle:"Preview — how customers see About",
    contactFormTitle:"Contact — Where to reach you",contactFormNote:"Your email and phone — so customers can find you"
  },
  fr:{login:"Connexion Admin",setup:"Créer un compte admin",user:"Nom d'utilisateur",pass:"Mot de passe (min 8)",email:"Email",phone:"Téléphone",create:"Créer le compte",enter:"Connexion",
    noteSetup:"Le compte admin est créé une seule fois. Après création, ce formulaire n'apparaîtra plus ; seule la connexion sera affichée.",
    noteLogin:"",forgot:"Mot de passe oublié ?",
    recTitle:"Récupérer le mot de passe",recIntro:"Entrez votre email ou téléphone, choisissez comment recevoir le code.",
    recIdent:"Email ou téléphone",recEmail:"Envoyer un lien par email",recPhone:"Envoyer un OTP par téléphone",recSend:"Envoyer le code",recBack:"Retour",
    resTitle:"Réinitialiser le mot de passe",resIntro:"Entrez l'OTP (si téléphone) ou utilisez le lien email, puis définissez un nouveau mot de passe.",
    resOtp:"OTP (6 chiffres)",resPass:"Nouveau mot de passe (min 8)",resSend:"Réinitialiser",
    codeTitle:"Enregistrez votre code de récupération",codeIntro:"Ce code n'est affiché qu'une seule fois. Gardez-le en sécurité.",codeCopy:"Copier",codeOk:"Je l'ai enregistré",codeGo:"Continuer",
    chats:"Discussions",products:"Produits",promo:"Promo",orders:"Commandes",tx:"Transactions",account:"Compte",dashboard:"Tableau de bord",
    dashStore:"Voir la boutique ↗",dashNotif:"Autoriser les notifications",dashOut:"Déconnexion",
    statProd:"Produits",statChat:"Clients",statToday:"Revenus du jour",statNew:"Nouvelles commandes",
    chatTitle:"Discussions avec les clients",chatEmpty:"Aucune discussion.",chatReplyPh:"Répondre au client…",chatSend:"Envoyer",
    pname:"Nom du produit",price:"Prix (RWF)",old:"Ancien prix (facultatif)",sizes:"Tailles : S,M,L ou 40,41,42",variants:"Couleurs (ex. Noir,Blanc,Rouge)",badge:"Étiquette (ex. Nouveau)",
    imgLabel:"Image (jpg/png/webp)",vidLabel:"Vidéo (mp4/webm — courte, 10–30 secondes)",colorsLabel:"Couleurs de la carte :",
    save:"Enregistrer",saveEdit:"Enregistrer les modifications",cancel:"Annuler",searchAdmin:"Rechercher…",
    csvTitle:"Importer plusieurs produits (CSV)",csvHint:"Chaque ligne : nom,catégorie,type,prix,ancien_prix,tailles,étiquette",
    productsTitle:"Produits",pnameEdit:"Modifier le produit",
    annTitle:"Annonce promo",annPh:"BONUS : Achetez 2, obtenez 1 gratuit…",annBtn:"Publier",
    txTitle:"Transactions — paiements MoMo",txAll:"Tout",txPaid:"Payé",txPending:"En attente de vérification",txRejected:"Rejeté",txRangeAll:"Tout le temps",txRangeToday:"Aujourd'hui",txRange7:"7 jours",txRange30:"30 jours",
    txOrders:"Commandes",txCsv:"Télécharger CSV",txSold:"Produits vendus",
    ordersTitle:"Commandes",ordersSent:"Expédiée",
    accTitle:"Sécurité du compte",accOld:"Mot de passe actuel",accNew:"Nouveau mot de passe (facultatif)",accRegen:"Générer un nouveau code de récupération",accSave:"Enregistrer",accEmail:"Email",accPhone:"Téléphone (+2507XXXXXXXX)",accContact:"Enregistrer email et téléphone",accCode:"Votre nouveau code (affiché une fois) :",
    paid:"Payé",pending:"En attente",rejected:"Rejeté",
    tableProd:"Produit",tableQty:"Quantité",tableTotal:"Montant",
    momo:"ID MoMo",
    aboutFormTitle:"À propos — Détails du site",
    aboutFormNote:"Ces détails apparaissent sur le site dans la section À propos.",
    sLoc:"Localisation",sHours:"Heures d'ouverture",sDel:"Livraison",sContact:"Contactez-nous",sText:"Texte À propos",sSave:"Enregistrer",
    prevTitle:"Aperçu — comment les clients voient À propos",
    contactFormTitle:"Contact — Où vous joindre",contactFormNote:"Votre email et téléphone — pour que les clients vous trouvent"
  }
};

let alang=localStorage.getItem("os-alang")||"rw";
if(!AT[alang])alang="rw";
const atr=k=>AT[alang][k]||AT.rw[k]||k;

function applyAdminLang(){
  document.documentElement.lang=alang;
  const setTxt=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
  const setPh=(id,val)=>{const e=document.getElementById(id);if(e)e.placeholder=val};
  const setOpt=(id,val)=>{const e=document.getElementById(id);if(e&&e.tagName==="OPTION")e.textContent=val};

  setTxt("lt",has?atr("login"):atr("setup"));
  setTxt("lb",has?atr("enter"):atr("create"));
  setTxt("lnote",has?atr("noteLogin"):atr("noteSetup"));
  setPh("lu",atr("user"));setPh("leml",atr("email"));setPh("lph",atr("phone"));setPh("lp",atr("pass"));
  setTxt("forgot",atr("forgot"));

  const recH=document.querySelector("#recover h2");if(recH)recH.textContent=atr("recTitle");
  const recNote=document.querySelector("#recover .note");if(recNote)recNote.textContent=atr("recIntro");
  setPh("ru",atr("recIdent"));
  setOpt("rch-opt-e",atr("recEmail"));setOpt("rch-opt-p",atr("recPhone"));
  const rcfBtn=document.querySelector("#rcf button");if(rcfBtn)rcfBtn.textContent=atr("recSend");
  setTxt("rback",atr("recBack"));

  const resH=document.querySelector("#reset h2");if(resH)resH.textContent=atr("resTitle");
  const resNote=document.querySelector("#reset .note");if(resNote)resNote.textContent=atr("resIntro");
  setPh("rst",atr("resOtp"));setPh("rsp",atr("resPass"));
  const rsfBtn=document.querySelector("#rsf button");if(rsfBtn)rsfBtn.textContent=atr("resSend");

  const codeH=document.querySelector("#rshow h2");if(codeH)codeH.textContent=atr("codeTitle");
  const codeNote=document.querySelector("#rshow .note");if(codeNote)codeNote.textContent=atr("codeIntro");
  setTxt("rcopy",atr("codeCopy"));
  const rokLabel=document.querySelector("#rshow label");if(rokLabel){rokLabel.innerHTML=`<input type="checkbox" id="rok" style="width:auto"> ${atr("codeOk")}`;const r=document.getElementById("rok");if(r)r.onchange=()=>{$("#rgo").disabled=!r.checked}}
  setTxt("rgo",atr("codeGo"));

  const storeLink=document.querySelector("#dash .btnlink");if(storeLink)storeLink.textContent=atr("dashStore");
  setTxt("notif",atr("dashNotif"));
  setTxt("out",atr("dashOut"));

  const anavLinks=document.querySelectorAll("#anav .anav-link");
  if(anavLinks[0])anavLinks[0].textContent="🏠 DASHBOARD";
  if(anavLinks[1])anavLinks[1].textContent="ℹ️ ABOUT";
  if(anavLinks[2])anavLinks[2].textContent="📞 CONTACT";
  if(anavLinks[3])anavLinks[3].textContent="🔐 KONTI";

  $$("#tabs .t").forEach(b=>{
    const t=b.dataset.tab;if(!t)return;
    if(t==="dashboard")b.textContent=atr("dashboard")||"Dashboard";
    if(t==="chat")b.innerHTML=atr("chats")+' <span class="bd" id="bchat" hidden></span>';
    if(t==="products")b.textContent=atr("products");
    if(t==="promo")b.textContent=atr("promo");
    if(t==="orders")b.innerHTML=atr("orders")+' <span class="bd" id="bord" hidden></span>';
    if(t==="tx")b.innerHTML=atr("tx")+' <span class="bd" id="btx" hidden></span>';
  });
  const alg=document.getElementById("alg");if(alg)alg.value=alang;

  const statLabels=document.querySelectorAll("#stats .stat small");
  if(statLabels[0])statLabels[0].textContent=atr("statProd");
  if(statLabels[1])statLabels[1].textContent=atr("statChat");
  if(statLabels[2])statLabels[2].textContent=atr("statToday");
  if(statLabels[3])statLabels[3].textContent=atr("statNew");

  const chatH=document.querySelector("#p-dashboard h2:nth-of-type(2)");if(chatH)chatH.textContent=atr("chatTitle");
  setPh("rb",atr("chatReplyPh"));
  const rfBtn=document.querySelector("#rf button");if(rfBtn)rfBtn.textContent=atr("chatSend");

  setTxt("ptitle",eid?atr("pnameEdit"):atr("pname"));
  setTxt("psave",eid?atr("saveEdit"):atr("save"));
  setTxt("pcancel",atr("cancel"));
  setPh("pn",atr("pname"));setPh("pp",atr("price"));setPh("po",atr("old"));setPh("ps",atr("sizes"));setPh("pv",atr("variants"));setPh("pb",atr("badge"));setPh("psearch",atr("searchAdmin"));
  const imgLbl=document.querySelector("#pf label:nth-of-type(1) small");if(imgLbl)imgLbl.textContent=atr("imgLabel");
  const vidLbl=document.querySelector("#pf label:nth-of-type(2) small");if(vidLbl)vidLbl.textContent=atr("vidLabel");
  const colLbl=document.querySelector("#pf > div:nth-of-type(3) small");if(colLbl)colLbl.textContent=atr("colorsLabel");
  const csvDet=document.querySelector("#p-products details summary");if(csvDet)csvDet.textContent=atr("csvTitle");
  const csvHint=document.querySelector("#p-products details p small");if(csvHint)csvHint.textContent=atr("csvHint");
  const prodH=document.querySelectorAll("#p-products section h2")[1];
  if(prodH){const ptot=document.getElementById("ptot");prodH.innerHTML=`${atr("productsTitle")} (<span id="ptot">${ptot?ptot.textContent:0}</span>)`}

  const annH=document.querySelector("#p-promo h2");if(annH)annH.textContent=atr("annTitle");
  setPh("at",atr("annPh"));
  const afBtn=document.querySelector("#af button");if(afBtn)afBtn.textContent=atr("annBtn");

  const txH=document.querySelector("#p-tx h2");if(txH)txH.textContent=atr("txTitle");
  const opts=document.querySelectorAll("#txs option");
  if(opts[0])opts[0].textContent=atr("txAll");
  if(opts[1])opts[1].textContent=atr("txPaid");
  if(opts[2])opts[2].textContent=atr("txPending");
  if(opts[3])opts[3].textContent=atr("txRejected");
  const opts2=document.querySelectorAll("#txr option");
  if(opts2[0])opts2[0].textContent=atr("txRangeAll");
  if(opts2[1])opts2[1].textContent=atr("txRangeToday");
  if(opts2[2])opts2[2].textContent=atr("txRange7");
  if(opts2[3])opts2[3].textContent=atr("txRange30");
  const txRowB=document.querySelector("#p-tx .row b");if(txRowB)txRowB.textContent=atr("txOrders");
  setTxt("txcsv",atr("txCsv"));
  const txSoldH=document.querySelectorAll("#p-tx h2")[1];if(txSoldH)txSoldH.textContent=atr("txSold");

  const ordersH=document.querySelector("#p-orders h2");if(ordersH)ordersH.textContent=atr("ordersTitle");

  const conH=document.querySelector("#p-contact h2");if(conH)conH.textContent=atr("contactFormTitle");
  const conNote=document.querySelector("#p-contact > p.note");if(conNote)conNote.textContent=atr("contactFormNote");
  setPh("aceml",atr("accEmail"));setPh("acph",atr("accPhone"));
  const acfBtn=document.querySelector("#acf button");if(acfBtn)acfBtn.textContent=atr("accContact");

  const accH=document.querySelector("#p-account h2");if(accH)accH.textContent=atr("accTitle");
  setPh("ao",atr("accOld"));setPh("an",atr("accNew"));
  const arLabel=document.querySelector("#af2 label");
  if(arLabel){arLabel.innerHTML=`<input type="checkbox" id="ar" style="width:auto"> ${atr("accRegen")}`;const ar=document.getElementById("ar");if(ar)ar.checked=false}
  const af2Btn=document.querySelector("#af2 button");if(af2Btn)af2Btn.textContent=atr("accSave");
  const acodeH=document.querySelector("#acode .note");if(acodeH)acodeH.textContent=atr("accCode");

  const aboutH=document.querySelector("#p-about h2");if(aboutH)aboutH.textContent=atr("aboutFormTitle");
  const aboutNote=document.querySelector("#p-about > p.note");if(aboutNote)aboutNote.textContent=atr("aboutFormNote");
  setPh("s-loc",atr("sLoc"));setPh("s-hours",atr("sHours"));setPh("s-del",atr("sDel"));setPh("s-contact",atr("sContact"));setPh("s-text",atr("sText"));
  setTxt("ssave",atr("sSave"));
  const prevH=document.querySelectorAll("#p-about h2")[1];if(prevH)prevH.textContent=atr("prevTitle");
}

const algSel=document.getElementById("alg");
if(algSel)algSel.onchange=e=>{
  alang=e.target.value;
  try{localStorage.setItem("os-alang",alang)}catch{}
  applyAdminLang();
  if(tab==="tx")loadTx();
  if(tab==="products")loadProducts();
  if(tab==="orders")loadOrders();
  if(tab==="promo")loadAnn();
};

/* ===== Amakosa ===== */
function showErr(m){let b=document.getElementById("errbar");if(!b){b=document.createElement("div");b.id="errbar";b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:9999;background:#B42318;color:#fff;padding:10px 16px;font:600 14px system-ui";document.body.appendChild(b)}b.textContent="Ikosa: "+m}
window.addEventListener("error",e=>showErr(e.message||"JavaScript"));
window.addEventListener("unhandledrejection",e=>{const r=e.reason||{};showErr(r.detail||r.error||r.message||("HTTP "+(r.status||"?")))});

/* ===== API call ===== */
async function call(p,m="GET",b){
  const r=await fetch(API+"admin/"+p,{method:m,headers:{"Content-Type":"application/json","X-CSRF":CS},body:b?JSON.stringify(b):undefined});
  if(r.status===401&&!window._ex){window._ex=1;location.reload()}
  const t=await r.text();let j;try{j=JSON.parse(t)}catch{throw {status:r.status,error:"Seriveri ntiyasubije neza (HTTP "+r.status+")"}}
  if(!r.ok)throw {status:r.status,...j};return j}

/* ===== Ijwi ===== */
function beep(){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=880;g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.5);o.start();o.stop(ac.currentTime+.5)}catch{}}
function ping(t){beep();if(window.Notification&&Notification.permission==="granted")new Notification("FRANCOIS STORE",{body:t})}
const notifEl=$("#notif");
if(notifEl)notifEl.onclick=()=>{try{ac=ac||new AudioContext()}catch{}if(window.Notification)Notification.requestPermission();notifEl.textContent=atr("dashNotif")+" ✓"};

/* ===== Boot ===== */
async function boot(){
  const urlTok=new URLSearchParams(location.search).get("reset");
  if(urlTok){
    window._resetToken=urlTok;
    ["#login","#recover","#rshow","#bootfail"].forEach(s=>{const e=$(s);if(e)e.hidden=true});
    const rs=$("#reset");if(rs)rs.hidden=false;
    const rst=$("#rst");if(rst)rst.hidden=true;
    applyAdminLang();
    return;
  }
  let m;
  try{
    const r=await fetch(API+"admin/me");const t=await r.text();
    try{m=JSON.parse(t)}catch{throw new Error("API yasubije HTTP "+r.status+" itari JSON")}
    if(m.error)throw new Error(m.detail||m.error)
  }catch(e){
    const bf=$("#bootfail");if(bf)bf.hidden=false;
    const bm=$("#bfmsg");if(bm)bm.textContent=(e.message||String(e));
    return;
  }
  CS=m.csrf||"";has=m.has;
  if(m.admin){
    showDash();
    try {
      const back = localStorage.getItem("admin-return");
      if (back === "1") {
        localStorage.removeItem("admin-return");
        localStorage.removeItem("admin-back");
        localStorage.removeItem("admin-tab");
        setTab("dashboard");
        return;
      }
      const h = (location.hash || "").replace("#","").trim();
      if (["dashboard","products","tx","orders","about","contact","account"].includes(h)) {
        setTab(h);
        return;
      }
      setTab("dashboard");
    } catch {}
    return;
  }
  $("#login").hidden=false;
  $("#forgot").hidden=!has;
  const leml=$("#leml"), lph=$("#lph");
  if(leml){leml.hidden=has; leml.required=!has;}
  if(lph){lph.hidden=has;  lph.required=!has;}
  applyAdminLang();
}

/* ===== Setup / Login ===== */
const lf=$("#lf");
if(lf)lf.onsubmit=async e=>{
  e.preventDefault();
  const le=$("#le");if(le)le.textContent="";
  const isSetup=!has;
  const payload=isSetup
    ? {u:$("#lu").value,email:$("#leml").value,phone:$("#lph").value,p:$("#lp").value}
    : {u:$("#lu").value,p:$("#lp").value};
  try{
    const r=await fetch(API+"admin/"+(isSetup?"setup":"login"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(r.status===429){if(le)le.textContent=`Wagerageje inshuro nyinshi. Tegereza iminota ${j.minutes||15}.`;return}
    if(r.status===409){if(le)le.textContent="Email cyangwa telefoni isanzwe ikoreshwa.";return}
    if(r.status===422){if(le)le.textContent=isSetup?"Genzura email, telefoni n'ijambobanga.":"Izina cyangwa ijambobanga si byo.";return}
    if(!r.ok)throw 0;
    try {
      localStorage.removeItem("admin-back");
      localStorage.removeItem("admin-return");
    } catch {}
    if(isSetup){
      has=true;
      const leml=$("#leml"), lph=$("#lph");
      if(leml){leml.hidden=true;leml.required=false}
      if(lph){lph.hidden=true;lph.required=false}
      applyAdminLang();
      $("#lp").value="";
      showCode(j.recovery);
    }else{
      CS=j.csrf;showDash();
    }
  }catch{
    if(le)le.textContent=isSetup?"Ntibyakunze.":"Izina cyangwa ijambobanga si byo.";
  }
};

/* ===== Sohoka ===== */
const outEl=$("#out");
if(outEl)outEl.onclick=async()=>{
  try{await call("logout","POST")}catch{}
  try {
    localStorage.removeItem("admin-back");
    localStorage.removeItem("admin-return");
    localStorage.removeItem("admin-tab");
  } catch {}
  location.reload()
};

/* ===== REBA IDUKA ===== */
const storeLink = document.getElementById("store-link");
if (storeLink) {
  storeLink.addEventListener("click", () => {
    try {
      localStorage.removeItem("admin-return");
      localStorage.setItem("admin-back", "1");
      localStorage.setItem("admin-tab", tab || "dashboard");
    } catch (e) {}
  });
}

/* ===== Dash ===== */
function showDash(){
  const ab=$("#authbrand");if(ab)ab.hidden=true;
  const lg=$("#login");if(lg)lg.hidden=true;
  const rc=$("#recover");if(rc)rc.hidden=true;
  const rs=$("#reset");if(rs)rs.hidden=true;
  const sh=$("#rshow");if(sh)sh.hidden=true;
  const da=$("#dash");if(da)da.hidden=false;
  applyAdminLang();
  stats();
  loadWidgets();
  setInterval(stats,4000);
  setInterval(loadWidgets,10000);
  loadProducts();
}

async function loadWidgets(){
  try{
    const w=await call("widgets");
    const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
    set("st-prod",w.products||0);
    set("st-chat",w.chats||0);
    set("st-today",Number(w.today||0).toLocaleString()+" RWF");
    set("st-new",w.new||0);
  }catch{}
}

/* ===== Tab ===== */
function setTab(t){
  tab=t;
  try { localStorage.setItem("admin-tab", t); } catch {}
  try {
    const newHash = "#" + t;
    if (location.hash !== newHash) history.replaceState(null, "", newHash);
  } catch {}
  $$("#tabs .t").forEach(x=>x.classList.toggle("on",x.dataset.tab===t));
  $$("#anav .anav-link").forEach(x=>x.classList.toggle("on",x.dataset.anav===t));
  ["dashboard","products","promo","orders","tx","about","contact","account"].forEach(x=>{
    const el=document.getElementById("p-"+x);
    if(el)el.hidden=(x!==t);
  });
  if(t==="dashboard")thread();
  if(t==="promo")loadAnn();
  if(t==="orders")loadOrders();
  if(t==="products")loadProducts();
  if(t==="tx")loadTx();
  if(t==="about")loadSettings();
  if(t==="contact")loadAccount();
}
const tabsEl=$("#tabs");
if(tabsEl)tabsEl.onclick=e=>{const b=e.target.closest("[data-tab]");if(!b)return;setTab(b.dataset.tab)};
const anav=document.getElementById("anav");
if(anav){
  anav.addEventListener("click",e=>{
    const a=e.target.closest("[data-anav]");
    if(!a)return;
    e.preventDefault();
    setTab(a.dataset.anav);
    window.scrollTo({top:0,behavior:"smooth"});
  });
}

/* ===== Ibiganiro ===== */
async function stats(){
  try{
    const s=await call("stats");
    if(prev){
      if(s.unread>prev.unread)ping("Ubutumwa bushya bw'umukiriya");
      if(s.orders>prev.orders){ping("Itegeko rishya!");if(tab==="orders")loadOrders();if(tab==="tx")loadTx()}
    }
    prev=s;
    const bc=$("#bchat");if(bc){bc.hidden=!s.unread;bc.textContent=s.unread;}
    const bo=$("#bord");if(bo){bo.hidden=!s.orders;bo.textContent=s.orders;}
    const bt=$("#btx");if(bt){bt.hidden=!s.tx;bt.textContent=s.tx;}
    const n=s.unread+s.orders;
    document.title=(n?`(${n}) `:"")+"Admin — FRANCOIS STORE";
    const cl=$("#clist");
    if(cl)cl.innerHTML=s.chats.length?s.chats.map(c=>`<button data-c="${c.id}" class="${cur&&cur.id===c.id?"on":""}"><b>${esc(c.name)}</b>${c.u>0?`<span class="bd">${c.u}</span>`:""}<br><small>${c.product?"Ashaka: "+esc(c.product):atr("chatEmpty")}${c.phone?" · "+esc(c.phone):""}</small></button>`).join(""):`<small>${atr("chatEmpty")}</small>`;
    window._chats=s.chats;
  }catch{}
}
const clistEl=$("#clist");
if(clistEl)clistEl.onclick=e=>{
  const b=e.target.closest("[data-c]");if(!b)return;
  cur=window._chats.find(c=>c.id==b.dataset.c);
  after=0;
  const msgs=$("#msgs");if(msgs){msgs.innerHTML="";msgs.hidden=false;}
  const rf=$("#rf");if(rf)rf.hidden=false;
  const th=$("#th");if(th)th.innerHTML=`<b>${esc(cur.name)}</b>`;
  thread();stats();
};
async function thread(){
  if(!cur)return;
  try{
    const j=await call(`thread?id=${cur.id}&after=${after}`);
    const msgs=$("#msgs");if(!msgs)return;
    j.m.forEach(m=>{
      const d=document.createElement("div");d.className="m "+m.s;
      if(m.b)d.appendChild(document.createTextNode(m.b));
      if(m.i){
        const im=document.createElement("img");
        im.src=U(m.i);im.alt="ifoto";im.loading="lazy";
        im.style.cssText="max-width:200px;max-height:200px;border-radius:10px;display:block;margin-top:4px;cursor:pointer";
        im.onclick=()=>window.open(U(m.i),"_blank");
        d.appendChild(im);
      }
      msgs.appendChild(d);
      after=Math.max(after,+m.id);
    });
    if(j.m.length)msgs.scrollTop=1e9;
  }catch{}
}
const rfEl=$("#rf");
if(rfEl)rfEl.onsubmit=async e=>{
  e.preventDefault();
  const b=$("#rb").value.trim();if(!b||!cur)return;
  $("#rb").value="";
  await call("reply","POST",{id:cur.id,body:b});thread();
};

function uploadChatImage(file){
  return new Promise((res,rej)=>{
    const x=new XMLHttpRequest();
    x.open("POST",API+"chat/upload");
    const fd=new FormData();
    fd.append("file",file);fd.append("token","");
    x.onload=()=>x.status===200?res(JSON.parse(x.responseText).url):rej(x.status);
    x.onerror=()=>rej(0);
    x.send(fd);
  });
}
async function sendImg(file){
  if(!cur)return;
  try{
    const url=await uploadChatImage(file);
    await call("reply","POST",{id:cur.id,body:"",image:url});
    thread();
  }catch(c){alert("Ifoto ntiyoherejwe (HTTP "+c+").")}
}
const aimg=$("#aimg");
if(aimg)aimg.onchange=e=>{const f=e.target.files[0];if(f)sendImg(f);e.target.value=""};

/* ===== Ibicuruzwa ===== */
const PER=30;let tot=0,qt;
function upload(file,onP){
  return new Promise((res,rej)=>{
    const x=new XMLHttpRequest();
    x.open("POST",API+"admin/upload");
    x.setRequestHeader("X-CSRF",CS);
    x.upload.onprogress=e=>e.lengthComputable&&onP(Math.round(e.loaded/e.total*100));
    x.onload=()=>x.status===200?res(JSON.parse(x.responseText).url):rej(x.status);
    x.onerror=()=>rej(0);
    const fd=new FormData();fd.append("file",file);x.send(fd);
  });
}
function prevs(){
  const ip=$("#iprev"), vp=$("#vprev");
  if(ip)ip.innerHTML=F.image?`<img class="thumb" src="${U(F.image)}" alt=""> <button type="button" class="t" data-clr="image">Kuraho</button>`:"";
  if(vp)vp.innerHTML=F.video?`<video src="${U(F.video)}" controls style="width:100%;max-height:200px"></video> <button type="button" class="t" data-clr="video">Kuraho</button>`:"";
}
const pfEl=$("#pf");
if(pfEl)pfEl.addEventListener("click",e=>{const b=e.target.closest("[data-clr]");if(b){F[b.dataset.clr]="";prevs()}});
function pick(k,sel,label){
  const inp=$(sel);if(!inp)return;
  inp.onchange=async()=>{
    const f=inp.files[0];if(!f)return;
    const ps=$("#pstat");if(ps)ps.textContent=label+" 0%";
    try{F[k]=await upload(f,p=>{if(ps)ps.textContent=label+" "+p+"%"});if(ps)ps.textContent="✓ "+label+" yoherejwe";prevs()}
    catch(c){if(ps)ps.textContent=c===413?"File ni nini cyane.":"Ntibyakunze (jpg/png/webp/mp4/webm gusa)."}
    inp.value="";
  };
}
pick("image","#pimg","Ifoto");pick("video","#pvid","Video");
function resetForm(){
  eid=null;F={image:"",video:""};
  if(pfEl)pfEl.reset();
  const pc=$("#pcol");if(pc)pc.value="#d6246e";
  const pb=$("#pbg");if(pb)pb.value="#ffe3ef";
  applyAdminLang();
  const pcancel=$("#pcancel");if(pcancel)pcancel.hidden=true;
  const ps=$("#pstat");if(ps)ps.textContent="";
  const pv=$("#pv");if(pv)pv.value="";
  prevs();
}
const pcancel=$("#pcancel");if(pcancel)pcancel.onclick=resetForm;
if(pfEl)pfEl.onsubmit=async e=>{
  e.preventDefault();
  const pmsg=$("#pmsg");if(pmsg)pmsg.textContent="";
  const body={name:$("#pn").value,cat:$("#pc").value,type:$("#pt").value,price:$("#pp").value,old:$("#po").value,sizes:$("#ps").value,variants:($("#pv")||{}).value||"",badge:$("#pb").value,color:$("#pcol").value,bg:$("#pbg").value,image:F.image,video:F.video};
  try{
    eid?await call("products/"+eid,"PUT",body):await call("products","POST",body);
    resetForm();pg=1;loadProducts();loadWidgets();
    if(pmsg)pmsg.innerHTML="✓ Igicuruzwa cyabitswe. <a href=\"./\" target=\"_blank\" rel=\"noopener\">Kireba mu iduka ↗</a>";
  }catch(x){
    if(pmsg)pmsg.textContent="Ntibyakunze (HTTP "+(x&&x.status||"?")+"): "+((x&&(x.detail||x.error))||"genzura izina, igiciro n'ingano.");
  }
};
async function loadProducts(){
  try{
    const j=await call(`products?page=${pg}&q=${encodeURIComponent($("#psearch").value.trim())}`);
    LP=j.items;tot=j.total;
    const pages=Math.max(1,Math.ceil(tot/PER));
    const pt=$("#ptot");if(pt)pt.textContent=tot;
    const pi=$("#pinfo");if(pi)pi.textContent=`${pg} / ${pages}`;
    const pp=$("#pprev");if(pp)pp.disabled=pg<=1;
    const pn=$("#pnext");if(pn)pn.disabled=pg>=pages;
    const pl=$("#plist");
    if(pl)pl.innerHTML=LP.map(x=>`<div class="row" style="${x.active?"":"opacity:.5"}">${x.image?`<img class="thumb" src="${U(x.image)}" alt="" loading="lazy">`:`<span class="thumb">${esc(x.type)}</span>`}
      <span style="flex:1">${esc(x.name)} ${x.video?"🎬":""}<br><small>${Number(x.price).toLocaleString()} RWF · ${esc(x.cat)}${x.active?"":" · rihishe"}${x.variants?" · "+atr("variants")+": "+esc(x.variants):""}</small></span>
      <span><button class="t" data-ed="${x.id}">Hindura</button> <button class="t" data-tg="${x.id}">${x.active?"Hisha":"Garagaza"}</button> <button class="x" data-dl="${x.id}">Siba</button></span></div>`).join("");
  }catch{}
}
const psearch=$("#psearch");if(psearch)psearch.oninput=()=>{clearTimeout(qt);qt=setTimeout(()=>{pg=1;loadProducts()},300)};
const pprev=$("#pprev");if(pprev)pprev.onclick=()=>{pg--;loadProducts()};
const pnext=$("#pnext");if(pnext)pnext.onclick=()=>{pg++;loadProducts()};
const plist=$("#plist");
if(plist)plist.onclick=async e=>{
  const ed=e.target.closest("[data-ed]"),tg=e.target.closest("[data-tg]"),dl=e.target.closest("[data-dl]");
  if(ed){
    const x=LP.find(p=>p.id==ed.dataset.ed);
    eid=x.id;F={image:x.image||"",video:x.video||""};
    $("#pn").value=x.name;$("#pc").value=x.cat;$("#pt").value=x.type;
    $("#pp").value=x.price;$("#po").value=x.old_price||"";$("#ps").value=x.sizes;
    const pv=$("#pv");if(pv)pv.value=x.variants||"";
    $("#pb").value=x.badge||"";$("#pcol").value=x.color||"#d6246e";$("#pbg").value=x.bg||"#ffe3ef";
    applyAdminLang();
    const pcancel=$("#pcancel");if(pcancel)pcancel.hidden=false;
    prevs();window.scrollTo(0,0);
  }
  if(tg){await call(`products/${tg.dataset.tg}/toggle`,"POST");loadProducts()}
  if(dl&&confirm("Gusiba burundu?")){await call("products/"+dl.dataset.dl,"DELETE");loadProducts()}
};
const csvEl=$("#csv");
if(csvEl)csvEl.onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  const cm=$("#cmsg");
  try{const j=await call("import","POST",{csv:await f.text()});if(cm)cm.textContent=`Hashyizwemo ${j.added}, hasimbutswe ${j.skipped}`;pg=1;loadProducts()}
  catch{if(cm)cm.textContent="Import ntiyakunze."}
  e.target.value="";
};

/* ===== Bonus ===== */
async function loadAnn(){
  try{
    const l=await call("announcements");
    const al=$("#alist");if(al)al.innerHTML=l.map(a=>`<div class="row" style="${a.active?"":"opacity:.5"}"><span style="flex:1">${esc(a.text)} <small>${a.active?"rigaragara":"rihishe"}</small></span><span><button class="t" data-at="${a.id}">${a.active?"Rihishe":"Rigaragaze"}</button> <button class="x" data-ad="${a.id}">Siba</button></span></div>`).join("");
  }catch{}
}
const afEl=$("#af");
if(afEl)afEl.onsubmit=async e=>{e.preventDefault();await call("announcements","POST",{text:$("#at").value});const at=$("#at");if(at)at.value="";loadAnn()};
const alEl=$("#alist");
if(alEl)alEl.onclick=async e=>{
  const t=e.target.closest("[data-at]"),d=e.target.closest("[data-ad]");
  if(t){await call(`announcements/${t.dataset.at}/toggle`,"POST");loadAnn()}
  if(d){await call("announcements/"+d.dataset.ad,"DELETE");loadAnn()}
};

/* ===== Amatumizwa ===== */
async function loadOrders(){
  try{
    const l=await call("orders");
    const ol=$("#olist");
    if(ol) ol.innerHTML = l.map(o=>{
      const sub = Number(o.subtotal ?? o.total ?? 0);
      const ship = Number(o.shipping ?? 0);
      const tot = Number(o.total ?? 0);
      const momo = o.momo_txn ? esc(o.momo_txn) : "—";
      return `<div class="row"><span><b>${esc(o.name)}</b> · ${esc(o.phone)}<br><small>${o.items.map(i=>`${esc(i.name)} (${esc(i.size)})${i.color?" "+esc(i.color):""} x${i.qty}`).join(", ")}<br>${esc(o.address)} · ${atr("momo")}: ${momo} · ${esc(o.created_at)}</small></span>
      <span style="text-align:right">
        <b>${sub.toLocaleString()} RWF</b>
        ${ship?`<br><small>+ ${ship.toLocaleString()} delivery</small>`:""}
        <br><b style="font-size:15px">${tot.toLocaleString()} RWF</b> ${payBadge(o.pay_status)}<br>
        ${o.status==="bishya"?`<button data-sent="${o.id}">${atr("ordersSent")}</button>`:`<small>${atr("ordersSent")}</small>`}
      </span></div>`;
    }).join("") || `<small>${atr("chatEmpty")}</small>`;
  }catch{}
}
const olEl=$("#olist");
if(olEl)olEl.onclick=async e=>{const b=e.target.closest("[data-sent]");if(b){await call(`orders/${b.dataset.sent}/sent`,"POST");loadOrders();stats()}};

/* ===== Kode yo kugarura ===== */
function showCode(code){
  const login=$("#login");if(login)login.hidden=true;
  const rec=$("#recover");if(rec)rec.hidden=true;
  const rs=$("#reset");if(rs)rs.hidden=true;
  const show=$("#rshow");if(show)show.hidden=false;
  const rc=$("#rcode");if(rc)rc.textContent=code;
  const rok=$("#rok");if(rok)rok.checked=false;
  const rgo=$("#rgo");if(rgo)rgo.disabled=true;
  applyAdminLang();
}
const rokEl=$("#rok");if(rokEl)rokEl.onchange=()=>{const rgo=$("#rgo");if(rgo)rgo.disabled=!rokEl.checked};
const rcopy=$("#rcopy");
if(rcopy)rcopy.onclick=()=>{
  const rc=$("#rcode");if(!rc)return;
  (navigator.clipboard?navigator.clipboard.writeText(rc.textContent):Promise.reject())
    .then(()=>{rcopy.textContent=atr("codeCopy")+" ✓"}).catch(()=>{rcopy.textContent=atr("codeCopy")});
};
const rgoEl=$("#rgo");
if(rgoEl)rgoEl.onclick=()=>{const show=$("#rshow");if(show)show.hidden=true;const login=$("#login");if(login)login.hidden=false;const fg=$("#forgot");if(fg)fg.hidden=false;const le=$("#le");if(le)le.textContent="Konti yiteguye. Injira.";applyAdminLang()};

const forgotEl=$("#forgot");
if(forgotEl)forgotEl.onclick=e=>{
  e.preventDefault();
  const login=$("#login");if(login)login.hidden=true;
  const rs=$("#rshow");if(rs)rs.hidden=true;
  const rset=$("#reset");if(rset)rset.hidden=true;
  const rec=$("#recover");if(rec)rec.hidden=false;
  const ru=$("#ru");const lu=$("#lu");if(ru&&lu)ru.value=lu.value;
  const re=$("#re");if(re)re.textContent="";
};
const rbackEl=$("#rback");
if(rbackEl)rbackEl.onclick=e=>{e.preventDefault();const rec=$("#recover");if(rec)rec.hidden=true;const login=$("#login");if(login)login.hidden=false;const le=$("#le");if(le)le.textContent=""};

const rcfEl=$("#rcf");
if(rcfEl)rcfEl.onsubmit=async e=>{
  e.preventDefault();const re=$("#re");if(re)re.textContent="";
  try{
    const r=await fetch(API+"admin/request-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ident:$("#ru").value,channel:$("#rch").value})});
    const j=await r.json().catch(()=>({}));
    if(r.status===429){if(re)re.textContent="Wabasabye kenshi. Tegereza iminota 15.";return}
    if(!r.ok){if(re)re.textContent="Ntibyakunze.";return}
    const rec=$("#recover");if(rec)rec.hidden=true;
    const rset=$("#reset");if(rset)rset.hidden=false;
    window._ident=$("#ru").value;
    const rst=$("#rst"), rse=$("#rse");
    if($("#rch").value==="p"){if(rst)rst.hidden=false;if(rse)rse.textContent="Kode yoherejwe kuri telefoni."}
    else{if(rst)rst.hidden=true;if(rse)rse.textContent="Reba email yawe: kanda link yoherejwe."}
    applyAdminLang();
  }catch{if(re)re.textContent="Ntibyakunze."}
};

const rsfEl=$("#rsf");
if(rsfEl)rsfEl.onsubmit=async e=>{
  e.preventDefault();const rse=$("#rse");if(rse)rse.textContent="";
  const body={p:$("#rsp").value};
  if(window._resetToken)body.token=window._resetToken;
  else{body.ident=window._ident;body.otp=$("#rst").value}
  try{
    const r=await fetch(API+"admin/reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const j=await r.json().catch(()=>({}));
    if(r.status===422){if(rse)rse.textContent="Ijambobanga rishya rigomba kuba nibura inyuguti 8.";return}
    if(!r.ok){if(rse)rse.textContent="Kode si yo cyangwa yarangiye.";return}
    if(rse)rse.textContent="Byagenze neza! Injira n'ijambobanga rishya.";
    window._resetToken=null;window._ident=null;
    setTimeout(()=>location.href=location.pathname,1500);
  }catch{if(rse)rse.textContent="Ntibyakunze."}
};

/* ===== Konti / Contact ===== */
async function loadAccount(){try{await call("me")}catch{}}
const acfEl=$("#acf");
if(acfEl)acfEl.onsubmit=async e=>{
  e.preventDefault();const acm=$("#acm");if(acm)acm.textContent="";
  try{await call("update-contact","POST",{email:$("#aceml").value,phone:$("#acph").value});if(acm)acm.textContent="Byabitswe ✓"}
  catch(x){if(acm)acm.textContent=x.status===409?"Email cyangwa telefoni isanzwe ikoreshwa.":"Ntibyakunze (HTTP "+(x.status||"?")+")."}
};
const af2El=$("#af2");
if(af2El)af2El.onsubmit=async e=>{
  e.preventDefault();const m=$("#am");if(m)m.textContent="";
  const acode=$("#acode");if(acode)acode.hidden=true;
  try{
    const j=await call("account","POST",{old:$("#ao").value,new:$("#an").value,regen:$("#ar").checked});
    if(m)m.textContent="Byabitswe ✓";
    if(j.recovery){if(acode)acode.hidden=false;const b=document.querySelector("#acode b");if(b)b.textContent=j.recovery}
    af2El.reset();
  }catch(x){
    const c=x&&x.status;
    if(m)m.textContent=c===400?"Ijambobanga rya none si ryo.":c===422?"Ijambobanga rishya rigomba kuba nibura inyuguti 8.":c===429?"Wagerageje inshuro nyinshi.":"Ntibyakunze (HTTP "+(c||"?")+").";
  }
};

/* ===== Settings (About) ===== */
async function loadSettings(){
  try{
    const s = await call("settings");
    const set = (id,val) => { const e=document.getElementById(id); if(e) e.value = val || ""; };
    set("s-loc", s.about_location);
    set("s-hours", s.about_hours);
    set("s-del", s.about_delivery);
    set("s-contact", s.about_contact);
    set("s-text", s.about_text);
    const setPrev = (id,val) => { const e=document.getElementById(id); if(e) e.textContent = val || ""; };
    setPrev("prev-text",     s.about_text);
    setPrev("prev-loc",      s.about_location);
    setPrev("prev-hours",    s.about_hours);
    setPrev("prev-del",      s.about_delivery);
    setPrev("prev-contact",  s.about_contact);
  }catch{}
}
const sfEl=document.getElementById("sf");
if (sfEl) sfEl.onsubmit = async e => {
  e.preventDefault();
  const m = document.getElementById("smsg");
  if (m) m.textContent = "";
  try {
    await call("settings","POST",{
      about_location: document.getElementById("s-loc").value,
      about_hours:    document.getElementById("s-hours").value,
      about_delivery: document.getElementById("s-del").value,
      about_contact:  document.getElementById("s-contact").value,
      about_text:     document.getElementById("s-text").value,
    });
    if (m) m.textContent = "Byabitswe ✓";
    const setPrev = (id,val) => { const e=document.getElementById(id); if(e) e.textContent = val; };
    setPrev("prev-text",     document.getElementById("s-text").value);
    setPrev("prev-loc",      document.getElementById("s-loc").value);
    setPrev("prev-hours",    document.getElementById("s-hours").value);
    setPrev("prev-del",      document.getElementById("s-del").value);
    setPrev("prev-contact",  document.getElementById("s-contact").value);
  } catch (x) {
    if (m) m.textContent = "Ntibyakunze (HTTP " + (x && x.status || "?") + ").";
  }
};

/* ===== Transaction ===== */
const PAYL={
  yishyuwe:{rw:"Yishyuwe",en:"Paid",fr:"Payé"},
  itegereje:{rw:"Itegereje",en:"Pending",fr:"En attente"},
  yanzwe:{rw:"Ntiyishyuye",en:"Rejected",fr:"Rejeté"}
};
const payLabel=st=>{const v=PAYL[st];return v?.[alang]||v?.rw||"Itegereje"};
const payBadge=s=>{const key=PAYL[s]?s:"itegereje";return `<span class="pay ${esc(key)}">${esc(payLabel(key))}</span>`};
const money=n=>Number(n||0).toLocaleString()+" RWF";
let TX=null;

async function loadTx(){
  try{
    const j=await call(`transactions?status=${$("#txs").value}&range=${$("#txr").value}`);
    TX=j;const s=j.summary;
    const tc=$("#tx-cards");
    if(tc)tc.innerHTML=[
      [atr("paid"),money(s.paid.total),s.paid.n+" "+atr("txOrders"),"ok"],
      [atr("statToday"),money(s.today_paid),"","ok"],
      [atr("txPending"),money(s.pending.total),s.pending.n+" "+atr("txOrders"),"wait"],
      [atr("txRejected"),money(s.rejected.total),s.rejected.n+" "+atr("txOrders"),"no"]
    ].map(c=>`<div class="card ${c[3]}"><small>${c[0]}</small><b>${esc(c[1])}</b><small>${esc(c[2])}</small></div>`).join("");
    
    const tl=$("#tx-list");
    if(tl) tl.innerHTML=j.items.map(o=>{
      const st = o.pay_status || "itegereje";
      const sub = Number(o.subtotal ?? o.total ?? 0);
      const ship = Number(o.shipping ?? 0);
      const tot = Number(o.total ?? 0);
      return `<div class="row" style="align-items:flex-start">
        <span style="flex:1"><b>${esc(o.name)}</b> · ${esc(o.phone)} ${payBadge(st)}<br>
          <small>${o.items.map(i=>esc(i.name)+" ("+esc(i.size)+")"+(i.color?" "+esc(i.color):"")+" x"+Number(i.qty)).join(", ")}<br>
          ${atr("momo")}: <b>${esc(o.momo_txn||"—")}</b> · ${esc(o.created_at)}${o.paid_at?" · "+esc(o.paid_at):""}</small>
          <div class="acts">
            ${st!=="yishyuwe"?`<button data-pay="${o.id}" data-s="yishyuwe">${payLabel("yishyuwe")}</button>`:""}
            ${st==="itegereje"?`<button class="x" data-pay="${o.id}" data-s="yanzwe">${payLabel("yanzwe")}</button>`:`<button class="t" data-pay="${o.id}" data-s="itegereje">${payLabel("itegereje")}</button>`}
          </div>
        </span>
        <span style="text-align:right">
          <b>${sub.toLocaleString()} RWF</b>
          ${ship?`<br><small>+ ${ship.toLocaleString()} delivery</small>`:""}
          <br><b style="font-size:15px">${tot.toLocaleString()} RWF</b>
        </span>
      </div>`;
    }).join("") || `<small>${atr("chatEmpty")}</small>`;
    
    const tp=$("#tx-prod");
    if(tp)tp.innerHTML=j.products.length
      ?`<table class="tbl"><tr><th>${atr("tableProd")}</th><th>${atr("tableQty")}</th><th>${atr("tableTotal")}</th></tr>${j.products.map(p=>`<tr><td>${esc(p.name)}</td><td>${Number(p.qty)}</td><td>${money(p.total)}</td></tr>`).join("")}</table>`
      :`<small>${atr("chatEmpty")}</small>`;
  }catch(x){const tl=$("#tx-list");if(tl)tl.textContent="Ntibyakunze (HTTP "+(x&&x.status||"?")+")."}
}
const txsEl=$("#txs");if(txsEl)txsEl.onchange=loadTx;
const txrEl=$("#txr");if(txrEl)txrEl.onchange=loadTx;

const txListEl=$("#tx-list");
if(txListEl)txListEl.onclick=async e=>{
  const b=e.target.closest("[data-pay]");if(!b)return;
  const st=b.dataset.s,o=TX&&TX.items.find(x=>x.id==b.dataset.pay);
  if(st==="yishyuwe"){
    const sub = Number((o&&o.subtotal) ?? (o&&o.total) ?? 0);
    const ship = Number((o&&o.shipping) ?? 0);
    const tot = Number((o&&o.total) ?? 0);
    const msg =
      `Wabonye SMS ya MTN ihuye na MoMo ID "${(o&&o.momo_txn)||"—"}"?\n\n`+
      `Ibicuruzwa: ${money(sub)}\n`+
      `Delivery: ${ship ? money(ship) : "Ubuntu"}\n`+
      `Yose hamwe: ${money(tot)}`;
    if(!confirm(msg)) return;
  }
  await call(`orders/${b.dataset.pay}/pay`,"POST",{state:st});
  loadTx();stats();
};

const txcsvEl=$("#txcsv");
if(txcsvEl)txcsvEl.onclick=()=>{
  if(!TX)return;
  const rows=[
    ["Itariki","Izina","Telefoni","Ibicuruzwa","Subtotal","Delivery","Total (RWF)","MoMo ID","Ubwishyu","Yishyuwe igihe"],
    ...TX.items.map(o=>{
      const sub = Number(o.subtotal ?? o.total ?? 0);
      const ship = Number(o.shipping ?? 0);
      const tot = Number(o.total ?? 0);
      return [
        o.created_at,
        o.name,
        o.phone,
        o.items.map(i=>i.name+" ("+i.size+")"+(i.color?" "+i.color:"")+" x"+i.qty).join("; "),
        sub,
        ship,
        tot,
        o.momo_txn,
        payLabel(o.pay_status),
        o.paid_at||""
      ];
    })
  ];
  const cell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const csv="\ufeff"+rows.map(r=>r.map(cell).join(";")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="transactions_"+new Date().toISOString().split("T")[0]+".csv";
  document.body.appendChild(a);a.click();a.remove();
};

boot();