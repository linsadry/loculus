import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const IMG_URL = "https://unjbdcjcfqmytapxyvuf.supabase.co/storage/v1/object/public/assets/IMG_8652.png";
const STORAGE_URL = "https://unjbdcjcfqmytapxyvuf.supabase.co/storage/v1/object/public/loculus-photos";

function hexRgb(hex = "#888") {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function getCat(cats, id) { return cats.find(c => c.id === id) || { color:"#aaa", label:"—" }; }
function todayStr() { return new Date().toISOString().slice(0,10); }

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
  return { width:36, height:36, borderRadius:"50%", background:bg, color, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, flexShrink:0 };
}

function Phone({ children, bg="#f7f9f6" }) {
  return (
    <div style={{ minHeight:"100vh", background:bg, display:"flex", flexDirection:"column", fontFamily:"'Nunito','DM Sans',system-ui,sans-serif", maxWidth:480, margin:"0 auto", position:"relative" }}>
      {children}
    </div>
  );
}

function ReminderChip({ r, cat, onToggle, onDelete, onOpen }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div onClick={()=>onOpen(r)} style={{
        flex:1, display:"flex", alignItems:"center", gap:8,
        padding:"10px 14px", borderRadius:20,
        background: r.done ? `rgba(${hexRgb(cat.color)},0.25)` : cat.color,
        color:"white", fontSize:14, fontWeight:600, cursor:"pointer",
        opacity: r.done ? 0.55 : 1,
        textDecoration: r.done ? "line-through" : "none",
        boxShadow: r.done ? "none" : `0 3px 10px rgba(${hexRgb(cat.color)},0.28)`,
        transition:"all 0.15s ease",
      }}>
        <span style={{flex:1}}>{r.text}</span>
        {r.time && <span style={{fontSize:11,opacity:0.8}}>{r.time.slice(0,5)}</span>}
        {r.note && !r.done && <span style={{fontSize:11}}>📝</span>}
        {r.photo_url && !r.done && <span style={{fontSize:11}}>📷</span>}
        {r.urgente && !r.done && <span style={{fontSize:11}}>⚡</span>}
        {r.importante && !r.done && <span style={{fontSize:11}}>⭐</span>}
        <div onClick={e=>{e.stopPropagation();onToggle(r.id,r.done);}} style={{
          width:18,height:18,borderRadius:"50%",flexShrink:0,
          border:"1.5px solid rgba(255,255,255,0.55)",
          background:r.done?"rgba(255,255,255,0.45)":"transparent",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,
        }}>{r.done?"✓":""}</div>
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

function DetailSheet({ r, cat, onClose, onToggle, onDelete, onSaveNote, onSavePhoto }) {
  const [note, setNote] = useState(r.note || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${r.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('loculus-photos').upload(path, file, { upsert: true });
    if (!error) {
      const url = `${STORAGE_URL}/${path}`;
      await onSavePhoto(r.id, url);
    }
    setUploading(false);
  }

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:480,
        background:"#fafcfa",borderRadius:"24px 24px 0 0",
        padding:"20px 20px 40px",
        boxShadow:"0 -8px 40px rgba(42,61,42,0.18)",
        maxHeight:"85vh",overflowY:"auto",
      }}>
        <div style={{width:36,height:4,background:"#d4dcd4",borderRadius:2,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
          <span style={{fontSize:11,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>{cat.label}</span>
          <div style={{flex:1}}/>
          <button onClick={()=>{onToggle(r.id,r.done);onClose();}} style={{
            padding:"6px 14px",borderRadius:12,border:"none",cursor:"pointer",
            background:r.done?"rgba(122,190,142,0.15)":"rgba(58,110,165,0.1)",
            color:r.done?"#7DBE8E":"#3A6EA5",fontSize:12,fontWeight:700,
          }}>{r.done?"↩ Reabrir":"✓ Concluir"}</button>
        </div>
        <div style={{fontSize:18,fontWeight:800,color:"#2a3d2a",marginBottom:4}}>{r.text}</div>
        <div style={{fontSize:12,color:"#8aaa8a",marginBottom:16}}>
          {formatDateLabel(r.date)}{r.time ? ` · ${r.time.slice(0,5)}` : ""}
          {r.urgente?" · ⚡":""}
          {r.importante?" · ⭐":""}
        </div>
        {r.photo_url && (
          <div style={{marginBottom:14,borderRadius:16,overflow:"hidden"}}>
            <img src={r.photo_url} alt="foto" style={{width:"100%",maxHeight:200,objectFit:"cover"}}/>
          </div>
        )}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#8aaa8a",marginBottom:6}}>NOTA</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Adicione uma nota…"
            style={{width:"100%",minHeight:80,padding:"10px 12px",borderRadius:12,
              border:"1.5px solid #d4e4d4",fontSize:14,background:"#f0f7f0",
              outline:"none",color:"#2a3d2a",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          <button onClick={e=>{e.stopPropagation();onSaveNote(r.id,note);}} style={{
            marginTop:6,padding:"7px 16px",borderRadius:10,border:"none",
            background:"#3A6EA5",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",
          }}>Salvar nota</button>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"#8aaa8a",marginBottom:6}}>FOTO</div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          <button onClick={e=>{e.stopPropagation();fileRef.current.click();}} disabled={uploading} style={{
            padding:"9px 18px",borderRadius:12,border:"1.5px dashed #b4d4b4",
            background:"rgba(122,190,142,0.08)",color:"#4a8a5a",
            fontSize:13,fontWeight:700,cursor:"pointer",
          }}>{uploading?"Enviando…":"📷 "+(r.photo_url?"Trocar foto":"Adicionar foto")}</button>
        </div>
        <button onClick={()=>{onDelete(r.id);onClose();}} style={{
          width:"100%",padding:"10px",borderRadius:14,border:"none",
          background:"rgba(212,82,58,0.08)",color:"#D4523A",
          fontSize:13,fontWeight:700,cursor:"pointer",
        }}>🗑️ Excluir lembrete</button>
      </div>
    </div>
  );
}

function AddSheet({ categories,nText,setNText,nCat,setNCat,nDate,setNDate,
  nTime,setNTime,nUrgente,setNUrgente,nImportante,setNImportante,
  onAdd,onClose,inputRef,loading }) {
  return (
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,zIndex:100,
      background:"#fafcfa",borderRadius:"24px 24px 0 0",
      padding:"20px 20px 36px",
      boxShadow:"0 -8px 40px rgba(42,61,42,0.13)",
    }}>
      <div style={{width:36,height:4,background:"#d4dcd4",borderRadius:2,margin:"0 auto 18px"}}/>
      <div style={{fontSize:15,fontWeight:800,color:"#2a3d2a",marginBottom:14}}>Nova gaveta</div>
      <input ref={inputRef} value={nText} onChange={e=>setNText(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&onAdd()}
        placeholder="O que você quer lembrar?"
        style={{width:"100%",padding:"12px 16px",borderRadius:14,
          border:"1.5px solid #d4e4d4",fontSize:14,background:"#f0f7f0",
          outline:"none",color:"#2a3d2a",boxSizing:"border-box",marginBottom:10}}/>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input type="date" value={nDate} onChange={e=>setNDate(e.target.value)}
          style={{flex:1,padding:"8px 10px",borderRadius:12,border:"1.5px solid #d4e4d4",
            fontSize:13,background:"#f0f7f0",outline:"none",color:"#2a3d2a"}}/>
        <input type="time" value={nTime} onChange={e=>setNTime(e.target.value)}
          placeholder="opcional"
          style={{width:100,padding:"8px 10px",borderRadius:12,border:"1.5px solid #d4e4d4",
            fontSize:13,background:"#f0f7f0",outline:"none",color:nTime?"#2a3d2a":"#aaa"}}/>
        {nTime && (
          <button onClick={()=>setNTime("")} style={{...btnIcon("rgba(212,82,58,0.1)","#D4523A"),fontSize:12}}>✕</button>
        )}
      </div>
      <div style={{fontSize:11,color:"#aaa",marginBottom:10,marginTop:-6}}>Hora é opcional — toque ✕ para limpar</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>setNCat(cat.id)} style={{
            padding:"5px 12px",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:12,
            border:nCat===cat.id?"none":"1.5px solid rgba(0,0,0,0.09)",
            background:nCat===cat.id?cat.color:"white",
            color:nCat===cat.id?"white":"#555",
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
        <button onClick={onClose} style={{
          flex:1,padding:"11px",borderRadius:14,border:"1.5px solid #d4e4d4",
          background:"white",color:"#6a8a72",fontSize:14,fontWeight:700,cursor:"pointer",
        }}>Cancelar</button>
        <button onClick={onAdd} disabled={loading} style={{
          flex:2,padding:"11px",borderRadius:14,border:"none",
          background:"linear-gradient(135deg,#3A6EA5,#5B8DB8)",
          color:"white",fontSize:14,fontWeight:800,cursor:"pointer",
          boxShadow:"0 4px 16px rgba(58,110,165,0.32)",opacity:loading?0.7:1,
        }}>{loading?"Salvando…":"Adicionar"}</button>
      </div>
    </div>
  );
}

function BottomBar({ screen, onAdd, onMain, onCal, onArchive }) {
  return (
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,zIndex:50,
      background:"rgba(247,249,246,0.95)",backdropFilter:"blur(10px)",
      padding:"10px 24px 28px",
      display:"flex",alignItems:"center",justifyContent:"space-around",
      borderTop:"1px solid rgba(42,61,42,0.07)",
    }}>
      <button onClick={onMain} style={{...btnIcon(screen==="main"?"#3A6EA5":"transparent",screen==="main"?"white":"#6a8a72"),width:44,height:44,fontSize:18}}>🏠</button>
      <button onClick={onAdd} style={{
        width:52,height:52,borderRadius:"50%",
        background:"linear-gradient(135deg,#3A6EA5,#5B8DB8)",
        color:"white",fontSize:26,border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 6px 20px rgba(58,110,165,0.4)",
      }}>+</button>
      <button onClick={onCal} style={{...btnIcon(screen==="calendar"?"#3A6EA5":"transparent",screen==="calendar"?"white":"#6a8a72"),width:44,height:44,fontSize:18}}>📅</button>
      <button onClick={onArchive} style={{...btnIcon(screen==="archive"?"#7DBE8E":"transparent",screen==="archive"?"white":"#6a8a72"),width:44,height:44,fontSize:18}}>📦</button>
    </div>
  );
}

export default function App() {
  const [screen,      setScreen]      = useState("home");
  const [categories,  setCategories]  = useState([]);
  const [reminders,   setReminders]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeCat,   setActiveCat]   = useState("todos");
  const [showAdd,     setShowAdd]     = useState(false);
  const [calView,     setCalView]     = useState("week");
  const [calOffset,   setCalOffset]   = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editCatId,   setEditCatId]   = useState(null);
  const [editLabel,   setEditLabel]   = useState("");
  const [editColor,   setEditColor]   = useState("#7DBE8E");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7DBE8E");
  const [nText,       setNText]       = useState("");
  const [nCat,        setNCat]        = useState("");
  const [nDate,       setNDate]       = useState(todayStr());
  const [nTime,       setNTime]       = useState("");
  const [nUrgente,    setNUrgente]    = useState(false);
  const [nImportante, setNImportante] = useState(false);
  const [detailR,     setDetailR]     = useState(null);
  const inputRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: cats }, { data: rems }] = await Promise.all([
        supabase.from("loculus_categories").select("*").order("position"),
        supabase.from("loculus_reminders").select("*").order("date").order("time"),
      ]);
      setCategories(cats || []);
      // Limpar concluídos com mais de 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const toDelete = (rems || []).filter(r => r.done && r.completed_at && new Date(r.completed_at) < thirtyDaysAgo);
      if (toDelete.length > 0) {
        await supabase.from("loculus_reminders").delete().in("id", toDelete.map(r => r.id));
      }
      setReminders((rems || []).filter(r => !toDelete.find(d => d.id === r.id)));
      if (cats?.length) setNCat(cats[0].id);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (showAdd && inputRef.current) inputRef.current.focus(); }, [showAdd]);

  async function addReminder() {
    if (!nText.trim()) return;
    setSaving(true);
    try {
      const payload = {
        text: nText.trim(), category_id: nCat,
        date: nDate,
        done: false, urgente: nUrgente, importante: nImportante,
      };
      if (nTime) payload.time = nTime + ":00";
      const { data } = await supabase.from("loculus_reminders").insert(payload).select().single();
      setReminders(prev => [...prev, data]);
      setNText(""); setNUrgente(false); setNImportante(false);
      setNDate(todayStr()); setNTime("");
      setShowAdd(false);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function toggleDone(id, currentDone) {
    const now = new Date().toISOString();
    const newDone = !currentDone;
    setReminders(prev => prev.map(r => r.id===id ? {...r, done:newDone, completed_at: newDone ? now : null} : r));
    const { error } = await supabase.from("loculus_reminders")
      .update({ done: newDone, completed_at: newDone ? now : null }).eq("id", id);
    if (error) setReminders(prev => prev.map(r => r.id===id ? {...r, done:currentDone} : r));
  }

  async function deleteReminder(id) {
    setReminders(prev => prev.filter(r => r.id!==id));
    await supabase.from("loculus_reminders").delete().eq("id", id);
  }

  async function saveNote(id, note) {
    const { error } = await supabase.from("loculus_reminders").update({ note }).eq("id", id);
    if (!error) {
      setReminders(prev => prev.map(r => r.id===id ? {...r, note} : r));
      setDetailR(prev => prev ? {...prev, note} : prev);
    } else { console.error("saveNote error:", error); }
  }

  async function savePhoto(id, photo_url) {
    const { error } = await supabase.from("loculus_reminders").update({ photo_url }).eq("id", id);
    if (!error) {
      setReminders(prev => prev.map(r => r.id===id ? {...r, photo_url} : r));
      setDetailR(prev => prev ? {...prev, photo_url} : prev);
    } else { console.error("savePhoto error:", error); }
  }

  async function addCategory() {
    if (!newCatLabel.trim()) return;
    const { data } = await supabase.from("loculus_categories").insert({
      label: newCatLabel.trim(), color: newCatColor, position: categories.length,
    }).select().single();
    setCategories(prev => [...prev, data]);
    setNewCatLabel(""); setNewCatColor("#7DBE8E");
  }

  async function updateCategory(id) {
    await supabase.from("loculus_categories").update({ label: editLabel, color: editColor }).eq("id", id);
    setCategories(prev => prev.map(c => c.id===id ? {...c,label:editLabel,color:editColor} : c));
    setEditCatId(null);
  }

  async function deleteCategory(id) {
    await supabase.from("loculus_categories").delete().eq("id", id);
    setCategories(prev => prev.filter(c => c.id!==id));
  }

  // Apenas não-concluídos na view principal
  const activeReminders = reminders.filter(r => !r.done);
  const archivedReminders = reminders.filter(r => r.done);

  const filtered = activeCat==="todos"      ? activeReminders
    : activeCat==="urgente"                 ? activeReminders.filter(r=>r.urgente)
    : activeCat==="importante"              ? activeReminders.filter(r=>r.importante)
    : activeReminders.filter(r=>r.category_id===activeCat);

  const byDate = filtered.reduce((acc,r) => {
    acc[r.date]=acc[r.date]||[]; acc[r.date].push(r); return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();
  const urgentCount = activeReminders.filter(r=>r.urgente).length;

  const WEEKDAYS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

  function getWeekDays(offset=0) {
    const now=new Date(); const day=now.getDay();
    const mon=new Date(now);
    mon.setDate(now.getDate()-(day===0?6:day-1)+offset*7);
    return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
  }

  function getMonthDays(offset=0) {
    const now=new Date();
    const first=new Date(now.getFullYear(),now.getMonth()+offset,1);
    const last=new Date(now.getFullYear(),now.getMonth()+offset+1,0);
    const pad=(first.getDay()+6)%7; const days=[];
    for(let i=0;i<pad;i++) days.push(null);
    for(let d=1;d<=last.getDate();d++) days.push(new Date(first.getFullYear(),first.getMonth(),d));
    return days;
  }

  function ds(d) { return d?d.toISOString().slice(0,10):""; }
  function remsOnDay(d) { return activeReminders.filter(r=>r.date===ds(d)); }

  function DayCell({ d, size="week" }) {
    if (!d) return <div/>;
    const dStr=ds(d); const isToday=dStr===todayStr();
    const isSel=selectedDay===dStr; const count=remsOnDay(d).length;
    const hasUrgent=remsOnDay(d).some(r=>r.urgente);
    const small=size==="month";
    return (
      <div onClick={()=>setSelectedDay(isSel?null:dStr)} style={{
        borderRadius:small?10:14, padding:small?"5px 2px":"8px 4px",
        textAlign:"center", cursor:"pointer", minHeight:small?38:undefined,
        background:isSel?"#3A6EA5":isToday?"#e8f0e8":"rgba(255,255,255,0.6)",
        border:`${small?1:1.5}px solid ${isSel?"#3A6EA5":isToday?"#7DBE8E":"transparent"}`,
      }}>
        <div style={{fontSize:small?13:15,fontWeight:800,color:isSel?"white":isToday?"#3A6EA5":"#2a3d2a"}}>{d.getDate()}</div>
        {count>0&&(
          <div style={{display:"flex",gap:2,justifyContent:"center",marginTop:3}}>
            <div style={{width:small?5:6,height:small?5:6,borderRadius:"50%",background:isSel?"white":hasUrgent?"#D4523A":"#7DBE8E"}}/>
            {!small&&count>1&&<div style={{width:6,height:6,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.6)":"#9B7EC8"}}/>}
          </div>
        )}
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────────
  if (screen==="home") return (
    <Phone bg="linear-gradient(180deg,#e8f4ef 0%,#f0ede8 60%,#e8e4f0 100%)">
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"24px 32px 48px"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:280,height:280,borderRadius:"50%",overflow:"hidden",boxShadow:"0 16px 60px rgba(90,120,90,0.18),0 4px 16px rgba(0,0,0,0.08)",border:"3px solid rgba(255,255,255,0.8)"}}>
            <img src={IMG_URL} alt="Loculus" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:48,fontWeight:900,letterSpacing:"-2px",color:"#2a3d2a",fontFamily:"'Georgia','Times New Roman',serif",lineHeight:1.1,marginBottom:10}}>Loculus</div>
          <div style={{fontSize:15,color:"#6a8a72",fontWeight:500,letterSpacing:"0.04em",fontStyle:"italic"}}>as gavetas do seu cérebro</div>
        </div>
        <button onClick={()=>setScreen("main")} style={{
          width:"100%",padding:"17px",borderRadius:22,
          background:"linear-gradient(135deg,#3A6EA5 0%,#5B8DB8 100%)",
          color:"white",fontSize:16,fontWeight:800,border:"none",cursor:"pointer",
          boxShadow:"0 8px 28px rgba(58,110,165,0.38)",letterSpacing:"0.02em",
        }}>Abrir minhas gavetas</button>
      </div>
    </Phone>
  );

  // ── CAT EDITOR ────────────────────────────────────────────────
  if (screen==="catEdit") return (
    <Phone bg="#f7f9f6">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 20px 16px",flexShrink:0}}>
        <button onClick={()=>setScreen("main")} style={btnIcon()}>←</button>
        <span style={{fontSize:16,fontWeight:800,color:"#2a3d2a"}}>Editar Gavetas</span>
        <div style={{width:36}}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 100px",scrollbarWidth:"none"}}>
        {categories.map(cat=>(
          <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:16,background:"white",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
            {editCatId===cat.id ? (
              <>
                <input value={editLabel} onChange={e=>setEditLabel(e.target.value)} style={{flex:1,border:"1px solid #ddd",borderRadius:8,padding:"4px 8px",fontSize:14}}/>
                <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} style={{width:32,height:32,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
                <button onClick={()=>updateCategory(cat.id)} style={{...btnIcon("#3A6EA5","white"),fontSize:12,width:32,height:32}}>✓</button>
              </>
            ) : (
              <>
                <span style={{flex:1,fontSize:15,fontWeight:600,color:"#2a3d2a"}}>{cat.label}</span>
                <button onClick={()=>{setEditCatId(cat.id);setEditLabel(cat.label);setEditColor(cat.color);}} style={btnIcon()}>✏️</button>
                <button onClick={()=>deleteCategory(cat.id)} style={btnIcon()}>🗑️</button>
              </>
            )}
          </div>
        ))}
        <div style={{padding:"14px 16px",borderRadius:16,marginTop:8,background:"rgba(58,110,165,0.07)",border:"1.5px dashed rgba(58,110,165,0.3)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#3A6EA5",marginBottom:10}}>Nova gaveta</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input placeholder="Nome" value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} style={{flex:1,border:"1px solid #ddd",borderRadius:10,padding:"8px 12px",fontSize:14}}/>
            <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} style={{width:38,height:38,border:"none",borderRadius:10,cursor:"pointer",padding:2}}/>
            <button onClick={addCategory} style={{...btnIcon("#3A6EA5","white"),width:38,height:38,fontSize:18}}>+</button>
          </div>
        </div>
      </div>
      <BottomBar screen="catEdit" onAdd={()=>{setScreen("main");setShowAdd(true);}} onMain={()=>setScreen("main")} onCal={()=>setScreen("calendar")} onArchive={()=>setScreen("archive")}/>
    </Phone>
  );

  // ── ARCHIVE ───────────────────────────────────────────────────
  if (screen==="archive") {
    const byDateArch = archivedReminders.reduce((acc,r) => {
      const key = r.completed_at ? r.completed_at.slice(0,10) : r.date;
      acc[key]=acc[key]||[]; acc[key].push(r); return acc;
    }, {});
    const sortedArch = Object.keys(byDateArch).sort().reverse();
    return (
      <Phone bg="#f7f9f6">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 20px 16px",flexShrink:0}}>
          <button onClick={()=>setScreen("main")} style={btnIcon()}>←</button>
          <span style={{fontSize:16,fontWeight:800,color:"#2a3d2a"}}>Arquivados</span>
          <div style={{width:36}}/>
        </div>
        <div style={{padding:"0 20px 8px",flexShrink:0}}>
          <div style={{fontSize:12,color:"#aaa",textAlign:"center"}}>Concluídos são removidos automaticamente após 30 dias</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"0 14px 100px",scrollbarWidth:"none"}}>
          {archivedReminders.length===0 ? (
            <div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Nenhum lembrete concluído 🌿</div>
          ) : sortedArch.map(date=>(
            <div key={date}>
              <div style={{textAlign:"center",fontSize:11,color:"#9aaa9a",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",margin:"10px 0 8px"}}>{formatDateLabel(date)}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {byDateArch[date].map(r=>(
                  <ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onOpen={setDetailR}/>
                ))}
              </div>
            </div>
          ))}
        </div>
        {detailR && (
          <DetailSheet r={detailR} cat={getCat(categories,detailR.category_id)}
            onClose={()=>setDetailR(null)} onToggle={toggleDone} onDelete={deleteReminder}
            onSaveNote={saveNote} onSavePhoto={savePhoto}/>
        )}
        <BottomBar screen="archive" onAdd={()=>setShowAdd(true)} onMain={()=>setScreen("main")} onCal={()=>setScreen("calendar")} onArchive={()=>{}}/>
      </Phone>
    );
  }

  // ── CALENDAR ──────────────────────────────────────────────────
  if (screen==="calendar") {
    const weekDays=getWeekDays(calOffset);
    const monthDays=getMonthDays(calOffset);
    const dispMonth=new Date(new Date().getFullYear(),new Date().getMonth()+calOffset,1);
    const monthLabel=dispMonth.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
    const weekLabel=`${weekDays[0].toLocaleDateString("pt-BR",{day:"numeric",month:"short"})} – ${weekDays[6].toLocaleDateString("pt-BR",{day:"numeric",month:"short",year:"numeric"})}`;
    return (
      <Phone bg="#f7f9f6">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 20px 12px",flexShrink:0}}>
          <button onClick={()=>{setScreen("main");setCalOffset(0);}} style={btnIcon()}>←</button>
          <span style={{fontSize:16,fontWeight:800,color:"#2a3d2a"}}>Calendário</span>
          <button onClick={()=>setShowAdd(true)} style={btnIcon("#3A6EA5","white")}>+</button>
        </div>
        <div style={{display:"flex",gap:6,padding:"0 20px 10px",flexShrink:0}}>
          {["week","month"].map(v=>(
            <button key={v} onClick={()=>{setCalView(v);setCalOffset(0);setSelectedDay(null);}} style={{
              flex:1,padding:"7px",borderRadius:12,border:"none",
              background:calView===v?"#3A6EA5":"rgba(58,110,165,0.1)",
              color:calView===v?"white":"#3A6EA5",fontSize:13,fontWeight:700,cursor:"pointer",
            }}>{v==="week"?"Semana":"Mês"}</button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 20px 12px",flexShrink:0}}>
          <button onClick={()=>{setCalOffset(o=>o-1);setSelectedDay(null);}} style={btnIcon()}>‹</button>
          <span style={{fontSize:13,fontWeight:700,color:"#4a6a4a",textTransform:"capitalize"}}>{calView==="week"?weekLabel:monthLabel}</span>
          <button onClick={()=>{setCalOffset(o=>o+1);setSelectedDay(null);}} style={btnIcon()}>›</button>
        </div>
        <div style={{padding:"0 12px",flexShrink:0}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
            {WEEKDAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#8aaa8a",paddingBottom:3}}>{d}</div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:calView==="month"?3:4}}>
            {(calView==="week"?weekDays:monthDays).map((d,i)=>(<DayCell key={i} d={d} size={calView}/>))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px 100px",scrollbarWidth:"none"}}>
          {selectedDay ? (
            <>
              <div style={{fontSize:13,fontWeight:700,color:"#8aaa8a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{formatDateLabel(selectedDay)}</div>
              {activeReminders.filter(r=>r.date===selectedDay).length===0
                ? <div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:20}}>Nenhum lembrete nesse dia 🌿</div>
                : <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {activeReminders.filter(r=>r.date===selectedDay).map(r=>(
                      <ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onOpen={setDetailR}/>
                    ))}
                  </div>
              }
            </>
          ) : (
            <div style={{textAlign:"center",color:"#bbb",fontSize:13,marginTop:20}}>Toque em um dia para ver os lembretes</div>
          )}
        </div>
        {showAdd&&<AddSheet categories={categories} nText={nText} setNText={setNText} nCat={nCat} setNCat={setNCat} nDate={nDate} setNDate={setNDate} nTime={nTime} setNTime={setNTime} nUrgente={nUrgente} setNUrgente={setNUrgente} nImportante={nImportante} setNImportante={setNImportante} onAdd={addReminder} onClose={()=>setShowAdd(false)} inputRef={inputRef} loading={saving}/>}
        {detailR && (<DetailSheet r={detailR} cat={getCat(categories,detailR.category_id)} onClose={()=>setDetailR(null)} onToggle={toggleDone} onDelete={deleteReminder} onSaveNote={saveNote} onSavePhoto={savePhoto}/>)}
        <BottomBar screen="calendar" onAdd={()=>setShowAdd(true)} onMain={()=>{setScreen("main");setCalOffset(0);}} onCal={()=>{}} onArchive={()=>setScreen("archive")}/>
      </Phone>
    );
  }

  // ── MAIN ──────────────────────────────────────────────────────
  return (
    <Phone bg="#f7f9f6">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 20px 10px",flexShrink:0}}>
        <button onClick={()=>setScreen("home")} style={{width:36,height:36,borderRadius:"50%",background:"transparent",border:"none",cursor:"pointer",overflow:"hidden",padding:0}}>
          <img src={IMG_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </button>
        <span style={{fontSize:20,fontWeight:900,color:"#2a3d2a",fontFamily:"'Georgia',serif",letterSpacing:"-0.5px"}}>Loculus</span>
        <div style={{position:"relative"}}>
          <button onClick={()=>setScreen("catEdit")} style={btnIcon()}>🗂️</button>
          {urgentCount>0&&(
            <div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"#D4523A",color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #f7f9f6"}}>{urgentCount}</div>
          )}
        </div>
      </div>
      <div style={{display:"flex",gap:6,padding:"0 14px 12px",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
        {[
          {id:"todos",      label:"Todos",         color:"#4a6a4a"},
          {id:"urgente",    label:"⚡ Urgentes",    color:"#D4523A"},
          {id:"importante", label:"⭐ Importantes", color:"#D4A843"},
        ].map(f=>{
          const isActive=activeCat===f.id;
          return (
            <button key={f.id} onClick={()=>setActiveCat(f.id)} style={{
              flexShrink:0,padding:"7px 13px",borderRadius:20,cursor:"pointer",
              border:isActive?"none":"1.5px solid rgba(0,0,0,0.09)",
              background:isActive?f.color:"white",color:isActive?"white":"#555",
              fontSize:12,fontWeight:700,whiteSpace:"nowrap",
              boxShadow:isActive?`0 4px 12px rgba(${hexRgb(f.color)},0.35)`:"none",
            }}>{f.label}</button>
          );
        })}
        {categories.map(cat=>{
          const isActive=activeCat===cat.id;
          return (
            <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
              flexShrink:0,padding:"7px 13px",borderRadius:20,cursor:"pointer",
              border:isActive?"none":"1.5px solid rgba(0,0,0,0.09)",
              background:isActive?cat.color:"white",color:isActive?"white":"#444",
              fontSize:12,fontWeight:700,whiteSpace:"nowrap",
              boxShadow:isActive?`0 4px 12px rgba(${hexRgb(cat.color)},0.35)`:"none",
              display:"flex",alignItems:"center",gap:5,
            }}>
              {!isActive&&<span style={{width:7,height:7,borderRadius:"50%",background:cat.color,display:"inline-block"}}/>}
              {cat.label}
            </button>
          );
        })}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 14px",scrollbarWidth:"none"}}>
        {loading ? (
          <div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Abrindo gavetas… 🗂️</div>
        ) : sortedDates.length===0 ? (
          <div style={{textAlign:"center",color:"#bbb",fontSize:14,marginTop:60}}>Nenhum lembrete aqui 🌿</div>
        ) : sortedDates.map(date=>(
          <div key={date}>
            <div style={{textAlign:"center",fontSize:11,color:"#9aaa9a",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",margin:"10px 0 8px"}}>{formatDateLabel(date)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {byDate[date].map(r=>(
                <ReminderChip key={r.id} r={r} cat={getCat(categories,r.category_id)} onToggle={toggleDone} onDelete={deleteReminder} onOpen={setDetailR}/>
              ))}
            </div>
          </div>
        ))}
        <div style={{height:100}}/>
      </div>
      {showAdd&&<AddSheet categories={categories} nText={nText} setNText={setNText} nCat={nCat} setNCat={setNCat} nDate={nDate} setNDate={setNDate} nTime={nTime} setNTime={setNTime} nUrgente={nUrgente} setNUrgente={setNUrgente} nImportante={nImportante} setNImportante={setNImportante} onAdd={addReminder} onClose={()=>setShowAdd(false)} inputRef={inputRef} loading={saving}/>}
      {detailR && (<DetailSheet r={detailR} cat={getCat(categories,detailR.category_id)} onClose={()=>setDetailR(null)} onToggle={toggleDone} onDelete={deleteReminder} onSaveNote={saveNote} onSavePhoto={savePhoto}/>)}
      <BottomBar screen="main" onAdd={()=>setShowAdd(true)} onMain={()=>{}} onCal={()=>setScreen("calendar")} onArchive={()=>setScreen("archive")}/>
    </Phone>
  );
}
