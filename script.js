// ---------- NAVIGATION ----------
document.querySelectorAll('.nav button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.wrap > section').forEach(s=>s.classList.remove('active'));
    document.getElementById(btn.dataset.nav).classList.add('active');
  };
});
document.querySelectorAll('.tabs button').forEach(btn=>{
  btn.onclick=()=>{
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
  if(cat==='akar') return genAkar(level);
  return genFaktorial(level);
}

// ---------- QUIZ STATE ----------
let quizState={};
const timeLimitByLevel={easy:15,medium:20,hard:30};

document.getElementById('startBtn').onclick=()=>{
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
  document.getElementById('qText').textContent=q.q;
  document.getElementById('qAnswer').value='';
  document.getElementById('qAnswer').disabled=false;
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
  const correct=parseFloat(userVal)===q.ans;
  const limit=timeLimitByLevel[s.level];
  const speedScore=Math.max(0,Math.min(30,((limit-timeTaken)/limit)*30));
  const correctScore=correct?70:0;
  const score=Math.round(correctScore+(correct?speedScore:0));
  s.results.push({q:q.q, userVal:userVal||'(kosong)', correctAns:q.ans, correct, timeTaken, score, expl:q.expl});

  const fb=document.getElementById('qFeedback');
  document.getElementById('qAnswer').disabled=true;
  if(correct){
    fb.innerHTML=`<div class="feedback ok">✅ Benar! Waktu: ${timeTaken.toFixed(1)}s — Skor soal ini: ${score}</div>`;
  } else {
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

function showResult(){
  const s=quizState;
  document.getElementById('quiz-play').style.display='none';
  document.getElementById('quiz-result').style.display='block';
  const totalScore=Math.round(s.results.reduce((a,r)=>a+r.score,0)/s.count);
  const correctCount=s.results.filter(r=>r.correct).length;
  const totalTime=s.results.reduce((a,r)=>a+r.timeTaken,0);
  document.getElementById('finalScore').textContent=totalScore;
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
