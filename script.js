// ---------- RENDER TRIK DARI DATA (tricks-data.js) ----------
function renderTrickCard(t,idx,total){
  const examplesHtml=(t.examples||[]).map(ex=>`<div class="example"><b>Contoh:</b> ${ex}</div>`).join('');
  const numbering=total>1?`Trik ${idx+1}: `:'';
  return `<div class="card trick-card">
    <h2>💡 ${numbering}${t.title}</h2>
    <p>${t.description}</p>
    <div class="formula">${t.trick}</div>
    ${examplesHtml}
  </div>`;
}
function renderAllTricks(){
  if(typeof TRICKS_DATA==='undefined') return;
  Object.keys(TRICKS_DATA).forEach(cat=>{
    const container=document.getElementById('tricks-'+cat);
    if(!container) return;
    const list=TRICKS_DATA[cat];
    container.innerHTML=list.map((t,i)=>renderTrickCard(t,i,list.length)).join('');
  });
}
renderAllTricks();

// ---------- SOUND EFFECTS (Web Audio API, tanpa file eksternal) ----------
let soundOn=true;
let audioCtx=null;
function getCtx(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
function beep(freq,dur,type='sine',vol=0.15,delay=0){
  if(!soundOn) return;
  const ctx=getCtx();
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  osc.type=type; osc.frequency.value=freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime+delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+delay+dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime+delay);
  osc.stop(ctx.currentTime+delay+dur);
}
const sfx={
  click:()=>beep(440,0.08,'square',0.08),
  start:()=>{beep(523,0.1);beep(659,0.1,'sine',0.15,0.1);beep(784,0.15,'sine',0.15,0.2);},
  correct:()=>{beep(660,0.1,'sine',0.18);beep(880,0.15,'sine',0.18,0.1);},
  wrong:()=>{beep(220,0.25,'sawtooth',0.15);},
  finish:()=>{beep(523,0.12);beep(659,0.12,'sine',0.18,0.12);beep(784,0.12,'sine',0.18,0.24);beep(1047,0.25,'sine',0.2,0.36);}
};
document.getElementById('soundToggle').onclick=function(){
  soundOn=!soundOn;
  this.textContent=soundOn?'🔊':'🔇';
  if(soundOn) sfx.click();
};

// ---------- CONFETTI ----------
function launchConfetti(){
  const layer=document.getElementById('confetti-layer');
  const emojis=['🎉','✨','⭐','🎊','💫'];
  for(let i=0;i<28;i++){
    const el=document.createElement('span');
    el.className='confetti-piece';
    el.textContent=emojis[rnd(0,emojis.length-1)];
    el.style.left=rnd(0,100)+'vw';
    el.style.animationDuration=(rnd(18,32)/10)+'s';
    el.style.fontSize=(rnd(12,26))+'px';
    layer.appendChild(el);
    setTimeout(()=>el.remove(),3300);
  }
}

// ---------- STATISTIK LOKAL (localStorage) ----------
const STATS_KEY='mathtrik_stats_v1';
const STAT_CATS=[
  {id:'perkalian',label:'Perkalian',icon:'✖️'},
  {id:'pembagian',label:'Pembagian',icon:'➗'},
  {id:'pangkat',label:'Pangkat',icon:'🔺'},
  {id:'akar',label:'Akar',icon:'√'},
  {id:'faktorial',label:'Faktorial',icon:'❗'}
];
function loadStats(){
  try{
    const raw=localStorage.getItem(STATS_KEY);
    return raw?JSON.parse(raw):{};
  }catch(e){ return {}; }
}
function saveStats(stats){
  try{ localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }catch(e){}
}
function updateStats(cat, results){
  const stats=loadStats();
  if(!stats[cat]) stats[cat]={count:0, correct:0, totalScore:0};
  results.forEach(r=>{
    stats[cat].count++;
    if(r.correct) stats[cat].correct++;
    stats[cat].totalScore+=r.score;
  });
  saveStats(stats);
}
function classify(avg,count){
  if(count===0) return {label:'Belum ada data', cls:'kosong'};
  if(count<5) return {label:'Data Kurang, Latihan Lagi 🔍', cls:'kosong'};

  // Tentukan tingkat dasar dari rata-rata nilai
  let tier;
  if(avg>=80) tier={label:'Jago / Cerdas 🏆', cls:'jago'};
  else if(avg>=50) tier={label:'Lumayan 👍', cls:'lumayan'};
  else tier={label:'Butuh Belajar 📚', cls:'belajar'};

  // Kalau nilai masih rendah TAPI udah ngerjain SANGAT banyak soal,
  // itu jadi bahan pertimbangan (kayak emak yang gak langsung marah
  // liat anaknya udah ngerjain ribuan soal walau nilai belum bagus).
  if(avg<50){
    if(count>=500) tier={label:'Butuh Belajar, tapi Rajin Banget 💪🔥', cls:'lumayan'};
    else if(count>=100) tier={label:'Butuh Belajar, tapi Udah Rajin Latihan 💪', cls:'lumayan'};
  }
  return tier;
}
function renderStats(){
  const stats=loadStats();
  const grid=document.getElementById('statsGrid');
  grid.innerHTML='';
  STAT_CATS.forEach(c=>{
    const s=stats[c.id]||{count:0,correct:0,totalScore:0};
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
document.getElementById('resetStatsBtn').onclick=()=>{
  sfx.click();
  localStorage.removeItem(STATS_KEY);
  renderStats();
};

// ---------- NAVIGATION ----------
document.querySelectorAll('.nav button[data-nav]').forEach(btn=>{
  btn.onclick=()=>{
    sfx.click();
    document.querySelectorAll('.nav button[data-nav]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.wrap > section').forEach(s=>s.classList.remove('active'));
    document.getElementById(btn.dataset.nav).classList.add('active');
    if(btn.dataset.nav==='statistik') renderStats();
  };
});
document.querySelectorAll('.tabs button').forEach(btn=>{
  btn.onclick=()=>{
    sfx.click();
    document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t=>t.style.display='none');
    document.getElementById('tab-'+btn.dataset.tab).style.display='block';
  };
});

// ---------- QUESTION GENERATORS ----------
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function factorial(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function doubleFactorial(n){let r=1;for(let i=n;i>1;i-=2)r*=i;return r;}

function genPerkalian(level){
  let a,b,expl;
  if(level==='easy'){ a=rnd(2,9); b=rnd(2,9);
    expl=`${a} × ${b} = ${Array(b).fill(a).join(' + ')} = ${a*b}`;
  } else if(level==='medium'){
    if(Math.random()<0.5){ a=rnd(2,9); b=9;
      expl=`Trik ×9: ${a} × 9 = (${a} × 10) − ${a} = ${a*10} − ${a} = ${a*9}`;
    } else { a=rnd(10,30); b=rnd(2,9);
      expl=`${a} × ${b} = ${a*b}`;
    }
  } else { // hard
    if(Math.random()<0.5){ let x=rnd(1,9); a=x*10+5;
      let head=x*(x+1); let val=head*100+25;
      expl=`Trik kuadrat akhiran 5: ${a}² → ${x}×${x+1}=${head}, tempel 25 → ${val}`;
      return {q:`${a}² = ?`, ans:val, expl};
    } else { a=rnd(11,25); b=rnd(11,25);
      expl=`${a} × ${b} = ${a*b}`;
    }
  }
  return {q:`${a} × ${b} = ?`, ans:a*b, expl};
}

function genPembagian(level){
  let a,b,expl;
  if(level==='easy'){
    b=rnd(2,9); a=rnd(2,9); const n=a*b;
    expl=`${n} ÷ ${b} = ${a}, karena ${b} × ${a} = ${n}`;
    return {q:`${n} ÷ ${b} = ?`, ans:a, expl};
  } else if(level==='medium'){
    if(Math.random()<0.5){
      a=rnd(2,40); const n=a*5;
      expl=`Trik ÷5: ${n} ÷ 5 = (${n} × 2) ÷ 10 = ${n*2} ÷ 10 = ${a}`;
      return {q:`${n} ÷ 5 = ?`, ans:a, expl};
    } else {
      b=rnd(2,9); a=rnd(10,20); const n=a*b;
      expl=`${n} ÷ ${b} = ${a}, karena ${b} × ${a} = ${n}`;
      return {q:`${n} ÷ ${b} = ?`, ans:a, expl};
    }
  } else { // hard
    if(Math.random()<0.5){
      a=rnd(10,60); const n=a*4;
      expl=`Trik ÷4: ${n} ÷ 4 = (${n} ÷ 2) ÷ 2 = ${n/2} ÷ 2 = ${a}`;
      return {q:`${n} ÷ 4 = ?`, ans:a, expl};
    } else {
      a=rnd(15,80); const n=a*5;
      expl=`Trik ÷5: ${n} ÷ 5 = (${n} × 2) ÷ 10 = ${n*2} ÷ 10 = ${a}`;
      return {q:`${n} ÷ 5 = ?`, ans:a, expl};
    }
  }
}

function genPangkat(level){
  let a,n,expl;
  if(level==='easy'){
    a=rnd(2,9); n=2;
    expl=`${a}² = ${a} × ${a} = ${a*a}`;
    return {q:`${a}² = ?`, ans:a*a, expl};
  } else if(level==='medium'){
    a=rnd(2,6); n=3;
    expl=`${a}³ = ${a} × ${a} × ${a} = ${a*a*a}`;
    return {q:`${a}³ = ?`, ans:a*a*a, expl};
  } else { // hard: trik kuadrat akhiran 5
    let x=rnd(1,9); a=x*10+5;
    let head=x*(x+1); let val=head*100+25;
    expl=`Trik kuadrat akhiran 5: ${a}² → ${x}×${x+1}=${head}, tempel 25 → ${val}`;
    return {q:`${a}² = ?`, ans:val, expl};
  }
}

function genAkar(level){
  let n;
  if(level==='easy'){ n=rnd(1,10); }
  else if(level==='medium'){ n=rnd(8,20); }
  else { n=rnd(15,40); }
  const sq=n*n;
  const expl=`√${sq} = ${n}, karena ${n} × ${n} = ${sq}`;
  return {q:`√${sq} = ?`, ans:n, expl};
}

function genFaktorial(level){
  if(level==='easy'){
    const n=rnd(2,5);
    const expl=`${n}! = ${Array.from({length:n},(_,i)=>n-i).join(' × ')} = ${factorial(n)}`;
    return {q:`${n}! = ?`, ans:factorial(n), expl};
  } else if(level==='medium'){
    const n=rnd(6,8);
    const expl=`${n}! = ${Array.from({length:n},(_,i)=>n-i).join(' × ')} = ${factorial(n)}`;
    return {q:`${n}! = ?`, ans:factorial(n), expl};
  } else {
    if(Math.random()<0.5){
      const n=rnd(6,9);
      const steps=[]; for(let i=n;i>1;i-=2) steps.push(i);
      const expl=`${n}‼ (multifaktorial loncat 2) = ${steps.join(' × ')} = ${doubleFactorial(n)}`;
      return {q:`${n}‼ = ?`, ans:doubleFactorial(n), expl};
    } else {
      const n=rnd(9,10);
      const expl=`${n}! = ${Array.from({length:n},(_,i)=>n-i).join(' × ')} = ${factorial(n)}`;
      return {q:`${n}! = ?`, ans:factorial(n), expl};
    }
  }
}

function genQuestion(cat,level){
  if(cat==='perkalian') return genPerkalian(level);
  if(cat==='pembagian') return genPembagian(level);
  if(cat==='pangkat') return genPangkat(level);
  if(cat==='akar') return genAkar(level);
  return genFaktorial(level);
}

// ---------- QUIZ STATE ----------
let quizState={};
const timeLimitByLevel={easy:15,medium:20,hard:30};

document.getElementById('startBtn').onclick=()=>{
  sfx.start();
  const cat=document.getElementById('qCategory').value;
  const level=document.getElementById('qLevel').value;
  const count=parseInt(document.getElementById('qCount').value);
  const questions=[];
  for(let i=0;i<count;i++) questions.push(genQuestion(cat,level));
  quizState={cat,level,count,questions,idx:0,results:[],startTime:0,timerInt:null,answered:false};
  document.getElementById('quiz-setup').style.display='none';
  document.getElementById('quiz-result').style.display='none';
  document.getElementById('quiz-play').style.display='block';
  showQuestion();
};

function showQuestion(){
  const s=quizState;
  const q=s.questions[s.idx];
  document.getElementById('qProgress').textContent=`Soal ${s.idx+1}/${s.count}`;
  document.getElementById('progBar').style.width=`${(s.idx/s.count)*100}%`;
  const qTextEl=document.getElementById('qText');
  qTextEl.textContent=q.q;
  qTextEl.classList.remove('pop'); void qTextEl.offsetWidth; qTextEl.classList.add('pop');
  document.getElementById('qAnswer').value='';
  document.getElementById('qAnswer').disabled=false;
  document.getElementById('qAnswer').classList.remove('shake','good-pulse');
  document.getElementById('qFeedback').innerHTML='';
  document.getElementById('submitBtn').style.display='inline-block';
  document.getElementById('submitBtn').textContent='Jawab';
  s.answered=false;
  s.startTime=performance.now();
  clearInterval(s.timerInt);
  s.timerInt=setInterval(()=>{
    const el=document.getElementById('qTimer');
    const t=(performance.now()-s.startTime)/1000;
    el.textContent=t.toFixed(1)+'s';
  },100);
  document.getElementById('qAnswer').focus();
}

function submitAnswer(){
  const s=quizState;
  if(s.answered) { nextQuestion(); return; }
  s.answered=true;
  clearInterval(s.timerInt);
  const timeTaken=(performance.now()-s.startTime)/1000;
  const q=s.questions[s.idx];
  const userVal=document.getElementById('qAnswer').value.trim();
  const correct=parseInt(userVal,10)===q.ans;
  const limit=timeLimitByLevel[s.level];
  let speedScore;
  if(timeTaken<=3){ speedScore=30; }
  else{ speedScore=Math.max(0, 30*(limit-timeTaken)/(limit-3)); }
  const correctScore=correct?70:0;
  const score=correct?Math.round(correctScore+speedScore):0;
  s.results.push({q:q.q, userVal:userVal||'(kosong)', correctAns:q.ans, correct, timeTaken, score, expl:q.expl});

  const fb=document.getElementById('qFeedback');
  const answerEl=document.getElementById('qAnswer');
  answerEl.disabled=true;
  if(correct){
    sfx.correct();
    answerEl.classList.add('good-pulse');
    fb.innerHTML=`<div class="feedback ok">✅ Benar! Waktu: ${timeTaken.toFixed(1)}s — Skor soal ini: ${score}</div>`;
  } else {
    sfx.wrong();
    answerEl.classList.add('shake');
    fb.innerHTML=`<div class="feedback no">❌ Kurang tepat. Jawaban kamu: ${userVal||'-'} | Jawaban benar: ${q.ans}<br><br>${q.expl}</div>`;
  }
  document.getElementById('submitBtn').textContent = (s.idx===s.count-1) ? 'Lihat Hasil' : 'Soal Berikutnya →';
}

function nextQuestion(){
  const s=quizState;
  s.idx++;
  if(s.idx>=s.count){ showResult(); } else { showQuestion(); }
}

document.getElementById('submitBtn').onclick=submitAnswer;
document.getElementById('qAnswer').addEventListener('keydown',e=>{ if(e.key==='Enter') submitAnswer(); });
document.getElementById('qAnswer').addEventListener('input',function(){
  this.value=this.value.replace(/[^0-9]/g,'');
});

function showResult(){
  sfx.finish();
  const s=quizState;
  updateStats(s.cat, s.results);
  document.getElementById('quiz-play').style.display='none';
  document.getElementById('quiz-result').style.display='block';
  const totalScore=Math.round(s.results.reduce((a,r)=>a+r.score,0)/s.count);
  const correctCount=s.results.filter(r=>r.correct).length;
  const totalTime=s.results.reduce((a,r)=>a+r.timeTaken,0);
  const scoreEl=document.getElementById('finalScore');
  scoreEl.textContent=totalScore;
  scoreEl.classList.remove('reveal'); void scoreEl.offsetWidth; scoreEl.classList.add('reveal');
  if(totalScore>=80) launchConfetti();
  document.getElementById('statCorrect').textContent=correctCount;
  document.getElementById('statWrong').textContent=s.count-correctCount;
  document.getElementById('statTime').textContent=totalTime.toFixed(1)+'s';

  const list=document.getElementById('resultList');
  list.innerHTML='';
  s.results.forEach((r,i)=>{
    const div=document.createElement('div');
    div.className='result-item'+(r.correct?'':' wrong');
    div.innerHTML=`<div class="qtext">Soal ${i+1}: ${r.q}</div>
      <div class="meta">Jawabanmu: ${r.userVal} | Jawaban benar: ${r.correctAns} | Waktu: ${r.timeTaken.toFixed(1)}s | Skor: ${r.score}</div>
      ${r.correct?'':`<div class="expl">📘 ${r.expl}</div>`}`;
    list.appendChild(div);
  });
}

document.getElementById('retryBtn').onclick=()=>{
  document.getElementById('quiz-result').style.display='none';
  document.getElementById('quiz-setup').style.display='block';
};
