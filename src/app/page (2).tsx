import { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_EXAMS = [
  {
    id: "1",
    title: "React.js Fundamentals",
    candidates: 24,
    questionSets: 3,
    slots: 30,
    duration: 45,
    questions: 20,
    negativeMarking: false,
    startTime: "2026-04-12T10:00",
    endTime: "2026-04-12T11:00",
  },
  {
    id: "2",
    title: "JavaScript ES6+ Deep Dive",
    candidates: 18,
    questionSets: 2,
    slots: 25,
    duration: 60,
    questions: 30,
    negativeMarking: true,
    startTime: "2026-04-13T14:00",
    endTime: "2026-04-13T15:30",
  },
  {
    id: "3",
    title: "TypeScript & Advanced Patterns",
    candidates: 12,
    questionSets: 4,
    slots: 20,
    duration: 90,
    questions: 40,
    negativeMarking: true,
    startTime: "2026-04-15T09:00",
    endTime: "2026-04-15T10:30",
  },
];

const MOCK_QUESTIONS_BANK = {
  "1": [
    {
      id: "q1",
      title: "What is the Virtual DOM?",
      type: "radio",
      options: [
        "A lightweight copy of the real DOM",
        "A browser API",
        "A CSS framework",
        "A database",
      ],
      correct: 0,
    },
    {
      id: "q2",
      title: "Which hook is used for side effects?",
      type: "radio",
      options: ["useState", "useEffect", "useRef", "useMemo"],
      correct: 1,
    },
    {
      id: "q3",
      title:
        "Select all valid React hooks:",
      type: "checkbox",
      options: ["useState", "useEffect", "useLoop", "useCallback"],
      correct: [0, 1, 3],
    },
    {
      id: "q4",
      title: "Explain the concept of React reconciliation in your own words.",
      type: "text",
      options: [],
      correct: null,
    },
  ],
  "2": [
    {
      id: "q5",
      title: "What does the spread operator (...) do?",
      type: "radio",
      options: [
        "Spreads array/object elements",
        "Creates a loop",
        "Declares a variable",
        "Imports a module",
      ],
      correct: 0,
    },
    {
      id: "q6",
      title: "Which of these are ES6+ features?",
      type: "checkbox",
      options: [
        "Arrow functions",
        "var keyword",
        "Template literals",
        "Promises",
      ],
      correct: [0, 2, 3],
    },
    {
      id: "q7",
      title: "Describe the difference between let, const, and var.",
      type: "text",
      options: [],
      correct: null,
    },
  ],
  "3": [
    {
      id: "q8",
      title: "What is a TypeScript interface?",
      type: "radio",
      options: [
        "A contract for object shape",
        "A class",
        "A function",
        "A module",
      ],
      correct: 0,
    },
    {
      id: "q9",
      title: "What are generics used for?",
      type: "text",
      options: [],
      correct: null,
    },
  ],
};

// ─── ZUSTAND-LIKE STORE (pure React) ─────────────────────────────────────────
function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (updater) => {
      state =
        typeof updater === "function"
          ? { ...state, ...updater(state) }
          : { ...state, ...updater };
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const store = createStore({
  currentUser: null,
  role: null, // 'employer' | 'candidate'
  view: "home", // home | employerLogin | candidateLogin | employerDashboard | candidateDashboard | createTest | exam
  exams: MOCK_EXAMS,
  questions: MOCK_QUESTIONS_BANK,
  examInProgress: null,
  tabSwitches: 0,
});

function useStore(selector) {
  const [val, setVal] = useState(() => selector(store.getState()));
  useEffect(() => {
    const unsub = store.subscribe(() => {
      const next = selector(store.getState());
      setVal((prev) => (JSON.stringify(prev) !== JSON.stringify(next) ? next : prev));
    });
    return unsub;
  }, []);
  return val;
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0a0a0f;
    --ink-2: #1a1a24;
    --ink-3: #2e2e3e;
    --muted: #6b6b80;
    --border: #e2e2ea;
    --surface: #f7f7fb;
    --white: #ffffff;
    --accent: #5b4cf5;
    --accent-2: #7c3aed;
    --accent-light: #ede9fe;
    --success: #059669;
    --danger: #dc2626;
    --warn: #d97706;
    --employer: #5b4cf5;
    --candidate: #0ea5e9;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-lg: 20px;
    --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.1);
  }

  body { font-family: var(--font-body); background: var(--surface); color: var(--ink); line-height: 1.5; }

  .app { min-height: 100vh; }

  /* ── LANDING ── */
  .landing {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--ink);
    position: relative;
    overflow: hidden;
  }
  .landing::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, #5b4cf520 0%, transparent 70%),
                radial-gradient(ellipse 40% 40% at 80% 80%, #0ea5e915 0%, transparent 60%);
  }
  .landing-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .landing-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem;
  }
  .landing-badge {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 100px;
    padding: .4rem 1rem;
    font-size: .75rem;
    font-family: var(--font-body);
    color: rgba(255,255,255,.6);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 2rem;
  }
  .landing-badge span { width: 6px; height: 6px; border-radius: 50%; background: #5b4cf5; display: block; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.4); } }
  .landing h1 {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 8vw, 5.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -.03em;
    margin-bottom: 1.25rem;
  }
  .landing h1 em { font-style: normal; background: linear-gradient(135deg, #a78bfa, #5b4cf5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .landing p {
    color: rgba(255,255,255,.5);
    font-size: 1.125rem;
    max-width: 480px;
    margin: 0 auto 3rem;
    font-weight: 300;
  }
  .landing-cards {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .portal-card {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius-lg);
    padding: 2rem 2.5rem;
    cursor: pointer;
    transition: all .25s ease;
    min-width: 220px;
    text-align: center;
  }
  .portal-card:hover {
    background: rgba(255,255,255,.09);
    border-color: rgba(255,255,255,.2);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,.3);
  }
  .portal-card .icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: grid; place-items: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
  }
  .portal-card.employer .icon { background: #5b4cf520; }
  .portal-card.candidate .icon { background: #0ea5e920; }
  .portal-card h3 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: .35rem;
  }
  .portal-card p { font-size: .8rem; color: rgba(255,255,255,.4); }

  /* ── AUTH ── */
  .auth-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--ink);
  }
  @media (max-width: 768px) { .auth-page { grid-template-columns: 1fr; } .auth-left { display: none; } }
  .auth-left {
    background: linear-gradient(135deg, #5b4cf5 0%, #7c3aed 50%, #0ea5e9 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 3rem;
    position: relative;
    overflow: hidden;
  }
  .auth-left.candidate { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #5b4cf5 100%); }
  .auth-left::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -20%;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
  }
  .auth-left-text h2 {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
  .auth-left-text p { color: rgba(255,255,255,.7); font-size: 1rem; font-weight: 300; }
  .auth-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .auth-form-wrap {
    width: 100%;
    max-width: 400px;
  }
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    color: rgba(255,255,255,.4);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: .875rem;
    padding: .5rem 0;
    margin-bottom: 2.5rem;
    transition: color .2s;
  }
  .back-btn:hover { color: rgba(255,255,255,.7); }
  .auth-form-wrap h2 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: .5rem;
  }
  .auth-form-wrap .subtitle { color: rgba(255,255,255,.4); font-size: .875rem; margin-bottom: 2rem; }
  .hint-box {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius);
    padding: .875rem 1rem;
    margin-bottom: 1.5rem;
    font-size: .8rem;
    color: rgba(255,255,255,.5);
    line-height: 1.6;
  }
  .hint-box strong { color: rgba(255,255,255,.8); }
  .field { margin-bottom: 1.25rem; }
  .field label { display: block; font-size: .8rem; font-weight: 500; color: rgba(255,255,255,.5); margin-bottom: .5rem; letter-spacing: .04em; text-transform: uppercase; }
  .field input {
    width: 100%;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius);
    padding: .875rem 1rem;
    font-family: var(--font-body);
    font-size: .9rem;
    color: #fff;
    transition: border-color .2s;
    outline: none;
  }
  .field input::placeholder { color: rgba(255,255,255,.25); }
  .field input:focus { border-color: #5b4cf5; box-shadow: 0 0 0 3px rgba(91,76,245,.2); }
  .field input.candidate-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,.2); }
  .error-msg { color: #f87171; font-size: .8rem; margin-top: .4rem; }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .875rem 1.5rem;
    border-radius: var(--radius);
    font-family: var(--font-display);
    font-size: .9rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all .2s ease;
    text-decoration: none;
  }
  .btn-primary { background: #5b4cf5; color: #fff; width: 100%; }
  .btn-primary:hover { background: #4c3ed9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(91,76,245,.4); }
  .btn-candidate { background: #0ea5e9; }
  .btn-candidate:hover { background: #0284c7; box-shadow: 0 6px 20px rgba(14,165,233,.4); }
  .btn-outline {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--ink);
  }
  .btn-outline:hover { background: var(--surface); }
  .btn-danger { background: #dc2626; color: #fff; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-sm { padding: .5rem 1rem; font-size: .8rem; }
  .btn-ghost { background: transparent; color: var(--muted); }
  .btn-ghost:hover { background: var(--surface); color: var(--ink); }
  .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

  /* ── LAYOUT ── */
  .dashboard-layout { min-height: 100vh; background: var(--surface); }
  .topbar {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .topbar-brand {
    display: flex;
    align-items: center;
    gap: .75rem;
  }
  .topbar-logo {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #5b4cf5, #7c3aed);
    display: grid; place-items: center;
    font-size: 1rem;
  }
  .topbar-brand h1 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--ink);
  }
  .topbar-brand .role-badge {
    font-size: .7rem;
    padding: .2rem .6rem;
    border-radius: 100px;
    font-weight: 600;
    letter-spacing: .04em;
  }
  .role-badge.employer { background: var(--accent-light); color: var(--accent); }
  .role-badge.candidate { background: #e0f2fe; color: #0284c7; }
  .topbar-right { display: flex; align-items: center; gap: .75rem; }
  .user-chip {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .4rem .75rem;
    background: var(--surface);
    border-radius: 100px;
    font-size: .8rem;
    color: var(--muted);
  }
  .avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5b4cf5, #0ea5e9);
    display: grid; place-items: center;
    font-size: .7rem;
    font-weight: 700;
    color: #fff;
  }
  .main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  .page-header { margin-bottom: 2rem; }
  .page-header h2 {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--ink);
    margin-bottom: .35rem;
  }
  .page-header p { color: var(--muted); font-size: .9rem; }
  .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }

  /* ── STATS ROW ── */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.25rem;
  }
  .stat-card .label { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .5rem; }
  .stat-card .value { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--ink); }
  .stat-card .value span { font-size: .9rem; color: var(--muted); font-family: var(--font-body); font-weight: 400; }

  /* ── EXAM CARDS ── */
  .exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
  .exam-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    transition: all .2s ease;
    position: relative;
    overflow: hidden;
  }
  .exam-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #5b4cf5, #7c3aed);
  }
  .exam-card.candidate-card::before { background: linear-gradient(90deg, #0ea5e9, #2563eb); }
  .exam-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); border-color: #e0e0f0; }
  .exam-card-title {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 1rem;
    padding-right: 2rem;
  }
  .exam-meta { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; margin-bottom: 1.25rem; }
  .meta-item { display: flex; flex-direction: column; gap: .15rem; }
  .meta-item .meta-label { font-size: .7rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
  .meta-item .meta-value { font-size: .9rem; font-weight: 600; color: var(--ink); }
  .exam-card-footer { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    padding: .3rem .75rem;
    border-radius: 100px;
    font-size: .72rem;
    font-weight: 600;
  }
  .tag-success { background: #d1fae5; color: #065f46; }
  .tag-warn { background: #fef3c7; color: #92400e; }
  .tag-info { background: #dbeafe; color: #1e40af; }

  /* ── CREATE TEST FORM ── */
  .form-page { max-width: 720px; margin: 0 auto; }
  .stepper { display: flex; align-items: center; gap: 0; margin-bottom: 2.5rem; }
  .step {
    display: flex;
    align-items: center;
    gap: .75rem;
    flex: 1;
  }
  .step-num {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: grid; place-items: center;
    font-family: var(--font-display);
    font-size: .85rem;
    font-weight: 700;
    color: var(--muted);
    flex-shrink: 0;
    transition: all .3s;
  }
  .step.active .step-num { background: var(--accent); border-color: var(--accent); color: #fff; }
  .step.done .step-num { background: var(--success); border-color: var(--success); color: #fff; }
  .step-info { flex: 1; }
  .step-info .step-title { font-size: .8rem; font-weight: 600; color: var(--ink); }
  .step-info .step-sub { font-size: .72rem; color: var(--muted); }
  .step-line { flex: 1; height: 1px; background: var(--border); margin: 0 .5rem; }
  .step.done .step-line { background: var(--success); }
  .form-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 1.5rem;
  }
  .form-card h3 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--ink);
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  .form-field { display: flex; flex-direction: column; gap: .4rem; }
  .form-field.full { grid-column: 1 / -1; }
  .form-field label { font-size: .78rem; font-weight: 500; color: var(--muted); letter-spacing: .04em; text-transform: uppercase; }
  .form-field input,
  .form-field select,
  .form-field textarea {
    padding: .75rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: .9rem;
    color: var(--ink);
    background: var(--white);
    transition: border-color .2s;
    outline: none;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .form-field .field-error { font-size: .75rem; color: var(--danger); }

  /* ── QUESTIONS ── */
  .questions-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.5rem; }
  .question-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .q-num {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--accent-light);
    color: var(--accent);
    display: grid; place-items: center;
    font-size: .75rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .q-body { flex: 1; }
  .q-body .q-title { font-size: .9rem; font-weight: 500; color: var(--ink); margin-bottom: .25rem; }
  .q-body .q-type { font-size: .72rem; color: var(--muted); }
  .q-actions { display: flex; gap: .5rem; }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(10,10,15,.7);
    backdrop-filter: blur(4px);
    display: grid; place-items: center;
    z-index: 999;
    padding: 1rem;
  }
  .modal {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 2rem;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp .25s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .modal-header h3 { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--ink); }
  .close-btn {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--white);
    cursor: pointer;
    display: grid; place-items: center;
    font-size: 1rem;
    color: var(--muted);
    transition: all .2s;
  }
  .close-btn:hover { background: var(--surface); color: var(--ink); }
  .option-row { display: flex; align-items: center; gap: .5rem; margin-bottom: .5rem; }
  .option-row input[type="text"] {
    flex: 1; padding: .6rem .875rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-body); font-size: .875rem;
    outline: none;
  }
  .option-row input[type="text"]:focus { border-color: var(--accent); }
  .add-option-btn {
    background: none; border: 1.5px dashed var(--border);
    border-radius: var(--radius); padding: .6rem 1rem;
    font-size: .8rem; color: var(--muted); cursor: pointer;
    width: 100%; text-align: center; margin-top: .5rem;
    transition: all .2s;
  }
  .add-option-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* ── EXAM SCREEN ── */
  .exam-screen {
    min-height: 100vh;
    background: var(--ink);
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
  .exam-topbar {
    background: rgba(255,255,255,.04);
    border-bottom: 1px solid rgba(255,255,255,.08);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .exam-topbar-left { display: flex; flex-direction: column; gap: .15rem; }
  .exam-topbar-left .exam-name {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
  }
  .exam-topbar-left .q-progress { font-size: .78rem; color: rgba(255,255,255,.4); }
  .timer-chip {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .6rem 1.25rem;
    border-radius: 100px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    transition: all .3s;
  }
  .timer-chip.warn { background: rgba(217,119,6,.2); border-color: rgba(217,119,6,.4); color: #fbbf24; }
  .timer-chip.danger { background: rgba(220,38,38,.2); border-color: rgba(220,38,38,.4); color: #f87171; animation: timerPulse 1s infinite; }
  @keyframes timerPulse { 0%,100% { opacity: 1; } 50% { opacity: .7; } }
  .exam-body { padding: 2rem; max-width: 800px; margin: 0 auto; width: 100%; }
  .question-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 1.5rem;
    animation: fadeIn .3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .question-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
  .question-badge {
    background: linear-gradient(135deg, #5b4cf5, #7c3aed);
    color: #fff;
    padding: .3rem .75rem;
    border-radius: 100px;
    font-size: .72rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .question-text {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.4;
  }
  .options-list { display: flex; flex-direction: column; gap: .75rem; }
  .option-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius);
    border: 1.5px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.03);
    cursor: pointer;
    transition: all .2s;
    text-align: left;
    width: 100%;
    color: rgba(255,255,255,.7);
    font-family: var(--font-body);
    font-size: .9rem;
  }
  .option-btn:hover { border-color: rgba(91,76,245,.5); background: rgba(91,76,245,.08); color: #fff; }
  .option-btn.selected { border-color: #5b4cf5; background: rgba(91,76,245,.15); color: #fff; }
  .option-indicator {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.2);
    flex-shrink: 0;
    display: grid; place-items: center;
    transition: all .2s;
  }
  .option-btn.selected .option-indicator { background: #5b4cf5; border-color: #5b4cf5; }
  .option-indicator::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #fff; display: none; }
  .option-btn.selected .option-indicator::after { display: block; }
  .checkbox-indicator { border-radius: 4px !important; }
  .checkbox-indicator::after { border-radius: 2px !important; width: 10px !important; height: 10px !important; }
  .text-answer {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1.5px solid rgba(255,255,255,.1);
    border-radius: var(--radius);
    padding: 1rem;
    color: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    resize: vertical;
    min-height: 120px;
    outline: none;
    transition: border-color .2s;
  }
  .text-answer:focus { border-color: #5b4cf5; box-shadow: 0 0 0 3px rgba(91,76,245,.2); }
  .text-answer::placeholder { color: rgba(255,255,255,.25); }
  .exam-nav {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid rgba(255,255,255,.06);
    background: rgba(255,255,255,.02);
    flex-wrap: wrap;
  }
  .q-dots { display: flex; gap: .4rem; flex-wrap: wrap; flex: 1; }
  .q-dot {
    width: 28px; height: 28px;
    border-radius: 6px;
    background: rgba(255,255,255,.07);
    border: none;
    cursor: pointer;
    font-size: .72rem;
    font-weight: 600;
    color: rgba(255,255,255,.4);
    transition: all .2s;
  }
  .q-dot.answered { background: rgba(91,76,245,.3); color: #a78bfa; }
  .q-dot.current { background: #5b4cf5; color: #fff; }
  .behavior-warning {
    position: fixed;
    top: 1rem; left: 50%;
    transform: translateX(-50%);
    background: #dc2626;
    color: #fff;
    padding: .75rem 1.5rem;
    border-radius: var(--radius);
    font-size: .875rem;
    font-weight: 600;
    z-index: 9999;
    animation: slideDown .3s ease;
    white-space: nowrap;
  }
  @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } }

  /* ── SUBMITTED ── */
  .submitted-screen {
    min-height: 100vh;
    background: var(--ink);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  .submitted-icon {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #059669, #10b981);
    display: grid; place-items: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
    animation: popIn .5s cubic-bezier(.175,.885,.32,1.275);
  }
  @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .submitted-screen h2 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: .75rem;
  }
  .submitted-screen p { color: rgba(255,255,255,.5); max-width: 400px; margin-bottom: 2rem; }
  .result-stats { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
  .result-stat {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius);
    padding: 1.25rem 2rem;
  }
  .result-stat .r-val { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: #fff; }
  .result-stat .r-label { font-size: .75rem; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .06em; }

  /* ── EMPTY STATE ── */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--muted);
  }
  .empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-state h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--ink); margin-bottom: .5rem; }

  /* ── MISC ── */
  .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }
  .modal-footer { display: flex; gap: .75rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 1.5rem; }
  .fullscreen-btn {
    padding: .4rem .75rem;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius);
    color: rgba(255,255,255,.5);
    font-size: .75rem;
    cursor: pointer;
    transition: all .2s;
    font-family: var(--font-body);
  }
  .fullscreen-btn:hover { color: #fff; background: rgba(255,255,255,.1); }
  .tab-count { font-size: .72rem; color: rgba(255,255,255,.35); }
  select option { background: var(--ink-2); color: #fff; }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function QuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState(
    question || { title: "", type: "radio", options: ["", ""] }
  );
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Question title is required";
    if (form.type !== "text" && form.options.some((o) => !o.trim()))
      e.options = "All options must be filled";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, id: question?.id || `q_${Date.now()}` });
  };

  const updateOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    set("options", opts);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{question ? "Edit Question" : "Add Question"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-field" style={{ marginBottom: "1rem" }}>
          <label>Question Title *</label>
          <textarea
            style={{ width: "100%", padding: ".75rem 1rem", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", fontFamily: "var(--font-body)", fontSize: ".9rem", resize: "vertical", minHeight: "80px", outline: "none" }}
            placeholder="Enter your question..."
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="form-field" style={{ marginBottom: "1rem" }}>
          <label>Question Type</label>
          <select value={form.type} onChange={(e) => { set("type", e.target.value); if (e.target.value === "text") set("options", []); else if (!form.options.length) set("options", ["", ""]); }}>
            <option value="radio">Single Choice (Radio)</option>
            <option value="checkbox">Multiple Choice (Checkbox)</option>
            <option value="text">Text Answer</option>
          </select>
        </div>
        {form.type !== "text" && (
          <div className="form-field">
            <label>Options</label>
            {form.options.map((opt, i) => (
              <div className="option-row" key={i}>
                <input type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                {form.options.length > 2 && (
                  <button className="close-btn" onClick={() => set("options", form.options.filter((_, j) => j !== i))}>✕</button>
                )}
              </div>
            ))}
            {errors.options && <span className="field-error">{errors.options}</span>}
            <button className="add-option-btn" onClick={() => set("options", [...form.options, ""])}>+ Add Option</button>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={handleSave}>
            {question ? "Update Question" : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTestForm({ onBack }) {
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState({
    title: "", totalCandidates: "", totalSlots: "", questionSets: "1",
    questionType: "mixed", startTime: "", endTime: "", duration: "",
  });
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setExamData((f) => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!examData.title.trim()) e.title = "Title is required";
    if (!examData.totalCandidates) e.totalCandidates = "Required";
    if (!examData.totalSlots) e.totalSlots = "Required";
    if (!examData.duration) e.duration = "Required";
    if (!examData.startTime) e.startTime = "Required";
    if (!examData.endTime) e.endTime = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const saveQuestion = (q) => {
    if (editingQ) {
      setQuestions((qs) => qs.map((x) => (x.id === q.id ? q : x)));
    } else {
      setQuestions((qs) => [...qs, q]);
    }
    setShowModal(false);
    setEditingQ(null);
  };

  const handleSubmit = () => {
    const state = store.getState();
    const newExam = {
      id: `e_${Date.now()}`,
      title: examData.title,
      candidates: 0,
      questionSets: parseInt(examData.questionSets),
      slots: parseInt(examData.totalSlots),
      duration: parseInt(examData.duration),
      questions: questions.length,
      negativeMarking: false,
      startTime: examData.startTime,
      endTime: examData.endTime,
    };
    store.setState({ exams: [...state.exams, newExam], questions: { ...state.questions, [newExam.id]: questions } });
    setSubmitted(true);
    setTimeout(() => store.setState({ view: "employerDashboard" }), 1500);
  };

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginBottom: ".5rem" }}>Test Created!</h3>
      <p style={{ color: "var(--muted)" }}>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="form-page">
      <div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
          <div className="step-num">{step > 1 ? "✓" : "1"}</div>
          <div className="step-info">
            <div className="step-title">Basic Info</div>
            <div className="step-sub">Exam details</div>
          </div>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-num">2</div>
          <div className="step-info">
            <div className="step-title">Question Sets</div>
            <div className="step-sub">Add questions</div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="form-card">
          <h3>📋 Basic Information</h3>
          <div className="form-grid">
            <div className="form-field full">
              <label>Exam Title *</label>
              <input placeholder="e.g. React.js Assessment 2026" value={examData.title} onChange={(e) => set("title", e.target.value)} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="form-field">
              <label>Total Candidates *</label>
              <input type="number" placeholder="50" value={examData.totalCandidates} onChange={(e) => set("totalCandidates", e.target.value)} />
              {errors.totalCandidates && <span className="field-error">{errors.totalCandidates}</span>}
            </div>
            <div className="form-field">
              <label>Total Slots *</label>
              <input type="number" placeholder="30" value={examData.totalSlots} onChange={(e) => set("totalSlots", e.target.value)} />
              {errors.totalSlots && <span className="field-error">{errors.totalSlots}</span>}
            </div>
            <div className="form-field">
              <label>Question Sets</label>
              <input type="number" placeholder="1" value={examData.questionSets} onChange={(e) => set("questionSets", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Question Type</label>
              <select value={examData.questionType} onChange={(e) => set("questionType", e.target.value)}>
                <option value="mixed">Mixed</option>
                <option value="mcq">MCQ Only</option>
                <option value="text">Text Only</option>
              </select>
            </div>
            <div className="form-field">
              <label>Duration (minutes) *</label>
              <input type="number" placeholder="60" value={examData.duration} onChange={(e) => set("duration", e.target.value)} />
              {errors.duration && <span className="field-error">{errors.duration}</span>}
            </div>
            <div className="form-field" />
            <div className="form-field">
              <label>Start Time *</label>
              <input type="datetime-local" value={examData.startTime} onChange={(e) => set("startTime", e.target.value)} />
              {errors.startTime && <span className="field-error">{errors.startTime}</span>}
            </div>
            <div className="form-field">
              <label>End Time *</label>
              <input type="datetime-local" value={examData.endTime} onChange={(e) => set("endTime", e.target.value)} />
              {errors.endTime && <span className="field-error">{errors.endTime}</span>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button className="btn btn-primary" style={{ width: "auto", minWidth: "160px" }} onClick={handleNext}>
              Next: Questions →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>❓ Question Sets</h3>
            <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={() => { setEditingQ(null); setShowModal(true); }}>
              + Add Question
            </button>
          </div>
          {questions.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <div className="empty-icon">📝</div>
              <h3>No questions yet</h3>
              <p>Add your first question to get started.</p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((q, i) => (
                <div className="question-item" key={q.id}>
                  <div className="q-num">{i + 1}</div>
                  <div className="q-body">
                    <div className="q-title">{q.title}</div>
                    <div className="q-type">
                      {q.type === "radio" ? "Single Choice" : q.type === "checkbox" ? "Multiple Choice" : "Text Answer"}
                      {q.type !== "text" && ` · ${q.options.length} options`}
                    </div>
                  </div>
                  <div className="q-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingQ(q); setShowModal(true); }}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: ".75rem", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{ width: "auto", minWidth: "160px" }} onClick={handleSubmit} disabled={questions.length === 0}>
              Create Test ✓
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <QuestionModal question={editingQ} onSave={saveQuestion} onClose={() => { setShowModal(false); setEditingQ(null); }} />
      )}
    </div>
  );
}

function EmployerDashboard() {
  const exams = useStore((s) => s.exams);
  const [viewCandidates, setViewCandidates] = useState(null);

  return (
    <div className="dashboard-layout">
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">⚡</div>
          <h1>AssessHub</h1>
          <span className="role-badge employer">Employer</span>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="avatar">HR</div>
            hr@akijibos.com
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => store.setState({ view: "home", currentUser: null })}>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="main-content">
        {store.getState().view === "createTest" ? (
          <>
            <div className="page-header">
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }} onClick={() => store.setState({ view: "employerDashboard" })}>
                ← Back to Dashboard
              </button>
              <h2>Create Online Test</h2>
              <p>Set up a new assessment for your candidates</p>
            </div>
            <CreateTestForm />
          </>
        ) : (
          <>
            <div className="page-header-row">
              <div className="page-header">
                <h2>Online Tests</h2>
                <p>Manage and monitor your assessments</p>
              </div>
              <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => store.setState({ view: "createTest" })}>
                + Create Test
              </button>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="label">Total Exams</div>
                <div className="value">{exams.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total Candidates</div>
                <div className="value">{exams.reduce((a, e) => a + e.candidates, 0)}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total Slots</div>
                <div className="value">{exams.reduce((a, e) => a + e.slots, 0)}</div>
              </div>
              <div className="stat-card">
                <div className="label">Active Tests</div>
                <div className="value">{exams.length} <span>live</span></div>
              </div>
            </div>
            <div className="exam-grid">
              {exams.map((exam) => (
                <div className="exam-card" key={exam.id}>
                  <div className="exam-card-title">{exam.title}</div>
                  <div className="exam-meta">
                    <div className="meta-item">
                      <span className="meta-label">Candidates</span>
                      <span className="meta-value">{exam.candidates} / {exam.slots}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Question Sets</span>
                      <span className="meta-value">{exam.questionSets} sets</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Exam Slots</span>
                      <span className="meta-value">{exam.slots} seats</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{exam.duration} min</span>
                    </div>
                  </div>
                  <div className="exam-card-footer">
                    <span className="tag tag-info">📅 {exam.slots - exam.candidates} slots left</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setViewCandidates(exam)}>
                      View Candidates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {viewCandidates && (
        <div className="modal-overlay" onClick={() => setViewCandidates(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Candidates — {viewCandidates.title}</h3>
              <button className="close-btn" onClick={() => setViewCandidates(null)}>✕</button>
            </div>
            <div className="empty-state" style={{ padding: "2rem" }}>
              <div className="empty-icon">👥</div>
              <h3>{viewCandidates.candidates} Registered</h3>
              <p>{viewCandidates.slots - viewCandidates.candidates} slots remaining out of {viewCandidates.slots}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setViewCandidates(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateDashboard() {
  const exams = useStore((s) => s.exams);

  return (
    <div className="dashboard-layout">
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo" style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>⚡</div>
          <h1>AssessHub</h1>
          <span className="role-badge candidate">Candidate</span>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="avatar" style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>RC</div>
            rakib@candidate.com
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => store.setState({ view: "home", currentUser: null })}>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="main-content">
        <div className="page-header">
          <h2>Available Exams</h2>
          <p>Select an exam to begin your assessment</p>
        </div>
        <div className="exam-grid">
          {exams.map((exam) => (
            <div className="exam-card candidate-card" key={exam.id}>
              <div className="exam-card-title">{exam.title}</div>
              <div className="exam-meta">
                <div className="meta-item">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{exam.duration} min</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Questions</span>
                  <span className="meta-value">{store.getState().questions[exam.id]?.length || exam.questions}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Negative Marking</span>
                  <span className="meta-value">{exam.negativeMarking ? "Yes ⚠️" : "No ✅"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Slots Left</span>
                  <span className="meta-value">{exam.slots - exam.candidates}</span>
                </div>
              </div>
              <div className="exam-card-footer">
                <span className={`tag ${exam.negativeMarking ? "tag-warn" : "tag-success"}`}>
                  {exam.negativeMarking ? "⚠️ Negative marking" : "✅ No penalty"}
                </span>
                <button
                  className="btn btn-candidate btn-sm"
                  style={{ background: "#0ea5e9", color: "#fff" }}
                  onClick={() => store.setState({ view: "exam", examInProgress: exam.id, tabSwitches: 0 })}
                >
                  Start Exam →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamScreen() {
  const examId = useStore((s) => s.examInProgress);
  const tabSwitches = useStore((s) => s.tabSwitches);
  const exam = useStore((s) => s.exams.find((e) => e.id === examId));
  const allQuestions = useStore((s) => s.questions[examId] || []);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((exam?.duration || 30) * 60);
  const [submitted, setSubmitted] = useState(false);
  const [warning, setWarning] = useState("");
  const warningRef = useRef(null);

  // Timer
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  // Tab switch detection
  useEffect(() => {
    const handler = () => {
      if (document.hidden && !submitted) {
        store.setState((s) => ({ tabSwitches: s.tabSwitches + 1 }));
        showWarning("⚠️ Tab switch detected! This has been recorded.");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [submitted]);

  const showWarning = (msg) => {
    setWarning(msg);
    clearTimeout(warningRef.current);
    warningRef.current = setTimeout(() => setWarning(""), 3000);
  };

  const handleSubmit = useCallback((auto = false) => {
    setSubmitted(true);
    if (auto) showWarning("⏱️ Time's up! Exam auto-submitted.");
  }, []);

  const setAnswer = (qId, val) => setAnswers((a) => ({ ...a, [qId]: val }));
  const toggleCheckbox = (qId, idx) => {
    const cur = answers[qId] || [];
    const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
    setAnswer(qId, next);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = (timeLeft / ((exam?.duration || 30) * 60)) * 100;
  const timerClass = pct < 10 ? "danger" : pct < 25 ? "warn" : "";

  const q = allQuestions[currentQ];
  const answered = Object.keys(answers).length;

  if (!exam || !allQuestions.length) return (
    <div className="exam-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>No questions available</h3>
        <button className="btn" style={{ background: "rgba(255,255,255,.1)", color: "#fff", marginTop: "1.5rem" }} onClick={() => store.setState({ view: "candidateDashboard" })}>← Back</button>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="submitted-screen">
        <div className="submitted-icon">✓</div>
        <h2>Exam Submitted!</h2>
        <p>Your responses have been recorded. Results will be shared by the employer.</p>
        <div className="result-stats">
          <div className="result-stat">
            <div className="r-val">{answered}</div>
            <div className="r-label">Answered</div>
          </div>
          <div className="result-stat">
            <div className="r-val">{allQuestions.length - answered}</div>
            <div className="r-label">Skipped</div>
          </div>
          <div className="result-stat">
            <div className="r-val">{tabSwitches}</div>
            <div className="r-label">Tab Switches</div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", minWidth: "200px" }} onClick={() => store.setState({ view: "candidateDashboard", examInProgress: null })}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="exam-screen">
      {warning && <div className="behavior-warning">{warning}</div>}
      <div className="exam-topbar">
        <div className="exam-topbar-left">
          <div className="exam-name">{exam.title}</div>
          <div className="q-progress">Question {currentQ + 1} of {allQuestions.length} · {answered} answered</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="tab-count">Switches: {tabSwitches}</span>
          <div className={`timer-chip ${timerClass}`}>
            ⏱ {fmt(timeLeft)}
          </div>
        </div>
      </div>

      <div className="exam-body">
        {q && (
          <div className="question-card">
            <div className="question-header">
              <span className="question-badge">Q{currentQ + 1}</span>
              <div className="question-text">{q.title}</div>
            </div>
            {q.type === "text" ? (
              <textarea
                className="text-answer"
                placeholder="Type your answer here..."
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            ) : (
              <div className="options-list">
                {q.options.map((opt, i) => {
                  const isRadio = q.type === "radio";
                  const isSelected = isRadio ? answers[q.id] === i : (answers[q.id] || []).includes(i);
                  return (
                    <button
                      key={i}
                      className={`option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => isRadio ? setAnswer(q.id, i) : toggleCheckbox(q.id, i)}
                    >
                      <div className={`option-indicator ${!isRadio ? "checkbox-indicator" : ""}`} />
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ color: "rgba(255,255,255,.4)" }} disabled={currentQ === 0} onClick={() => setCurrentQ((c) => c - 1)}>
            ← Previous
          </button>
          {currentQ < allQuestions.length - 1 ? (
            <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={() => setCurrentQ((c) => c + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-sm" style={{ background: "#059669", color: "#fff" }} onClick={() => handleSubmit(false)}>
              Submit Exam ✓
            </button>
          )}
        </div>
      </div>

      <div className="exam-nav">
        <div className="q-dots">
          {allQuestions.map((_, i) => (
            <button key={i} className={`q-dot ${answers[allQuestions[i].id] !== undefined ? "answered" : ""} ${i === currentQ ? "current" : ""}`} onClick={() => setCurrentQ(i)}>
              {i + 1}
            </button>
          ))}
        </div>
        <button className="btn btn-sm" style={{ background: "#dc262620", color: "#f87171", border: "1px solid #dc262640" }} onClick={() => handleSubmit(false)}>
          Submit
        </button>
      </div>
    </div>
  );
}

function LoginPage({ role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEmployer = role === "employer";

  const MOCK_CREDS = isEmployer
    ? { email: "hr@akijibos.com", password: "employer123" }
    : { email: "rakib@candidate.com", password: "candidate123" };

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      if (email === MOCK_CREDS.email && password === MOCK_CREDS.password) {
        store.setState({ currentUser: email, role, view: isEmployer ? "employerDashboard" : "candidateDashboard" });
      } else {
        setErrors({ general: "Invalid credentials. Use the demo credentials below." });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className={`auth-left ${!isEmployer ? "candidate" : ""}`}>
        <div className="auth-left-text">
          <h2>{isEmployer ? "Hire smarter with data-driven assessments." : "Showcase your skills with confidence."}</h2>
          <p>{isEmployer ? "Create tests, track candidates, and make informed hiring decisions — all in one place." : "Take assessments designed to highlight what you know best."}</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <button className="back-btn" onClick={() => store.setState({ view: "home" })}>
            ← Back to home
          </button>
          <h2>{isEmployer ? "Employer Login" : "Candidate Login"}</h2>
          <p className="subtitle">Sign in to access your {isEmployer ? "employer" : "candidate"} dashboard</p>
          <div className="hint-box">
            <strong>Demo credentials:</strong><br />
            Email: <strong>{MOCK_CREDS.email}</strong><br />
            Password: <strong>{MOCK_CREDS.password}</strong>
          </div>
          {errors.general && <div style={{ background: "#dc262620", border: "1px solid #dc262640", borderRadius: "var(--radius)", padding: ".75rem 1rem", marginBottom: "1rem", color: "#f87171", fontSize: ".85rem" }}>{errors.general}</div>}
          <div className="field">
            <label>Email Address</label>
            <input className={!isEmployer ? "candidate-input" : ""} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            {errors.email && <div className="error-msg">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input className={!isEmployer ? "candidate-input" : ""} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            {errors.password && <div className="error-msg">{errors.password}</div>}
          </div>
          <button className={`btn btn-primary ${!isEmployer ? "btn-candidate" : ""}`} onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : `Sign In as ${isEmployer ? "Employer" : "Candidate"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="landing">
      <div className="landing-grid" />
      <div className="landing-content">
        <div className="landing-badge"><span />Online Assessment Platform</div>
        <h1>Assess. <em>Evaluate.</em><br />Hire Better.</h1>
        <p>A streamlined platform for employers to create assessments and candidates to demonstrate their skills — with real-time behavioral tracking.</p>
        <div className="landing-cards">
          <div className="portal-card employer" onClick={() => store.setState({ view: "employerLogin" })}>
            <div className="icon">🏢</div>
            <h3>Employer Portal</h3>
            <p>Create tests & manage candidates</p>
          </div>
          <div className="portal-card candidate" onClick={() => store.setState({ view: "candidateLogin" })}>
            <div className="icon">🎓</div>
            <h3>Candidate Portal</h3>
            <p>Take exams & showcase skills</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const view = useStore((s) => s.view);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="app">
        {view === "home" && <Landing />}
        {view === "employerLogin" && <LoginPage role="employer" />}
        {view === "candidateLogin" && <LoginPage role="candidate" />}
        {(view === "employerDashboard" || view === "createTest") && <EmployerDashboard />}
        {view === "candidateDashboard" && <CandidateDashboard />}
        {view === "exam" && <ExamScreen />}
      </div>
    </>
  );
}
