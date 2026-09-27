/* =========================================================================
   AUTH.JS — Sistem Akun (Firebase Authentication + Firestore)
   Username disimpan sebagai email palsu "username@mathtrik.local" di
   belakang layar, karena Firebase Auth butuh format email. User gak
   pernah lihat/pakai format ini, cukup ketik username biasa.
   ========================================================================= */

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();

const STAT_CATS=[
  {id:'perkalian',label:'Perkalian',icon:'✖️'},
  {id:'pembagian',label:'Pembagian',icon:'➗'},
  {id:'pangkat',label:'Pangkat',icon:'🔺'},
  {id:'akar',label:'Akar',icon:'√'},
  {id:'faktorial',label:'Faktorial',icon:'❗'}
];

function cleanUsername(u){ return u.trim().toLowerCase().replace(/[^a-z0-9_]/g,''); }
function usernameToEmail(u){ return cleanUsername(u)+'@mathtrik.local'; }
function setMsg(id,text,isError){
  const el=document.getElementById(id);
  el.textContent=text;
  el.className='auth-msg '+(isError?'err':'ok');
}

// ---------- REGISTER ----------
document.getElementById('registerBtn').onclick=async()=>{
  const uRaw=document.getElementById('regUsername').value;
  const pass=document.getElementById('regPassword').value;
  const uname=cleanUsername(uRaw);
  if(uname.length<3){ setMsg('registerMsg','Username minimal 3 karakter (huruf/angka/underscore).',true); return; }
  if(pass.length<6){ setMsg('registerMsg','Password minimal 6 karakter.',true); return; }
  try{
    const cred=await auth.createUserWithEmailAndPassword(usernameToEmail(uname),pass);
    await db.collection('users').doc(cred.user.uid).set({username:uname});
    await db.collection('stats').doc(cred.user.uid).set({});
    setMsg('registerMsg','Akun berhasil dibuat! Selamat datang, '+uname+' 🎉',false);
    sfx.finish();
  }catch(e){
    if(e.code==='auth/email-already-in-use') setMsg('registerMsg','Username sudah dipakai orang lain.',true);
    else setMsg('registerMsg','Gagal daftar: '+e.message,true);
  }
};

// ---------- LOGIN ----------
document.getElementById('loginBtn').onclick=async()=>{
  const uname=cleanUsername(document.getElementById('loginUsername').value);
  const pass=document.getElementById('loginPassword').value;
  if(!uname||!pass){ setMsg('loginMsg','Isi username dan password dulu.',true); return; }
  try{
    await auth.signInWithEmailAndPassword(usernameToEmail(uname),pass);
    setMsg('loginMsg','',false);
  }catch(e){
    setMsg('loginMsg','Username atau password salah.',true);
  }
};

// ---------- LOGOUT ----------
document.getElementById('logoutBtn').onclick=()=>{ sfx.click(); auth.signOut(); };

// ---------- GANTI USERNAME ----------
document.getElementById('changeUsernameBtn').onclick=async()=>{
  const user=auth.currentUser; if(!user) return;
  const newUname=cleanUsername(document.getElementById('newUsername').value);
  const curPass=document.getElementById('confirmPassUsername').value;
  if(newUname.length<3){ setMsg('changeUsernameMsg','Username minimal 3 karakter.',true); return; }
  if(!curPass){ setMsg('changeUsernameMsg','Masukkan password saat ini buat konfirmasi.',true); return; }
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(user.email,curPass);
    await user.reauthenticateWithCredential(cred);
    await user.updateEmail(usernameToEmail(newUname));
    await db.collection('users').doc(user.uid).set({username:newUname},{merge:true});
    document.getElementById('currentUsername').textContent=newUname;
    document.getElementById('newUsername').value='';
    document.getElementById('confirmPassUsername').value='';
    setMsg('changeUsernameMsg','Username berhasil diganti ke '+newUname+' ✅',false);
  }catch(e){
    if(e.code==='auth/email-already-in-use') setMsg('changeUsernameMsg','Username itu sudah dipakai.',true);
    else if(e.code==='auth/wrong-password') setMsg('changeUsernameMsg','Password salah.',true);
    else setMsg('changeUsernameMsg','Gagal: '+e.message,true);
  }
};

// ---------- GANTI PASSWORD ----------
document.getElementById('changePasswordBtn').onclick=async()=>{
  const user=auth.currentUser; if(!user) return;
  const newPass=document.getElementById('newPassword').value;
  const curPass=document.getElementById('confirmPassPassword').value;
  if(newPass.length<6){ setMsg('changePasswordMsg','Password baru minimal 6 karakter.',true); return; }
  if(!curPass){ setMsg('changePasswordMsg','Masukkan password saat ini buat konfirmasi.',true); return; }
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(user.email,curPass);
    await user.reauthenticateWithCredential(cred);
    await user.updatePassword(newPass);
    document.getElementById('newPassword').value='';
    document.getElementById('confirmPassPassword').value='';
    setMsg('changePasswordMsg','Password berhasil diganti ✅',false);
  }catch(e){
    if(e.code==='auth/wrong-password') setMsg('changePasswordMsg','Password saat ini salah.',true);
    else setMsg('changePasswordMsg','Gagal: '+e.message,true);
  }
};

// ---------- STATISTIK CLOUD ----------
async function updateStatsCloud(cat,results){
  const user=auth.currentUser;
  if(!user) return; // gak login -> statistik gak disimpen
  const ref=db.collection('stats').doc(user.uid);
  const doc=await ref.get();
  const data=doc.exists?doc.data():{};
  if(!data[cat]) data[cat]={count:0,correct:0,totalScore:0};
  results.forEach(r=>{
    data[cat].count++;
    if(r.correct) data[cat].correct++;
    data[cat].totalScore+=r.score;
  });
  await ref.set(data,{merge:true});
}
function classify(avg,count){
  if(count===0) return {label:'Belum ada data', cls:'kosong'};
  if(count<5) return {label:'Data Kurang, Latihan Lagi 🔍', cls:'kosong'};
  let tier;
  if(avg>=80) tier={label:'Jago / Cerdas 🏆', cls:'jago'};
  else if(avg>=50) tier={label:'Lumayan 👍', cls:'lumayan'};
  else tier={label:'Butuh Belajar 📚', cls:'belajar'};
  if(avg<50){
    if(count>=500) tier={label:'Butuh Belajar, tapi Rajin Banget 💪🔥', cls:'lumayan'};
    else if(count>=100) tier={label:'Butuh Belajar, tapi Udah Rajin Latihan 💪', cls:'lumayan'};
  }
  return tier;
}
async function renderStatsCloud(){
  const user=auth.currentUser; if(!user) return;
  const doc=await db.collection('stats').doc(user.uid).get();
  const data=doc.exists?doc.data():{};
  const grid=document.getElementById('statsGrid');
  grid.innerHTML='';
  STAT_CATS.forEach(c=>{
    const s=data[c.id]||{count:0,correct:0,totalScore:0};
    const avg=s.count>0?Math.round(s.totalScore/s.count):0;
    const info=classify(avg,s.count);
    const div=document.createElement('div');
    div.className='stat-card';
    div.innerHTML=`<h4>${c.icon} ${c.label}</h4>
      <div class="avg">${s.count>0?avg:'-'}</div>
      <div class="detail">${s.count} soal dikerjakan • ${s.correct} benar</div>
      <span class="badge ${info.cls}">${info.label}</span>`;
    grid.appendChild(div);
  });
}
document.getElementById('resetStatsBtn').onclick=async()=>{
  const user=auth.currentUser; if(!user) return;
  sfx.click();
  await db.collection('stats').doc(user.uid).set({});
  renderStatsCloud();
};

// ---------- TAB LOGIN/DAFTAR TOGGLE ----------
document.querySelectorAll('[data-authtab]').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('[data-authtab]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('authtab-login').style.display=btn.dataset.authtab==='login'?'block':'none';
    document.getElementById('authtab-register').style.display=btn.dataset.authtab==='register'?'block':'none';
  };
});

// ---------- AUTH STATE ----------
auth.onAuthStateChanged(async(user)=>{
  const gate=document.getElementById('auth-gate');
  const accPanel=document.getElementById('account-panel');
  const statsPanel=document.getElementById('stats-panel');
  if(user){
    gate.style.display='none';
    accPanel.style.display='block';
    statsPanel.style.display='block';
    const udoc=await db.collection('users').doc(user.uid).get();
    const uname=udoc.exists?udoc.data().username:cleanUsername(user.email.split('@')[0]);
    document.getElementById('currentUsername').textContent=uname;
    renderStatsCloud();
  } else {
    gate.style.display='block';
    accPanel.style.display='none';
    statsPanel.style.display='none';
  }
});
