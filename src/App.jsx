import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { Home, Calendar, CheckCircle2, Settings, Lock, Plus, Pencil, X, ChevronLeft, ChevronRight, Star, Zap, Check, ArrowLeft } from "lucide-react";

const supabase = createClient(
  'https://unjbdcjcfqmytapxyvuf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamJkY2pjZnFteXRhcHh5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTQ1NDAsImV4cCI6MjA5MjI5MDU0MH0.Wvc2IaYUib3zO1b92tAd5d9pH4Tpzr6cMm9yGKEelKs'
);

const IMG_URL = "https://unjbdcjcfqmytapxyvuf.supabase.co/storage/v1/object/public/assets/IMG_8652.png";

/* ============ DESIGN TOKENS ============ */
const T = {
  bg: "#F7F7F3",
  surface: "#FFFFFF",
  sage: "#7A9B76",
  olive: "#8D9B4C",
  terracotta: "#C96D52",
  coral: "#D96A57",
  petrol: "#486C78",
  text: "#2F342F",
  textSec: "#6C726C",
  textTert: "#A6ABA3",
  border: "#ECECE7",
  radiusLg: 22,
  radiusMd: 16,
  radiusSm: 10,
  shadow: "0 1px 2px rgba(47,52,47,0.05), 0 6px 20px rgba(47,52,47,0.05)",
  shadowHover: "0 2px 6px rgba(47,52,47,0.07), 0 14px 34px rgba(47,52,47,0.09)",
  shadowFloat: "0 10px 40px rgba(47,52,47,0.16)",
  fontDisplay: "'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
  fontBody: "'SF Pro Text',-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
};

function hashPin(pin) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin + "loculus_salt_2026"))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));
}
function hexRgb(hex = "#888") {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function getCat(cats, id) { return cats.find(c => c.id === id) || { color: T.textTert, label: "—" }; }
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
  if (dateStr === t) return "Hoje";
  if (dateStr === tom.toISOString().slice(0,10)) return "Amanhã";
  if (dateStr === yest.toISOString().slice(0,10)) return "Ontem";
  const d = new Date(dateStr+"T12:00:00");
  const s = d.toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"});
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function priorityOf(r) {
  if (r.urgente) return { label: "Urgente", color: T.coral };
  if (r.importante) return { label: "Importante", color: T.terracotta };
  return null;
}
const iconBtnStyle = (active=false) => ({
  width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  background: active ? "rgba(47,52,47,0.07)" : "transparent",
  color: active ? T.sage : T.textSec, transition: "background .15s ease",
});

/* ============ PIN COMPONENTS ============ */
function PinPad({ value, onChange, onSubmit, error, label, sublabel }) {
  const digits = [1,2,3,4,5,6,7,8,9,null,0,"del"];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      {label && <div style={{fontSize:19,fontWeight:600,color:T.text,marginBottom:6,textAlign:"center",fontFamily:T.fontDisplay,letterSpacing:"-0.3px"}}>{label}</div>}
      {sublabel && <div style={{fontSize:13,color:T.textSec,marginBottom:28,textAlign:"center"}}>{sublabel}</div>}
      <div style={{display:"flex",gap:12,marginBottom:32}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{width:9,height:9,borderRadius:"50%",
            background:i<value.length?T.sage:T.border,transition:"background 0.15s ease"}}/>
        ))}
      </div>
      {error && <div style={{fontSize:13,color:T.coral,fontWeight:500,marginBottom:16,
        textAlign:"center",background:`rgba(${hexRgb(T.coral)},0.08)`,padding:"8px 16px",borderRadius:T.radiusSm}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:240}}>
        {digits.map((d,i)=>(
          <button key={i} onClick={()=>{
            if(d===null)return;
            if(d==="del"){onChange(value.slice(0,-1));return;}
            if(value.length>=6)return;
            const next=value+d; onChange(next);
            if(next.length===6)onSubmit(next);
          }} style={{
            height:58,borderRadius:T.radiusMd,
            background:d===null?"transparent":T.surface,
            border:d===null?"none":`1px solid ${T.border}`,
            fontSize:19,fontWeight:500,color:d==="del"?T.coral:T.text,
            cursor:d===null?"default":"pointer",
            boxShadow:d!==null?T.shadow:"none",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:T.fontBody,
          }}>{d===null?"":d==="del"?"⌫":d}</button>
        ))}
      </div>
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,
      display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontBody}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 24px"}}>
        <div style={{width:72,height:72,borderRadius:20,overflow:"hidden",marginBottom:22,boxShadow:T.shadow}}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{fontSize:26,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,letterSpacing:"-0.5px",marginBottom:36}}>Loculus</div>
        {children}
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
  function handleFirst(pin){if(pin.length===6){setFirst(pin);setStep("confirm");}}
  async function handleConfirm(pin){
    if(pin.length<6)return;
    if(pin!==first){setError("PINs não conferem.");setSecond("");setStep("create");setFirst("");return;}
    setLoading(true);
    try{const hash=await hashPin(pin);await supabase.from("loculus_pin").insert({pin_hash:hash});sessionStorage.setItem("loculus_auth","1");onDone();}
    catch(e){setError("Erro ao salvar PIN.");}finally{setLoading(false);}
  }
  return (
    <AuthShell>
      {loading?<div style={{color:T.textSec,fontSize:14}}>Salvando PIN…</div>
        :step==="create"?<PinPad value={first} onChange={setFirst} onSubmit={handleFirst} error={error} label="Crie seu PIN" sublabel="6 dígitos para proteger seu espaço"/>
        :<PinPad value={second} onChange={setSecond} onSubmit={handleConfirm} error={error} label="Confirme o PIN" sublabel="Digite novamente para confirmar"/>}
    </AuthShell>
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
    <AuthShell>
      {loading?<div style={{color:T.textSec,fontSize:14}}>Verificando…</div>
        :<PinPad value={pin} onChange={setPin} onSubmit={handleSubmit} error={error} label="Digite seu PIN" sublabel=""/>}
      {attempts>=3&&<button onClick={onForgot} style={{marginTop:24,background:"none",border:"none",color:T.coral,fontSize:13,fontWeight:600,cursor:"pointer"}}>Esqueci meu PIN</button>}
    </AuthShell>
  );
}

/* ============ CALENDAR ============ */
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
    <div style={{background:T.surface,borderRadius:T.radiusLg,padding:18,boxShadow:T.shadow,border:`1px solid ${T.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setOffset(o=>o-1)} style={iconBtnStyle()}><ChevronLeft size={16} strokeWidth={1.75}/></button>
        <span style={{fontSize:14,fontWeight:600,color:T.text,textTransform:"capitalize",fontFamily:T.fontDisplay}}>{monthLabel}</span>
        <button onClick={()=>setOffset(o=>o+1)} style={iconBtnStyle()}><ChevronRight size={16} strokeWidth={1.75}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>
        {WD.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:600,color:T.textTert}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {monthDays.map((d,i)=>{
          if(!d)return <div key={`e${i}`}/>;
          const dStr=ds(d);const isToday=dStr===todayStr();const isSel=selectedDay===dStr;
          const dayRems=remsOnDay(d);const count=dayRems.length;const hasUrgent=dayRems.some(r=>r.urgente);
          return (
            <div key={i} onClick={()=>onDaySelect(isSel?null:dStr)} style={{
              borderRadius:10,padding:"5px 2px",textAlign:"center",cursor:"pointer",minHeight:34,
              background:isSel?T.sage:isToday?`rgba(${hexRgb(T.sage)},0.1)`:"transparent",
              transition:"background .15s ease",
            }}>
              <div style={{fontSize:12.5,fontWeight:isToday||isSel?700:500,color:isSel?"white":isToday?T.sage:T.text}}>{d.getDate()}</div>
              {count>0&&<div style={{display:"flex",gap:2,justifyContent:"center",marginTop:2}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:isSel?"white":hasUrgent?T.coral:T.sage}}/>
                {count>1&&<div style={{width:4,height:4,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.6)":T.petrol}}/>}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ TASK CARD ============ */
function TaskCard({ r, cat, onToggle, onDelete, onEdit, compact=false }) {
  const [hover,setHover]=useState(false);
  const priority = priorityOf(r);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{
      display:"flex",alignItems:"center",gap:12,
      background:T.surface,borderRadius:T.radiusMd,
      padding:compact?"10px 12px":"13px 14px",
      marginBottom:8,border:`1px solid ${T.border}`,
      borderLeft:`3px solid ${cat.color}`,
      boxShadow:hover?T.shadowHover:T.shadow,
      transform:hover?"translateY(-1px)":"none",
      opacity:r.done?0.5:1,
      transition:"transform .15s ease, box-shadow .15s ease",
    }}>
      <button onClick={()=>onToggle(r.id,r.done)} style={{
        width:20,height:20,borderRadius:"50%",flexShrink:0,cursor:"pointer",
        border:`1.5px solid ${r.done?cat.color:T.border}`,
        background:r.done?cat.color:"transparent",padding:0,
        display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",
        transition:"all .15s ease",
      }}>{r.done && <Check size={12} strokeWidth={3}/>}</button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:compact?13:14.5,fontWeight:500,color:T.text,
          textDecoration:r.done?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          fontFamily:T.fontBody}}>{r.text}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
          <span style={{fontSize:10.5,fontWeight:600,color:cat.color,
            background:`rgba(${hexRgb(cat.color)},0.1)`,padding:"2px 8px",borderRadius:20}}>{cat.label}</span>
          {r.time && <span style={{fontSize:11,color:T.textSec}}>{r.time.slice(0,5)}</span>}
          {priority && (
            <span style={{display:"flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:700,color:priority.color,letterSpacing:"0.04em",textTransform:"uppercase"}}>
              {r.urgente ? <Zap size={10} strokeWidth={2.5}/> : <Star size={10} strokeWidth={2.5}/>}
              {priority.label}
            </span>
          )}
        </div>
      </div>
      {hover && (
        <div style={{display:"flex",gap:2}}>
          <button onClick={()=>onEdit(r)} style={iconBtnStyle()}><Pencil size={14} strokeWidth={1.75}/></button>
          <button onClick={()=>onDelete(r.id)} style={{...iconBtnStyle(),color:T.coral}}><X size={15} strokeWidth={1.75}/></button>
        </div>
      )}
    </div>
  );
}

/* ============ DASHBOARD ============ */
function DashboardCards({ active, done, urgentCount, todayCount, overdueCount }) {
  const items = [
    { label:"Hoje", value:todayCount, color:T.petrol },
    { label:"Concluídos", value:done.length, color:T.sage },
    { label:"Atrasados", value:overdueCount, color:T.terracotta },
    { label:"Urgentes", value:urgentCount, color:T.coral },
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22}}>
      {items.map(it=>(
        <div key={it.label} style={{background:T.surface,borderRadius:T.radiusMd,padding:"14px 16px",
          border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
          <div style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,letterSpacing:"-0.5px"}}>{it.value}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:it.color}}/>
            <div style={{fontSize:11.5,color:T.textSec,fontWeight:500}}>{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ ADD / EDIT SHEET ============ */
function AddSheet({ categories,nText,setNText,nCat,setNCat,nDate,setNDate,
  nTime,setNTime,nUrgente,setNUrgente,nImportante,setNImportante,
  onAdd,onClose,inputRef,loading,isDesktop,onAddCategory,isEditing }) {
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(T.sage);
  const [savingCat, setSavingCat] = useState(false);

  const fieldStyle = {width:"100%",padding:"11px 14px",borderRadius:T.radiusSm,border:`1px solid ${T.border}`,
    fontSize:14,background:T.bg,outline:"none",color:T.text,boxSizing:"border-box",fontFamily:T.fontBody};

  async function handleAddCat() {
    if (!newCatLabel.trim()) return;
    setSavingCat(true);
    const newCat = await onAddCategory(newCatLabel.trim(), newCatColor);
    if (newCat) setNCat(newCat.id);
    setNewCatLabel(""); setNewCatColor(T.sage);
    setShowNewCat(false); setSavingCat(false);
  }

  const content = (
    <>
      <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"0 auto 20px"}}/>
      <div style={{fontSize:17,fontWeight:600,color:T.text,marginBottom:16,fontFamily:T.fontDisplay,letterSpacing:"-0.3px"}}>{isEditing?"Editar tarefa":"Nova tarefa"}</div>
      <input ref={inputRef} value={nText} onChange={e=>setNText(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&onAdd()} placeholder="O que você precisa fazer?"
        style={{...fieldStyle,marginBottom:10}}/>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input type="date" value={nDate} onChange={e=>setNDate(e.target.value)} style={{...fieldStyle,flex:1}}/>
        <input type="time" value={nTime} onChange={e=>setNTime(e.target.value)} style={{...fieldStyle,width:100}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>setNCat(cat.id)} style={{
            padding:"6px 13px",borderRadius:20,cursor:"pointer",fontWeight:600,fontSize:12,
            border:nCat===cat.id?"none":`1px solid ${T.border}`,
            background:nCat===cat.id?cat.color:T.surface,color:nCat===cat.id?"white":T.textSec,
            display:"flex",alignItems:"center",gap:5,fontFamily:T.fontBody,
          }}>
            {nCat!==cat.id&&<span style={{width:6,height:6,borderRadius:"50%",background:cat.color,display:"inline-block"}}/>}
            {cat.label}
          </button>
        ))}
        <button onClick={()=>setShowNewCat(v=>!v)} style={{
          padding:"6px 12px",borderRadius:20,cursor:"pointer",fontWeight:600,fontSize:12,
          border:`1px dashed ${showNewCat?T.sage:T.textTert}`,
          background:showNewCat?`rgba(${hexRgb(T.sage)},0.07)`:"transparent",
          color:showNewCat?T.sage:T.textTert,display:"flex",alignItems:"center",gap:4,
        }}><Plus size={12} strokeWidth={2.5}/> Gaveta</button>
      </div>
      {showNewCat&&(
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:12,
          padding:"8px 10px",borderRadius:T.radiusSm,background:T.bg,border:`1px solid ${T.border}`}}>
          <input placeholder="Nome da gaveta" value={newCatLabel}
            onChange={e=>setNewCatLabel(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleAddCat()}
            style={{...fieldStyle,background:T.surface,padding:"7px 10px"}}/>
          <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)}
            style={{width:30,height:30,border:"none",borderRadius:8,cursor:"pointer",padding:2,flexShrink:0}}/>
          <button onClick={handleAddCat} disabled={savingCat||!newCatLabel.trim()} style={{
            width:30,height:30,borderRadius:8,border:"none",flexShrink:0,
            background:savingCat||!newCatLabel.trim()?T.border:T.sage,
            color:"white",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{savingCat?"…":<Check size={14} strokeWidth={2.5}/>}</button>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <button onClick={()=>setNUrgente(!nUrgente)} style={{
          flex:1,padding:"10px",borderRadius:T.radiusSm,cursor:"pointer",fontWeight:600,fontSize:13,
          border:`1px solid ${nUrgente?T.coral:T.border}`,
          background:nUrgente?`rgba(${hexRgb(T.coral)},0.08)`:T.surface,color:nUrgente?T.coral:T.textSec,
          fontFamily:T.fontBody,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}><Zap size={13} strokeWidth={2}/> Urgente</button>
        <button onClick={()=>setNImportante(!nImportante)} style={{
          flex:1,padding:"10px",borderRadius:T.radiusSm,cursor:"pointer",fontWeight:600,fontSize:13,
          border:`1px solid ${nImportante?T.terracotta:T.border}`,
          background:nImportante?`rgba(${hexRgb(T.terracotta)},0.08)`:T.surface,color:nImportante?T.terracotta:T.textSec,
          fontFamily:T.fontBody,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}><Star size={13} strokeWidth={2}/> Importante</button>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:T.radiusSm,border:`1px solid ${T.border}`,background:T.surface,color:T.textSec,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancelar</button>
        <button onClick={onAdd} disabled={loading} style={{flex:2,padding:"12px",borderRadius:T.radiusSm,border:"none",background:T.sage,color:"white",fontSize:14,fontWeight:600,cursor:"pointer",opacity:loading?0.6:1}}>{loading?"Salvando…":isEditing?"Salvar":"Adicionar"}</button>
      </div>
    </>
  );

  if(isDesktop) return (
    <div style={{position:"fixed",inset:0,background:"rgba(47,52,47,0.25)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.surface,borderRadius:T.radiusLg,padding:"26px 26px 28px",width:460,boxShadow:T.shadowFloat}}>{content}</div>
    </div>
  );
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:T.surface,borderRadius:"24px 24px 0 0",padding:"18px 20px 34px",boxShadow:T.shadowFloat}}>
      {content}
    </div>
  );
}

/* ============ GAVETA (CATEGORY) EDITOR ============ */
function CategoryEditor({ categories, editCatId, setEditCatId, editLabel, setEditLabel,
  editColor, setEditColor, updateCategory, deleteCategory, newCatLabel, setNewCatLabel,
  newCatColor, setNewCatColor, addCategory }) {
  return (
    <div>
      {categories.map(cat=>(
        <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
          borderRadius:T.radiusMd,background:T.surface,marginBottom:8,border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
          {editCatId===cat.id?(
            <>
              <input value={editLabel} onChange={e=>setEditLabel(e.target.value)} style={{flex:1,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",fontSize:14}}/>
              <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} style={{width:30,height:30,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
              <button onClick={()=>updateCategory(cat.id)} style={{...iconBtnStyle(),background:T.sage,color:"white"}}><Check size={14} strokeWidth={2.5}/></button>
            </>
          ):(
            <>
              <span style={{flex:1,fontSize:14,fontWeight:500,color:T.text}}>{cat.label}</span>
              <button onClick={()=>{setEditCatId(cat.id);setEditLabel(cat.label);setEditColor(cat.color);}} style={iconBtnStyle()}><Pencil size={14} strokeWidth={1.75}/></button>
              <button onClick={()=>deleteCategory(cat.id)} style={{...iconBtnStyle(),color:T.coral}}><X size={15} strokeWidth={1.75}/></button>
            </>
          )}
        </div>
      ))}
      <div style={{padding:"14px 16px",borderRadius:T.radiusMd,marginTop:8,background:T.bg,border:`1px dashed ${T.textTert}`}}>
        <div style={{fontSize:12.5,fontWeight:600,color:T.sage,marginBottom:10}}>Nova gaveta</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input placeholder="Nome" value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()}
            style={{flex:1,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:14,outline:"none",background:T.surface}}/>
          <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} style={{width:36,height:36,border:"none",borderRadius:8,cursor:"pointer",padding:2}}/>
          <button onClick={addCategory} style={{width:36,height:36,borderRadius:8,border:"none",background:T.sage,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={16} strokeWidth={2.5}/></button>
        </div>
      </div>
    </div>
  );
}

/* ============ NAV (sidebar + mobile bottom bar) ============ */
function NavItem({ label, count, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",
      borderRadius:T.radiusSm,border:"none",cursor:"pointer",marginBottom:2,
      background:active?`rgba(${hexRgb(T.sage)},0.1)`:"transparent",
      color:active?T.sage:T.text,fontSize:13.5,fontWeight:active?600:500,
      textAlign:"left",fontFamily:T.fontBody,
    }}>
      {dot && <span style={{width:7,height:7,borderRadius:"50%",background:dot,flexShrink:0}}/>}
      <span style={{flex:1}}>{label}</span>
      {count>0 && <span style={{fontSize:11,fontWeight:600,color:active?T.sage:T.textTert}}>{count}</span>}
    </button>
  );
}

function BottomBar({ screen, onAdd, onMain, onCal, onLock, onDone }) {
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,
      background:"rgba(247,247,243,0.92)",backdropFilter:"blur(16px)",
      padding:"10px 24px 28px",display:"flex",alignItems:"center",justifyContent:"space-around",
      borderTop:`1px solid ${T.border}`}}>
      <button onClick={onLock} style={iconBtnStyle()}><Lock size={17} strokeWidth={1.75}/></button>
      <button onClick={onMain} style={iconBtnStyle(screen==="main")}><Home size={17} strokeWidth={1.75}/></button>
      <button onClick={onAdd} style={{width:48,height:48,borderRadius:"50%",background:T.sage,color:"white",
        border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:`0 6px 18px rgba(${hexRgb(T.sage)},0.4)`}}><Plus size={24} strokeWidth={2.2}/></button>
      <button onClick={onCal} style={iconBtnStyle(screen==="calendar")}><Calendar size={17} strokeWidth={1.75}/></button>
      <button onClick={onDone} style={iconBtnStyle(screen==="done")}><CheckCircle2 size={17} strokeWidth={1.75}/></button>
    </div>
  );
}

/* ============ MAIN APP ============ */
export default function App() {
  const isDesktop = useIsDesktop();
  const [authState,   setAuthState]   = useState("loading");
  const [screen,      setScreen]      = useState("main");
  const [categories,  setCategories]  = useState([]);
  const [reminders,   setReminders]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeCat,   setActiveCat]   = useState("hoje");
  const [showAdd,     setShowAdd]     = useState(false);
  const [calSelDay,   setCalSelDay]   = useState(null);
  const [editCatId,   setEditCatId]   = useState(null);
  const [editLabel,   setEditLabel]   = useState("");
  const [editColor,   setEditColor]   = useState(T.sage);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(T.sage);
  const [nText,       setNText]       = useState("");
  const [nCat,        setNCat]        = useState("");
  const [nDate,       setNDate]       = useState(todayStr());
  const [nTime,       setNTime]       = useState("09:00");
  const [nUrgente,    setNUrgente]    = useState(false);
  const [nImportante, setNImportante] = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const inputRef = useRef(null);

  function startEdit(r){
    setEditingId(r.id);
    setNText(r.text);
    setNCat(r.category_id||"");
    setNDate(r.date);
    setNTime((r.time||"09:00:00").slice(0,5));
    setNUrgente(!!r.urgente);
    setNImportante(!!r.importante);
    setShowAdd(true);
  }

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

  async function saveReminder(){
    if(!nText.trim())return;setSaving(true);
    try{
      if(editingId){
        const{data,error}=await supabase.from("loculus_reminders").update({
          text:nText.trim(),category_id:nCat||null,date:nDate,time:nTime+":00",
          urgente:nUrgente,importante:nImportante,
        }).eq("id",editingId).select().single();
        if(error)throw error;
        setReminders(prev=>prev.map(r=>r.id===editingId?data:r));
      }else{
        const{data,error}=await supabase.from("loculus_reminders").insert({
          text:nText.trim(),category_id:nCat||null,date:nDate,time:nTime+":00",
          done:false,urgente:nUrgente,importante:nImportante,
        }).select().single();
        if(error)throw error;
        setReminders(prev=>[...prev,data]);
      }
      setNText("");setNUrgente(false);setNImportante(false);setNDate(todayStr());setNTime("09:00");setShowAdd(false);setEditingId(null);
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
    setCategories(prev=>[...prev,data]);setNewCatLabel("");setNewCatColor(T.sage);
  }
  async function addCategoryInline(label, color) {
    const { data, error } = await supabase.from("loculus_categories").insert({
      label, color, position: categories.length,
    }).select().single();
    if (error) { alert("Erro: " + error.message); return null; }
    setCategories(prev => [...prev, data]);
    return data;
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
  const t = todayStr();
  const todayCount = active.filter(r=>r.date===t).length;
  const overdueCount = active.filter(r=>r.date<t).length;
  const urgentCount = active.filter(r=>r.urgente).length;
  const importantCount = active.filter(r=>r.importante).length;

  const filtered =
    activeCat==="hoje" ? active.filter(r=>r.date===t) :
    activeCat==="proximos" ? active.filter(r=>r.date>t) :
    activeCat==="todos" ? active :
    activeCat==="urgente" ? active.filter(r=>r.urgente) :
    activeCat==="importante" ? active.filter(r=>r.importante) :
    active.filter(r=>r.category_id===activeCat);

  const byDate=filtered.reduce((acc,r)=>{acc[r.date]=acc[r.date]||[];acc[r.date].push(r);return acc;},{});
  const sortedDates=Object.keys(byDate).sort();

  if(authState==="loading")return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontBody,color:T.textSec,fontSize:14}}>Carregando…</div>
  );
  if(authState==="setup")return <PinSetup onDone={()=>{setAuthState("ok");loadAll();}}/>;
  if(authState==="login")return <PinLogin onSuccess={()=>{setAuthState("ok");loadAll();}} onForgot={handleForgotPin}/>;

  const AddSheetProps={categories,nText,setNText,nCat,setNCat,nDate,setNDate,nTime,setNTime,nUrgente,setNUrgente,nImportante,setNImportante,onAdd:saveReminder,onClose:()=>{setShowAdd(false);setEditingId(null);},inputRef,loading:saving,onAddCategory:addCategoryInline,isEditing:!!editingId};

  const TaskList = (dates, source) => (
    loading ? <div style={{textAlign:"center",color:T.textTert,fontSize:14,marginTop:60}}>Carregando…</div>
    : dates.length===0 ? (
      <div style={{textAlign:"center",color:T.textTert,fontSize:14,marginTop:60,padding:"40px 20px"}}>
        <div style={{fontSize:32,marginBottom:10,opacity:0.4}}>◌</div>
        <div>Tudo organizado por aqui</div>
      </div>
    ) : dates.map(date=>(
      <div key={date}>
        <div style={{fontSize:11,color:T.textTert,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",margin:"14px 0 8px"}}>{formatDateLabel(date)}</div>
        {source[date].map(r=><TaskCard key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onEdit={startEdit}/>)}
      </div>
    ))
  );

  const DoneList = (
    done.length===0
      ? <div style={{textAlign:"center",color:T.textTert,fontSize:14,marginTop:60}}>Nenhuma tarefa concluída</div>
      : <>
          <div style={{fontSize:12,color:T.textSec,marginBottom:12}}>{done.length} concluída{done.length!==1?"s":""} · apagadas automaticamente após 30 dias</div>
          {done.map(r=><TaskCard key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onEdit={startEdit} compact/>)}
        </>
  );

  const navItems = [
    { id:"hoje", label:"Hoje", count:todayCount },
    { id:"proximos", label:"Próximos", count:active.filter(r=>r.date>t).length },
    { id:"todos", label:"Todos", count:active.length },
    { id:"urgente", label:"Urgentes", count:urgentCount, dot:T.coral },
    { id:"importante", label:"Importantes", count:importantCount, dot:T.terracotta },
  ];

  if(isDesktop) return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.fontBody,display:"flex"}}>
      <div style={{width:220,flexShrink:0,borderRight:`1px solid ${T.border}`,padding:"22px 14px",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px",marginBottom:26,cursor:"pointer"}} onClick={()=>setScreen("main")}>
          <div style={{width:30,height:30,borderRadius:9,overflow:"hidden"}}><img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
          <span style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,letterSpacing:"-0.3px"}}>Loculus</span>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{margin:"0 4px 20px",padding:"9px 14px",borderRadius:T.radiusSm,border:"none",
          background:T.sage,color:"white",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          <Plus size={15} strokeWidth={2.2}/> Nova tarefa
        </button>
        <div style={{padding:"0 4px"}}>
          {navItems.map(n=><NavItem key={n.id} label={n.label} count={n.count} dot={n.dot} active={screen==="main"&&activeCat===n.id} onClick={()=>{setScreen("main");setActiveCat(n.id);}}/>)}
        </div>
        <div style={{fontSize:10.5,fontWeight:700,color:T.textTert,textTransform:"uppercase",letterSpacing:"0.06em",margin:"20px 8px 6px"}}>Gavetas</div>
        <div style={{padding:"0 4px",flex:1,overflowY:"auto"}}>
          {categories.map(cat=>(
            <NavItem key={cat.id} label={cat.label} count={active.filter(r=>r.category_id===cat.id).length} dot={cat.color} active={screen==="main"&&activeCat===cat.id} onClick={()=>{setScreen("main");setActiveCat(cat.id);}}/>
          ))}
        </div>
        <div style={{padding:"0 4px",marginTop:8,display:"flex",flexDirection:"column",gap:2}}>
          <NavItem label="Concluídos" active={screen==="done"} onClick={()=>setScreen("done")}/>
          <NavItem label="Editar gavetas" active={screen==="catEdit"} onClick={()=>setScreen("catEdit")}/>
          <NavItem label="Bloquear" onClick={lock}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        {screen==="main" && (
          <>
            <div style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,letterSpacing:"-0.5px",marginBottom:18,textTransform:"capitalize"}}>
              {navItems.find(n=>n.id===activeCat)?.label || getCat(categories,activeCat).label}
            </div>
            <DashboardCards active={active} done={done} urgentCount={urgentCount} todayCount={todayCount} overdueCount={overdueCount}/>
            {TaskList(sortedDates, byDate)}
          </>
        )}
        {screen==="done" && (<><div style={{fontSize:22,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,marginBottom:18}}>Concluídos</div>{DoneList}</>)}
        {screen==="catEdit" && (<><div style={{fontSize:22,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,marginBottom:18}}>Gavetas</div>
          <CategoryEditor categories={categories} editCatId={editCatId} setEditCatId={setEditCatId} editLabel={editLabel} setEditLabel={setEditLabel}
            editColor={editColor} setEditColor={setEditColor} updateCategory={updateCategory} deleteCategory={deleteCategory}
            newCatLabel={newCatLabel} setNewCatLabel={setNewCatLabel} newCatColor={newCatColor} setNewCatColor={setNewCatColor} addCategory={addCategory}/>
        </>)}
      </div>

      <div style={{width:290,flexShrink:0,padding:"28px 28px 28px 0",overflowY:"auto"}}>
        <CalendarWidget reminders={reminders} onDaySelect={setCalSelDay} selectedDay={calSelDay}/>
        {calSelDay&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,fontWeight:700,color:T.textTert,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{formatDateLabel(calSelDay)}</div>
            {reminders.filter(r=>r.date===calSelDay).length===0
              ?<div style={{textAlign:"center",color:T.textTert,fontSize:13,padding:"16px 0"}}>Nenhuma tarefa</div>
              :reminders.filter(r=>r.date===calSelDay).map(r=><TaskCard key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onEdit={startEdit} compact/>)}
          </div>
        )}
        <div style={{marginTop:16,background:T.surface,borderRadius:T.radiusLg,padding:16,border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textTert,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Resumo</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{label:"Pendentes",value:active.length,color:T.petrol},{label:"Urgentes",value:urgentCount,color:T.coral},{label:"Concluídos",value:done.length,color:T.sage}].map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:s.color}}/>
                  <span style={{fontSize:12.5,color:T.textSec}}>{s.label}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:T.text}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showAdd&&<AddSheet {...AddSheetProps} isDesktop={true}/>}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.fontBody,maxWidth:480,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 18px 8px",flexShrink:0}}>
        <div style={{width:32,height:32,borderRadius:9,overflow:"hidden",cursor:"pointer"}} onClick={()=>setScreen("main")}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <span style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:T.fontDisplay,letterSpacing:"-0.3px"}}>Loculus</span>
        <div style={{position:"relative"}}>
          <button onClick={()=>setScreen("catEdit")} style={iconBtnStyle()}><Settings size={17} strokeWidth={1.75}/></button>
          {urgentCount>0&&<div style={{position:"absolute",top:-2,right:-2,width:15,height:15,borderRadius:"50%",background:T.coral,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.bg}`}}>{urgentCount}</div>}
        </div>
      </div>

      <div style={{display:"flex",gap:6,padding:"8px 16px 14px",overflowX:"auto"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setActiveCat(n.id)} style={{
            flexShrink:0,padding:"7px 14px",borderRadius:20,cursor:"pointer",
            border:activeCat===n.id?"none":`1px solid ${T.border}`,
            background:activeCat===n.id?T.sage:T.surface,color:activeCat===n.id?"white":T.textSec,
            fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",
          }}>{n.label}</button>
        ))}
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
            flexShrink:0,padding:"7px 14px",borderRadius:20,cursor:"pointer",
            border:activeCat===cat.id?"none":`1px solid ${T.border}`,
            background:activeCat===cat.id?cat.color:T.surface,color:activeCat===cat.id?"white":T.textSec,
            fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,
          }}>{activeCat!==cat.id&&<span style={{width:6,height:6,borderRadius:"50%",background:cat.color}}/>}{cat.label}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 16px"}}>
        {screen==="main" && <>
          <DashboardCards active={active} done={done} urgentCount={urgentCount} todayCount={todayCount} overdueCount={overdueCount}/>
          {TaskList(sortedDates, byDate)}
        </>}
        {screen==="calendar" && (
          <>
            <div style={{marginBottom:16}}><CalendarWidget reminders={reminders} onDaySelect={setCalSelDay} selectedDay={calSelDay}/></div>
            {calSelDay?(
              <>
                <div style={{fontSize:11,fontWeight:700,color:T.textTert,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{formatDateLabel(calSelDay)}</div>
                {reminders.filter(r=>r.date===calSelDay).length===0
                  ?<div style={{textAlign:"center",color:T.textTert,fontSize:13,marginTop:20}}>Nenhuma tarefa nesse dia</div>
                  :reminders.filter(r=>r.date===calSelDay).map(r=><TaskCard key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onEdit={startEdit}/>)}
              </>
            ):<div style={{textAlign:"center",color:T.textTert,fontSize:13,marginTop:20}}>Toque em um dia para ver as tarefas</div>}
          </>
        )}
        {screen==="done" && (<><div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:12,paddingTop:4,fontFamily:T.fontDisplay}}>Concluídos</div>{DoneList}</>)}
        {screen==="catEdit" && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingTop:4}}>
              <button onClick={()=>setScreen("main")} style={iconBtnStyle()}><ArrowLeft size={17} strokeWidth={1.75}/></button>
              <span style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:T.fontDisplay}}>Gavetas</span>
            </div>
            <CategoryEditor categories={categories} editCatId={editCatId} setEditCatId={setEditCatId} editLabel={editLabel} setEditLabel={setEditLabel}
              editColor={editColor} setEditColor={setEditColor} updateCategory={updateCategory} deleteCategory={deleteCategory}
              newCatLabel={newCatLabel} setNewCatLabel={setNewCatLabel} newCatColor={newCatColor} setNewCatColor={setNewCatColor} addCategory={addCategory}/>
          </>
        )}
        <div style={{height:100}}/>
      </div>
      <BottomBar screen={screen} onAdd={()=>setShowAdd(true)} onMain={()=>setScreen("main")} onCal={()=>setScreen("calendar")} onDone={()=>setScreen("done")} onLock={lock}/>
      {showAdd&&<AddSheet {...AddSheetProps} isDesktop={false}/>}
    </div>
  );
}
