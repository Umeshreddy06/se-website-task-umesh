const defaultProjects=[
 {title:"Real-Time Object Detection & Logging Platform",tech:"Python • YOLO • OpenCV • Streamlit • MySQL",desc:"An AI/ML application for real-time object detection and logging, combining computer vision with database storage."},
 {title:"Personal Portfolio Website",tech:"HTML • CSS • JavaScript • Vercel",desc:"A responsive portfolio website presenting skills, projects, professional profiles and contact information."},
 {title:"Student Management System",tech:"Python",desc:"A practical Python application designed to manage student records and basic academic information."}
];

const DB_NAME="UCRStudentHubDB", STORE="records";
let records=[];

function openDB(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error);
 });
}
async function loadRecords(){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly"), req=tx.objectStore(STORE).getAll();
  req.onsuccess=()=>{records=req.result;resolve(records)};
  req.onerror=()=>reject(req.error);
 });
}
async function addRecord(record){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).add(record);
  tx.oncomplete=()=>{loadRecords().then(resolve)};
  tx.onerror=()=>reject(tx.error);
 });
}
async function clearRecords(){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).clear();
  tx.oncomplete=()=>{records=[];renderProjects();renderRecords();resolve()};
  tx.onerror=()=>reject(tx.error);
 });
}
function renderProjects(){
 const grid=document.getElementById("projectGrid");
 const all=[...defaultProjects,...records.filter(r=>r.kind==="project")];
 grid.innerHTML=all.map(p=>`<article class="project"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p><div class="tags">${escapeHtml(p.tech).split("•").map(x=>`<span class="tag">${x.trim()}</span>`).join("")}</div></article>`).join("");
}
function renderRecords(){
 const box=document.getElementById("recordList");
 if(!records.length){box.innerHTML='<div class="record"><small>Database is empty. Add a project or send a message.</small></div>';return}
 box.innerHTML=records.slice().reverse().map(r=>`<div class="record"><strong>${escapeHtml(r.title)}</strong><br><small>${escapeHtml(r.meta)} • ${new Date(r.created).toLocaleString()}</small></div>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function showToast(msg){document.getElementById("toast").textContent=msg;setTimeout(()=>document.getElementById("toast").textContent="",3000)}

document.getElementById("projectForm").addEventListener("submit",async e=>{
 e.preventDefault();
 await addRecord({kind:"project",title:document.getElementById("pTitle").value,meta:document.getElementById("pTech").value,tech:document.getElementById("pTech").value,desc:document.getElementById("pDesc").value,created:Date.now()});
 e.target.reset();renderProjects();renderRecords();showToast("Project saved to IndexedDB database.");
});
document.getElementById("contactForm").addEventListener("submit",async e=>{
 e.preventDefault();
 await addRecord({kind:"message",title:document.getElementById("cName").value,meta:`${document.getElementById("cEmail").value}: ${document.getElementById("cMessage").value}`,created:Date.now()});
 e.target.reset();renderProjects();renderRecords();showToast("Message saved to IndexedDB database.");
});
document.getElementById("clearBtn").addEventListener("click",async()=>{await clearRecords();showToast("Database records cleared.")});
document.getElementById("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("theme")==="light")document.body.classList.add("light");
loadRecords().then(()=>{renderProjects();renderRecords()});
