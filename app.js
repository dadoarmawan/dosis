let medicines=[]; let current=null;
const $=id=>document.getElementById(id);
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

async function init(){
  medicines=await fetch("data/medicines.json").then(r=>r.json());
  $("drugCount").textContent=`${medicines.length} obat`;
  renderTable(medicines); populateDrugs(medicines);
}
function populateDrugs(list){
  const sel=$("drugSelect"), old=sel.value;
  sel.innerHTML=list.map(x=>`<option value="${esc(x.id)}">${esc(x.generic)}${x.brands?.length?" — "+esc(x.brands.slice(0,2).join(", ")):""}</option>`).join("");
  if(old && list.some(x=>x.id===old)) sel.value=old;
  updateDrug();
}
function allFormulations(drug){
  const base=drug.formulations||[];
  return base;
}
function renderTable(list){
  $("drugTable").innerHTML=list.map(d=>`<tr><td><b>${esc(d.generic)}</b><br><span class="mini">${esc((d.brands||[]).join(", ")||"—")}</span></td><td>${esc(d.class)}</td><td>${esc(allFormulations(d).map(f=>f.name).join(", "))}</td><td>${esc(d.indications?.[0]?.refs?.join("; ")||"-")}</td></tr>`).join("");
}
function updateDrug(){
  current=medicines.find(x=>x.id===$("drugSelect").value);
  if(!current)return;
  $("drugInfo").innerHTML=`${esc(current.info||"")}${current.brands?.length?`<br><b>Merek:</b> ${esc(current.brands.join(", "))}`:""}`;
  $("indicationSelect").innerHTML=(current.indications||[]).map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join("");
  populateFormulations();
}
function populateFormulations(selectedIndex=null){
  if(!current)return;
  const forms=allFormulations(current);
  const sel=$("formulationSelect"), old=selectedIndex!==null?String(selectedIndex):sel.value;
  sel.innerHTML=forms.map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join("");
  if(old && Number(old)<forms.length) sel.value=old;
}
function num(v){return Number(v)||0}
function round(v){return Math.round(v*100)/100}
function ageMonths(){return num($("ageYears").value)*12+num($("ageMonths").value)}
function dosesPerDay(text=''){
  const s=text.toLowerCase();
  const div=s.match(/dibagi\s+(\d+)\s+dosis/); if(div)return Number(div[1]);
  const every=s.match(/setiap\s+(\d+)\s*[-–]?\s*(?:\d+\s*)?jam/); if(every && Number(every[1])>0)return 24/Number(every[1]);
  return null;
}
function calculate(){
  const wt=num($("weight").value), age=ageMonths(), y=num($("ageYears").value), m=num($("ageMonths").value);
  if(!wt || wt<=0){alert("Masukkan berat badan yang valid.");return}
  const ind=current.indications[num($("indicationSelect").value)];
  const form=allFormulations(current)[num($("formulationSelect").value)];
  if(!ind||!form)return;
  if(current.doseMode==="age") return renderAgeResult(ind,form,wt,age,y,m);
  if(current.doseMode==="weightBand") return renderWeightBand(ind,form,wt,y,m);
  if(current.doseMode==="nonWeight") return renderNonWeight(ind,form,wt,y,m);
  let minMg,maxMg,perDose=false,totalDaily=false;
  if(ind.unit.includes("mg/kg/dosis")){minMg=wt*ind.doseMin;maxMg=wt*ind.doseMax;perDose=true}
  else if(ind.unit.includes("mg/kg/hari")){minMg=wt*ind.doseMin;maxMg=wt*ind.doseMax;totalDaily=true}
  else {minMg=ind.doseMin;maxMg=ind.doseMax}
  if(ind.maxDaily && ind.maxDailyUnit?.includes("mg/hari")){minMg=Math.min(minMg,ind.maxDaily);maxMg=Math.min(maxMg,ind.maxDaily)}
  if(ind.maxDaily && ind.maxDailyUnit?.includes("mg/kg/hari")){minMg=Math.min(minMg,wt*ind.maxDaily);maxMg=Math.min(maxMg,wt*ind.maxDaily)}
  let perDoseMin=minMg, perDoseMax=maxMg, doseNote='';
  if(totalDaily){
    const nDoses=ind.dosesPerDay||dosesPerDay(ind.frequency);
    if(nDoses){perDoseMin=minMg/nDoses;perDoseMax=maxMg/nDoses;doseNote=`≈ ${nDoses} kali/hari (${round(perDoseMin)}–${round(perDoseMax)} mg/dosis)`}
    else doseNote='Dosis di atas adalah total per hari; pembagian per dosis perlu mengikuti regimen yang dipilih.';
  }
  const volume=form.mgPerMl?`${round(perDoseMin/form.mgPerMl)}–${round(perDoseMax/form.mgPerMl)} mL/dosis`:'—';
  const n=num($("powderCount").value)||1;
  const powder=form.mgPerUnit?`${round(perDoseMin*n/form.mgPerUnit)}–${round(perDoseMax*n/form.mgPerUnit)} unit total untuk ${n} puyer`:(perDoseMin?`Bahan aktif per puyer: ${round(perDoseMin)}–${round(perDoseMax)} mg/dosis`:'');
  renderResult({wt,y,m,ind,form,minMg:perDoseMin,maxMg:perDoseMax,volume,powder,perDose:true,totalDaily,dailyMin:minMg,dailyMax:maxMg,doseNote,extra:""});
}
function renderAgeResult(ind,form,wt,age,y,m){
  const rule=(ind.doseRules||[]).find(r=>age>=r.minMonths&&age<=r.maxMonths);
  if(!rule)return renderNeedVerify(ind,form,wt,y,m,"Tidak ada aturan usia yang cocok.");
  renderResult({wt,y,m,ind,form,minMg:null,maxMg:null,volume:"—",powder:"",perDose:false,extra:`<div class="dose-box"><div class="mini">Aturan berdasarkan usia</div><div class="dose">${esc(rule.doseText)}</div><div class="mini">${esc(rule.frequency||"")}</div><div class="mini">${esc(rule.note||"")}</div></div>`});
}
function renderWeightBand(ind,form,wt,y,m){
  const rule=(ind.doseRules||[]).find(r=>wt>=r.minKg&&wt<=r.maxKg);
  if(!rule)return renderNeedVerify(ind,form,wt,y,m,"Tidak ada aturan berat badan yang cocok.");
  renderResult({wt,y,m,ind,form,minMg:null,maxMg:null,volume:"—",powder:"",perDose:false,extra:`<div class="dose-box"><div class="mini">Aturan berdasarkan kelompok BB</div><div class="dose">${esc(rule.doseText)}</div><div class="mini">${esc(rule.frequency||"")}</div><div class="mini">${esc(rule.note||"")}</div></div>`});
}
function renderNonWeight(ind,form,wt,y,m){
  const r=ind.doseRules?.[0];
  renderResult({wt,y,m,ind,form,minMg:null,maxMg:null,volume:"—",powder:"",perDose:false,extra:`<div class="dose-box"><div class="mini">Cara penggunaan</div><div class="dose">${esc(r?.doseText||"Lihat monograf")}</div><div class="mini">${esc(r?.frequency||"")}</div><div class="mini">${esc(r?.note||"")}</div></div>`});
}
function renderResult(o){
  $("emptyResult").hidden=true;$("result").hidden=false;
  $("statusPill").className="status ok";$("statusPill").textContent="HASIL";
  const formula=o.form.name;
  const numeric=o.minMg!=null?`<div class="big-result"><div class="metric"><span>Sediaan</span><b>${esc(formula)}</b></div><div class="metric"><span>Volume</span><b>${esc(o.volume)}</b></div></div>`:`<div class="metric"><span>Sediaan</span><b>${esc(formula)}</b></div>`;
  const daily=o.totalDaily?`<div class="metric"><span>Total dosis/hari</span><b>${round(o.dailyMin)}–${round(o.dailyMax)} mg/hari</b></div>`:"";
  $("result").innerHTML=`<div class="result-title">${esc(current.generic)}</div>
  <div class="result-sub">Merek terkait: ${esc((current.brands||[]).join(", ")||"—")} • Pasien: ${esc($("patientName").value||"—")} • BB ${o.wt} kg • usia ${o.y} th ${o.m} bln</div>
  ${o.extra||""}${daily}
  ${o.minMg!=null?`<div class="dose-box"><div class="mini">Dosis per pemberian</div><div class="dose">${round(o.minMg)}–${round(o.maxMg)} mg/dosis</div><div class="mini">${esc(o.ind.frequency||"")}</div>${o.doseNote?`<div class="mini">${esc(o.doseNote)}</div>`:""}</div>`:""}
  ${numeric}
  ${o.powder?`<div class="metric"><span>Estimasi bahan untuk puyer</span><b>${esc(o.powder)}</b><div class="mini">Perhitungan teoritis; verifikasi kesesuaian tablet untuk digerus/dibagi.</div></div>`:""}
  <div class="checks"><div class="check">✓ Regimen: ${o.ind.unit?`${esc(o.ind.doseMin)}–${esc(o.ind.doseMax)} ${esc(o.ind.unit)}`:"aturan khusus berdasarkan usia/BB"}</div><div class="check warn">⚠ Verifikasi konsentrasi produk, batas usia, indikasi, alergi, kontraindikasi, interaksi, fungsi ginjal/hati, dan informasi produk yang benar-benar tersedia.</div></div>
  <div class="refs"><b>Referensi database:</b> ${esc((o.ind.refs||[]).join(" • "))}</div>`;
}
function renderNeedVerify(ind,form,wt,y,m,msg){
  $("emptyResult").hidden=true;$("result").hidden=false;$("statusPill").className="status warn";$("statusPill").textContent="PERLU VERIFIKASI";
  $("result").innerHTML=`<div class="result-title">${esc(current.generic)}</div><div class="result-sub">BB ${wt} kg • usia ${y} th ${m} bln</div><div class="dose-box"><div class="dose">Tidak dihitung otomatis</div><div class="mini">${esc(msg)}</div></div><div class="checks"><div class="check warn">⚠ Jangan gunakan angka ini untuk menentukan dosis.</div></div><div class="refs"><b>Referensi:</b> ${esc((ind.refs||[]).join(" • "))}</div>`;
}


$("drugSelect").addEventListener("change",updateDrug);
$("calculateBtn").addEventListener("click",calculate);
$("printBtn").addEventListener("click",()=>window.print());






$("drugSearch").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim(); const list=medicines.filter(x=>(x.generic+" "+x.class+" "+(x.brands||[]).join(" ")).toLowerCase().includes(q)); renderTable(list); populateDrugs(list);
});

init().catch(err=>{console.error(err);alert("Database obat gagal dimuat. Pastikan folder data/ ikut di-upload ke GitHub.");});
