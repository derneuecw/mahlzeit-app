import { useState, useEffect } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

const DAYS = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const SLOTS = ["Mittagessen","Abendessen"];
const UNITS = ["g","kg","ml","l","EL","TL","Stück","Prise","Bund","Dose","Packung","Zehe","Scheibe",""];
const CATS  = ["Pasta","Fleisch","Fisch","Vegetarisch","Vegan","Suppe","Salat","Backen","Sonstiges"];

const SAMPLES = [
  { id:"s1", name:"Spaghetti Bolognese", category:"Pasta", servings:4, prepTime:45,
    ingredients:[{name:"Spaghetti",amount:400,unit:"g"},{name:"Hackfleisch",amount:500,unit:"g"},
      {name:"Tomaten (Dose)",amount:400,unit:"g"},{name:"Zwiebel",amount:1,unit:"Stück"},
      {name:"Knoblauch",amount:3,unit:"Zehe"},{name:"Olivenöl",amount:2,unit:"EL"}], notes:"" },
  { id:"s2", name:"Lachs mit Ofengemüse", category:"Fisch", servings:2, prepTime:35,
    ingredients:[{name:"Lachsfilet",amount:300,unit:"g"},{name:"Zucchini",amount:1,unit:"Stück"},
      {name:"Paprika",amount:2,unit:"Stück"},{name:"Kirschtomaten",amount:200,unit:"g"},
      {name:"Olivenöl",amount:3,unit:"EL"},{name:"Zitrone",amount:1,unit:"Stück"}], notes:"" },
  { id:"s3", name:"Hähnchen-Curry", category:"Fleisch", servings:4, prepTime:40,
    ingredients:[{name:"Hähnchenbrust",amount:600,unit:"g"},{name:"Kokosmilch",amount:400,unit:"ml"},
      {name:"Currypaste",amount:2,unit:"EL"},{name:"Zwiebel",amount:1,unit:"Stück"},
      {name:"Reis",amount:300,unit:"g"},{name:"Ingwer",amount:1,unit:"Stück"}], notes:"" },
  { id:"s4", name:"Tomatensuppe", category:"Suppe", servings:4, prepTime:30,
    ingredients:[{name:"Tomaten (Dose)",amount:800,unit:"g"},{name:"Gemüsebrühe",amount:500,unit:"ml"},
      {name:"Zwiebel",amount:1,unit:"Stück"},{name:"Knoblauch",amount:2,unit:"Zehe"},
      {name:"Sahne",amount:100,unit:"ml"},{name:"Basilikum",amount:1,unit:"Bund"}], notes:"" },
];

const uid = () => Math.random().toString(36).slice(2,9);

const storage = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.error(e); } }
};

const css = `
  * { box-sizing: border-box; margin:0; padding:0; }
  body { background:#FBF7F0; }
  .app { font-family:'DM Sans',sans-serif; min-height:100vh; background:#FBF7F0; color:#2C2416; }
  h1,h2,h3,h4 { font-family:'Playfair Display',serif; }
  .header { background:#2C2416; padding:20px 24px 0; position:sticky; top:0; z-index:100; }
  .header-top { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
  .logo { color:#E8A87C; font-family:'Playfair Display',serif; font-size:22px; font-weight:700; }
  .logo span { color:#C4622D; }
  .tabs { display:flex; gap:4px; }
  .tab { padding:10px 20px; border:none; background:transparent; color:#9A8A7A; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; border-radius:8px 8px 0 0; transition:all .2s; }
  .tab:hover { color:#E8A87C; background:rgba(255,255,255,.05); }
  .tab.active { background:#FBF7F0; color:#2C2416; font-weight:600; }
  .content { padding:24px; max-width:1100px; margin:0 auto; }
  .section-title { font-size:28px; color:#2C2416; margin-bottom:6px; }
  .section-sub { color:#7A6A5A; font-size:14px; margin-bottom:24px; }
  .week-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; }
  .day-card { background:#fff; border-radius:14px; padding:14px 12px; box-shadow:0 2px 8px rgba(44,36,22,.06); border:1.5px solid transparent; }
  .day-name { font-family:'Playfair Display',serif; font-size:13px; font-weight:600; color:#C4622D; margin-bottom:10px; text-transform:uppercase; letter-spacing:.5px; }
  .meal-slot { margin-bottom:8px; }
  .meal-label { font-size:10px; color:#9A8A7A; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .meal-filled { background:#FDF0E8; border:1.5px solid #E8A87C; border-radius:8px; padding:8px 10px; font-size:12px; font-weight:500; color:#2C2416; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:4px; transition:all .2s; }
  .meal-filled:hover { background:#F9E0C8; }
  .meal-filled .cat { font-size:10px; color:#C4622D; font-weight:600; }
  .meal-empty { border:1.5px dashed #D4C4B4; border-radius:8px; padding:8px 10px; font-size:12px; color:#B0A090; cursor:pointer; text-align:center; transition:all .2s; }
  .meal-empty:hover { border-color:#C4622D; color:#C4622D; background:#FDF5EF; }
  .meal-remove { background:none; border:none; color:#9A8A7A; cursor:pointer; font-size:14px; padding:0; line-height:1; flex-shrink:0; }
  .meal-remove:hover { color:#C4622D; }
  .suggest-bar { background:#fff; border-radius:14px; padding:16px 20px; box-shadow:0 2px 8px rgba(44,36,22,.06); margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .suggest-label { font-family:'Playfair Display',serif; font-size:15px; color:#2C2416; flex-shrink:0; }
  .suggest-chips { display:flex; gap:8px; flex-wrap:wrap; flex:1; }
  .suggest-chip { background:#F0F5F0; border:1.5px solid #A8C4AB; border-radius:20px; padding:6px 14px; font-size:12px; color:#3A5C3D; cursor:pointer; font-weight:500; transition:all .2s; }
  .suggest-chip:hover { background:#5C7A5F; color:#fff; border-color:#5C7A5F; }
  .btn-refresh { background:none; border:1.5px solid #D4C4B4; border-radius:8px; padding:7px 14px; font-size:12px; color:#7A6A5A; cursor:pointer; font-weight:500; font-family:'DM Sans',sans-serif; transition:all .2s; flex-shrink:0; }
  .btn-refresh:hover { border-color:#C4622D; color:#C4622D; }
  .recipe-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
  .recipe-card { background:#fff; border-radius:14px; padding:18px; box-shadow:0 2px 8px rgba(44,36,22,.06); cursor:pointer; transition:all .2s; border:1.5px solid transparent; }
  .recipe-card:hover { border-color:#E8A87C; transform:translateY(-2px); box-shadow:0 6px 20px rgba(44,36,22,.1); }
  .recipe-cat { font-size:10px; font-weight:700; color:#5C7A5F; text-transform:uppercase; letter-spacing:.8px; margin-bottom:8px; }
  .recipe-name { font-family:'Playfair Display',serif; font-size:17px; color:#2C2416; margin-bottom:8px; }
  .recipe-meta { display:flex; gap:12px; }
  .recipe-meta span { font-size:12px; color:#9A8A7A; }
  .btn-primary { background:#C4622D; color:#fff; border:none; border-radius:10px; padding:11px 22px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
  .btn-primary:hover { background:#A8501F; }
  .btn-secondary { background:transparent; color:#C4622D; border:1.5px solid #C4622D; border-radius:10px; padding:9px 20px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
  .btn-secondary:hover { background:#FDF0E8; }
  .btn-ghost { background:transparent; border:none; color:#7A6A5A; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; padding:8px; }
  .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .search-bar { border:1.5px solid #E0D4C4; border-radius:10px; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:14px; width:260px; outline:none; background:#fff; }
  .search-bar:focus { border-color:#C4622D; }
  .cat-filter { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
  .cat-btn { background:#fff; border:1.5px solid #E0D4C4; border-radius:20px; padding:5px 14px; font-size:12px; color:#7A6A5A; cursor:pointer; font-weight:500; font-family:'DM Sans',sans-serif; transition:all .2s; }
  .cat-btn.active, .cat-btn:hover { background:#C4622D; color:#fff; border-color:#C4622D; }
  .shopping-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .shopping-list { background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 8px rgba(44,36,22,.06); }
  .shop-day-group { margin-bottom:20px; }
  .shop-day-title { font-family:'Playfair Display',serif; font-size:16px; color:#C4622D; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #F0E8DC; }
  .shop-item { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid #F8F4EF; }
  .shop-item:last-child { border-bottom:none; }
  .shop-check { width:18px; height:18px; accent-color:#C4622D; cursor:pointer; flex-shrink:0; }
  .shop-item-text { font-size:14px; color:#2C2416; }
  .shop-item-text.done { text-decoration:line-through; color:#B0A090; }
  .shop-amount { font-size:13px; color:#9A8A7A; margin-left:auto; flex-shrink:0; }
  .shop-empty { text-align:center; padding:40px; color:#9A8A7A; }
  .shop-empty h3 { font-family:'Playfair Display',serif; font-size:20px; margin-bottom:8px; color:#C4B4A4; }
  .overlay { position:fixed; inset:0; background:rgba(44,36,22,.5); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn .2s; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal { background:#fff; border-radius:20px; padding:28px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; animation:slideUp .25s; }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
  .modal-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:22px; color:#2C2416; }
  .modal-close { background:none; border:none; font-size:22px; color:#9A8A7A; cursor:pointer; line-height:1; }
  .modal-close:hover { color:#C4622D; }
  .form-group { margin-bottom:16px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  label { display:block; font-size:12px; font-weight:600; color:#7A6A5A; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  input, select, textarea { width:100%; border:1.5px solid #E0D4C4; border-radius:10px; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; background:#fff; color:#2C2416; transition:border .2s; }
  input:focus, select:focus, textarea:focus { border-color:#C4622D; }
  textarea { min-height:80px; resize:vertical; }
  .ing-row { display:grid; grid-template-columns:1fr 80px 100px 32px; gap:8px; align-items:center; margin-bottom:8px; }
  .btn-add-ing { background:none; border:1.5px dashed #C4622D; border-radius:8px; padding:8px; color:#C4622D; cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; width:100%; transition:all .2s; }
  .btn-add-ing:hover { background:#FDF0E8; }
  .btn-del-ing { background:none; border:none; color:#C0B0A0; cursor:pointer; font-size:16px; }
  .btn-del-ing:hover { color:#C4622D; }
  .recipe-picker { display:flex; flex-direction:column; gap:8px; max-height:400px; overflow-y:auto; }
  .picker-item { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border:1.5px solid #E8DDD0; border-radius:10px; cursor:pointer; transition:all .2s; }
  .picker-item:hover { border-color:#C4622D; background:#FDF5EF; }
  .picker-name { font-weight:500; font-size:14px; color:#2C2416; }
  .picker-meta { font-size:12px; color:#9A8A7A; }
  .picker-cat { font-size:11px; font-weight:700; color:#5C7A5F; text-transform:uppercase; }
  .detail-meta { display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap; }
  .detail-meta-item { background:#FDF0E8; border-radius:10px; padding:10px 16px; }
  .detail-meta-item .val { font-family:'Playfair Display',serif; font-size:20px; color:#C4622D; }
  .detail-meta-item .lbl { font-size:11px; color:#9A8A7A; text-transform:uppercase; letter-spacing:.5px; }
  .ing-list { list-style:none; display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
  .ing-list li { display:flex; justify-content:space-between; font-size:14px; color:#2C2416; padding:6px 0; border-bottom:1px solid #F5F0EA; }
  .ing-list li span { color:#9A8A7A; }
  .week-nav { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .week-label { font-family:'Playfair Display',serif; font-size:16px; color:#2C2416; }
  .btn-week { background:#fff; border:1.5px solid #E0D4C4; border-radius:8px; padding:6px 12px; cursor:pointer; font-size:16px; color:#7A6A5A; transition:all .2s; }
  .btn-week:hover { border-color:#C4622D; color:#C4622D; }
  .toast { position:fixed; bottom:24px; right:24px; background:#2C2416; color:#E8A87C; padding:12px 20px; border-radius:12px; font-size:14px; font-weight:500; z-index:300; animation:fadeIn .3s; font-family:'DM Sans',sans-serif; }
  @media(max-width:768px) { .week-grid { grid-template-columns:repeat(2,1fr); } .form-row { grid-template-columns:1fr; } .ing-row { grid-template-columns:1fr 70px 90px 28px; } }
  @media(max-width:480px) { .week-grid { grid-template-columns:1fr; } .content { padding:16px; } .header { padding:14px 16px 0; } }
`;

function getWeekKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  return `week-${d.getFullYear()}-${d.getMonth()}-${Math.ceil(d.getDate()/7)}`;
}

function getWeekLabel(offset) {
  if (offset === 0) return "Diese Woche";
  if (offset === 1) return "Nächste Woche";
  if (offset === -1) return "Letzte Woche";
  return offset > 0 ? `+${offset} Wochen` : `${offset} Wochen`;
}

function aggregateShopping(weekPlan, recipes) {
  const byDay = {};
  DAYS.forEach((day) => {
    const dayIngredients = [];
    SLOTS.forEach((slot) => {
      const rid = weekPlan?.[day]?.[slot];
      if (!rid) return;
      const recipe = recipes.find(r => r.id === rid);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => dayIngredients.push({ ...ing, recipe: recipe.name }));
    });
    if (dayIngredients.length) byDay[day] = dayIngredients;
  });
  return byDay;
}

export default function App() {
  const [tab, setTab] = useState("planer");
  const [recipes, setRecipes] = useState(() => storage.get("recipes") || SAMPLES);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPlan, setWeekPlan] = useState(() => storage.get(getWeekKey(0)) || {});
  const [checkedItems, setCheckedItems] = useState(() => storage.get("checked") || {});
  const [modal, setModal] = useState(null);
  const [catFilter, setCatFilter] = useState("Alle");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const w = storage.get(getWeekKey(weekOffset)) || {};
    setWeekPlan(w);
  }, [weekOffset]);

  useEffect(() => {
    const used = new Set(Object.values(weekPlan).flatMap(d => Object.values(d)));
    const unused = recipes.filter(r => !used.has(r.id));
    const pool = unused.length >= 3 ? unused : recipes;
    setSuggestions([...pool].sort(() => Math.random() - .5).slice(0, 4));
  }, [recipes, weekPlan]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const saveRecipe = (recipe) => {
    const next = recipe.id
      ? recipes.map(r => r.id === recipe.id ? recipe : r)
      : [...recipes, { ...recipe, id: uid() }];
    setRecipes(next);
    storage.set("recipes", next);
    setModal(null);
    showToast(recipe.id ? "Rezept gespeichert ✓" : "Rezept hinzugefügt ✓");
  };

  const deleteRecipe = (id) => {
    const next = recipes.filter(r => r.id !== id);
    setRecipes(next);
    storage.set("recipes", next);
    setModal(null);
    showToast("Rezept gelöscht");
  };

  const assignMeal = (day, slot, recipeId) => {
    const next = { ...weekPlan, [day]: { ...(weekPlan[day] || {}), [slot]: recipeId } };
    setWeekPlan(next);
    storage.set(getWeekKey(weekOffset), next);
    setModal(null);
    showToast("Gericht eingeplant ✓");
  };

  const removeMeal = (day, slot) => {
    const next = { ...weekPlan, [day]: { ...(weekPlan[day] || {}), [slot]: null } };
    setWeekPlan(next);
    storage.set(getWeekKey(weekOffset), next);
  };

  const toggleCheck = (key) => {
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
    storage.set("checked", next);
  };

  const filteredRecipes = recipes.filter(r => {
    const matchCat = catFilter === "Alle" || r.category === catFilter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const shoppingByDay = aggregateShopping(weekPlan, recipes);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div className="logo">Mahl<span>zeit</span> 🍽️</div>
          </div>
          <div className="tabs">
            {[["planer","Wochenplaner"],["rezepte","Rezeptbuch"],["einkauf","Einkaufsliste"]].map(([t,l]) => (
              <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="content">
          {tab === "planer" && (
            <>
              <div className="week-nav">
                <button className="btn-week" onClick={()=>setWeekOffset(o=>o-1)}>←</button>
                <span className="week-label">{getWeekLabel(weekOffset)}</span>
                <button className="btn-week" onClick={()=>setWeekOffset(o=>o+1)}>→</button>
                {weekOffset!==0 && <button className="btn-ghost" onClick={()=>setWeekOffset(0)}>Heute</button>}
              </div>
              {suggestions.length > 0 && (
                <div className="suggest-bar">
                  <span className="suggest-label">💡 Vorschläge</span>
                  <div className="suggest-chips">
                    {suggestions.map(r => (
                      <span key={r.id} className="suggest-chip" onClick={()=>setModal({type:'selectSlot',recipe:r})}>
                        {r.name}
                      </span>
                    ))}
                  </div>
                  <button className="btn-refresh" onClick={()=>{
                    const used = new Set(Object.values(weekPlan).flatMap(d=>Object.values(d)));
                    const pool = recipes.filter(r=>!used.has(r.id));
                    const base = pool.length>=4?pool:recipes;
                    setSuggestions([...base].sort(()=>Math.random()-.5).slice(0,4));
                  }}>↻ Neue</button>
                </div>
              )}
              <div className="week-grid">
                {DAYS.map(day => (
                  <div key={day} className="day-card">
                    <div className="day-name">{day.slice(0,2)}</div>
                    {SLOTS.map(slot => {
                      const rid = weekPlan?.[day]?.[slot];
                      const recipe = rid ? recipes.find(r=>r.id===rid) : null;
                      return (
                        <div key={slot} className="meal-slot">
                          <div className="meal-label">{slot==="Mittagessen"?"🍜 Mittag":"🌙 Abend"}</div>
                          {recipe ? (
                            <div className="meal-filled" onClick={()=>setModal({type:'viewRecipe',recipe,day,slot})}>
                              <div>
                                <div className="cat">{recipe.category}</div>
                                <div>{recipe.name}</div>
                              </div>
                              <button className="meal-remove" onClick={e=>{e.stopPropagation();removeMeal(day,slot)}}>×</button>
                            </div>
                          ) : (
                            <div className="meal-empty" onClick={()=>setModal({type:'pickRecipe',day,slot})}>+ Gericht</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "rezepte" && (
            <>
              <div className="toolbar">
                <div>
                  <h2 className="section-title">Rezeptbuch</h2>
                  <p className="section-sub">{recipes.length} Rezepte gespeichert</p>
                </div>
                <button className="btn-primary" onClick={()=>setModal({type:'editRecipe',recipe:null})}>+ Neues Rezept</button>
              </div>
              <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
                <input className="search-bar" placeholder="🔍 Rezept suchen…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              <div className="cat-filter">
                {["Alle",...CATS].map(c=>(
                  <button key={c} className={`cat-btn ${catFilter===c?'active':''}`} onClick={()=>setCatFilter(c)}>{c}</button>
                ))}
              </div>
              <div className="recipe-grid">
                {filteredRecipes.map(r => (
                  <div key={r.id} className="recipe-card" onClick={()=>setModal({type:'viewRecipe',recipe:r})}>
                    <div className="recipe-cat">{r.category}</div>
                    <div className="recipe-name">{r.name}</div>
                    <div className="recipe-meta">
                      <span>👥 {r.servings} Personen</span>
                      {r.prepTime && <span>⏱ {r.prepTime} Min</span>}
                    </div>
                  </div>
                ))}
                {filteredRecipes.length === 0 && (
                  <div style={{gridColumn:'1/-1',textAlign:'center',padding:40,color:'#9A8A7A'}}>
                    <p style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>Keine Rezepte gefunden</p>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "einkauf" && (
            <>
              <div className="shopping-header">
                <div>
                  <h2 className="section-title">Einkaufsliste</h2>
                  <p className="section-sub">Basierend auf deinem Wochenplan</p>
                </div>
                <button className="btn-secondary" onClick={()=>{ setCheckedItems({}); storage.set("checked",{}); }}>Liste zurücksetzen</button>
              </div>
              {Object.keys(shoppingByDay).length === 0 ? (
                <div className="shopping-list">
                  <div className="shop-empty">
                    <h3>Noch nichts geplant</h3>
                    <p>Trage Gerichte im Wochenplaner ein, um automatisch eine Einkaufsliste zu erhalten.</p>
                    <button className="btn-primary" style={{marginTop:16}} onClick={()=>setTab('planer')}>Zum Wochenplaner</button>
                  </div>
                </div>
              ) : (
                <div className="shopping-list">
                  {Object.entries(shoppingByDay).map(([day, items]) => (
                    <div key={day} className="shop-day-group">
                      <div className="shop-day-title">{day}</div>
                      {items.map((item, i) => {
                        const key = `${day}-${i}-${item.name}`;
                        return (
                          <div key={key} className="shop-item">
                            <input type="checkbox" className="shop-check" checked={!!checkedItems[key]} onChange={()=>toggleCheck(key)} />
                            <div className={`shop-item-text ${checkedItems[key]?'done':''}`}>
                              {item.name}
                              <span style={{fontSize:11,color:'#B0A090',marginLeft:8}}>({item.recipe})</span>
                            </div>
                            <div className="shop-amount">{item.amount} {item.unit}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {modal && (
          <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
            <div className="modal">
              {modal.type === 'viewRecipe' && <ViewRecipe recipe={modal.recipe}
                onEdit={()=>setModal({type:'editRecipe',recipe:modal.recipe})}
                onDelete={()=>{ if(window.confirm(`"${modal.recipe.name}" löschen?`)) deleteRecipe(modal.recipe.id); }}
                onAssign={modal.day?null:()=>setModal({type:'selectSlot',recipe:modal.recipe})}
                onClose={()=>setModal(null)} />}
              {modal.type === 'editRecipe' && <EditRecipe recipe={modal.recipe} onSave={saveRecipe} onClose={()=>setModal(null)} />}
              {modal.type === 'pickRecipe' && (
                <>
                  <div className="modal-header">
                    <div className="modal-title">Gericht für {modal.day} – {modal.slot}</div>
                    <button className="modal-close" onClick={()=>setModal(null)}>×</button>
                  </div>
                  <div style={{marginBottom:12}}>
                    <input className="search-bar" style={{width:'100%'}} placeholder="🔍 Suchen…" value={search} onChange={e=>setSearch(e.target.value)} />
                  </div>
                  <div className="recipe-picker">
                    {recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())).map(r=>(
                      <div key={r.id} className="picker-item" onClick={()=>assignMeal(modal.day,modal.slot,r.id)}>
                        <div>
                          <div className="picker-cat">{r.category}</div>
                          <div className="picker-name">{r.name}</div>
                        </div>
                        <div className="picker-meta">👥 {r.servings} · ⏱ {r.prepTime||'?'} Min</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {modal.type === 'selectSlot' && (
                <>
                  <div className="modal-header">
                    <div className="modal-title">"{modal.recipe.name}" einplanen</div>
                    <button className="modal-close" onClick={()=>setModal(null)}>×</button>
                  </div>
                  <p style={{color:'#7A6A5A',marginBottom:16,fontSize:14}}>Für welchen Tag & Mahlzeit?</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {DAYS.map(day=>SLOTS.map(slot=>(
                      <div key={`${day}-${slot}`} className="picker-item" onClick={()=>assignMeal(day,slot,modal.recipe.id)}>
                        <div className="picker-name">{day}</div>
                        <div className="picker-meta">{slot}</div>
                      </div>
                    )))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function ViewRecipe({ recipe, onEdit, onDelete, onAssign, onClose }) {
  return (
    <>
      <div className="modal-header">
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#5C7A5F',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:6}}>{recipe.category}</div>
          <div className="modal-title">{recipe.name}</div>
        </div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="detail-meta">
        <div className="detail-meta-item">
          <div className="val">{recipe.servings}</div>
          <div className="lbl">Personen</div>
        </div>
        {recipe.prepTime && <div className="detail-meta-item">
          <div className="val">{recipe.prepTime}</div>
          <div className="lbl">Minuten</div>
        </div>}
      </div>
      <h4 style={{marginBottom:10,fontFamily:"'Playfair Display',serif",fontSize:16}}>Zutaten</h4>
      <ul className="ing-list">
        {recipe.ingredients.map((ing,i)=>(
          <li key={i}><span>{ing.name}</span><span>{ing.amount} {ing.unit}</span></li>
        ))}
      </ul>
      {recipe.notes && <div style={{background:'#FDF5EF',borderRadius:10,padding:14,fontSize:14,color:'#5A4A3A',marginBottom:16}}>{recipe.notes}</div>}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:8}}>
        <button className="btn-primary" onClick={onEdit}>Bearbeiten</button>
        {onAssign && <button className="btn-secondary" onClick={onAssign}>Einplanen</button>}
        <button className="btn-ghost" onClick={onDelete} style={{color:'#C04040',marginLeft:'auto'}}>Löschen</button>
      </div>
    </>
  );
}

function EditRecipe({ recipe, onSave, onClose }) {
  const [form, setForm] = useState(recipe || { id:null, name:'', category:'Pasta', servings:2, prepTime:'', ingredients:[], notes:'' });
  const setField = (k,v) => setForm(f=>({...f,[k]:v}));
  const setIng = (i,k,v) => setForm(f=>{ const ings=[...f.ingredients]; ings[i]={...ings[i],[k]:v}; return {...f,ingredients:ings}; });
  const addIng = () => setForm(f=>({...f,ingredients:[...f.ingredients,{name:'',amount:'',unit:'g'}]}));
  const delIng = (i) => setForm(f=>({...f,ingredients:f.ingredients.filter((_,j)=>j!==i)}));
  const handleSave = () => {
    if (!form.name.trim()) return alert("Bitte einen Namen eingeben.");
    onSave({ ...form, servings:Number(form.servings)||2, prepTime:Number(form.prepTime)||null });
  };
  return (
    <>
      <div className="modal-header">
        <div className="modal-title">{recipe?'Rezept bearbeiten':'Neues Rezept'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label>Rezeptname *</label>
        <input value={form.name} onChange={e=>setField('name',e.target.value)} placeholder="z.B. Pasta Arrabiata" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Kategorie</label>
          <select value={form.category} onChange={e=>setField('category',e.target.value)}>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Portionen</label>
          <input type="number" min="1" value={form.servings} onChange={e=>setField('servings',e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Zubereitungszeit (Minuten)</label>
        <input type="number" value={form.prepTime} onChange={e=>setField('prepTime',e.target.value)} placeholder="z.B. 30" />
      </div>
      <h4 style={{fontFamily:"'Playfair Display',serif",fontSize:16,marginBottom:12}}>Zutaten</h4>
      {form.ingredients.map((ing,i)=>(
        <div key={i} className="ing-row">
          <input placeholder="Zutat" value={ing.name} onChange={e=>setIng(i,'name',e.target.value)} />
          <input placeholder="Menge" type="number" value={ing.amount} onChange={e=>setIng(i,'amount',e.target.value)} />
          <select value={ing.unit} onChange={e=>setIng(i,'unit',e.target.value)}>
            {UNITS.map(u=><option key={u} value={u}>{u||'—'}</option>)}
          </select>
          <button className="btn-del-ing" onClick={()=>delIng(i)}>×</button>
        </div>
      ))}
      <button className="btn-add-ing" onClick={addIng} style={{marginBottom:16}}>+ Zutat hinzufügen</button>
      <div className="form-group">
        <label>Notizen / Zubereitung</label>
        <textarea value={form.notes} onChange={e=>setField('notes',e.target.value)} placeholder="Kurze Hinweise zur Zubereitung…" />
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
        <button className="btn-primary" onClick={handleSave}>Speichern</button>
      </div>
    </>
  );
}
