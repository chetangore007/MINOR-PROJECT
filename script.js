// AgnoSutra frontend logic (enhanced)
// Keeps original KB + model + rule engine and adds XAI & feedback persistence

// -------------------- Knowledge base --------------------
const KNOWLEDGE_BASE = {
  "Vata": {
    characteristics: ["light","dry","cold","active"],
    diet: ["Warm, oily, grounding foods","Cooked oats, soups, ghee"],
    herbs: ["Ashwagandha","Triphala"],
    yoga: ["Grounding Hatha sequences, slow breathing"],
    routine: ["Regular meals","Massage with warm oil","Sleep early"]
  },
  "Pitta": {
    characteristics: ["hot","sharp","intense"],
    diet: ["Cooling foods","Avoid spicy, fermented food"],
    herbs: ["Brahmi","Neem"],
    yoga: ["Cooling restorative poses","Pranayama"],
    routine: ["Avoid midday heat","Sleep early","Calming activities"]
  },
  "Kapha": {
    characteristics: ["heavy","slow","stable"],
    diet: ["Light meals","Avoid heavy dairy and sugars"],
    herbs: ["Ginger","Turmeric"],
    yoga: ["Energizing sequences","Cardio"],
    routine: ["Active mornings","Light meals","Dry brushing"]
  }
};

// -------------------- Sample dataset (display only) --------------------
const SAMPLE_DATA = [
  {heart_rate:74, sleep_hours:7.0, diet_type:"Vegetarian", stress:2, mood:3, water:2000, dosha:"Pitta"},
  {heart_rate:82, sleep_hours:5.5, diet_type:"Mixed", stress:7, mood:2, water:1500, dosha:"Vata"},
  {heart_rate:68, sleep_hours:8.0, diet_type:"Vegan", stress:3, mood:4, water:2200, dosha:"Kapha"},
];

// Diet mapping for numeric encoding
const DIET_MAP = {"Vegetarian":0, "Mixed":1, "Vegan":2, "Non-Veg":3};

// -------------------- Utility functions --------------------
function htmlEscape(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

// Normalize numeric to 0-1 (simple)
function normalize(val, min, max){
  if(max === min) return 0.5;
  return (val - min) / (max - min);
}

// Simulate sensors
function simulateSensorValues(){
  const hr = Math.round(randomNormal(75,6));
  const temp = (randomNormal(36.6,0.4)).toFixed(2);
  const hum = Math.round(Math.random()*40 + 30);
  return {heart_rate:hr, temp, hum};
}

// small normal RNG
function randomNormal(mu=0, sigma=1){
  // Box-Muller
  let u=0,v=0;
  while(u===0) u=Math.random();
  while(v===0) v=Math.random();
  return mu + sigma*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

// -------------------- Preprocess -> "Model" (weighted score) --------------------
function modelPredict(features){
  const scores = {Vata:0, Pitta:0, Kapha:0};
  const hr = features.heart_rate;
  const sleep = features.sleep_hours;
  const stress = features.stress;
  const mood = features.mood;
  const water = features.water;
  const dietEnc = DIET_MAP[features.diet_type] || 0;

  const n_hr = normalize(hr, 50, 110);         // 0..1
  const n_sleep = normalize(sleep, 0, 12);     // 0..1
  const n_stress = normalize(stress, 0, 10);   // 0..1
  const n_mood = normalize(mood, 1, 5);        // 0..1
  const n_water = normalize(water, 0, 4000);   // 0..1

  scores['Pitta'] += 0.5*n_hr + 0.6*n_stress + 0.3*(1-n_sleep);
  scores['Vata'] += 0.5*(1-n_sleep) + 0.4*n_stress + 0.3*(dietEnc===1 ? 1 : 0);
  scores['Kapha'] += 0.6*(1 - n_hr) + 0.5*n_sleep + 0.3*(dietEnc===0 ? 0.5 : 0);

  scores['Vata'] += 0.2*(1-n_mood);
  scores['Kapha'] += 0.2*n_water;
  scores['Pitta'] += 0.1*(n_mood>0.6 ? 0.4 : 0);

  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const basePred = entries[0][0];
  return {scores, basePred, scoresSorted:entries};
}

// -------------------- Rule engine --------------------
function ruleEngine(inputs, basePrediction){
  const votes = {Vata:0, Pitta:0, Kapha:0};
  votes[basePrediction] += 1;

  const hr = inputs.heart_rate;
  const sleep = inputs.sleep_hours;
  const stress = inputs.stress;
  const diet = inputs.diet_type;

  if(hr > 85 || stress >= 7){
    votes['Pitta'] += 1;
  }
  if(sleep < 6 || diet === "Mixed"){
    votes['Vata'] += 1;
  }
  if(hr < 70 && sleep >= 8){
    votes['Kapha'] += 1;
  }
  if(stress >= 8 && sleep < 5){
    votes['Vata'] += 1;
  }

  const final = Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0];
  return {final, votes};
}

// -------------------- Recommendations --------------------
function generateRecommendations(dosha){
  const kb = KNOWLEDGE_BASE[dosha];
  if(!kb) return {dosha, summary: "No KB", diet:[], herbs:[], yoga:[], routine:[]};
  return {
    dosha,
    summary: `You are ${dosha}-dominant today. Recommended: ${kb.diet.join(", ")}.`,
    diet: kb.diet,
    herbs: kb.herbs,
    yoga: kb.yoga,
    routine: kb.routine
  };
}

// -------------------- UI interactions --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Elements and sliders
  const stressVal = document.getElementById('stressVal');
  const moodVal = document.getElementById('moodVal');
  const stressSlider = document.getElementById('stress');
  const moodSlider = document.getElementById('mood');
  stressVal.textContent = stressSlider.value;
  moodVal.textContent = moodSlider.value;
  stressSlider.addEventListener('input', ()=> stressVal.textContent = stressSlider.value);
  moodSlider.addEventListener('input', ()=> moodVal.textContent = moodSlider.value);

  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const startStream = document.getElementById('startStream');
  const startStreamHero = document.getElementById('startStreamHero');

  analyzeBtn.addEventListener('click', onAnalyze);
  clearBtn.addEventListener('click', onClear);
  startStream.addEventListener('click', onStartStream);
  if(startStreamHero) {
    startStreamHero.addEventListener('click', onStartStreamHero);
    document.getElementById('streamLenHero').addEventListener('change', ()=>{});
  }

  // feedback
  const feedbackSlider = document.getElementById('feedbackSlider');
  const feedbackValue = document.getElementById('feedbackValue');
  const submitFeedback = document.getElementById('submitFeedback');
  feedbackValue.textContent = feedbackSlider.value;
  feedbackSlider.addEventListener('input', ()=> feedbackValue.textContent = feedbackSlider.value);
  submitFeedback.addEventListener('click', ()=> {
    saveFeedback(parseInt(feedbackSlider.value));
  });

  // Populate sample table
  renderSampleTable();
  // init chart
  initChart();

  // load any saved feedback message
  loadFeedbackMessage();
});

function collectInputs(){
  const sleep = parseFloat(document.getElementById('sleep').value) || 0;
  const diet = document.getElementById('diet').value;
  const stress = parseInt(document.getElementById('stress').value) || 0;
  const mood = parseInt(document.getElementById('mood').value) || 3;
  const water = parseInt(document.getElementById('water').value) || 0;
  let heart = parseInt(document.getElementById('heart').value) || 0;
  const simulateSensors = document.getElementById('simulateSensors').checked;
  if(heart === 0 && simulateSensors){
    const s = simulateSensorValues();
    heart = s.heart_rate;
    // show simulated metrics
    updateSensorMetrics(s.heart_rate, s.temp, s.hum);
  }
  return {heart_rate: heart, sleep_hours: sleep, diet_type: diet, stress, mood, water};
}

function onAnalyze(){
  const features = collectInputs();
  const {scores, basePred, scoresSorted} = modelPredict(features);
  const {final, votes} = ruleEngine(features, basePred);
  const rec = generateRecommendations(final);
  renderResults(basePred, final, votes, scores, rec, features, scoresSorted);
  pushChartData(features);
}

function onClear(){
  document.getElementById('inputForm').reset();
  document.getElementById('stressVal').textContent = "3";
  document.getElementById('moodVal').textContent = "3";
  document.getElementById('modelPred').textContent = "Model: —";
  document.getElementById('finalPred').textContent = "Final: —";
  document.getElementById('votesArea').innerHTML = "";
  document.getElementById('recs').innerHTML = "";
  document.getElementById('explanation').textContent = "";
  document.getElementById('xaiList').innerHTML = "";
}

function renderResults(basePred, finalPred, votes, scores, rec, features, scoresSorted){
  document.getElementById('modelPred').textContent = `Model: ${basePred}`;
  document.getElementById('finalPred').textContent = `Final: ${finalPred}`;
  document.getElementById('votesArea').innerHTML = `<strong>Rule votes:</strong> Vata ${votes.Vata}, Pitta ${votes.Pitta}, Kapha ${votes.Kapha}`;
  document.getElementById('explanation').textContent = `Base model suggested ${basePred}. Rule engine adjusted using HR: ${features.heart_rate} bpm, sleep: ${features.sleep_hours} h, stress: ${features.stress}.`;

  // XAI: list top contributing features (simple heuristic)
  const xai = computeXAI(featuresToXAI(features), scoresSorted);
  const xaiList = document.getElementById('xaiList');
  xaiList.innerHTML = "";
  xai.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.feature}: ${it.reason}`;
    xaiList.appendChild(li);
  });

  // recs
  const recDiv = document.getElementById('recs');
  recDiv.innerHTML = `<p><strong>${rec.summary}</strong></p>`;
  let html = "<h4>Diet</h4><ul>";
  rec.diet.forEach(d=> html += `<li>${htmlEscape(d)}</li>`);
  html += "</ul><h4>Herbs</h4><ul>";
  rec.herbs.forEach(h=> html += `<li>${htmlEscape(h)}</li>`);
  html += "</ul><h4>Yoga</h4><ul>";
  rec.yoga.forEach(y=> html += `<li>${htmlEscape(y)}</li>`);
  html += "</ul><h4>Routine</h4><ul>";
  rec.routine.forEach(r=> html += `<li>${htmlEscape(r)}</li>`);
  html += "</ul>";
  recDiv.innerHTML += html;
}

// simple XAI helper: describe influence of features
function featuresToXAI(f){
  return [
    {name:'heart_rate', value:f.heart_rate},
    {name:'sleep_hours', value:f.sleep_hours},
    {name:'stress', value:f.stress},
    {name:'mood', value:f.mood},
    {name:'diet_type', value:f.diet_type},
    {name:'water', value:f.water}
  ];
}
function computeXAI(feats, scoresSorted){
  const out = [];
  // heart rate
  const hr = feats.find(x=>x.name==='heart_rate').value;
  if(hr > 85) out.push({feature:'Heart rate', reason:`High (${hr} bpm) → supports Pitta`});
  else if(hr < 65) out.push({feature:'Heart rate', reason:`Low (${hr} bpm) → supports Kapha/Vata`});
  // sleep
  const sl = feats.find(x=>x.name==='sleep_hours').value;
  if(sl < 6) out.push({feature:'Sleep', reason:`Low sleep (${sl} h) → supports Vata`});
  else if(sl >= 8) out.push({feature:'Sleep', reason:`High sleep (${sl} h) → supports Kapha`});
  // stress
  const st = feats.find(x=>x.name==='stress').value;
  if(st >= 7) out.push({feature:'Stress', reason:`High stress (${st}) → supports Pitta/Vata`});
  // mood
  const md = feats.find(x=>x.name==='mood').value;
  if(md <= 2) out.push({feature:'Mood', reason:`Low mood (${md}) → Vata influence`});
  // diet
  const dt = feats.find(x=>x.name==='diet_type').value;
  if(dt === 'Mixed') out.push({feature:'Diet', reason:`Mixed/irregular diet → Vata`});
  // top model scores
  out.push({feature:'Model scores', reason:`Top: ${scoresSorted.map(s=>s[0]).join(', ')}`});
  return out;
}

// -------------------- Chart: simple metrics --------------------
let metricsChart;
function initChart(){
  const ctx = document.getElementById('metricsChart').getContext('2d');
  metricsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {label:'Heart Rate', data:[], fill:false, tension:0.2},
        {label:'Sleep (h)', data:[], fill:false, tension:0.2},
      ]
    },
    options: {
      responsive: true,
      interaction:{mode:'index',intersect:false},
      scales: { y: { beginAtZero: true } }
    }
  });
}

function pushChartData(features){
  const labels = metricsChart.data.labels;
  labels.push(new Date().toLocaleTimeString());
  metricsChart.data.datasets[0].data.push(features.heart_rate);
  metricsChart.data.datasets[1].data.push(features.sleep_hours);
  if(labels.length>12){
    labels.shift();
    metricsChart.data.datasets.forEach(ds=> ds.data.shift());
  }
  metricsChart.update();
}

// -------------------- Sample table display --------------------
function renderSampleTable(){
  const div = document.getElementById('sampleTable');
  let html = "<table style='width:100%;border-collapse:collapse'><thead><tr>";
  html += "<th style='text-align:left;padding:6px'>Heart</th><th>Sleep</th><th>Diet</th><th>Stress</th><th>Mood</th><th>Water</th><th>Dosha</th></tr></thead><tbody>";
  SAMPLE_DATA.forEach(r=>{
    html += `<tr><td style='padding:6px'>${r.heart_rate}</td><td>${r.sleep_hours}</td><td>${r.diet_type}</td><td>${r.stress}</td><td>${r.mood}</td><td>${r.water}</td><td>${r.dosha}</td></tr>`;
  });
  html += "</tbody></table>";
  div.innerHTML = html;
}

// -------------------- Sensor simulation stream --------------------
async function onStartStream(){
  const len = parseInt(document.getElementById('streamLen').value) || 6;
  const log = document.getElementById('streamLog');
  log.innerHTML = "";
  for(let i=0;i<len;i++){
    const s = simulateSensorValues();
    updateSensorMetrics(s.heart_rate, s.temp, s.hum);
    const line = document.createElement('div');
    line.textContent = `${new Date().toLocaleTimeString()} — HR: ${s.heart_rate} bpm, Temp: ${s.temp}°C, Humidity: ${s.hum}%`;
    log.prepend(line);
    await new Promise(r=> setTimeout(r, 500));
  }
}

async function onStartStreamHero(){
  const len = parseInt(document.getElementById('streamLenHero').value) || 6;
  const log = document.getElementById('streamLogHero');
  log.innerHTML = "";
  for(let i=0;i<len;i++){
    const s = simulateSensorValues();
    updateHeroSensorMetrics(s.heart_rate, s.temp, s.hum);
    const line = document.createElement('div');
    line.textContent = `${new Date().toLocaleTimeString()} — HR: ${s.heart_rate} bpm, Temp: ${s.temp}°C`;
    log.prepend(line);
    await new Promise(r=> setTimeout(r, 450));
  }
}

// update the small sensor metric cards
function updateSensorMetrics(hr, temp, hum){
  document.getElementById('hrMetricAside').textContent = hr + " bpm";
  document.getElementById('tempMetricAside').textContent = temp + " °C";
  document.getElementById('humMetricAside').textContent = hum + " %";
  // also mirror to hero small display if present
  const hrHero = document.getElementById('hrMetric');
  if(hrHero) hrHero.textContent = hr + " bpm";
  const tempHero = document.getElementById('tempMetric');
  if(tempHero) tempHero.textContent = temp + " °C";
  const humHero = document.getElementById('humMetric');
  if(humHero) humHero.textContent = hum + " %";
}
function updateHeroSensorMetrics(hr, temp, hum){
  const hrHero = document.getElementById('hrMetric');
  if(hrHero) hrHero.textContent = hr + " bpm";
  const tempHero = document.getElementById('tempMetric');
  if(tempHero) tempHero.textContent = temp + " °C";
  const humHero = document.getElementById('humMetric');
  if(humHero) humHero.textContent = hum + " %";
}

// -------------------- Feedback persistence (frontend only) --------------------
function saveFeedback(val){
  if(typeof(Storage) !== "undefined"){
    const now = new Date().toISOString();
    const payload = {value:val, time:now};
    // maintain small array
    let arr = JSON.parse(localStorage.getItem('agno_feedback') || "[]");
    arr.push(payload);
    if(arr.length > 50) arr.shift();
    localStorage.setItem('agno_feedback', JSON.stringify(arr));
    document.getElementById('feedbackMsg').textContent = "Thanks — feedback saved locally (demo).";
  } else {
    document.getElementById('feedbackMsg').textContent = "Feedback not supported in this browser.";
  }
  loadFeedbackMessage();
}
function loadFeedbackMessage(){
  const arr = JSON.parse(localStorage.getItem('agno_feedback') || "[]");
  if(arr.length === 0){
    document.getElementById('feedbackMsg').textContent = "No feedback recorded yet.";
  } else {
    const last = arr[arr.length-1];
    document.getElementById('feedbackMsg').textContent = `Last feedback: ${last.value} (on ${new Date(last.time).toLocaleString()})`;
  }
}
