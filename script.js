/* Mint/Ayurveda theme (Option A) */
:root{
  --bg:#f4fff6;        /* faint mint background */
  --card:#ffffff;
  --muted:#60756a;
  --accent:#1c8c64;    /* emerald */
  --accent-2:#2aa36a;
  --accent-dark:#0f6b46;
  --glass: rgba(255,255,255,0.6);
  --radius:12px;
  --shadow: 0 6px 22px rgba(28,140,100,0.06);
  --soft-shadow: 0 4px 14px rgba(16,30,20,0.04);
}

/* base */
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family: 'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  background:var(--bg);
  color:#123;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.45;
}

/* layout */
.container{max-width:1150px;margin:0 auto;padding:20px}
.topnav{background:transparent;padding:10px 0}
.nav-inner{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:10px}
.logo{font-size:20px}
.title{font-weight:700;color:var(--accent-dark);font-size:20px}
.nav-links{list-style:none;display:flex;gap:14px;margin:0;padding:0}
.nav-links a{color:var(--accent-dark);text-decoration:none;font-weight:600}

/* HERO */
.hero{padding:28px 0}
.hero-grid{display:flex;gap:24px;align-items:stretch}
.hero-left{flex:1}
.hero-right{width:360px}
.hero h1{font-size:28px;margin:0;color:var(--accent-dark)}
.hero-tag{color:var(--muted);margin-top:8px}
.hero-ctas{margin-top:14px;display:flex;gap:10px}
.btn{border:0;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:600}
.btn.primary{background:linear-gradient(180deg,var(--accent),var(--accent-2));color:white;box-shadow:0 6px 16px rgba(26,120,80,0.12)}
.btn.ghost{background:transparent;border:1px solid rgba(12,80,60,0.06);color:var(--accent-dark)}
.btn.small{padding:6px 10px;font-size:13px;border-radius:8px}

/* hero right card */
.card{background:var(--card);border-radius:var(--radius);box-shadow:var(--soft-shadow);padding:16px}
.metrics{display:flex;gap:10px;align-items:center;margin-top:8px}
.metric{flex:1;background:linear-gradient(180deg,#ffffff,#fbfff9);padding:10px;border-radius:10px;text-align:center}
.metric-big{font-size:20px;font-weight:700;color:var(--accent-dark)}
.metric-label{font-size:13px;color:var(--muted);margin-top:6px}
.stream-controls{display:flex;gap:8px;margin-top:12px;align-items:center}
.stream-input{width:70px;padding:8px;border-radius:8px;border:1px solid #e6efe6}

/* feature row */
.feature-row{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.feat{background:rgba(40,120,80,0.06);color:var(--accent-dark);padding:8px 10px;border-radius:10px;font-weight:600}

/* MAIN GRID */
.main-grid{display:grid;grid-template-columns:2fr 1fr;gap:18px;align-items:start;margin-top:10px}

/* forms */
.form-grid label{display:block;margin-bottom:10px;font-weight:600;color:var(--accent-dark)}
input[type="number"], select, input[type="range"]{width:100%;padding:10px;border-radius:8px;border:1px solid #e9f5ee;background:transparent}
.range-row{display:flex;align-items:center;gap:10px}
.slider-value{background:#eef9f2;padding:6px 8px;border-radius:8px;color:var(--accent-dark);font-weight:600}
.checkbox{display:flex;align-items:center;gap:8px}

/* sensor aside */
.sensor-cards{display:flex;gap:10px;justify-content:space-between;margin:8px 0}
.sensor-card{flex:1;background:linear-gradient(180deg,#fff,#f7fff7);border-radius:10px;padding:12px;text-align:center;box-shadow:var(--soft-shadow)}
.sensor-value{font-weight:700;color:var(--accent-dark);font-size:18px}
.sensor-label{font-size:13px;color:var(--muted);margin-top:6px}
.stream-row{display:flex;gap:8px;align-items:center}
.stream-log{height:120px;overflow:auto;background:#fbfff9;border-radius:8px;padding:8px;border:1px solid #eef6ee;margin-top:10px}

/* chart */
.chart-wrap{margin-top:12px}

/* result panels */
.result-panel{display:flex;gap:18px;align-items:flex-start}
.result-left{flex:1}
.result-right{flex:1;padding:14px;background:linear-gradient(180deg,#fbfff9,#ffffff);border-radius:10px}

/* xai */
.xai.small{padding:12px;margin-top:12px}
.small-list{margin:8px 0 0 16px;color:var(--muted)}

/* table */
.table{margin-top:12px;padding:12px;background:linear-gradient(180deg,#fff,#fbfff9);border-radius:12px;box-shadow:var(--soft-shadow)}
.table table{width:100%;border-collapse:collapse}
.table th{text-align:left;padding:10px;color:var(--accent-dark)}
.table td{padding:10px;border-top:1px solid #f2f9f2;color:#123}

/* feedback */
.feedback-row{display:flex;align-items:center;gap:12px;margin-top:8px}
#feedbackValue{font-weight:700;color:var(--accent-dark)}

/* architecture */
.arch-grid{display:flex;gap:12px;margin-top:12px}
.arch-box{flex:1;padding:14px;border-radius:12px;background:linear-gradient(180deg,#fff,#f8fff7);box-shadow:var(--soft-shadow);border:1px solid #eef6ee}
.arch-box h4{margin:0;color:var(--accent-dark)}

/* footer */
.site-footer{margin-top:28px;padding:20px 0;text-align:center;color:var(--muted)}

/* responsiveness */
@media(max-width:960px){
  .main-grid{grid-template-columns:1fr}
  .hero-grid{flex-direction:column}
  .hero-right{width:100%}
  .nav-links{display:none}
  .feature-row{gap:8px}
}
