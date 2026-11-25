import React from "react";
import { useEffect, useState } from "react";
import { Leaf, Home, ScanBarcode, UserRound, Search, ShieldCheck, AlertTriangle, CheckCircle2, Apple, Heart, ChevronRight, ArrowRight, Activity } from "lucide-react";

const demo = [
 {code:"3017620422003",name:"Nutella",brand:"Ferrero",ingredients:"Sladkor, palmovo olje, lešniki (13 %), kakav, posneto mleko v prahu, lecitin (soja), vanilin.",allergens:["lešniki","mleko","soja"],nutri:{energy:539,fat:30.9,carbs:57.5,sugar:56.3,protein:6.3,salt:0.11},grade:"E"},
 {code:"7622210449283",name:"Oreo Original",brand:"Mondelēz",ingredients:"Pšenična moka, sladkor, palmovo olje, kakav v prahu, pšenični škrob.",allergens:["gluten","pšenica","soja"],nutri:{energy:476,fat:20,carbs:45,sugar:38,protein:5,salt:0.6},grade:"E"},
 {code:"5449000000996",name:"Coca-Cola",brand:"Coca-Cola",ingredients:"Voda, sladkor, ogljikov dioksid, barvilo: karamel, fosforna kislina, naravne arome, kofein.",allergens:[],nutri:{energy:42,fat:0,carbs:10.6,sugar:10.6,protein:0,salt:0},grade:"E"},
 {code:"5901234123457",name:"Riževi vaflji",brand:"Bio izbor",ingredients:"Ekspandiran polnozrnati riž, morska sol.",allergens:[],nutri:{energy:387,fat:2.8,carbs:81,sugar:0.9,protein:7.5,salt:0.3},grade:"A"}
];
demo[1].nutri.carbs = 45;
const allergens = ["gluten","laktoza","mleko","arašidi","oreščki","lešniki","soja","jajca","ribe","sezam","gorčica","zelena"];

function App(){
 const [page,setPage]=useState("home");
 const [profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem("sd-profile"))||{name:"Timi",allergies:["gluten"],prefs:["Bolj zdrava izbira"]}}catch{return {name:"Timi",allergies:["gluten"],prefs:[]}}});
 const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("sd-history"))||[]}catch{return []}});
 const [code,setCode]=useState("");
 const [product,setProduct]=useState(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 useEffect(()=>localStorage.setItem("sd-profile",JSON.stringify(profile)),[profile]);
 useEffect(()=>localStorage.setItem("sd-history",JSON.stringify(history)),[history]);

 async function searchProduct(value=code){
  const v=value.trim(); if(!v){setError("Vnesi črtno kodo izdelka.");return}
  setLoading(true);setError("");setProduct(null);
  const sample=demo.find(x=>x.code===v);
  if(sample){setProduct(sample);setHistory(old=>[sample,...old.filter(x=>x.code!==sample.code)].slice(0,8));setLoading(false);return}
  try{
   const res=await fetch("https://world.openfoodfacts.org/api/v2/product/"+encodeURIComponent(v)+".json");
   const data=await res.json();
   if(data.status!==1)throw new Error("Izdelka nismo našli. Preveri črtno kodo ali poskusi demo izdelek.");
   const p=data.product,n=p.nutriments||{};
   const found={code:v,name:(p.product_name_sl||p.product_name||"Neznan izdelek"),brand:p.brands||"Znamka ni navedena",ingredients:p.ingredients_text_sl||p.ingredients_text||"Sestavine niso navedene.",allergens:(p.allergens_tags||[]).map(x=>x.replace("en:","").replaceAll("-"," ")),nutri:{energy:Math.round(n["energy-kcal_100g"]||0),fat:n.fat_100g||0,carbs:n.carbohydrates_100g||0,sugar:n.sugars_100g||0,protein:n.proteins_100g||0,salt:n.salt_100g||0},grade:(p.nutriscore_grade||"—").toUpperCase()};
   setProduct(found);setHistory(old=>[found,...old.filter(x=>x.code!==v)].slice(0,8));
  }catch(e){setError(e.message||"Pri iskanju je prišlo do napake.")}
  finally{setLoading(false)}
 }
 const warnings=product?profile.allergies.filter(a=>(product.ingredients+" "+product.allergens.join(" ")).toLowerCase().includes(a.toLowerCase()) || (a==="laktoza"&&/mleko|milk|lactose/i.test(product.ingredients))):[];
 const toggle=(a)=>setProfile(p=>({...p,allergies:p.allergies.includes(a)?p.allergies.filter(x=>x!==a):[...p.allergies,a]}));
 const nav=[["home","Domov",Home],["scan","Skeniranje",ScanBarcode],["profile","Moj profil",UserRound]];
 return <div className="layout">
  <aside className="sidebar"><div className="logo"><span><Leaf/></span>smart<b>diet</b></div><small className="menu-label">GLAVNI MENI</small>{nav.map(([id,label,Icon])=><button className={"nav "+(page===id?"selected":"")} onClick={()=>{setPage(id);setError("")}} key={id}><Icon size={18}/>{label}{page===id&&<ChevronRight className="push"/>}</button>)}<div className="side-bottom"><div className="side-tip"><ShieldCheck/><b>Tvoja prehrana. Tvoj nadzor.</b><p>Preveri živila in bodi pozoren na alergene.</p></div><div className="user"><span>{(profile.name||"T")[0].toUpperCase()}</span><div><b>{profile.name||"Uporabnik"}</b><small>Osebni profil</small></div></div></div></aside>
  <main><header><div className="mobile-logo"><Leaf/> smart<b>diet</b></div><span>SmartDiet <i>/</i> {nav.find(x=>x[0]===page)?.[1]}</span><label><em/> Prototip <strong>{(profile.name||"T")[0].toUpperCase()}</strong></label></header>
  {page==="home"&&<section className="content">
   <div className="welcome"><div><small className="eyebrow">✦ PAMETNA PREHRANA</small><h1>Živjo, {profile.name||"Timi"}! 👋</h1><p>Preveri sestavine in odkrij, kaj se skriva v tvoji hrani.</p></div><div className="apple"><Apple size={44}/></div></div>
   <div className="hero"><div><small>SMARTDIET SCANNER</small><h2>Veš, kaj je v tvoji hrani?</h2><p>Vnesi črtno kodo izdelka in preveri sestavine, hranilne vrednosti ter morebitne alergene.</p><button className="primary" onClick={()=>setPage("scan")}>Preveri izdelek <ArrowRight size={17}/></button></div><div className="barcode-art"><ScanBarcode size={68}/><small>EAN / UPC</small></div></div>
   <div className="section-title"><div><h2>Tvoj prehranski pregled</h2><p>Podatki iz tvojega profila</p></div><button className="link" onClick={()=>setPage("profile")}>Uredi profil <ArrowRight size={14}/></button></div>
   <div className="stats"><div><ShieldCheck/><small>Aktivne alergije</small><b>{profile.allergies.length}</b><p>nastavljenih opozoril</p></div><div><ScanBarcode/><small>Pregledani izdelki</small><b>{history.length}</b><p>v tej napravi</p></div><div><Heart/><small>Prehranske preference</small><b>{profile.prefs.length}</b><p>osebnih preferenc</p></div></div>
   <div className="section-title"><div><h2>Nedavno pregledano</h2><p>Tvoji zadnji izdelki</p></div><button className="link" onClick={()=>setPage("scan")}>Poišči izdelek <ArrowRight size={14}/></button></div>
   {history.length? <div className="history">{history.slice(0,4).map(p=><button key={p.code} onClick={()=>{setCode(p.code);setProduct(p);setPage("scan")}}><span className="food-icon"><Apple/></span><span><b>{p.name}</b><small>{p.brand}</small></span><em>{p.allergens?.length?"Preveri alergene":"Brez zaznanih"}</em><ChevronRight/></button>)}</div>:<div className="empty"><Apple/><b>Še nimaš pregledanih izdelkov</b><p>Ko preveriš prvi izdelek, se bo prikazal tukaj.</p><button className="outline" onClick={()=>setPage("scan")}>Začni pregled</button></div>}
   <div className="note"><AlertTriangle size={16}/> SmartDiet je prototip. Podatki o alergenih so informativni – vedno preveri embalažo izdelka.</div>
  </section>}
  {page==="scan"&&<section className="content"><div className="intro"><small className="eyebrow">⌕ ISKANJE ŽIVIL</small><h1>Preveri izdelek</h1><p>Vnesi številko pod črtno kodo in preveri, ali je izdelek primeren zate.</p></div>
   <div className="panel"><div className="panel-title"><span><ScanBarcode/></span><div><b>Iskanje po črtni kodi</b><p>Povezava z javno bazo Open Food Facts.</p></div></div><form onSubmit={e=>{e.preventDefault();searchProduct()}}><div className="search"><Search/><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Npr. 3017620422003"/></div><button className="primary" disabled={loading}>{loading?"Iščem...":"Poišči izdelek"} <ArrowRight size={16}/></button></form><div className="demos"><span>Preizkusi demo izdelek:</span>{demo.map(p=><button key={p.code} onClick={()=>{setCode(p.code);searchProduct(p.code)}}>{p.name}</button>)}</div>{error&&<div className="error"><AlertTriangle size={17}/>{error}</div>}</div>
   {product?<div className="result"><div className="result-heading"><div><small className="eyebrow">REZULTAT ISKANJA</small><h2>{product.name}</h2><p>{product.brand}</p></div><span className={warnings.length?"danger":"safe"}>{warnings.length?"⚠ Pozor – preveri":"✓ Brez zaznanih ujemanj"}</span></div><div className={"alert "+(warnings.length?"alert-danger":"alert-safe")}><b>{warnings.length?"Izdelek lahko vsebuje tvoje alergene":"Ni zaznanih ujemanj s tvojim profilom"}</b><p>{warnings.length?"Preveri naslednje sestavine: "+warnings.join(", ")+".":"V podatkih ni bilo zaznanih izbranih alergenov. Kljub temu preveri embalažo."}</p></div><h3>Hranilne vrednosti <small>na 100 g / 100 ml</small></h3><div className="nutrition">{[["Energija",product.nutri.energy,"kcal"],["Maščobe",product.nutri.fat,"g"],["Ogljikovi hidrati",product.nutri.carbs,"g"],["Sladkorji",product.nutri.sugar,"g"],["Beljakovine",product.nutri.protein,"g"],["Sol",product.nutri.salt,"g"]].map(x=><div><small>{x[0]}</small><b>{x[1]} <i>{x[2]}</i></b></div>)}</div><h3>Sestavine</h3><p className="ingredients">{product.ingredients}</p><div className="result-meta">Črtna koda: {product.code}<span>Nutri-Score: <b>{product.grade}</b></span></div><p className="disclaimer">Informacije iz baze so lahko nepopolne ali zastarele. Vedno preveri deklaracijo na embalaži.</p></div>:<div className="features"><div><ShieldCheck/><b>Osebna opozorila</b><p>Izdelek primerjamo z alergijami v tvojem profilu.</p></div><div><Activity/><b>Hranilne vrednosti</b><p>Preglej energijo, maščobe, sladkorje in beljakovine.</p></div><div><Leaf/><b>Sestavine</b><p>Na enem mestu si oglej sestavine in alergene.</p></div></div>}
   <div className="note"><AlertTriangle size={16}/> Če izdelka ni v bazi ali podatki niso popolni, to še ne pomeni, da je varen.</div>
  </section>}
  {page==="profile"&&<section className="content"><div className="intro"><small className="eyebrow">♙ TVOJ PROFIL</small><h1>Prehranske nastavitve</h1><p>Nastavi alergije in preference, da SmartDiet prilagodi opozorila.</p></div><div className="profile-grid"><div>
   <div className="panel"><div className="panel-title"><span><UserRound/></span><div><b>Osebni podatki</b><p>Osnovne informacije o tebi.</p></div></div><label className="field">Ime</label><input className="name-input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Vnesi ime"/></div>
   <div className="panel"><div className="panel-title"><span className="orange"><AlertTriangle/></span><div><b>Moje alergije in intolerance</b><p>Izberi sestavine, na katere želiš biti posebej pozoren.</p></div></div><div className="allergy-grid">{allergens.map(a=><button className={profile.allergies.includes(a)?"checked":""} onClick={()=>toggle(a)}><i>{profile.allergies.includes(a)?"✓":""}</i>{a}</button>)}</div><p className="count"><ShieldCheck size={15}/>{profile.allergies.length} aktivnih opozoril</p></div>
   <div className="panel"><div className="panel-title"><span className="purple"><Heart/></span><div><b>Prehranske preference</b><p>Izberi, kaj ti je pri prehrani pomembno.</p></div></div><div className="prefs">{["Bolj zdrava izbira","Manj sladkorja","Več beljakovin","Vegetarijanska prehrana"].map(x=><button className={profile.prefs.includes(x)?"checked":""} onClick={()=>setProfile(p=>({...p,prefs:p.prefs.includes(x)?p.prefs.filter(y=>y!==x):[...p.prefs,x]}))}><i>{profile.prefs.includes(x)?"✓":""}</i>{x}</button>)}</div></div>
   </div><aside className="summary"><div className="initial">{(profile.name||"T")[0].toUpperCase()}</div><h3>{profile.name||"Uporabnik"}</h3><p>SmartDiet uporabnik</p><hr/><div><span>Aktivne alergije</span><b>{profile.allergies.length}</b></div><div><span>Preference</span><b>{profile.prefs.length}</b></div><hr/><small>MOJA OPOZORILA</small><p>{profile.allergies.length?profile.allergies.join(" · "):"Ni izbranih alergij."}</p><div className="privacy"><ShieldCheck/><b>Podatki ostanejo pri tebi</b><p>Nastavitve se shranijo v brskalnik na tej napravi.</p></div></aside></div><div className="note"><AlertTriangle size={16}/> Ta prototip ne nadomešča strokovnega zdravstvenega nasveta.</div></section>}
  <footer>© 2026 SmartDiet <span>Šolski prototip · Vite + React</span></footer></main>
 </div>
}
export default App;
