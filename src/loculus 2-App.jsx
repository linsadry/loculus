import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://unjbdcjcfqmytapxyvuf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamJkY2pjZnFteXRhcHh5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTQ1NDAsImV4cCI6MjA5MjI5MDU0MH0.Wvc2IaYUib3zO1b92tAd5d9pH4Tpzr6cMm9yGKEelKs'
);

const IMG_URL = "https://unjbdcjcfqmytapxyvuf.supabase.co/storage/v1/object/public/assets/IMG_8652.png";

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "loculus_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexRgb(hex = "#888") {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function getCat(cats, id) { return cats.find(c => c.id === id) || { color:"#aaa", label:"—" }; }
function todayStr() { return new Date().toISOString().slice(0,10); }
function useIsDesktop() {
  const [desk, setDesk] = useState(window.innerWidth >= 900);
  useEffect(() => {
    const h = () => setDesk(window.innerWidth >= 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return desk;
}

function formatDateLabel(dateStr) {
  const t = todayStr();
  const tom = new Date(); tom.setDate(tom.getDate()+1);
  const yest = new Date(); yest.setDate(yest.getDate()-1);
  if (dateStr === t) return "hoje";
  if (dateStr === tom.toISOString().slice(0,10)) return "amanhã";
  if (dateStr === yest.toISOString().slice(0,10)) return "ontem";
  const d = new Date(dateStr+"T12:00:00");
  return d.toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"});
}

function btnIcon(bg="rgba(42,61,42,0.08)", color="#2a3d2a") {
  return {
    width:36, height:36, borderRadius:"50%",
    background:bg, color, border:"none", cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:15, fontWeight:700, flexShrink:0,
  };
}

function PinPad({ value, onChange, onSubmit, error, label, sublabel }) {
  const digits = [1,2,3,4,5,6,7,8,9,null,0,"⌫"];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      {label && <div style={{fontSize:17,fontWeight:800,color:"#2a3d2a",marginBottom:6,textAlign:"center"}}>{label}</div>}
      {sublabel && <div style={{fontSize:13,color:"#7a9a7a",marginBottom:24,textAlign:"center"}}>{sublabel}</div>}
      <div style={{display:"flex",gap:14,marginBottom:32}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",
            background:i<value.length?"#3A6EA5":"rgba(58,110,165,0.15)",transition:"background 0.15s ease"}}/>
        ))}
      </div>
      {error && <div style={{fontSize:13,color:"#D4523A",fontWeight:600,marginBottom:16,
        textAlign:"center",background:"rgba(212,82,58,0.08)",padding:"8px 16px",borderRadius:10}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:240}}>
        {digits.map((d,i)=>(
          <button key={i} onClick={()=>{
            if(d===null)return;
            if(d==="⌫"){onChange(value.slice(0,-1));return;}
            if(value.length>=6)return;
            const next=value+d; onChange(next);
            if(next.length===6)onSubmit(next);
          }} style={{
            height:60,borderRadius:18,
            background:d===null?"transparent":d==="⌫"?"rgba(212,82,58,0.08)":"white",
            border:d===null?"none":"1.5px solid rgba(58,110,165,0.12)",
            fontSize:d==="⌫"?20:22,fontWeight:700,color:d==="⌫"?"#D4523A":"#2a3d2a",
            cursor:d===null?"default":"pointer",
            boxShadow:d!==null&&d!=="⌫"?"0 2px 8px rgba(0,0,0,0.06)":"none",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{d===null?"":d}</button>
        ))}
      </div>
    </div>
  );
}

function PinSetup({ onDone }) {
  const [step,setStep]=useState("create");
  const [first,setFirst]=useState("");
  const [second,setSecond]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function handleFirst(pin){if(pin.length===6){setFirst(pin);setStep("confirm");}}
  async function handleConfirm(pin){
    if(pin.length<6)return;
    if(pin!==first){setError("PINs não conferem.");setSecond("");setStep("create");setFirst("");return;}
    setLoading(true);
    try{const hash=await hashPin(pin);await supabase.from("loculus_pin").insert({pin_hash:hash});sessionStorage.setItem("loculus_auth","1");onDone();}
    catch(e){setError("Erro ao salvar PIN.");}finally{setLoading(false);}
  }
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8f4ef 0%,#f0ede8 60%,#e8e4f0 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 24px"}}>
        <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",marginBottom:24,boxShadow:"0 8px 24px rgba(90,120,90,0.15)"}}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{fontSize:32,fontWeight:900,color:"#2a3d2a",fontFamily:"'Georgia',serif",letterSpacing:"-1px",marginBottom:32}}>Loculus</div>
        {loading?<div style={{color:"#7a9a7a",fontSize:14}}>Salvando PIN…</div>
          :step==="create"?<PinPad value={first} onChange={setFirst} onSubmit={handleFirst} error={error} label="Crie seu PIN" sublabel="6 dígitos para proteger suas gavetas"/>
          :<PinPad value={second} onChange={setSecond} onSubmit={handleConfirm} error={error} label="Confirme o PIN" sublabel="Digite novamente para confirmar"/>}
      </div>
    </div>
  );
}

function PinLogin({ onSuccess, onForgot }) {
  const [pin,setPin]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [attempts,setAttempts]=useState(0);
  async function handleSubmit(p){
    if(loading)return;setLoading(true);
    try{const hash=await hashPin(p);const{data}=await supabase.from("loculus_pin").select("pin_hash").single();
      if(data?.pin_hash===hash){sessionStorage.setItem("loculus_auth","1");onSuccess();}
      else{const n=attempts+1;setAttempts(n);setError(n>=5?"Muitas tentativas.":"PIN incorreto.");setPin("");}
    }catch(e){setError("Erro de conexão.");setPin("");}finally{setLoading(false);}
  }
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8f4ef 0%,#f0ede8 60%,#e8e4f0 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 24px"}}>
        <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",marginBottom:24,boxShadow:"0 8px 24px rgba(90,120,90,0.15)"}}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{fontSize:32,fontWeight:900,color:"#2a3d2a",fontFamily:"'Georgia',serif",letterSpacing:"-1px",marginBottom:32}}>Loculus</div>
        {loading?<div style={{color:"#7a9a7a",fontSize:14}}>Verificando…</div>
          :<PinPad value={pin} onChange={setPin} onSubmit={handleSubmit} error={error} label="Digite seu PIN" sublabel=""/>}
        {attempts>=3&&<button onClick={onForgot} style={{marginTop:24,background:"none",border:"none",color:"#D4523A",fontSize:13,fontWeight:700,cursor:"pointer"}}>Esqueci meu PIN</button>}
      </div>
    </div>
  );
}

function CalendarWidget({ reminders, onDaySelect, selectedDay }) {
  const [offset,setOffset]=useState(0);
  const WD=["S","T","Q","Q","S","S","D"];
  function getMonthDays(o=0){
    const now=new Date();const first=new Date(now.getFullYear(),now.getMonth()+o,1);
    const last=new Date(now.getFullYear(),now.getMonth()+o+1,0);
    const pad=(first.getDay()+6)%7;const days=[];
    for(let i=0;i<pad;i++)days.push(null);
    for(let d=1;d<=last.getDate();d++)days.push(new Date(first.getFullYear(),first.getMonth(),d));
    return days;
  }
  function ds(d){return d?d.toISOString().slice(0,10):"";}
  function remsOnDay(d){return reminders.filter(r=>r.date===ds(d)&&!r.done);}
  const monthDays=getMonthDays(offset);
  const dispMonth=new Date(new Date().getFullYear(),new Date().getMonth()+offset,1);
  const monthLabel=dispMonth.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  return (
    <div style={{background:"white",borderRadius:20,padding:16,boxShadow:"0 2px 16px rgba(42,61,42,0.07)",border:"1px solid rgba(42,61,42,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>setOffset(o=>o-1)} style={{...btnIcon(),width:28,height:28,fontSize:13}}>‹</button>
        <span style={{fontSize:13,fontWeight:700,color:"#2a3d2a",textTransform:"capitalize"}}>{monthLabel}</span>
        <button onClick={()=>setOffset(o=>o+1)} style={{...btnIcon(),width:28,height:28,fontSize:13}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {WD.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"#9aaa9a"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {monthDays.map((d,i)=>{
          if(!d)return <div key={`e${i}`}/>;
          const dStr=ds(d);const isToday=dStr===todayStr();const isSel=selectedDay===dStr;
          const count=remsOnDay(d).length;const hasUrgent=remsOnDay(d).some(r=>r.urgente);
          return (
            <div key={i} onClick={()=>onDaySelect(isSel?null:dStr)} style={{
              borderRadius:8,padding:"4px 2px",textAlign:"center",cursor:"pointer",minHeight:32,
              background:isSel?"#3A6EA5":isToday?"#e8f0e8":"transparent",
              border:`1px solid ${isSel?"#3A6EA5":isToday?"#7DBE8E":"transparent"}`,
            }}>
              <div style={{fontSize:12,fontWeight:700,color:isSel?"white":isToday?"#3A6EA5":"#2a3d2a"}}>{d.getDate()}</div>
              {count>0&&<div style={{display:"flex",gap:1,justifyContent:"center",marginTop:1}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:isSel?"white":hasUrgent?"#D4523A":"#7DBE8E"}}/>
                {count>1&&<div style={{width:4,height:4,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.6)":"#9B7EC8"}}/>}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReminderChip({ r, cat, onToggle, onDelete, compact=false }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:compact?4:7}}>
      <div onClick={()=>onToggle(r.id,r.done)} style={{
        flex:1,display:"flex",alignItems:"center",gap:8,
        padding:compact?"8px 12px":"10px 14px",borderRadius:20,
        background:r.done?`rgba(${hexRgb(cat.color)},0.25)`:cat.color,
        color:"white",fontSize:compact?13:14,fontWeight:600,cursor:"pointer",
        opacity:r.done?0.55:1,textDecoration:r.done?"line-through":"none",
        boxShadow:r.done?"none":`0 3px 10px rgba(${hexRgb(cat.color)},0.28)`,
        transition:"all 0.15s ease",
      }}>
        <span style={{flex:1}}>{r.text}</span>
        <span style={{fontSize:11,opacity:0.8}}>{r.time?.slice(0,5)}</span>
        {r.urgente&&!r.done&&<span style={{fontSize:11}}>⚡</span>}
        {r.importante&&!r.done&&<span style={{fontSize:11}}>⭐</span>}
        <span style={{width:18,height:18,borderRadius:"50%",flexShrink:0,
          border:"1.5px solid rgba(255,255,255,0.55)",
          background:r.done?"rgba(255,255,255,0.45)":"transparent",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,
        }}>{r.done?"✓":""}</span>
      </div>
      <button onClick={()=>onDelete(r.id)} style={{
        width:28,height:28,borderRadius:"50%",border:"none",
        background:"rgba(212,82,58,0.12)",color:"#D4523A",
        fontSize:14,cursor:"pointer",flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>×</button>
    </div>
  );
}

function AddSheet({ categories,nText,setNText,nCat,setNCat,nDate,setNDate,
  nTime,setNTime,nUrgente,setNUrgente,nImportante,setNImportante,
  onAdd,onClose,inputRef,loading,isDesktop }) {
  const content = (
    <>
      <div style={{width:36,height:4,background:"#d4dcd4",borderRadius:2,margin:"0 auto 18px"}}/>
      <div style={{fontSize:15,fontWeight:800,color:"#2a3d2a",marginBottom:14}}>Nova gaveta</div>
      <input ref={inputRef} value={nText} onChange={e=>setNText(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&onAdd()} placeholder="O que você quer lembrar?"
        style={{width:"100%",padding:"12px 16px",borderRadius:14,border:"1.5px solid #d4e4d4",
          fontSize:14,background:"#f0f7f0",outline:"none",color:"#2a3d2a",boxSizing:"border-box",marginBottom:10}}/>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input type="date" value={nDate} onChange={e=>setNDate(e.target.value)}
          style={{flex:1,padding:"8px 10px",borderRadius:12,border:"1.5px solid #d4e4d4",fontSize:13,background:"#f0f7f0",outline:"none",color:"#2a3d2a"}}/>
        <input type="time" value={nTime} onChange={e=>setNTime(e.target.value)}
          style={{width:90,padding:"8px 10px",borderRadius:12,border:"1.5px solid #d4e4d4",fontSize:13,background:"#f0f7f0",outline:"none",color:"#2a3d2a"}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>setNCat(cat.id)} style={{
            padding:"5px 12px",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:12,
            border:nCat===cat.id?"none":"1.5px solid rgba(0,0,0,0.09)",
            background:nCat===cat.id?cat.color:"white",color:nCat===cat.id?"white":"#555",
            boxShadow:nCat===cat.id?`0 3px 10px rgba(${hexRgb(cat.color)},0.35)`:"none",
            display:"flex",alignItems:"center",gap:4,
          }}>
            {nCat!==cat.id&&<span style={{width:7,height:7,borderRadius:"50%",background:cat.color,display:"inline-block"}}/>}
            {cat.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button onClick={()=>setNUrgente(!nUrgente)} style={{
          flex:1,padding:"10px",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:13,
          border:`1.5px solid ${nUrgente?"#D4523A":"rgba(0,0,0,0.09)"}`,
          background:nUrgente?"#fdf0ed":"white",color:nUrgente?"#D4523A":"#888",
        }}>⚡ Urgente</button>
        <button onClick={()=>setNImportante(!nImportante)} style={{
          flex:1,padding:"10px",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:13,
          border:`1.5px solid ${nImportante?"#D4A843":"rgba(0,0,0,0.09)"}`,
          background:nImportante?"#fdf7e8":"white",color:nImportante?"#D4A843":"#888",
        }}>⭐ Importante</button>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:14,border:"1.5px solid #d4e4d4",background:"white",color:"#6a8a72",fontSize:14,fontWeight:700,cursor:"pointer"}}>Cancelar</button>
        <button onClick={onAdd} disabled={loading} style={{flex:2,padding:"11px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#3A6EA5,#5B8DB8)",color:"white",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(58,110,165,0.32)",opacity:loading?0.7:1}}>{loading?"Salvando…":"Adicionar"}</button>
      </div>
    </>
  );
  if(isDesktop) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fafcfa",borderRadius:24,padding:"28px 28px 32px",width:480,boxShadow:"0 16px 60px rgba(0,0,0,0.15)"}}>{content}</div>
    </div>
  );
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:"#fafcfa",borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",boxShadow:"0 -8px 40px rgba(42,61,42,0.13)"}}>
      {content}
    </div>
  );
}

function BottomBar({ screen, onAdd, onMain, onCal, onLock, onDone }) {
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,
      background:"rgba(247,249,246,0.97)",backdropFilter:"blur(10px)",
      padding:"10px 24px 28px",display:"flex",alignItems:"center",justifyContent:"space-around",
      borderTop:"1px solid rgba(42,61,42,0.07)"}}>
      <button onClick={onLock} style={{...btnIcon(),width:40,height:40,fontSize:16}}>🔒</button>
      <button onClick={onMain} style={{...btnIcon(screen==="main"?"#3A6EA5":"transparent",screen==="main"?"white":"#6a8a72"),width:40,height:40,fontSize:16}}>🏠</button>
      <button onClick={onAdd} style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#3A6EA5,#5B8DB8)",color:"white",fontSize:26,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(58,110,165,0.4)"}}>+</button>
      <button onClick={onCal} style={{...btnIcon(screen==="calendar"?"#3A6EA5":"transparent",screen==="calendar"?"white":"#6a8a72"),width:40,height:40,fontSize:16}}>📅</button>
      <button onClick={onDone} style={{...btnIcon(screen==="done"?"#7DBE8E":"transparent",screen==="done"?"white":"#6a8a72"),width:40,height:40,fontSize:16}}>✅</button>
    </div>
  );
}

export default function App() {
  const isDesktop = useIsDesktop();
  const [authState,   setAuthState]   = useState("loading");
  const [screen,      setScreen]      = useState("main");
  const [categories,  setCategories]  = useState([]);
  const [reminders,   setReminders]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeCat,   setActiveCat]   = useState("todos");
  const [showAdd,     setShowAdd]     = useState(false);
  const [calSelDay,   setCalSelDay]   = useState(null);
  const [editCatId,   setEditCatId]   = useState(null);
  const [editLabel,   setEditLabel]   = useState("");
  const [editColor,   setEditColor]   = useState("#7DBE8E");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7DBE8E");
  const [nText,       setNText]       = useState("");
  const [nCat,        setNCat]        = useState("");
  const [nDate,       setNDate]       = useState(todayStr());
  const [nTime,       setNTime]       = useState("09:00");
  const [nUrgente,    setNUrgente]    = useState(false);
  const [nImportante, setNImportante] = useState(false);
  const inputRef = useRef(null);

  useEffect(()=>{
    async function checkAuth(){
      if(sessionStorage.getItem("loculus_auth")==="1"){setAuthState("ok");return;}
      const{data}=await supabase.from("loculus_pin").select("id").maybeSingle();
      setAuthState(data?"login":"setup");
    }
    checkAuth();
  },[]);

  const loadAll=useCallback(async()=>{
    setLoading(true);
    try{
      const[{data:cats},{data:rems}]=await Promise.all([
        supabase.from("loculus_categories").select("*").order("position"),
        supabase.from("loculus_reminders").select("*").order("date").order("time"),
      ]);
      setCategories(cats||[]);
      setReminders(rems||[]);
      if(cats?.length)setNCat(cats[0].id);
      // Auto-delete concluídos com mais de 30 dias
      const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
      const cutoffStr=cutoff.toISOString().slice(0,10);
      const old=(rems||[]).filter(r=>r.done&&r.date<cutoffStr);
      if(old.length>0){
        const ids=old.map(r=>r.id);
        await supabase.from("loculus_reminders").delete().in("id",ids);
        setReminders(prev=>prev.filter(r=>!ids.includes(r.id)));
      }
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{if(authState==="ok")loadAll();},[authState,loadAll]);
  useEffect(()=>{if(showAdd&&inputRef.current)inputRef.current.focus();},[showAdd]);

  function lock(){sessionStorage.removeItem("loculus_auth");setAuthState("login");}

  async function handleForgotPin(){
    if(!confirm("Apagar PIN e criar um novo?"))return;
    await supabase.from("loculus_pin").delete().neq("id","00000000-0000-0000-0000-000000000000");
    sessionStorage.removeItem("loculus_auth");setAuthState("setup");
  }

  async function addReminder(){
    if(!nText.trim())return;setSaving(true);
    try{
      const{data,error}=await supabase.from("loculus_reminders").insert({
        text:nText.trim(),category_id:nCat||null,date:nDate,time:nTime+":00",
        done:false,urgente:nUrgente,importante:nImportante,
      }).select().single();
      if(error)throw error;
      setReminders(prev=>[...prev,data]);
      setNText("");setNUrgente(false);setNImportante(false);setNDate(todayStr());setNTime("09:00");setShowAdd(false);
    }catch(e){console.error(e);alert("Erro: "+e.message);}finally{setSaving(false);}
  }

  async function toggleDone(id,currentDone){
    setReminders(prev=>prev.map(r=>r.id===id?{...r,done:!currentDone}:r));
    const{error}=await supabase.from("loculus_reminders").update({done:!currentDone}).eq("id",id);
    if(error)setReminders(prev=>prev.map(r=>r.id===id?{...r,done:currentDone}:r));
  }

  async function deleteReminder(id){
    setReminders(prev=>prev.filter(r=>r.id!==id));
    await supabase.from("loculus_reminders").delete().eq("id",id);
  }

  async function addCategory(){
    if(!newCatLabel.trim())return;
    const{data,error}=await supabase.from("loculus_categories").insert({
      label:newCatLabel.trim(),color:newCatColor,position:categories.length,
    }).select().single();
    if(error){alert("Erro: "+error.message);return;}
    setCategories(prev=>[...prev,data]);setNewCatLabel("");setNewCatColor("#7DBE8E");
  }

  async function updateCategory(id){
    const{error}=await supabase.from("loculus_categories").update({label:editLabel,color:editColor}).eq("id",id);
    if(error){alert("Erro: "+error.message);return;}
    setCategories(prev=>prev.map(c=>c.id===id?{...c,label:editLabel,color:editColor}:c));setEditCatId(null);
  }

  async function deleteCategory(id){
    await supabase.from("loculus_categories").delete().eq("id",id);
    setCategories(prev=>prev.filter(c=>c.id!==id));
  }

  const active=reminders.filter(r=>!r.done);
  const done=reminders.filter(r=>r.done);
  const filtered=activeCat==="todos"?active:activeCat==="urgente"?active.filter(r=>r.urgente):activeCat==="importante"?active.filter(r=>r.importante):active.filter(r=>r.category_id===activeCat);
  const byDate=filtered.reduce((acc,r)=>{acc[r.date]=acc[r.date]||[];acc[r.date].push(r);return acc;},{});
  const sortedDates=Object.keys(byDate).sort();
  const urgentCount=active.filter(r=>r.urgente).length;

  if(authState==="loading")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8f4ef 0%,#f0ede8 60%,#e8e4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',system-ui,sans-serif",color:"#7a9a7a",fontSize:14}}>Abrindo gavetas… 🗂️</div>
  );
  if(authState==="setup")return <PinSetup onDone={()=>{setAuthState("ok");loadAll();}}/>;
  if(authState==="login")return <PinLogin onSuccess={()=>{setAuthState("ok");loadAll();}} onForgot={handleForgotPin}/>;

  const FilterChips=(
    <div style={{display:"flex",gap:6,padding:"0 0 12px",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {[{id:"todos",label:"Todos",color:"#4a6a4a"},{id:"urgente",label:"⚡ Urgentes",color:"#D4523A"},{id:"importante",label:"⭐ Importantes",color:"#D4A843"}].map(f=>{
        const isActive=activeCat===f.id;
        return <button key={f.id} onClick={()=>setActiveCat(f.id)} style={{flexShrink:0,padding:"7px 13px",borderRadius:20,cursor:"pointer",border:isActive?"none":"1.5px solid rgba(0,0,0,0.09)",background:isActive?f.color:"white",color:isActive?"white":"#555",fontSize:12,fontWeight:700,whiteSpace:"nowrap",boxShadow:isActive?`0 4px 12px rgba(${hexRgb(f.color)},0.35)`:"none"}}>{f.label}</button>;
      })}
      {categories.map(cat=>{
        const isActive=activeCat===cat.id;
        return <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{flexShrink:0,padding:"7px 13px",borderRadius:20,cursor:"pointer",border:isActive?"none":"1.5px solid rgba(0,0,0,0.09)",background:isActive?cat.color:"white",color:isActive?"white":"#444",fontSize:12,fontWeight:700,whiteSpace:"nowrap",boxShadow:isActive?`0 4px 12px rgba(${hexRgb(cat.color)},0.35)`:"none",display:"flex",alignItems:"center",gap:5}}>
          {!isActive&&<span style={{width:7,height:7,borderRadius:"50%",background:cat.color,display:"inline-block"}}/>}{cat.label}</button>;
      })}
    </div>
  );

  const ReminderList=(
    <>
      {loading?<div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Abrindo gavetas… 🗂️</div>
        :sortedDates.length===0?<div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Nenhum lembrete aqui 🌿</div>
        :sortedDates.map(date=>(
          <div key={date}>
            <div style={{textAlign:"center",fontSize:11,color:"#9aaa9a",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",margin:"10px 0 8px"}}>{formatDateLabel(date)}</div>
            <div style={{display:"flex",flexDirection:"column"}}>
              {byDate[date].map(r=><ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder}/>)}
            </div>
          </div>
        ))}
    </>
  );

  const DoneDrawer=(
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
      {done.length===0?<div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Nenhum lembrete concluído 🌿</div>:(
        <>
          <div style={{fontSize:12,color:"#9aaa9a",marginBottom:12,fontWeight:500}}>{done.length} concluído{done.length!==1?"s":""} · apagados automaticamente após 30 dias</div>
          {done.map(r=><ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} compact/>)}
        </>
      )}
    </div>
  );

  const CatEditor=(
    <div style={{flex:1,overflowY:"auto",padding:"0 0 40px",scrollbarWidth:"none"}}>
      {categories.map(cat=>(
        <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:16,background:"white",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
          {editCatId===cat.id?(
            <><input value={editLabel} onChange={e=>setEditLabel(e.target.value)} style={{flex:1,border:"1px solid #ddd",borderRadius:8,padding:"4px 8px",fontSize:14}}/>
            <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} style={{width:32,height:32,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
            <button onClick={()=>updateCategory(cat.id)} style={{...btnIcon("#3A6EA5","white"),fontSize:12,width:32,height:32}}>✓</button></>
          ):(
            <><span style={{flex:1,fontSize:15,fontWeight:600,color:"#2a3d2a"}}>{cat.label}</span>
            <button onClick={()=>{setEditCatId(cat.id);setEditLabel(cat.label);setEditColor(cat.color);}} style={btnIcon()}>✏️</button>
            <button onClick={()=>deleteCategory(cat.id)} style={btnIcon()}>🗑️</button></>
          )}
        </div>
      ))}
      <div style={{padding:"14px 16px",borderRadius:16,marginTop:8,background:"rgba(58,110,165,0.07)",border:"1.5px dashed rgba(58,110,165,0.3)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#3A6EA5",marginBottom:10}}>Nova gaveta</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input placeholder="Nome" value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()}
            style={{flex:1,border:"1px solid #ddd",borderRadius:10,padding:"8px 12px",fontSize:14,outline:"none"}}/>
          <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} style={{width:38,height:38,border:"none",borderRadius:10,cursor:"pointer",padding:2}}/>
          <button onClick={addCategory} style={{...btnIcon("#3A6EA5","white"),width:38,height:38,fontSize:18}}>+</button>
        </div>
      </div>
    </div>
  );

  const AddSheetProps={categories,nText,setNText,nCat,setNCat,nDate,setNDate,nTime,setNTime,nUrgente,setNUrgente,nImportante,setNImportante,onAdd:addReminder,onClose:()=>setShowAdd(false),inputRef,loading:saving};

  if(isDesktop) return (
    <div style={{minHeight:"100vh",background:"#f0f4f0",fontFamily:"'Nunito','DM Sans',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:"white",borderBottom:"1px solid rgba(42,61,42,0.07)",padding:"12px 32px",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",cursor:"pointer"}} onClick={()=>setScreen("main")}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <span style={{fontSize:20,fontWeight:900,color:"#2a3d2a",fontFamily:"'Georgia',serif",letterSpacing:"-0.5px"}}>Loculus</span>
        <div style={{flex:1}}/>
        {[{k:"main",label:"🏠 Gavetas"},{k:"done",label:"✅ Concluídos"},{k:"catEdit",label:"🗂️ Editar"}].map(t=>(
          <button key={t.k} onClick={()=>setScreen(t.k)} style={{padding:"7px 16px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:screen===t.k?"#3A6EA5":"transparent",color:screen===t.k?"white":"#6a8a72"}}>{t.label}</button>
        ))}
        <button onClick={()=>setShowAdd(true)} style={{padding:"8px 20px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:"linear-gradient(135deg,#3A6EA5,#5B8DB8)",color:"white",boxShadow:"0 4px 12px rgba(58,110,165,0.3)"}}>+ Novo</button>
        <button onClick={lock} style={{...btnIcon(),fontSize:16}}>🔒</button>
        {urgentCount>0&&<div style={{padding:"4px 10px",borderRadius:20,background:"#D4523A",color:"white",fontSize:12,fontWeight:700}}>⚡ {urgentCount}</div>}
      </div>
      <div style={{flex:1,display:"flex",gap:0,overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"24px 32px",scrollbarWidth:"none"}}>
          {screen==="main"&&<>{FilterChips}{ReminderList}</>}
          {screen==="done"&&<><div style={{fontSize:18,fontWeight:800,color:"#2a3d2a",marginBottom:16}}>Gaveta de Concluídos</div>{DoneDrawer}</>}
          {screen==="catEdit"&&<><div style={{fontSize:18,fontWeight:800,color:"#2a3d2a",marginBottom:16}}>Editar Gavetas</div>{CatEditor}</>}
        </div>
        <div style={{width:300,flexShrink:0,padding:"24px 24px 24px 0",overflowY:"auto",scrollbarWidth:"none"}}>
          <CalendarWidget reminders={reminders} onDaySelect={setCalSelDay} selectedDay={calSelDay}/>
          {calSelDay&&(
            <div style={{marginTop:16}}>
              <div style={{fontSize:12,fontWeight:700,color:"#9aaa9a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{formatDateLabel(calSelDay)}</div>
              {reminders.filter(r=>r.date===calSelDay).length===0
                ?<div style={{textAlign:"center",color:"#bbb",fontSize:13,padding:"20px 0"}}>Nenhum lembrete 🌿</div>
                :<div style={{display:"flex",flexDirection:"column"}}>
                  {reminders.filter(r=>r.date===calSelDay).map(r=><ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} compact/>)}
                </div>}
            </div>
          )}
          <div style={{marginTop:16,background:"white",borderRadius:16,padding:14,boxShadow:"0 2px 8px rgba(42,61,42,0.06)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#9aaa9a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Resumo</div>
            <div style={{display:"flex",gap:8}}>
              {[{label:"Pendentes",value:active.length,color:"#3A6EA5"},{label:"Urgentes",value:urgentCount,color:"#D4523A"},{label:"Concluídos",value:done.length,color:"#7DBE8E"}].map(s=>(
                <div key={s.label} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:10,background:`rgba(${hexRgb(s.color)},0.07)`}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:"#9aaa9a",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showAdd&&<AddSheet {...AddSheetProps} isDesktop={true}/>}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f7f9f6",fontFamily:"'Nunito','DM Sans',system-ui,sans-serif",maxWidth:480,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",cursor:"pointer"}} onClick={()=>setScreen("main")}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <span style={{fontSize:20,fontWeight:900,color:"#2a3d2a",fontFamily:"'Georgia',serif",letterSpacing:"-0.5px"}}>Loculus</span>
        <div style={{position:"relative"}}>
          <button onClick={()=>setScreen("catEdit")} style={btnIcon()}>🗂️</button>
          {urgentCount>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"#D4523A",color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #f7f9f6"}}>{urgentCount}</div>}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 14px",scrollbarWidth:"none"}}>
        {screen==="main"&&<>{FilterChips}{ReminderList}</>}
        {screen==="calendar"&&(
          <>
            <div style={{marginBottom:16}}><CalendarWidget reminders={reminders} onDaySelect={setCalSelDay} selectedDay={calSelDay}/></div>
            {calSelDay?(
              <>
                <div style={{fontSize:12,fontWeight:700,color:"#9aaa9a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{formatDateLabel(calSelDay)}</div>
                {reminders.filter(r=>r.date===calSelDay).length===0
                  ?<div style={{textAlign:"center",color:"#bbb",fontSize:13,marginTop:20}}>Nenhum lembrete nesse dia 🌿</div>
                  :<div style={{display:"flex",flexDirection:"column"}}>
                    {reminders.filter(r=>r.date===calSelDay).map(r=><ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder}/>)}
                  </div>}
              </>
            ):<div style={{textAlign:"center",color:"#bbb",fontSize:13,marginTop:20}}>Toque em um dia para ver os lembretes</div>}
          </>
        )}
        {screen==="done"&&(
          <>
            <div style={{fontSize:16,fontWeight:800,color:"#2a3d2a",marginBottom:12,paddingTop:4}}>Gaveta de Concluídos</div>
            {DoneDrawer}
          </>
        )}
        {screen==="catEdit"&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingTop:4}}>
              <button onClick={()=>setScreen("main")} style={btnIcon()}>←</button>
              <span style={{fontSize:16,fontWeight:800,color:"#2a3d2a"}}>Editar Gavetas</span>
            </div>
            {CatEditor}
          </>
        )}
        <div style={{height:100}}/>
      </div>
      <BottomBar screen={screen} onAdd={()=>setShowAdd(true)} onMain={()=>setScreen("main")} onCal={()=>setScreen("calendar")} onDone={()=>setScreen("done")} onLock={lock}/>
      {showAdd&&<AddSheet {...AddSheetProps} isDesktop={false}/>}
    </div>
  );
}
