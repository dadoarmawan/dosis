let medicines=[]; let current=null;

const $=id=>document.getElementById(id);
async function init(){
  medicines=await fetch("data/medicines.json").then(r=>r.json());
  $("drugCount").textContent=`${medicines.length} obat`;
  renderTable(medicines); populateDrugs(medicines);
}
function populateDrugs(list){
  const sel=$("drugSelect"), old=sel.value;
  sel.innerHTML=list.map(x=>`<option value="${x.id}">${x.generic}</option>`).join("");
  if(old && list.some(x=>x.id===old)) sel.value=old;
  updateDrug();
}
function renderTable(list){
  $("drugTable").innerHTML=list.map(d=>`<tr><td><b>${d.generic}</b></td><td>${d.class}</td><td>${d.formulations.map(f=>f.name).join(", ")}</td><td>${d.indications[0]?.refs?.join("; ")||"-"}</td></tr>`).join("");
}
function updateDrug(){
  current=medicines.find(x=>x.id===$("drugSelect").value);
  if(!current)return;
  $("drugInfo").textContent=current.info;
  $("indicationSelect").innerHTML=current.indications.map((x,i)=>`<option value="${i}">${x.name} • ${x.doseMin}–${x.doseMax} ${x.unit}</option>`).join("");
  $("formulationSelect").innerHTML=current.formulations.map((x,i)=>`<option value="${i}">${x.name}</option>`).join("");
}
function num(v){return Number(v)||0}
function round(v){return Math.round(v*100)/100}
function calculate(){
  const wt=num($("weight").value);
  const y=num($("ageYears").value), m=num($("ageMonths").value);
  if(!wt || wt<=0){alert("Masukkan berat badan yang valid."); return;}
  const ind=current.indications[num($("indicationSelect").value)];
  const form=current.formulations[num($("formulationSelect").value)];
  if(!ind){return}
  if(ind.doseMax===0){renderNeedVerify(ind,form,wt,y,m);return}
  let minMg,maxMg,perDose=false;
  if(ind.unit.includes("mg/kg/dosis")){
    minMg=wt*ind.doseMin; maxMg=wt*ind.doseMax; perDose=true;
  } else if(ind.unit.includes("mg/kg/hari")){
    minMg=wt*ind.doseMin; maxMg=wt*ind.doseMax;
  } else {
    minMg=ind.doseMin; maxMg=ind.doseMax;
  }
  if(ind.maxDaily && ind.maxDailyUnit.includes("mg/hari")){minMg=Math.min(minMg,ind.maxDaily);maxMg=Math.min(maxMg,ind.maxDaily)}
  if(ind.maxDaily && ind.maxDailyUnit.includes("mg/kg/hari")){minMg=Math.min(minMg,wt*ind.maxDaily);maxMg=Math.min(maxMg,wt*ind.maxDaily)}
  let volume="";
  if(form.mgPerMl){volume=`${round(minMg/form.mgPerMl)}–${round(maxMg/form.mgPerMl)} mL`;}
  let powder="";
  if(form.mgPerUnit){
    const n=num($("powderCount").value)||1;
    powder=`${round(minMg*n/form.mgPerUnit)}–${round(maxMg*n/form.mgPerUnit)} ${form.name.toLowerCase().includes("tablet")?"tablet":"unit"} total untuk ${n} puyer`;
  }
  renderResult({wt,y,m,ind,form,minMg,maxMg,volume,powder,perDose});
}
function renderResult(o){
  $("emptyResult").hidden=true;$("result").hidden=false;
  $("statusPill").className="status ok";$("statusPill").textContent="HASIL TERHITUNG";
  const age=o.y*12+o.m;
  $("result").innerHTML=`
    <div class="result-title">${current.generic}</div>
    <div class="result-sub">Pasien: ${$("patientName").value||"—"} • BB ${o.wt} kg • usia ${o.y} th ${o.m} bln</div>
    <div class="dose-box"><div class="mini">Dosis berdasarkan regimen terpilih</div>
      <div class="dose">${o.perDose?`${round(o.minMg)}–${round(o.maxMg)} mg/dosis`:`${round(o.minMg)}–${round(o.maxMg)} mg`}</div>
      <div class="mini">${o.ind.frequency}</div>
    </div>
    <div class="big-result">
      <div class="metric"><span>Sediaan</span><b>${o.form.name}</b></div>
      <div class="metric"><span>Volume per pemberian</span><b>${o.volume||"—"}</b></div>
    </div>
    ${o.powder?`<div class="metric"><span>Estimasi bahan untuk puyer</span><b>${o.powder}</b><div class="mini">Ini perhitungan teoritis, bukan instruksi pencampuran/formulasi.</div></div>`:""}
    <div class="checks">
      <div class="check">✓ Regimen: ${o.ind.doseMin}–${o.ind.doseMax} ${o.ind.unit}</div>
      ${o.ind.maxDaily?`<div class="check">✓ Batas yang tersimpan: ${o.ind.maxDaily} ${o.ind.maxDailyUnit}</div>`:""}
      <div class="check warn">⚠ Verifikasi kembali konsentrasi produk, batas usia, alergi, kontraindikasi, interaksi, fungsi ginjal/hati, dan dosis maksimum.</div>
    </div>
    <div class="refs"><b>Referensi database:</b> ${(o.ind.refs||[]).join(" • ")}</div>`;
}
function renderNeedVerify(ind,form,wt,y,m){
  $("emptyResult").hidden=true;$("result").hidden=false;$("statusPill").className="status warn";$("statusPill").textContent="PERLU VERIFIKASI";
  $("result").innerHTML=`<div class="result-title">${current.generic}</div><div class="result-sub">BB ${wt} kg • usia ${y} th ${m} bln</div><div class="dose-box"><div class="dose">Tidak dihitung otomatis</div><div class="mini">Regimen pada database ditandai perlu verifikasi terhadap pedoman/produk yang digunakan.</div></div><div class="checks"><div class="check warn">⚠ Jangan gunakan angka ini untuk menentukan dosis.</div><div class="check">Referensi: ${(ind.refs||[]).join(" • ")}</div></div>`;
}
$("drugSelect").addEventListener("change",updateDrug);
$("calculateBtn").addEventListener("click",calculate);
$("printBtn").addEventListener("click",()=>window.print());
$("drugSearch").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim();
  const list=medicines.filter(x=>(x.generic+" "+x.class).toLowerCase().includes(q));
  renderTable(list);populateDrugs(list);
});
init().catch(err=>{console.error(err);alert("Database obat gagal dimuat. Pastikan folder data/ ikut di-upload ke GitHub.");});
