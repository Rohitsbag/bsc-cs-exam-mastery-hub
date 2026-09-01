// ══════════════════════════════════════════
// UNIFIED STATE MANAGEMENT & PERSISTENCE
// ══════════════════════════════════════════
const STORAGE_KEY = 'bsc_cs_mastery_state_v2';

let appState = {
  activeTab: 'schedule',
  currentDay: 1,
  tasks: {}
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        appState = { ...appState, ...parsed };
      }
    }
    // Also load legacy keys if present
    for (let i = 1; i <= 30; i++) {
      ['m', 'a', 'e', 'n'].forEach(s => {
        const k = `task_day_${i}_${s}`;
        if (localStorage.getItem(k) === 'true') {
          appState.tasks[`${i}_${s}`] = true;
        }
      });
    }
  } catch (e) {
    console.error('loadState error:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    // Mirror for legacy keys
    Object.keys(appState.tasks).forEach(k => {
      const parts = k.split('_');
      if (parts.length === 2) {
        localStorage.setItem(`task_day_${parts[0]}_${parts[1]}`, 'true');
      }
    });
  } catch (e) {
    console.error('saveState error:', e);
  }
}

function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-10px);background:#16a34a;color:#fff;padding:12px 22px;border-radius:12px;font-size:13px;font-weight:700;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,0.6);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);pointer-events:none;opacity:0;display:flex;align-items:center;gap:8px;border:1px solid #22c55e';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 3500);
}

// ── APP SECTION NAVIGATION (Desktop & Mobile) ──
function showSection(id) {
  appState.activeTab = id;
  saveState();
  ['videos','lab','subjects','flashcards','schedule'].forEach(s => {
    const sec = document.getElementById('sec-' + s);
    const mNav = document.getElementById('nav-' + s);
    const dNav = document.getElementById('dnav-' + s);
    if(sec) sec.classList.remove('active');
    if(mNav) mNav.classList.remove('active');
    if(dNav) dNav.classList.remove('active');
  });
  const activeSec = document.getElementById('sec-' + id);
  const activeMNav = document.getElementById('nav-' + id);
  const activeDNav = document.getElementById('dnav-' + id);
  if(activeSec) activeSec.classList.add('active');
  if(activeMNav) activeMNav.classList.add('active');
  if(activeDNav) activeDNav.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── SIMULATION TAB SWITCHER ──
function switchSim(simId) {
  ['sorting', 'gates', 'cpu', 'dbms', 'stats', 'chmod'].forEach(s => {
    const panel = document.getElementById(`sim-${s}`);
    const tab = document.getElementById(`tab-${s}`);
    if(panel) panel.classList.remove('active');
    if(tab) tab.classList.remove('active');
  });
  const activePanel = document.getElementById(`sim-${simId}`);
  const activeTab = document.getElementById(`tab-${simId}`);
  if(activePanel) activePanel.classList.add('active');
  if(activeTab) activeTab.classList.add('active');
}

// ── SEMESTER FILTER ──
let currentSem = 'all';
function filterSemester(sem) {
  currentSem = sem;
  document.querySelectorAll('.sem-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${sem}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderSubjects(sem, document.getElementById('globalSearch').value);
}

// ── SCROLL TO HELPER ──
function scrollToSection(id) {
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════
// 30-DAY MASTER CALENDAR DATASET (SEPT 1 - SEPT 30, 2026)
// ══════════════════════════════════════════
const calendarDays = [
  { day: 1, date: "Sept 1", dow: "Tue", phase: "Phase 1: Basics", m: { sub: "DAA (1102111)", topic: "Algorithm Complexity & Big-O Notation", yt: "Jenny lectures Big O complexity", goal: "Understand why O(n log n) is faster than O(n^2)" }, a: { sub: "Python (1101411)", topic: "Data Types, If-Else & Prime Check Loop", yt: "CodeWithHarry Python prime check loop", goal: "Write for-else prime loop without errors" }, e: { sub: "Management (1172311)", topic: "Henri Fayol 14 Principles (Principles 1-7)", yt: "Gate Smashers Henri Fayol 14 principles", goal: "Memorize Division of Work & Unity of Command" }, n: "Flip 5 DAA Flashcards + draw Big-O curve" },
  { day: 2, date: "Sept 2", dow: "Wed", phase: "Phase 1: Basics", m: { sub: "Digital Systems (1101111)", topic: "Number Conversions & De Morgan's Laws", yt: "Neso Academy De Morgan proof", goal: "Prove (A.B)' = A' + B' with truth table" }, a: { sub: "Statistics (1042212)", topic: "Arithmetic Mean & Median for Grouped Data", yt: "Pradeep Giri Statistics Mean Median Mode", goal: "Solve 2 grouped frequency table numericals" }, e: { sub: "IPR (1481311)", topic: "3 Essential Criteria for Patentability", yt: "Gate Smashers Patent Criteria Novelty Inventive", goal: "Memorize Novelty, Non-obviousness, Utility" }, n: "Flip 5 Digital Systems Flashcards + draw NAND circuit" },
  { day: 3, date: "Sept 3", dow: "Thu", phase: "Phase 1: Basics", m: { sub: "DBMS (1101112)", topic: "3-Tier ANSI/SPARC Architecture & Data Independence", yt: "Gate Smashers 3 Tier Architecture DBMS", goal: "Draw External, Conceptual & Internal layers" }, a: { sub: "Linux OS (1101413)", topic: "Filesystem Hierarchy Standard (FHS) & Commands", yt: "Gate Smashers Linux FHS /bin /etc /home", goal: "Explain /bin, /etc, /home, /var, /proc" }, e: { sub: "IKS (2531511)", topic: "Ancient Mathematics: Aryabhata & Brahmagupta", yt: "Indian Knowledge System Aryabhata Zero", goal: "Write Aryabhatiya Pi value & Zero arithmetic" }, n: "Flip 5 DBMS Flashcards + draw 3-Tier diagram" },
  { day: 4, date: "Sept 4", dow: "Fri", phase: "Phase 1: Basics", m: { sub: "OOP C++ (1102112)", topic: "4 Pillars of OOP: Encapsulation, Abstraction, Inheritance", yt: "CodeWithHarry 4 Pillars OOP C++", goal: "Write basic C++ class with private/public members" }, a: { sub: "Web Tech (1102411)", topic: "HTTP/HTTPS Cycle & Semantic HTML5 Tags", yt: "Gate Smashers HTTP Request Response Cycle", goal: "Explain GET vs POST and <header>, <nav>, <article>" }, e: { sub: "Content Writing (1432311)", topic: "AIDA Copywriting Framework & Search Intent", yt: "AIDA model copywriting Attention Interest", goal: "Breakdown Attention, Interest, Desire, Action" }, n: "Flip 5 OOP Flashcards + write C++ class template" },
  { day: 5, date: "Sept 5", dow: "Sat", phase: "Phase 1: Basics", m: { sub: "DAA (1102111)", topic: "Merge Sort Divide-and-Conquer Recurrence", yt: "Jenny lectures Merge sort dry run complexity", goal: "Dry run Merge Sort on [45, 12, 85, 32] by hand" }, a: { sub: "Adv Python (1102413)", topic: "Python Generators (yield) & Decorators (@fn)", yt: "CodeWithHarry Python Generators yield", goal: "Write memory-efficient generator number_stream()" }, e: { sub: "People's Skills (2541514)", topic: "Daniel Goleman 5 Pillars of Emotional Intelligence", yt: "Daniel Goleman Emotional Intelligence 5 domains", goal: "List Self-Awareness, Self-Regulation, Empathy" }, n: "Run Merge Sort on Study Lab Sim + Flip 5 Cards" },
  { day: 6, date: "Sept 6", dow: "Sun", phase: "Phase 1: Basics", m: { sub: "Digital Systems (1101111)", topic: "K-Map 3 & 4 Variable Minimization (SOP)", yt: "Gate Smashers K Map 3 and 4 variable", goal: "Group 1s in 2x4 and 4x4 K-Maps without errors" }, a: { sub: "Statistics (1042212)", topic: "Mode for Grouped Data & Empirical Formula", yt: "Empirical relationship Mean Median Mode formula", goal: "State Mode = 3(Median) - 2(Mean)" }, e: { sub: "Behavioral Skills (2542520)", topic: "Johari Window Model of Interpersonal Awareness", yt: "Johari Window 4 quadrants Open Blind Hidden", goal: "Draw 4 quadrants: Open, Blind, Hidden, Unknown" }, n: "Solve 1 K-Map on paper + Flip 5 Cards" },
  { day: 7, date: "Sept 7", dow: "Mon", phase: "Phase 1 Review", m: { sub: "All CS Core Review", topic: "Week 1 Review: DAA, Digital Systems, DBMS, OOP", yt: "Gate Smashers Quick Revision Computer Science", goal: "Self-test 4 fundamental definitions from memory" }, a: { sub: "Code & Math Review", topic: "Week 1 Review: Python Loops, Stats Mean, Linux FHS", yt: "CodeWithHarry Python Quick Review", goal: "Write Python loop + Mean formula without looking" }, e: { sub: "Electives Review", topic: "Week 1 Review: Fayol 14 Principles, Patents, EQ", yt: "Henri Fayol Management Principles revision", goal: "List Fayol 14 points on blank paper" }, n: "Complete 15-Mark Checkpoint Mock Paper on paper" },

  // WEEK 2: CORE MECHANICS (PASSING FLOOR LOCK)
  { day: 8, date: "Sept 8", dow: "Tue", phase: "Phase 2: Core", m: { sub: "DAA (1102111)", topic: "Greedy Method vs Dynamic Programming: Knapsack", yt: "Gate Smashers Fractional Knapsack vs 0 1", goal: "Explain why Greedy works for Fractional, DP for 0/1" }, a: { sub: "Python (1101411)", topic: "Lists, Tuples, Sets, Dictionaries comparison", yt: "CodeWithHarry Python data structures comparison", goal: "Write mutability, syntax & lookup time comparison" }, e: { sub: "Management (1172311)", topic: "Henri Fayol Principles 8-14 & Maslow Hierarchy", yt: "Maslow Need Hierarchy Theory Motivation", goal: "Draw 5-layer Maslow pyramid from Physiological to Self-Act" }, n: "Flip 5 Knapsack Flashcards + draw Maslow Pyramid" },
  { day: 9, date: "Sept 9", dow: "Tue", phase: "Phase 2: Core", m: { sub: "Digital Systems (1101111)", topic: "Full Adder Design using 2 Half Adders & OR Gate", yt: "Gate Smashers Full Adder using two half adders", goal: "Derive Sum = A ^ B ^ Cin and Carry equations" }, a: { sub: "Statistics (1042212)", topic: "Standard Deviation (sigma) & Variance (sigma^2)", yt: "Standard Deviation formula grouped data", goal: "Calculate SD for a dataset of 5 grouped values" }, e: { sub: "IPR (1481311)", topic: "Copyright Act 1957 & Doctrine of Fair Dealing", yt: "Doctrine of Fair Dealing copyright exceptions", goal: "Explain 3 exceptions for education & private study" }, n: "Draw Full Adder circuit on paper + Flip 5 Cards" },
  { day: 10, date: "Sept 10", dow: "Wed", phase: "Phase 2: Core", m: { sub: "DBMS (1101112)", topic: "1NF & 2NF Normalization (Partial Dependency)", yt: "Gate Smashers Normalization 1NF 2NF", goal: "Split Order_Customer table to remove partial dependency" }, a: { sub: "Linux OS (1101413)", topic: "File Permissions (chmod 755 vs 644, chown)", yt: "Gate Smashers Linux File Permissions chmod 755", goal: "Calculate octal from rwxr-xr-x (4+2+1, 4+1, 4+1)" }, e: { sub: "IKS (2531511)", topic: "Tridosha Theory of Ayurveda (Vata, Pitta, Kapha)", yt: "Tridosha Ayurveda Vata Pitta Kapha elements", goal: "Explain 5 elements (Panchamahabhutas) combination" }, n: "Test Chmod Sim on Study Lab + Flip 5 Cards" },
  { day: 11, date: "Sept 11", dow: "Thu", phase: "Phase 2: Core", m: { sub: "OOP C++ (1102112)", topic: "Diamond Problem & Virtual Base Class in C++", yt: "Gate Smashers Diamond Problem C++ Virtual Base Class", goal: "Write class B : virtual public A syntax" }, a: { sub: "Web Tech (1102411)", topic: "CSS Box Model (box-sizing: border-box) & Flexbox", yt: "CSS Box Model margin border padding", goal: "Draw margin, border, padding, content box diagram" }, e: { sub: "Content Writing (1432311)", topic: "SEO Keyword Types: Informational vs Transactional", yt: "Search Intent Informational Commercial Transactional", goal: "Write examples for 3 search intent keywords" }, n: "Write Virtual Base Class code snippet + Flip 5 Cards" },
  { day: 12, date: "Sept 12", dow: "Fri", phase: "Phase 2: Core", m: { sub: "DAA (1102111)", topic: "Dijkstra Single Source Shortest Path Algorithm", yt: "Gate Smashers Dijkstra shortest path algorithm", goal: "Apply relaxation formula: dist[v] = dist[u] + w(u,v)" }, a: { sub: "Adv Python (1102413)", topic: "Tkinter GUI Window, Entry Boxes & Button Event", yt: "Tkinter Python GUI addition calculator", goal: "Write 10-line script to take 2 inputs and add" }, e: { sub: "People's Skills (2541514)", topic: "Thomas-Kilmann 5 Conflict Handling Modes", yt: "Thomas Kilmann Conflict Modes collaborate compete", goal: "Explain Collaborate, Compete, Compromise, Avoid, Accommodate" }, n: "Run Dijkstra dry run on 4-node graph + Flip 5 Cards" },
  { day: 13, date: "Sept 13", dow: "Sat", phase: "Phase 2: Core", m: { sub: "Digital Systems (1101111)", topic: "JK Flip-Flop Race Around Condition & Master-Slave", yt: "Gate Smashers JK Flip Flop Race around condition", goal: "Explain why tp > tpd causes race around toggling" }, a: { sub: "Statistics (1042212)", topic: "Karl Pearson Coefficient of Correlation (r)", yt: "Karl Pearson Correlation coefficient r formula", goal: "Calculate r value between Marks & Study Hours" }, e: { sub: "Behavioral Skills (2542520)", topic: "Passive vs Aggressive vs Assertive Communication", yt: "Assertive Communication styles passive aggressive", goal: "Explain why Assertiveness (I win, You win) is ideal" }, n: "Test Stats Live Sim on Study Lab + Flip 5 Cards" },
  { day: 14, date: "Sept 14", dow: "Sun", phase: "Phase 2 Milestone", m: { sub: "MILESTONE CHECKPOINT", topic: "12-Mark Passing Floor Lock Drill (All 16 Subjects)", yt: "Gate Smashers Computer Science exam strategy", goal: "Verify you know top 3 questions in all 16 subjects" }, a: { sub: "Passing Floor Drill", topic: "Write 3 core answers for Sem 1 Subjects on paper", yt: "Neso Academy digital electronics quick revision", goal: "Time: 25 minutes for 3 answers" }, e: { sub: "Passing Floor Drill", topic: "Write 3 core answers for Sem 2 Subjects on paper", yt: "Jenny lectures DAA revision", goal: "Time: 25 minutes for 3 answers" }, n: "🎉 PASSING FLOOR LOCKED: You have passed all 16 papers!" },

  // WEEK 3: 25+ DISTINCTION EXPANSION
  { day: 15, date: "Sept 15", dow: "Tue", phase: "Phase 3: Distinction", m: { sub: "DAA (1102111)", topic: "8-Queens Problem using Backtracking & State Tree", yt: "Gate Smashers 8 Queens Problem backtracking", goal: "Draw state space tree for 4-Queens mini version" }, a: { sub: "Python (1101411)", topic: "File Handling (r, w, a) & Word Frequency Dictionary", yt: "Python count word frequency in text file", goal: "Write script to read 'data.txt' and count word counts" }, e: { sub: "Management (1172311)", topic: "Line vs Matrix Organizational Structure & Control", yt: "Matrix organization structure advantages", goal: "Draw 2-boss Matrix structure diagram" }, n: "Draw 8-Queens tree + Flip 5 Cards" },
  { day: 16, date: "Sept 16", dow: "Wed", phase: "Phase 3: Distinction", m: { sub: "Digital Systems (1101111)", topic: "Von Neumann Architecture & Register Data Paths", yt: "Gate Smashers Von Neumann Architecture registers", goal: "Draw PC -> MAR -> MDR -> IR -> AC flow diagram" }, a: { sub: "Statistics (1042212)", topic: "Linear Regression Lines (Y on X: byx, X on Y: bxy)", yt: "Regression Lines Y on X bxy byx formula", goal: "State r = +/- sqrt(byx * bxy) relationship" }, e: { sub: "IPR (1481311)", topic: "Trade Secrets & Information Technology Act 2000", yt: "Trade Secrets protection NDA IT Act section 66", goal: "Explain Section 66 cyber hacking penalties" }, n: "Run CPU Cycle Sim on Study Lab + Flip 5 Cards" },
  { day: 17, date: "Sept 17", dow: "Thu", phase: "Phase 3: Distinction", m: { sub: "DBMS (1101112)", topic: "3NF Normalization (Transitive Dep) & ACID Properties", yt: "Gate Smashers 3NF Normalization ACID", goal: "Explain CustID -> CityCode -> CityName elimination" }, a: { sub: "Linux OS (1101413)", topic: "Shell Scripting: Loops, Test Conditions & Tar Backup", yt: "CodeWithHarry Bash Shell Scripting tar backup", goal: "Write script: if [ -d $d ]; then tar -cvf b.tar $d; fi" }, e: { sub: "IKS (2531511)", topic: "Harappan Town Planning & Vedic Drainage Architecture", yt: "Harappan civilization grid town planning drainage", goal: "Describe right-angle grid streets & covered drains" }, n: "Test 3NF Sim on Study Lab + Flip 5 Cards" },
  { day: 18, date: "Sept 18", dow: "Fri", phase: "Phase 3: Distinction", m: { sub: "OOP C++ (1102112)", topic: "Virtual Functions, Pure Virtual & Abstract Classes", yt: "Jenny lectures Pure Virtual Functions Abstract Class C++", goal: "Write virtual void show() = 0 syntax" }, a: { sub: "Web Tech (1102411)", topic: "JavaScript DOM Selection & Form Submit Validation", yt: "JavaScript Form Validation querySelector", goal: "Write email validation check before submit" }, e: { sub: "Content Writing (1432311)", topic: "PAS Framework (Problem, Agitate, Solve) & Readability", yt: "PAS copywriting framework Problem Agitate Solve", goal: "Write 3-line landing page copy using PAS" }, n: "Write Abstract Class snippet + Flip 5 Cards" },
  { day: 19, date: "Sept 19", dow: "Sat", phase: "Phase 3: Distinction", m: { sub: "DAA (1102111)", topic: "P vs NP vs NP-Complete vs NP-Hard Classes", yt: "Gate Smashers P NP NP Complete NP Hard", goal: "Define Polynomial time solvable vs verifiable" }, a: { sub: "Adv Python (1102413)", topic: "SQLite3 Database Connection & CRUD Queries in Python", yt: "Python sqlite3 database connect insert query", goal: "Write connect, cursor, execute INSERT, commit()" }, e: { sub: "People's Skills (2541514)", topic: "7-Stage Communication Process & Physical Barriers", yt: "Communication Process Sender Encoding Channel Receiver", goal: "Draw Sender -> Encoding -> Channel -> Receiver loop" }, n: "Write SQLite Python block + Flip 5 Cards" },
  { day: 20, date: "Sept 20", dow: "Sun", phase: "Phase 3: Distinction", m: { sub: "Digital Systems (1101111)", topic: "Memory Hierarchy & Cache Mapping (L1, L2, L3)", yt: "Gate Smashers Memory Hierarchy Cache RAM Disk", goal: "Draw speed vs cost pyramid: Registers -> Cache -> RAM" }, a: { sub: "Statistics (1042212)", topic: "Properties of Correlation Coefficient r (-1 to +1)", yt: "Properties of Correlation Coefficient r limits", goal: "State r is independent of change of origin & scale" }, e: { sub: "Hindi Bhasha (2512517)", topic: "प्रयोजनमूलक हिंदी की परिभाषा एवं प्रशासनिक शब्दावली", yt: "Prayojanmoolak Hindi prashasnik shabdavali", goal: "Write definitions of Circular, Order, Notification" }, n: "Draw Memory Pyramid + Flip 5 Cards" },
  { day: 21, date: "Sept 21", dow: "Mon", phase: "Phase 3 Milestone", m: { sub: "MILESTONE CHECKPOINT", topic: "Full Syllabus Coverage Verification (16 Subjects)", yt: "Gate Smashers Computer Science quick review", goal: "Confirm you have touched all Units 1, 2, and 3" }, a: { sub: "Sem 1 Formula Sheet", topic: "Consolidate all Sem 1 Diagrams & Code on 2 Sheets", yt: "Neso Academy digital logic revision", goal: "Draw 6 diagrams on one A4 sheet" }, e: { sub: "Sem 2 Formula Sheet", topic: "Consolidate all Sem 2 Formulas & Classes on 2 Sheets", yt: "Jenny lectures DAA formulas revision", goal: "Write all formulas on one A4 sheet" }, n: "🎉 25+ SYLLABUS EXPANSION COMPLETE!" },

  // WEEK 4: TIMED DRILLS & EVALUATOR BLUEPRINTS
  { day: 22, date: "Sept 22", dow: "Tue", phase: "Phase 4: Speed Drills", m: { sub: "DAA Timed Drill", topic: "Write Dijkstra + Merge Sort in 16 Mins flat", yt: "Jenny lectures Merge sort quick revision", goal: "Follow 5/5 Formula: Def + Diagram + 4 Bullets + Recurrence" }, a: { sub: "Python Timed Drill", topic: "Write Prime loop + Word count dict in 14 Mins", yt: "CodeWithHarry Python exercises", goal: "Clean indentation without compiler bugs" }, e: { sub: "Management Timed Drill", topic: "Write Fayol 14 Principles + Maslow in 16 Mins", yt: "Fayol principles fast writing", goal: "Clean numbered bullets + Gangplank diagram" }, n: "Score yourself: 15/15 target" },
  { day: 23, date: "Sept 23", dow: "Wed", phase: "Phase 4: Speed Drills", m: { sub: "Digital Systems Drill", topic: "Write De Morgan + Full Adder + K-Map in 22 Mins", yt: "Neso Academy full adder K map", goal: "Draw sharp circuit gates + truth table" }, a: { sub: "Statistics Drill", topic: "Solve Mean + SD + Karl Pearson r in 20 Mins", yt: "Statistics formula fast solving", goal: "Show all calculation steps with units" }, e: { sub: "IPR Timed Drill", topic: "Write 3 Patent Criteria + Fair Dealing in 14 Mins", yt: "IPR patent criteria exam question", goal: "Bold keywords: Novelty, Non-obvious, Utility" }, n: "Score yourself: 15/15 target" },
  { day: 24, date: "Sept 24", dow: "Thu", phase: "Phase 4: Speed Drills", m: { sub: "DBMS Timed Drill", topic: "Write 3-Tier + 1NF/2NF/3NF + ACID in 22 Mins", yt: "Gate Smashers DBMS revision", goal: "Draw 3-Tier schema + write table schemas" }, a: { sub: "Linux OS Drill", topic: "Write FHS 5 Dirs + chmod 755 + Backup script", yt: "Linux chmod FHS exam questions", goal: "Write octal math + shebang #!/bin/bash" }, e: { sub: "IKS Timed Drill", topic: "Write Aryabhata + Tridosha in 14 Mins", yt: "IKS exam questions revision", goal: "Explain Vata, Pitta, Kapha + Aryabhatiya" }, n: "Score yourself: 15/15 target" },
  { day: 25, date: "Sept 25", dow: "Fri", phase: "Phase 4: Speed Drills", m: { sub: "OOP C++ Drill", topic: "Write 4 Pillars + Virtual Base Class in 16 Mins", yt: "C++ diamond problem exam answer", goal: "Include class A, B: virtual public A code" }, a: { sub: "Web Tech Drill", topic: "Write HTTP Cycle + Box Model + JS Form in 20 Mins", yt: "Web tech exam questions revision", goal: "Draw Box model + write querySelector code" }, e: { sub: "Content Writing Drill", topic: "Write AIDA + Search Intent + PAS in 16 Mins", yt: "Content writing copywriting exam", goal: "Clean marketing examples" }, n: "Score yourself: 15/15 target" },
  { day: 26, date: "Sept 26", dow: "Sat", phase: "Phase 4: Speed Drills", m: { sub: "DAA & Python Drill", topic: "Write Knapsack Greedy vs DP + Generators in 16 Mins", yt: "DAA Knapsack dry run", goal: "Draw DP matrix recurrence equation" }, a: { sub: "Adv Python & Linux", topic: "Write Tkinter GUI + SQLite CRUD in 16 Mins", yt: "Tkinter sqlite script revision", goal: "Clean Python code syntax" }, e: { sub: "Life Skills Drill", topic: "Write Goleman 5 EQ + Johari Window in 16 Mins", yt: "EQ Johari window revision", goal: "Draw 4 Johari quadrants" }, n: "Score yourself: 15/15 target" },
  { day: 27, date: "Sept 27", dow: "Sun", phase: "Phase 4: Speed Drills", m: { sub: "Digital & Stats Drill", topic: "Write Von Neumann + Regression Lines in 16 Mins", yt: "Von Neumann architecture exam diagram", goal: "Draw register data bus connections" }, a: { sub: "Language & Ethics", topic: "Write Hindi Prashasnik + Assertiveness in 16 Mins", yt: "Prayojanmoolak Hindi exam", goal: "Clear Hindi terminology" }, e: { sub: "All Flashcard Speedrun", topic: "Flip all 8 Flashcards on Study Lab in 10 Mins", yt: "Active recall study lab", goal: "Recall 100% answers before card flips" }, n: "100% Flashcard accuracy verified" },
  { day: 28, date: "Sept 28", dow: "Mon", phase: "Full Mock Exam", m: { sub: "FULL MOCK EXAM 1", topic: "Timed 1-Hour 30-Mark Simulation Paper (Sem 1)", yt: "Gate Smashers full paper solve", goal: "Write 5 questions in 50 minutes flat" }, a: { sub: "FULL MOCK EXAM 2", topic: "Timed 1-Hour 30-Mark Simulation Paper (Sem 2)", yt: "Jenny lectures full DAA paper solve", goal: "Write 5 questions in 50 minutes flat" }, e: { sub: "Mock Evaluation", topic: "Self-grade using 5/5 Evaluator Formula", yt: "Evaluation marking scheme Mumbai University", goal: "Confirm 25+ Marks achieved in both mocks" }, n: "🎯 25+ MARKS CERTIFIED: Ready for Distinction!" },

  // DAYS 29-30: PRE-EXAM HALL TICKET PRE-FLIGHT
  { day: 29, date: "Sept 29", dow: "Tue", phase: "Pre-Flight Scan", m: { sub: "Sem 1 Formula Scan", topic: "De Morgan, K-Maps, Adders, 3-Tier, chmod, Patents", yt: "Digital logic formulas quick scan", goal: "Rapid visual scan on Study Lab app" }, a: { sub: "Sem 2 Formula Scan", topic: "Dijkstra, Merge Sort, C++ Virtual, Stats r, AIDA", yt: "DAA stats formulas quick scan", goal: "Rapid visual scan on Study Lab app" }, e: { sub: "Relaxation & Confidence", topic: "Rest your brain. Light walking & good meal", yt: "Exam mindset calm confidence", goal: "Zero panic. You have prepared 30 solid days." }, n: "Sleep early (8 hours restful sleep)" },
  { day: 30, date: "Sept 30", dow: "Wed", phase: "Final Readiness", m: { sub: "Stationery & Hall Ticket", topic: "Check Hall Ticket, College ID, 2 Black/Blue Pens, Scale", yt: "Exam hall readiness checklist", goal: "Bag packed and ready" }, a: { sub: "Mobile Quick Scan", topic: "Scroll Study Lab on phone: Flashcards + KaTeX formulas", yt: "Study lab quick scan", goal: "15 minutes light review" }, e: { sub: "Mental Peace", topic: "Early dinner + calm evening with family", yt: "Positive exam morning routine", goal: "You are going in with a full 25+ blueprint." }, n: "🌙 EXAM READY: Tomorrow is Day 1 of Victory!" }
];

let currentCalDay = 1;

// ── CALENDAR VIEW CONTROLS ──
function setCalView(viewName) {
  document.getElementById('btn-cal-month').classList.toggle('active', viewName === 'month');
  document.getElementById('btn-cal-week').classList.toggle('active', viewName === 'week');
  document.getElementById('btn-cal-day').classList.toggle('active', viewName === 'day');

  document.getElementById('cal-view-month').style.display = (viewName === 'month') ? 'block' : 'none';
  document.getElementById('cal-view-week').style.display = (viewName === 'week') ? 'block' : 'none';
  document.getElementById('cal-view-day').style.display = (viewName === 'day') ? 'block' : 'none';

  if (viewName === 'day') {
    loadDayDetail(currentCalDay);
  }
}

// ── RENDER MONTH GRID ──
function renderMonthGrid() {
  const container = document.getElementById('month-grid-container');
  if (!container) return;
  container.innerHTML = '';

  const todayDay = getTodayDayNum();
  calendarDays.forEach(d => {
    let dayCount = 0;
    ['m','a','e','n'].forEach(s => {
      if (appState.tasks[`${d.day}_${s}`]) dayCount++;
    });
    const isDone = dayCount === 4;
    const isToday = d.day === todayDay;
    const card = document.createElement('div');
    card.className = `cal-day-card ${d.day === currentCalDay ? 'active-day' : ''} ${isToday ? 'is-today' : ''}`;
    card.onclick = () => {
      currentCalDay = d.day;
      document.querySelectorAll('.cal-day-card').forEach(c => c.classList.remove('active-day'));
      card.classList.add('active-day');
      setCalView('day');
    };

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;font-weight:800;color:${isToday ? '#38bdf8' : '#f4f4f5'}">${d.date}</span>
        <span style="font-size:9px;color:${isToday ? '#22d3ee' : '#717684'};font-family:'JetBrains Mono',monospace;font-weight:${isToday ? '800' : '500'}">${isToday ? 'TODAY' : d.dow}</span>
      </div>
      <div style="font-size:9px;color:#fbbf24;font-weight:700;margin-bottom:2px">Day ${d.day}</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        <span class="cal-pill cal-pill-m">${d.m.sub.split(' ')[0]}</span>
        <span class="cal-pill cal-pill-a">${d.a.sub.split(' ')[0]}</span>
        <span class="cal-pill cal-pill-e">${d.e.sub.split(' ')[0]}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <span style="font-size:9px;color:#525866">${d.phase.split(':')[0]}</span>
        <span style="font-size:10px">${isDone ? '✅' : (dayCount > 0 ? '🟡' : '⚪')}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ── POPULATE DAY DROPDOWN ──
function populateDayDropdown() {
  const select = document.getElementById('day-selector-dropdown');
  if (!select) return;
  select.innerHTML = '';
  calendarDays.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.day;
    opt.innerText = `Day ${d.day}: ${d.date} (${d.dow})`;
    select.appendChild(opt);
  });
}

// ── LOAD DAY DETAIL IN DAY INSPECTOR ──
function loadDayDetail(dayNum) {
  currentCalDay = dayNum;
  const d = calendarDays.find(item => item.day === dayNum);
  if (!d) return;

  const select = document.getElementById('day-selector-dropdown');
  if (select) select.value = dayNum;

  document.getElementById('insp-day-badge').innerText = `DAY ${d.day} OF 30`;
  document.getElementById('insp-date-title').innerText = `${d.date}, 2026 (${d.dow})`;
  document.getElementById('insp-theme-desc').innerText = `${d.phase} · ${d.m.sub.split(' ')[0]} + ${d.a.sub.split(' ')[0]} + ${d.e.sub.split(' ')[0]}`;

  const container = document.getElementById('day-sessions-container');
  container.innerHTML = `
    <!-- Session 1: Morning -->
    <div class="day-session-card" style="border-left:4px solid #6366f1">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px">
        <span class="tag tag-indigo">🌅 BLOCK 1: MORNING (8:00 AM – 10:30 AM | 2.5h)</span>
        <span style="font-size:12px;font-weight:700;color:#818cf8">${d.m.sub}</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px">${d.m.topic}</div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:10px">🎯 <strong>Action Goal:</strong> ${d.m.goal}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(d.m.yt)}" target="_blank" class="yt-link" style="padding:6px 10px;font-size:11px">
          <span>▶ Watch Lecture on YouTube</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
        </a>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;cursor:pointer">
          <input type="checkbox" class="perm-check" id="chk_day_${d.day}_m" onchange="toggleTask(${d.day}, 'm')"> Block Done
        </label>
      </div>
    </div>

    <!-- Session 2: Afternoon -->
    <div class="day-session-card" style="border-left:4px solid #06b6d4">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px">
        <span class="tag tag-cyan">☀️ BLOCK 2: AFTERNOON (2:00 PM – 4:30 PM | 2.5h)</span>
        <span style="font-size:12px;font-weight:700;color:#22d3ee">${d.a.sub}</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px">${d.a.topic}</div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:10px">🎯 <strong>Action Goal:</strong> ${d.a.goal}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(d.a.yt)}" target="_blank" class="yt-link" style="padding:6px 10px;font-size:11px">
          <span>▶ Watch Lecture on YouTube</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
        </a>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;cursor:pointer">
          <input type="checkbox" class="perm-check" id="chk_day_${d.day}_a" onchange="toggleTask(${d.day}, 'a')"> Block Done
        </label>
      </div>
    </div>

    <!-- Session 3: Evening -->
    <div class="day-session-card" style="border-left:4px solid #10b981">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px">
        <span class="tag tag-green">🌆 BLOCK 3: EVENING (6:30 PM – 8:30 PM | 2.0h)</span>
        <span style="font-size:12px;font-weight:700;color:#4ade80">${d.e.sub}</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px">${d.e.topic}</div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:10px">🎯 <strong>Action Goal:</strong> ${d.e.goal}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(d.e.yt)}" target="_blank" class="yt-link" style="padding:6px 10px;font-size:11px">
          <span>▶ Watch Lecture on YouTube</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
        </a>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;cursor:pointer">
          <input type="checkbox" class="perm-check" id="chk_day_${d.day}_e" onchange="toggleTask(${d.day}, 'e')"> Block Done
        </label>
      </div>
    </div>

    <!-- Session 4: Night Recall -->
    <div class="day-session-card" style="border-left:4px solid #f59e0b">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px">
        <span class="tag tag-amber">🌙 BLOCK 4: NIGHT RECALL (10:00 PM – 10:45 PM | 45m)</span>
        <span style="font-size:12px;font-weight:700;color:#fbbf24">Active Spaced Repetition</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px">${d.n}</div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:10px">🎯 <strong>Action Goal:</strong> Test yourself without looking at notes. Let sleep solidify long-term memory.</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <button onclick="showSection('flashcards')" style="padding:6px 12px;border-radius:8px;background:#2563eb;border:none;color:#fff;font-size:11px;font-weight:700;cursor:pointer">Open Flashcards →</button>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;cursor:pointer">
          <input type="checkbox" class="perm-check" id="chk_day_${d.day}_n" onchange="toggleTask(${d.day}, 'n')"> Night Recall Done
        </label>
      </div>
    </div>
  `;

  // Restore Checkbox States from appState.tasks
  ['m','a','e','n'].forEach(session => {
    const isChecked = !!appState.tasks[`${d.day}_${session}`];
    const el = document.getElementById(`chk_day_${d.day}_${session}`);
    if (el) el.checked = isChecked;
  });

  updateDayProgress(d.day);
}

// ── TOGGLE TASK CHECKBOX ──
function toggleTask(day, session) {
  const el = document.getElementById(`chk_day_${day}_${session}`);
  if (el) {
    if (el.checked) {
      appState.tasks[`${day}_${session}`] = true;
    } else {
      delete appState.tasks[`${day}_${session}`];
    }
    saveState();
  }
  updateDayProgress(day);
}

// ── UPDATE DAY PROGRESS ──
function updateDayProgress(day) {
  let count = 0;
  ['m','a','e','n'].forEach(s => {
    if (appState.tasks[`${day}_${s}`]) count++;
  });
  const percent = Math.round((count / 4) * 100);
  const progEl = document.getElementById('daily-prog-percent');
  const barEl = document.getElementById('daily-prog-bar');
  if (progEl) progEl.innerText = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;

  if (percent === 100) {
    localStorage.setItem(`cal_day_${day}_done`, 'true');
  } else {
    localStorage.removeItem(`cal_day_${day}_done`);
  }
  renderMonthGrid();
  renderHeatmapAndStreak();
  updateDateAndPaceRadar();
}

function prevCalDay() {
  if (currentCalDay > 1) {
    loadDayDetail(currentCalDay - 1);
  }
}
function nextCalDay() {
  if (currentCalDay < 30) {
    loadDayDetail(currentCalDay + 1);
  }
}

// ══════════════════════════════════════════
// MASTER COURSES DATASET (ALL 16 COURSES)
// ══════════════════════════════════════════
const coursesData = [
  // SEMESTER 1
  {
    id: '1101111',
    sem: 'sem1',
    name: 'Digital Systems & Architecture',
    type: 'Major Core',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Number Systems & Boolean Logic',
        topics: 'Binary, Octal, Hex Conversions, 1s & 2s Complements, De Morgan\'s Theorems, K-Maps (SOP & POS minimization).',
        keyExamQ: 'Explain De Morgan\'s Theorems with circuit diagrams and truth tables.',
        renderType: 'math',
        formula: '\\overline{A \\cdot B} = \\overline{A} + \\overline{B} \\quad \\text{and} \\quad \\overline{A + B} = \\overline{A} \\cdot \\overline{B}'
      },
      {
        title: 'Unit 2: Combinational & Sequential Circuits',
        topics: 'Half & Full Adders, Multiplexers (4:1, 8:1 MUX), Flip-Flops (SR, JK, D, T), Master-Slave JK Race Around Condition, Shift Registers.',
        keyExamQ: 'Design a Full Adder using two Half Adders and an OR gate. Derive Sum and Carry equations.',
        renderType: 'math',
        formula: '\\text{Sum} = A \\oplus B \\oplus C_{in}, \\quad \\text{Carry} = AB + BC_{in} + AC_{in}'
      },
      {
        title: 'Unit 3: Processor Organization & Memory Hierarchy',
        topics: 'Von Neumann Architecture, Registers (PC, MAR, MDR, AC, IR), Instruction Cycle (Fetch, Decode, Execute), Cache Memory (L1, L2, L3).',
        keyExamQ: 'Explain the Von Neumann Architecture with a block diagram and register data paths.',
        renderType: 'flow',
        flowSteps: ['PC (Program Counter)', 'MAR (Address Bus)', 'MDR (Data Bus)', 'IR (Instruction Decode)', 'AC (Accumulator)']
      }
    ]
  },
  {
    id: '1101112',
    sem: 'sem1',
    name: 'Fundamentals of Database Systems',
    type: 'Major Core',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Introduction to DBMS & Data Modeling',
        topics: 'File System vs. DBMS, 3-Tier Schema Architecture, Data Independence, ER Modeling (Entities, Keys, Relationships, EER Generalization).',
        keyExamQ: 'Explain 3-Tier ANSI/SPARC Architecture and Physical vs. Logical Data Independence.',
        renderType: 'flow',
        flowSteps: ['External Level (User Views)', 'Conceptual Level (Logical Tables & Keys)', 'Internal Level (Physical Disk Storage)']
      },
      {
        title: 'Unit 2: Relational Model, Algebra & Normalization',
        topics: 'Relational Algebra (σ, π, ⋈), Normal Forms: 1NF, 2NF (Partial Dependency), 3NF (Transitive Dependency), BCNF.',
        keyExamQ: 'What is Normalization? Explain 1NF, 2NF, and 3NF with a student table example.',
        renderType: 'badge_list',
        badges: [
          { label: '1NF', desc: 'Atomic values only (No multi-valued lists)' },
          { label: '2NF', desc: '1NF + No Partial Dependencies (Non-prime depends on full PK)' },
          { label: '3NF', desc: '2NF + No Transitive Dependencies (A → B, B → C eliminated)' }
        ]
      },
      {
        title: 'Unit 3: SQL & Transaction Management',
        topics: 'DDL/DML/DCL, Group By, Having, Joins, ACID Properties, Transaction States.',
        keyExamQ: 'Explain ACID properties in DBMS with a real bank transfer transaction example.',
        renderType: 'badge_list',
        badges: [
          { label: 'Atomicity', desc: 'All or Nothing execution' },
          { label: 'Consistency', desc: 'Preserves database integrity rules' },
          { label: 'Isolation', desc: 'Concurrent transactions do not interfere' },
          { label: 'Durability', desc: 'Committed data survives power failure' }
        ]
      }
    ]
  },
  {
    id: '1101411',
    sem: 'sem1',
    name: 'Introduction to Programming with Python',
    type: 'Vocational / Skill',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Python Fundamentals & Control Flow',
        topics: 'Data types, Operators, Bitwise operators, If-elif-else, While/For loops, Break, Continue, Pass.',
        keyExamQ: 'Write a Python program to check if a number is Prime using a for-else construct.',
        renderType: 'code',
        code: 'for i in range(2, int(n**0.5) + 1):\n    if n % i == 0:\n        print("Not Prime"); break\nelse: print("Prime")'
      },
      {
        title: 'Unit 2: Core Data Structures & Strings',
        topics: 'List, Tuple, Sets, Dictionaries, Slicing, List Comprehension, Dict Methods.',
        keyExamQ: 'Compare Lists vs Tuples vs Sets vs Dictionaries with syntax and mutability.',
        renderType: 'badge_list',
        badges: [
          { label: 'List [ ]', desc: 'Ordered, Mutable, Allows Duplicates' },
          { label: 'Tuple ( )', desc: 'Ordered, Immutable (Fixed)' },
          { label: 'Set { }', desc: 'Unordered, Unique elements only' },
          { label: 'Dict {k:v}', desc: 'Key-Value pairs (Fast O(1) hash lookup)' }
        ]
      },
      {
        title: 'Unit 3: Functions, Modules & File Handling',
        topics: 'def, *args, **kwargs, Lambda functions, Recursion, File modes (r, w, a, r+), Try-Except-Finally blocks.',
        keyExamQ: 'Write a Python function to read a text file and count the frequency of each word using a Dictionary.',
        renderType: 'code',
        code: 'with open("data.txt", "r") as f:\n    words = f.read().split()\n    counts = {w: words.count(w) for w in set(words)}'
      }
    ]
  },
  {
    id: '1101413',
    sem: 'sem1',
    name: 'Linux Operating System',
    type: 'Skill Course',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Architecture & Filesystem Hierarchy',
        topics: 'Kernel vs Shell, FHS (/bin, /sbin, /etc, /home, /var, /proc), Navigation commands (ls -la, cd, mkdir -p, rm -rf).',
        keyExamQ: 'Explain the Linux Filesystem Hierarchy Standard (FHS) and describe 5 essential directories.',
        renderType: 'flow',
        flowSteps: ['/ (Root)', '/bin (User binaries)', '/etc (Config files)', '/home (User files)', '/var (System logs)']
      },
      {
        title: 'Unit 2: Permissions, Filters & Process Control',
        topics: 'Chmod (755 vs 644), Chown, Grep, Find, Pipes (|), Redirection, Process States, ps aux, top, kill -9.',
        keyExamQ: 'Explain Linux File Permissions with symbolic vs. octal notation with examples.',
        renderType: 'code',
        code: '# 755: Owner=rwx (7), Group=r-x (5), Others=r-x (5)\nchmod 755 script.sh\nps aux | grep python | awk "{print $2}" | xargs kill -9'
      },
      {
        title: 'Unit 3: Shell Scripting & Admin',
        topics: 'Shebang #!/bin/bash, Variables ($0..$9, $?), If-else test operators (-eq, -f, -d), Loops, Tar compression.',
        keyExamQ: 'Write a shell script to take a directory name and backup all .txt files into an archive.tar file.',
        renderType: 'code',
        code: '#!/bin/bash\nread -p "Enter dir: " d\nif [ -d "$d" ]; then\n    tar -cvf backup.tar "$d"/*.txt\nfi'
      }
    ]
  },
  {
    id: '1481311',
    sem: 'sem1',
    name: 'Intellectual Property Rights (IPR)',
    type: 'Open Elective',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Patents & Trademarks',
        topics: 'Tangible vs Intangible Property, 3 Criteria for Patentability (Novelty, Inventive Step, Industrial Application), Trademark classes.',
        keyExamQ: 'What are the 3 essential criteria for patent grant under Indian Patent Act 1970?',
        renderType: 'badge_list',
        badges: [
          { label: '1. Novelty', desc: 'Invention must be globally new' },
          { label: '2. Non-Obviousness', desc: 'Inventive step to person skilled in art' },
          { label: '3. Industrial Utility', desc: 'Must have practical real-world application' }
        ]
      },
      {
        title: 'Unit 2: Copyrights, Trade Secrets & IT Act 2000',
        topics: 'Copyright Act 1957, Software protection, Fair Dealing doctrine, Trade Secrets (NDAs), Cyber law Sec 66.',
        keyExamQ: 'Explain the Doctrine of Fair Dealing under Copyright law with exemptions for education and research.',
        renderType: 'badge_list',
        badges: [
          { label: 'Copyright Term', desc: 'Author Lifetime + 60 Years' },
          { label: 'Fair Dealing', desc: 'Exempts education, private research & critique' },
          { label: 'Trade Secrets', desc: 'Protected indefinitely via NDA contracts' }
        ]
      }
    ]
  },
  {
    id: '2531511',
    sem: 'sem1',
    name: 'Indian Knowledge System (IKS)',
    type: 'IKS Core',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Ancient Mathematics & Astronomy',
        topics: 'Decimal system, Concept of Shunya (Zero) by Brahmagupta, Aryabhata (π ≈ 3.1416, earth rotation), Bhaskara II.',
        keyExamQ: 'Describe the mathematical contributions of Aryabhata and Brahmagupta to global mathematics.',
        renderType: 'badge_list',
        badges: [
          { label: 'Aryabhata', desc: 'Aryabhatiya: π ≈ 3.1416, Earth rotation on its axis' },
          { label: 'Brahmagupta', desc: 'Brahmasphutasiddhanta: Formal arithmetic for Zero & Negatives' },
          { label: 'Bhaskara II', desc: 'Lilavati & Bijaganita: Cyclic method for indeterminate equations' }
        ]
      },
      {
        title: 'Unit 2: Ayurveda & Town Planning',
        topics: 'Tridosha Theory (Vata, Pitta, Kapha), Panchamahabhutas, Harappan Grid layout & underground drainage.',
        keyExamQ: 'Explain the Tridosha Theory of Ayurveda and its balance in human health.',
        renderType: 'badge_list',
        badges: [
          { label: 'Vata (Air + Ether)', desc: 'Controls nervous system & kinetic movement' },
          { label: 'Pitta (Fire + Water)', desc: 'Controls digestion, metabolism & temperature' },
          { label: 'Kapha (Water + Earth)', desc: 'Controls physical structure & immunity' }
        ]
      }
    ]
  },
  {
    id: '2541514',
    sem: 'sem1',
    name: 'Fundamental of People\'s Skills',
    type: 'Value Education',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Communication Models & Active Listening',
        topics: 'Sender-Receiver channel, Kinesics, Proxemics, Communication barriers, Active listening stages.',
        keyExamQ: 'Describe the 7-stage Communication Process and explain physical vs semantic barriers.',
        renderType: 'flow',
        flowSteps: ['Sender (Idea)', 'Encoding', 'Message & Channel', 'Receiver', 'Decoding', 'Feedback Loop']
      },
      {
        title: 'Unit 2: Emotional Intelligence & Conflict',
        topics: 'Daniel Goleman 5 EQ Pillars, Thomas-Kilmann Conflict Modes (Collaborate, Compete, Compromise, Avoid, Accommodate).',
        keyExamQ: 'Explain Daniel Goleman\'s 5 Pillars of Emotional Intelligence (EQ) in professional life.',
        renderType: 'badge_list',
        badges: [
          { label: '1. Self-Awareness', desc: 'Recognizing one\'s own emotional states' },
          { label: '2. Self-Regulation', desc: 'Managing impulses & adapting to change' },
          { label: '3. Internal Motivation', desc: 'Drive beyond money and status' },
          { label: '4. Empathy', desc: 'Understanding others\' emotions' },
          { label: '5. Social Skills', desc: 'Conflict management & leadership' }
        ]
      }
    ]
  },

  // SEMESTER 2
  {
    id: '1102111',
    sem: 'sem2',
    name: 'Design & Analysis of Algorithms (DAA)',
    type: 'Major Core',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Asymptotic Complexity & Divide-and-Conquer',
        topics: 'Big-O, Omega, Theta definitions, Merge Sort, Quick Sort (Partitioning), Binary Search, Master Theorem.',
        keyExamQ: 'Explain Merge Sort algorithm with divide-and-conquer recurrence relation and prove O(n log n).',
        renderType: 'math',
        formula: 'T(n) = 2T(n/2) + O(n) \\implies \\text{Master Theorem Case 2: } O(n \\log n)'
      },
      {
        title: 'Unit 2: Greedy Method & Dynamic Programming',
        topics: 'Fractional Knapsack, Dijkstra Shortest Path, Prim/Kruskal MST, 0/1 Knapsack (DP Matrix), Longest Common Subsequence (LCS).',
        keyExamQ: 'Differentiate between Greedy Approach and Dynamic Programming with Knapsack problem.',
        renderType: 'math',
        formula: 'V[i, w] = \\max\\left(V[i-1, w], \\, V[i-1, w - w_i] + p_i\\right)'
      },
      {
        title: 'Unit 3: Backtracking & NP-Completeness',
        topics: '8-Queens problem, State space trees, Graph coloring, P vs NP vs NP-Complete vs NP-Hard.',
        keyExamQ: 'Explain the 8-Queens problem using backtracking with state-space tree diagram.',
        renderType: 'badge_list',
        badges: [
          { label: 'Class P', desc: 'Solvable in polynomial time O(n^k)' },
          { label: 'Class NP', desc: 'Verifiable in polynomial time' },
          { label: 'NP-Complete', desc: 'Hardest problems in NP (e.g. Traveling Salesman)' }
        ]
      }
    ]
  },
  {
    id: '1102112',
    sem: 'sem2',
    name: 'Object Oriented Programming (OOP)',
    type: 'Major Core',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: 4 Pillars of OOP & Class Structure',
        topics: 'Encapsulation, Abstraction, Inheritance, Polymorphism, Access specifiers (private, public, protected), this pointer.',
        keyExamQ: 'Explain the 4 fundamental pillars of OOP with real-world examples and class snippets.',
        renderType: 'badge_list',
        badges: [
          { label: 'Encapsulation', desc: 'Binding data & methods into a class (Data Hiding)' },
          { label: 'Abstraction', desc: 'Displaying essential features, hiding backend machinery' },
          { label: 'Inheritance', desc: 'Reusability by deriving child classes from parent' },
          { label: 'Polymorphism', desc: 'One interface, multiple implementations' }
        ]
      },
      {
        title: 'Unit 2: Constructors, Destructors & Inheritance',
        topics: 'Default, Parameterized & Copy Constructors, Destructor (~ClassName), Multiple Inheritance & Diamond Problem (Virtual Base Class).',
        keyExamQ: 'Explain the Diamond Problem in C++ multiple inheritance and how Virtual Base Class solves it.',
        renderType: 'code',
        code: 'class A { public: int x; };\nclass B : virtual public A { }; // Solves Diamond ambiguity\nclass C : virtual public A { };\nclass D : public B, public C { };'
      },
      {
        title: 'Unit 3: Polymorphism & Virtual Functions',
        topics: 'Function Overloading, Operator Overloading, Virtual Functions (vtable/vptr), Pure Virtual Functions & Abstract Classes.',
        keyExamQ: 'Explain Runtime Polymorphism using Virtual Functions and Abstract Classes in C++.',
        renderType: 'code',
        code: 'class Base {\npublic:\n    virtual void show() = 0; // Pure Virtual Function -> Abstract Class\n};'
      }
    ]
  },
  {
    id: '1102411',
    sem: 'sem2',
    name: 'Web Technologies',
    type: 'Skill Course',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Web Architecture & Semantic HTML5',
        topics: 'HTTP/HTTPS, Status codes (200, 404, 500), Semantic tags (<header>, <nav>, <article>, <section>), Forms & inputs.',
        keyExamQ: 'Explain the HTTP Request-Response cycle and compare GET vs POST methods.',
        renderType: 'flow',
        flowSteps: ['Client Browser (URL)', 'DNS IP Lookup', 'HTTP/HTTPS TCP Handshake', 'Server Processing', '200 OK HTML Render']
      },
      {
        title: 'Unit 2: CSS3 Box Model, Flexbox & Responsive Design',
        topics: 'Box model (margin, border, padding, content), Flexbox layout (justify-content, align-items), Media Queries.',
        keyExamQ: 'Explain the CSS Box Model with diagram and show how box-sizing: border-box alters dimensions.',
        renderType: 'code',
        code: '/* Modern CSS Box Layout */\n.card {\n    box-sizing: border-box; /* Width includes padding & border */\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}'
      },
      {
        title: 'Unit 3: JavaScript DOM & Event Handling',
        topics: 'Let vs Const vs Var, DOM selection (querySelector), addEventListener, JSON parse/stringify, Fetch API.',
        keyExamQ: 'Write JavaScript code to validate an email address and display an error message on form submit.',
        renderType: 'code',
        code: 'document.querySelector("#my-form").addEventListener("submit", (e) => {\n    const email = document.querySelector("#email").value;\n    if (!email.includes("@")) { e.preventDefault(); alert("Invalid Email"); }\n});'
      }
    ]
  },
  {
    id: '1102413',
    sem: 'sem2',
    name: 'Advanced Python Programming',
    type: 'Skill Course',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: OOP Python, Generators & Decorators',
        topics: '__init__, self, Class methods, Static methods, Generators (yield), Decorators (@fn), Dunder methods (__str__, __len__).',
        keyExamQ: 'Explain Python Generators and yield keyword. Why are they memory efficient compared to Lists?',
        renderType: 'code',
        code: 'def number_stream(n):\n    for i in range(n):\n        yield i  # Memory efficient lazy streaming'
      },
      {
        title: 'Unit 2: GUI Development with Tkinter',
        topics: 'Tkinter root window, Widgets (Label, Entry, Button), Geometry managers (pack, grid, place), Event binding.',
        keyExamQ: 'Write a Python Tkinter GUI program with 2 Entry boxes and a Button to calculate sum of two numbers.',
        renderType: 'code',
        code: 'import tkinter as tk\nroot = tk.Tk()\nroot.title("25+ Calculator")\ne1 = tk.Entry(root); e1.pack()\nbtn = tk.Button(root, text="Calculate", command=lambda: print("Calculated"))\nbtn.pack()\nroot.mainloop()'
      },
      {
        title: 'Unit 3: Multithreading, Regex & SQLite3',
        topics: 'Threading module, GIL, Regex (re.search, findall, sub), SQLite3 database CRUD operations.',
        keyExamQ: 'Write a Python program to connect to SQLite database, create a table, and insert 2 student records.',
        renderType: 'code',
        code: 'import sqlite3\nconn = sqlite3.connect("student.db")\ncur = conn.cursor()\ncur.execute("CREATE TABLE IF NOT EXISTS marks (id INT, score INT)")\nconn.commit()'
      }
    ]
  },
  {
    id: '1042212',
    sem: 'sem2',
    name: 'DS_Descriptive Statistics',
    type: 'Minor',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Central Tendency & Data Presentation',
        topics: 'Histograms, Ogives, Arithmetic Mean, Median (L + [(N/2 - CF)/f]*h), Mode (L + [(f1-f0)/(2f1-f0-f2)]*h).',
        keyExamQ: 'State the empirical relationship between Mean, Median, and Mode and calculate Mean for grouped data.',
        renderType: 'math',
        formula: '\\text{Empirical Mode} = 3(\\text{Median}) - 2(\\text{Mean}) \\quad \\text{and} \\quad \\bar{x} = \\frac{\\sum f_i x_i}{N}'
      },
      {
        title: 'Unit 2: Measures of Dispersion',
        topics: 'Range, Quartile Deviation, Mean Deviation, Variance & Standard Deviation (σ), Coefficient of Variation (CV).',
        keyExamQ: 'Define Standard Deviation (σ) and Coefficient of Variation (CV). Why is CV used for consistency comparison?',
        renderType: 'math',
        formula: '\\sigma = \\sqrt{\\frac{\\sum f_i (x_i - \\bar{x})^2}{N}}, \\qquad CV = \\frac{\\sigma}{\\bar{x}} \\times 100\\%'
      },
      {
        title: 'Unit 3: Correlation & Linear Regression',
        topics: 'Karl Pearson Correlation (r), Spearman Rank (ρ), Regression lines (Y on X: byx, X on Y: bxy), Properties of r.',
        keyExamQ: 'Explain Karl Pearson\'s coefficient of correlation (r) formula, interpretation, and limits (-1 to +1).',
        renderType: 'math',
        formula: 'r = \\frac{n\\sum xy - (\\sum x)(\\sum y)}{\\sqrt{[n\\sum x^2 - (\\sum x)^2][n\\sum y^2 - (\\sum y)^2]}}, \\quad r = \\pm\\sqrt{b_{yx} \\cdot b_{xy}}'
      }
    ]
  },
  {
    id: '1172311',
    sem: 'sem2',
    name: 'Principles & Practices of Management',
    type: 'Open Elective',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Management Theories (Fayol & Taylor)',
        topics: 'F.W. Taylor Scientific Management, Henri Fayol 14 Principles (Division of Work, Unity of Command, Scalar Chain, Esprit de Corps).',
        keyExamQ: 'Explain Henri Fayol\'s 14 Principles of Management with modern business examples.',
        renderType: 'badge_list',
        badges: [
          { label: 'Unity of Command', desc: 'One employee receives orders from only ONE boss' },
          { label: 'Scalar Chain', desc: 'Clear line of authority from top to bottom' },
          { label: 'Gangplank', desc: 'Direct horizontal communication bridge in emergencies' },
          { label: 'Esprit de Corps', desc: 'Team harmony & mutual trust' }
        ]
      },
      {
        title: 'Unit 2: Management Functions (POSDCORB)',
        topics: 'Planning, Organizing (Line vs Matrix structure), Maslow Hierarchy of Needs, 4-Step Control Process.',
        keyExamQ: 'Explain Maslow\'s Need Hierarchy Theory of Motivation with pyramid diagram.',
        renderType: 'flow',
        flowSteps: ['1. Physiological Needs', '2. Safety & Security', '3. Social Belonging', '4. Esteem & Respect', '5. Self-Actualization']
      }
    ]
  },
  {
    id: '1432311',
    sem: 'sem2',
    name: 'Content Writing',
    type: 'Open Elective',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Copywriting Frameworks & Tone',
        topics: 'Content Writing vs Copywriting, AIDA Framework (Attention, Interest, Desire, Action), PAS (Problem, Agitate, Solve), B2B vs B2C persona.',
        keyExamQ: 'Explain the AIDA copywriting framework and write a high-converting landing page headline for a SaaS product.',
        renderType: 'flow',
        flowSteps: ['Attention (Hook)', 'Interest (Engage)', 'Desire (Benefits & Emotion)', 'Action (CTA Button)']
      },
      {
        title: 'Unit 2: SEO & Digital Content Formats',
        topics: 'On-Page SEO (H1/H2 tags, Meta descriptions, Keyword intent), Editing, Readability scores, Plagiarism check.',
        keyExamQ: 'What is Search Intent? Differentiate between Informational, Commercial, and Transactional keywords.',
        renderType: 'badge_list',
        badges: [
          { label: 'Informational Intent', desc: '"How does Merge Sort work?"' },
          { label: 'Commercial Intent', desc: '"Best AI SaaS tools for Mac 2026"' },
          { label: 'Transactional Intent', desc: '"Buy RD National College ATKT form"' }
        ]
      }
    ]
  },
  {
    id: '2512517',
    sem: 'sem2',
    name: 'Hindi Bhasha — Kaushal Ke Aadhaar',
    type: 'AECC',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Prayojanmoolak Hindi & Grammar',
        topics: 'Scope of Functional Hindi, Sandhi, Samas, Upsarg, Pratyay, Vakya Shuddhi, Muhavare.',
        keyExamQ: 'प्रयोजनमूलक हिंदी की परिभाषा एवं प्रशासनिक क्षेत्र में इसके महत्व को स्पष्ट कीजिए।',
        renderType: 'badge_list',
        badges: [
          { label: 'प्रयोजनमूलक हिंदी', desc: 'दैनिक बोलचाल से इतर कार्यालयीन, वैज्ञानिक एवं तकनीकी अभिव्यक्ति' },
          { label: 'पारिभाषिक शब्दावली', desc: 'Notification = अधिसूचना | Circular = परिपत्र | Order = आदेश' }
        ]
      },
      {
        title: 'Unit 2: Business & Official Communication',
        topics: 'Karyalayee Patra (Official Letters), Aavedan Patra, English-to-Hindi Technical Translation, Tippan aur Praroopan.',
        keyExamQ: 'कार्यालयीन टिप्पणी (Noting) और प्रारूपण (Drafting) की प्रक्रिया को उदाहरण सहित समझाइए।',
        renderType: 'flow',
        flowSteps: ['आवक पत्र प्राप्ति', 'टिप्पणी लेखन (Noting)', 'अधिकारी का निर्णय', 'प्रारूपण (Drafting)', 'अंतिम पत्र प्रेषण']
      }
    ]
  },
  {
    id: '2542520',
    sem: 'sem2',
    name: 'Foundation of Behavioral Skills',
    type: 'Value Education',
    credits: '2.0',
    units: [
      {
        title: 'Unit 1: Self-Awareness & Mindset',
        topics: 'Johari Window Model (Open, Blind, Hidden, Unknown), Growth vs Fixed Mindset, Eustress vs Distress management.',
        keyExamQ: 'Explain the Johari Window model of interpersonal awareness with a 4-quadrant diagram.',
        renderType: 'badge_list',
        badges: [
          { label: '1. Open Arena', desc: 'Known to self & Known to others' },
          { label: '2. Blind Spot', desc: 'Unknown to self, but Known to others' },
          { label: '3. Hidden Facade', desc: 'Known to self, but Hidden from others' },
          { label: '4. Unknown', desc: 'Unknown to self & Unknown to others' }
        ]
      },
      {
        title: 'Unit 2: Assertiveness & Workplace Ethics',
        topics: 'Passive vs Aggressive vs Assertive communication, "I" statements, SMART goal setting, Professional email etiquette.',
        keyExamQ: 'Compare Passive, Aggressive, and Assertive communication styles. Why is Assertiveness ideal in tech workplaces?',
        renderType: 'badge_list',
        badges: [
          { label: 'Passive', desc: 'I lose, You win (Avoids conflict, builds resentment)' },
          { label: 'Aggressive', desc: 'I win, You lose (Attacks others, destroys collaboration)' },
          { label: 'Assertive (Ideal)', desc: 'I win, You win (Respectful, clear boundaries, firm)' }
        ]
      }
    ]
  }
];

// ── RENDER MECHANISM HELPER ──
function renderMechanismBox(unit) {
  if (unit.renderType === 'math') {
    return `
      <div class="unit-box">
        <div style="font-size:10px;color:#717684;text-transform:uppercase;font-weight:700;margin-bottom:6px;letter-spacing:0.04em">Core Exam Formula</div>
        <div class="katex-render" style="overflow-x:auto;color:#818cf8;text-align:center;padding:6px 0">\\[ ${unit.formula} \\]</div>
      </div>
    `;
  } else if (unit.renderType === 'flow') {
    const pills = unit.flowSteps.map((step, idx) => `
      <span class="flow-pill"><span style="color:#818cf8;font-weight:700">${idx+1}.</span> ${step}</span>
      ${idx < unit.flowSteps.length - 1 ? '<span class="flow-arrow">→</span>' : ''}
    `).join('');
    return `
      <div class="unit-box">
        <div style="font-size:10px;color:#717684;text-transform:uppercase;font-weight:700;margin-bottom:6px;letter-spacing:0.04em">Architecture Execution Flow</div>
        <div class="flow-wrap">${pills}</div>
      </div>
    `;
  } else if (unit.renderType === 'code') {
    return `
      <div class="unit-box">
        <div style="font-size:10px;color:#717684;text-transform:uppercase;font-weight:700;margin-bottom:6px;letter-spacing:0.04em">Code / Query Snippet</div>
        <pre class="code-block">${unit.code}</pre>
      </div>
    `;
  } else if (unit.renderType === 'badge_list') {
    const items = unit.badges.map(b => `
      <div class="badge-item">
        <span class="badge-label">${b.label}</span>
        <span class="badge-desc">${b.desc}</span>
      </div>
    `).join('');
    return `
      <div class="unit-box">
        <div style="font-size:10px;color:#717684;text-transform:uppercase;font-weight:700;margin-bottom:6px;letter-spacing:0.04em">Key Technical Breakdown</div>
        <div class="badge-row">${items}</div>
      </div>
    `;
  }
  return '';
}

// ── RENDER SUBJECTS ──
function renderSubjects(filter = 'all', searchQuery = '') {
  const container = document.getElementById('subjects-container');
  if(!container) return;
  container.innerHTML = '';
  
  const filtered = coursesData.filter(c => {
    const matchesSem = (filter === 'all') || (c.sem === filter);
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q || 
      c.name.toLowerCase().includes(q) || 
      c.id.includes(q) || 
      c.units.some(u => u.title.toLowerCase().includes(q) || u.topics.toLowerCase().includes(q) || u.keyExamQ.toLowerCase().includes(q));
    return matchesSem && matchesSearch;
  });

  document.getElementById('course-count-badge').innerText = `${filtered.length} Courses`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;border:1px dashed #1c202d;border-radius:18px;background:#0a0c12">
        <div style="font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:6px">No courses matched your query</div>
        <div style="font-size:12px;color:#717684">Try searching for "Dijkstra", "3NF", "K-Map", "Python", or "chmod"</div>
      </div>
    `;
    return;
  }

  filtered.forEach(course => {
    const isSem1 = course.sem === 'sem1';
    const tagClass = isSem1 ? 'tag-cyan' : 'tag-indigo';
    const semLabel = isSem1 ? 'Semester I' : 'Semester II';

    let unitsHTML = course.units.map((u, idx) => `
      <div class="unit-box">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:13px;font-weight:700;color:#f4f4f5">${u.title}</span>
          <span style="font-size:10px;background:#141724;color:#818cf8;border:1px solid #1e2438;border-radius:6px;padding:2px 7px;font-family:'JetBrains Mono',monospace;white-space:nowrap;margin-left:8px;font-weight:700">Unit ${idx+1}</span>
        </div>
        <p style="font-size:12px;color:#8e95a5;line-height:1.6;margin-bottom:10px">${u.topics}</p>
        
        <div style="background:#0f1118;border:1px solid #1c202d;border-radius:10px;padding:10px;margin-bottom:6px">
          <span style="font-size:10px;color:#fbbf24;font-weight:700;display:flex;align-items:center;gap:4px">
            ★ High-Yield 5M Exam Question:
          </span>
          <p style="font-size:12px;color:#e4e4e7;margin-top:4px;line-height:1.6;font-style:italic">${u.keyExamQ}</p>
        </div>

        ${renderMechanismBox(u)}
      </div>
    `).join('');

    container.innerHTML += `
      <div class="card" id="course-${course.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span class="tag ${tagClass}">${semLabel} · ${course.type}</span>
          <span style="font-size:11px;color:#525866;font-family:'JetBrains Mono',monospace;font-weight:600">Code: ${course.id}</span>
        </div>
        <div style="font-size:16px;font-weight:800;color:#f4f4f5;margin-bottom:4px;letter-spacing:-0.01em">${course.name}</div>
        <div style="margin-top:4px">${unitsHTML}</div>
      </div>
    `;
  });

  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });
  }
}

// ── SEARCH INPUT EVENT ──
document.getElementById('globalSearch').addEventListener('input', e => renderSubjects(currentSem, e.target.value));

// ══════════════════════════════════════════
// SIM 1: SORTING VISUALIZER LOGIC
// ══════════════════════════════════════════
let sortArray = [45, 12, 85, 32, 89, 39, 69, 44, 42, 25, 65, 78, 19, 54, 95, 29];
function renderBars(highlights = []) {
  const container = document.getElementById('bars-container');
  if(!container) return;
  container.innerHTML = '';
  const maxVal = Math.max(...sortArray);
  sortArray.forEach((val, idx) => {
    const heightPercent = (val / maxVal) * 90;
    const isH = highlights.includes(idx);
    const bar = document.createElement('div');
    bar.style.cssText = `flex:1;border-radius:4px 4px 0 0;transition:height 0.15s ease;height:${heightPercent}%;background:${isH ? '#f59e0b' : '#3b82f6'};${isH ? 'box-shadow:0 0 10px rgba(245,158,11,0.6)' : ''}`;
    container.appendChild(bar);
  });
}
function generateRandomArray() {
  sortArray = Array.from({length: 16}, () => Math.floor(Math.random() * 85) + 12);
  document.getElementById('sort-comparisons').innerText = '0';
  renderBars();
}
async function startMergeSort() {
  let comps = 0;
  async function merge(arr, start) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = await merge(arr.slice(0, mid), start);
    const right = await merge(arr.slice(mid), start + mid);
    let result = [], l = 0, r = 0;
    while (l < left.length && r < right.length) {
      comps++;
      document.getElementById('sort-comparisons').innerText = comps;
      renderBars([start + l, start + mid + r]);
      await new Promise(res => setTimeout(res, 120));
      if (left[l] < right[r]) result.push(left[l++]);
      else result.push(right[r++]);
    }
    while (l < left.length) result.push(left[l++]);
    while (r < right.length) result.push(right[r++]);
    for (let i = 0; i < result.length; i++) sortArray[start + i] = result[i];
    renderBars();
    return result;
  }
  await merge(sortArray.slice(), 0);
  renderBars();
}
async function startQuickSort() {
  let comps = 0;
  async function qSort(s, e) {
    if (s >= e) return;
    let pivot = sortArray[e], pIdx = s;
    for (let i = s; i < e; i++) {
      comps++;
      document.getElementById('sort-comparisons').innerText = comps;
      renderBars([i, e]);
      await new Promise(res => setTimeout(res, 100));
      if (sortArray[i] < pivot) {
        [sortArray[i], sortArray[pIdx]] = [sortArray[pIdx], sortArray[i]];
        pIdx++;
      }
    }
    [sortArray[pIdx], sortArray[e]] = [sortArray[e], sortArray[pIdx]];
    renderBars([pIdx]);
    await new Promise(res => setTimeout(res, 100));
    await qSort(s, pIdx - 1);
    await qSort(pIdx + 1, e);
  }
  await qSort(0, sortArray.length - 1);
  renderBars();
}

// ══════════════════════════════════════════
// SIM 2: LOGIC GATES SIMULATOR
// ══════════════════════════════════════════
let inputA = 0, inputB = 0;
function toggleGateInput(gate) {
  if (gate === 'A') {
    inputA = inputA === 0 ? 1 : 0;
    document.getElementById('btn-input-a').innerText = `A: ${inputA}`;
    document.getElementById('btn-input-a').style.background = inputA ? '#2563eb' : '#181b26';
    document.getElementById('btn-input-a').style.borderColor = inputA ? '#3b82f6' : '#272c3d';
  } else {
    inputB = inputB === 0 ? 1 : 0;
    document.getElementById('btn-input-b').innerText = `B: ${inputB}`;
    document.getElementById('btn-input-b').style.background = inputB ? '#2563eb' : '#181b26';
    document.getElementById('btn-input-b').style.borderColor = inputB ? '#3b82f6' : '#272c3d';
  }
  updateGateSim();
}
function updateGateSim() {
  const type = document.getElementById('gate-type').value;
  let out = 0, expr = '';
  if (type === 'AND') { out = (inputA && inputB) ? 1 : 0; expr = 'Q = A • B'; }
  if (type === 'OR') { out = (inputA || inputB) ? 1 : 0; expr = 'Q = A + B'; }
  if (type === 'NAND') { out = !(inputA && inputB) ? 1 : 0; expr = 'Q = (A • B)\''; }
  if (type === 'NOR') { out = !(inputA || inputB) ? 1 : 0; expr = 'Q = (A + B)\''; }
  if (type === 'XOR') { out = (inputA !== inputB) ? 1 : 0; expr = 'Q = A ⊕ B'; }

  document.getElementById('gate-symbol-display').innerText = `[ ${type} GATE ]`;
  document.getElementById('gate-boolean-exp').innerText = `Expression: ${expr}`;

  const lamp = document.getElementById('output-lamp');
  lamp.innerText = out;
  lamp.style.cssText = out
    ? 'width:54px;height:54px;border-radius:50%;background:#06b6d4;border:2px solid #22d3ee;display:flex;align-items:center;justify-content:center;color:#000;font-family:JetBrains Mono,monospace;font-weight:800;font-size:18px;transition:all 0.2s;box-shadow:0 0 16px rgba(6,182,212,0.6)'
    : 'width:54px;height:54px;border-radius:50%;background:#181b26;border:2px solid #272c3d;display:flex;align-items:center;justify-content:center;color:#525866;font-family:JetBrains Mono,monospace;font-weight:800;font-size:18px;transition:all 0.2s';

  const tbody = document.getElementById('truth-table-body');
  tbody.innerHTML = '';
  [[0,0],[0,1],[1,0],[1,1]].forEach(([a,b]) => {
    let o = 0;
    if (type === 'AND') o = (a && b) ? 1 : 0;
    if (type === 'OR') o = (a || b) ? 1 : 0;
    if (type === 'NAND') o = !(a && b) ? 1 : 0;
    if (type === 'NOR') o = !(a || b) ? 1 : 0;
    if (type === 'XOR') o = (a !== b) ? 1 : 0;
    const isCur = (a === inputA && b === inputB);
    tbody.innerHTML += `
      <tr style="${isCur ? 'background:#1d4ed822;' : ''}border-bottom:1px solid #1c202d">
        <td style="padding:9px 12px;${isCur ? 'color:#f4f4f5;font-weight:700' : 'color:#8e95a5'}">${a}</td>
        <td style="padding:9px 12px;${isCur ? 'color:#f4f4f5;font-weight:700' : 'color:#8e95a5'}">${b}</td>
        <td style="padding:9px 12px;${o ? 'color:#22d3ee;font-weight:700' : 'color:#8e95a5'}">${o}</td>
        <td style="padding:9px 12px;font-size:10px;color:#717684">${isCur ? '▶ ACTIVE' : '—'}</td>
      </tr>
    `;
  });
}

// ══════════════════════════════════════════
// SIM 3: CPU CYCLE SIMULATOR
// ══════════════════════════════════════════
const cpuPhases = [
  { phase: "1. FETCH: PC loaded to MAR, instruction retrieved into MDR", pc: "0x1004", mar: "0x1004", mdr: "LOAD [0x50]", ir: "--", ac: "0", t: "T1" },
  { phase: "2. DECODE: Instruction passed to IR, Control Unit decodes opcode", pc: "0x1008", mar: "0x1004", mdr: "LOAD [0x50]", ir: "OP: LOAD, ADDR: 0x50", ac: "0", t: "T2" },
  { phase: "3. EXECUTE: Data at 0x50 loaded into Accumulator (AC)", pc: "0x1008", mar: "0x0050", mdr: "42", ir: "OP: LOAD, ADDR: 0x50", ac: "42", t: "T3" },
  { phase: "4. WRITEBACK / NEXT INSTRUCTION CYCLE READY", pc: "0x1008", mar: "0x1008", mdr: "ADD [0x54]", ir: "--", ac: "42", t: "T4" }
];
let cpuIndex = 0;
function stepCpuCycle() {
  cpuIndex = (cpuIndex + 1) % cpuPhases.length;
  const cur = cpuPhases[cpuIndex];
  document.getElementById('cpu-current-phase').innerText = cur.phase;
  document.getElementById('reg-pc').querySelector('div:last-child').innerText = cur.pc;
  document.getElementById('reg-mar').querySelector('div:last-child').innerText = cur.mar;
  document.getElementById('reg-mdr').querySelector('div:last-child').innerText = cur.mdr;
  document.getElementById('reg-ir').querySelector('div:last-child').innerText = cur.ir;
  document.getElementById('reg-ac').querySelector('div:last-child').innerText = `Value: ${cur.ac}`;
  document.getElementById('cpu-cycle-count').innerText = cur.t;
}

// ══════════════════════════════════════════
// SIM 4: DBMS NORMALIZATION SANDBOX
// ══════════════════════════════════════════
function setNormalForm(nf) {
  document.querySelectorAll('.nf-btn').forEach(b => {
    b.style.background = '#0d0f17';
    b.style.color = '#8e95a5';
    b.style.borderColor = '#1c202d';
  });
  const ab = document.getElementById(`nf-${nf}`);
  if (ab) {
    ab.style.background = '#2563eb';
    ab.style.color = '#fff';
    ab.style.borderColor = '#2563eb';
  }
  const view = document.getElementById('norm-table-view');
  const exp = document.getElementById('norm-explanation');
  const badge = document.getElementById('norm-badge');
  const tr = s => `<tr style="border-bottom:1px solid #1c202d;color:#a1a1aa">${s}</tr>`;
  const td = s => `<td style="padding:8px 10px">${s}</td>`;
  const th = s => `<th style="padding:8px 10px;color:#717684;font-size:10px;text-transform:uppercase;border-bottom:1px solid #1c202d;text-align:left">${s}</th>`;

  if (nf === 'unnorm') {
    view.innerHTML = `
      <div style="font-size:11px;color:#8e95a5;margin-bottom:8px;font-family:'JetBrains Mono',monospace">TABLE: Resolvia_Orders (Unnormalized)</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'JetBrains Mono',monospace">
        <thead><tr>${['OrderID','CustID','CustName','CustCity','ItemsOrdered'].map(th).join('')}</tr></thead>
        <tbody>
          ${tr(td('101') + td('C1') + td('Rohit') + td('Mumbai') + td('AI SaaS, CRM Tool'))}
          ${tr(td('102') + td('C2') + td('Adarsh') + td('Delhi') + td('Cloud Bot'))}
        </tbody>
      </table>
    `;
    exp.innerText = '⚠️ Unnormalized: ItemsOrdered has non-atomic values (violates 1NF). Updating city requires multiple row edits.';
    badge.innerText = 'Anomaly Risk: Extreme';
    badge.style.color = '#f87171';
  } else if (nf === '1nf') {
    view.innerHTML = `
      <div style="font-size:11px;color:#8e95a5;margin-bottom:8px;font-family:'JetBrains Mono',monospace">TABLE: Orders_1NF (Atomic Attributes Only)</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'JetBrains Mono',monospace">
        <thead><tr>${['OrderID','CustID','CustName','CustCity','Item'].map(th).join('')}</tr></thead>
        <tbody>
          ${tr(td('101') + td('C1') + td('Rohit') + td('Mumbai') + td('AI SaaS'))}
          ${tr(td('101') + td('C1') + td('Rohit') + td('Mumbai') + td('CRM Tool'))}
          ${tr(td('102') + td('C2') + td('Adarsh') + td('Delhi') + td('Cloud Bot'))}
        </tbody>
      </table>
    `;
    exp.innerText = '✅ 1NF: All values are atomic. But Partial Dependency exists (CustName depends only on CustID, not full PK).';
    badge.innerText = 'Anomaly Risk: Moderate';
    badge.style.color = '#fbbf24';
  } else if (nf === '2nf') {
    view.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
        <div>
          <div style="font-size:10px;color:#818cf8;font-family:'JetBrains Mono',monospace;margin-bottom:6px;font-weight:700">Customers Table</div>
          <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'JetBrains Mono',monospace">
            <thead><tr>${['CustID (PK)','CustName','CustCity'].map(th).join('')}</tr></thead>
            <tbody>
              ${tr(td('C1') + td('Rohit') + td('Mumbai'))}
              ${tr(td('C2') + td('Adarsh') + td('Delhi'))}
            </tbody>
          </table>
        </div>
        <div>
          <div style="font-size:10px;color:#22d3ee;font-family:'JetBrains Mono',monospace;margin-bottom:6px;font-weight:700">Order_Items Table</div>
          <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'JetBrains Mono',monospace">
            <thead><tr>${['OrderID (PK)','CustID (FK)','Item'].map(th).join('')}</tr></thead>
            <tbody>
              ${tr(td('101') + td('C1') + td('AI SaaS'))}
              ${tr(td('102') + td('C2') + td('Cloud Bot'))}
            </tbody>
          </table>
        </div>
      </div>
    `;
    exp.innerText = '✅ 2NF: Partial dependencies removed. Tables split into Customers and Order_Items.';
    badge.innerText = 'Anomaly Risk: Low';
    badge.style.color = '#22d3ee';
  } else if (nf === '3nf') {
    view.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
        <div style="background:#0a0c12;border:1px solid #1c202d;border-radius:10px;padding:12px">
          <div style="font-size:10px;font-weight:700;color:#818cf8;font-family:'JetBrains Mono',monospace;margin-bottom:6px">Customers (CustID PK)</div>
          <div style="font-size:11px;color:#a1a1aa;font-family:'JetBrains Mono',monospace;line-height:1.7">C1, Rohit, MUM<br>C2, Adarsh, DEL</div>
        </div>
        <div style="background:#0a0c12;border:1px solid #1c202d;border-radius:10px;padding:12px">
          <div style="font-size:10px;font-weight:700;color:#22d3ee;font-family:'JetBrains Mono',monospace;margin-bottom:6px">Cities (CityCode PK)</div>
          <div style="font-size:11px;color:#a1a1aa;font-family:'JetBrains Mono',monospace;line-height:1.7">MUM, Mumbai<br>DEL, Delhi</div>
        </div>
        <div style="background:#0a0c12;border:1px solid #1c202d;border-radius:10px;padding:12px">
          <div style="font-size:10px;font-weight:700;color:#4ade80;font-family:'JetBrains Mono',monospace;margin-bottom:6px">Orders (OrderID PK)</div>
          <div style="font-size:11px;color:#a1a1aa;font-family:'JetBrains Mono',monospace;line-height:1.7">101, C1, AI SaaS<br>102, C2, Cloud Bot</div>
        </div>
      </div>
    `;
    exp.innerText = '🎯 3NF: Transitive dependency (CustID → CityCode → CityName) completely eliminated!';
    badge.innerText = 'Anomaly Free: 100%';
    badge.style.color = '#4ade80';
  }
}

// ═══════════════════════════════════════
// SIM 5: STATS CALCULATOR LOGIC
// ═══════════════════════════════════════
function computeLiveStats() {
  try {
    const parseArr = id => document.getElementById(id).value.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    const x = parseArr('stats-input-x'), y = parseArr('stats-input-y');
    if (x.length === 0) return;

    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const varX = x.reduce((a, b) => a + Math.pow(b - meanX, 2), 0) / x.length;
    const sdX = Math.sqrt(varX);

    document.getElementById('stat-mean-x').innerText = meanX.toFixed(2);
    document.getElementById('stat-sd-x').innerText = sdX.toFixed(2);
    document.getElementById('stat-var-x').innerText = varX.toFixed(2);

    if (x.length === y.length && x.length > 1) {
      const meanY = y.reduce((a, b) => a + b, 0) / y.length;
      let num = 0, denX = 0, denY = 0;
      for (let i = 0; i < x.length; i++) {
        num += (x[i] - meanX) * (y[i] - meanY);
        denX += Math.pow(x[i] - meanX, 2);
        denY += Math.pow(y[i] - meanY, 2);
      }
      const r = num / (Math.sqrt(denX * denY));
      document.getElementById('stat-corr-r').innerText = `${r >= 0 ? '+' : ''}${r.toFixed(2)} (${Math.abs(r) > 0.7 ? 'Strong' : 'Weak'})`;
    }
  } catch (e) {}
}

// ══════════════════════════════════════════
// SIM 6: CHMOD PERMISSIONS LOGIC
// ══════════════════════════════════════════
function updateChmod() {
  const ur = document.getElementById('perm-u-r').checked ? 4 : 0;
  const uw = document.getElementById('perm-u-w').checked ? 2 : 0;
  const ux = document.getElementById('perm-u-x').checked ? 1 : 0;

  const gr = document.getElementById('perm-g-r').checked ? 4 : 0;
  const gw = document.getElementById('perm-g-w').checked ? 2 : 0;
  const gx = document.getElementById('perm-g-x').checked ? 1 : 0;

  const or_ = document.getElementById('perm-o-r').checked ? 4 : 0;
  const ow = document.getElementById('perm-o-w').checked ? 2 : 0;
  const ox = document.getElementById('perm-o-x').checked ? 1 : 0;

  const uVal = ur + uw + ux;
  const gVal = gr + gw + gx;
  const oVal = or_ + ow + ox;

  const octal = `${uVal}${gVal}${oVal}`;
  const sym = `-${ur ? 'r' : '-'}${uw ? 'w' : '-'}${ux ? 'x' : '-'}${gr ? 'r' : '-'}${gw ? 'w' : '-'}${gx ? 'x' : '-'}${or_ ? 'r' : '-'}${ow ? 'w' : '-'}${ox ? 'x' : '-'}`;

  document.getElementById('chmod-octal').innerText = octal;
  document.getElementById('chmod-symbolic').innerText = sym;
  document.getElementById('chmod-cmd').innerText = `chmod ${octal} script.sh`;
}

// ══════════════════════════════════════════
// ACTIVE RECALL FLASHCARDS DATASET
// ══════════════════════════════════════════
const flashcardsData = [
  {
    subject: "DESIGN & ANALYSIS OF ALGORITHMS",
    question: "State Dijkstra's Single Source Shortest Path Algorithm and its complexity.",
    answer: "<p><strong>1. Concept:</strong> Greedy algorithm finding minimum distances from a source node in non-negative weighted graphs.</p><p style='margin-top:6px'><strong>2. Relaxation Formula:</strong> <code style='color:#4ade80;font-family:JetBrains Mono,monospace'>if dist[u] + w(u,v) < dist[v]: dist[v] = dist[u] + w(u,v)</code></p><p style='margin-top:6px'><strong>3. Complexity:</strong> Time: \\(O((V+E) \\log V)\\) using Min-Heap / Priority Queue. Space: \\(O(V)\\).</p>"
  },
  {
    subject: "DATABASE MANAGEMENT SYSTEMS",
    question: "Explain 3-Tier Schema ANSI/SPARC Architecture with diagram components.",
    answer: "<p><strong>1. External Level (View):</strong> What users see (UI forms, queries).</p><p style='margin-top:6px'><strong>2. Conceptual Level (Logical):</strong> What data is stored (tables, relationships, constraints).</p><p style='margin-top:6px'><strong>3. Internal Level (Physical):</strong> How data is physically stored (B-Trees, indices on disk).</p><p style='margin-top:6px'><strong>Key Benefit:</strong> Provides Physical &amp; Logical Data Independence.</p>"
  },
  {
    subject: "DIGITAL SYSTEMS & ARCHITECTURE",
    question: "Explain the Race-Around Condition in JK Flip-Flops and its solution.",
    answer: "<p><strong>1. Problem:</strong> In JK flip-flop, when J=1, K=1 and clock pulse width \\(t_p > t_{pd}\\) (propagation delay), output toggles uncontrollably multiple times in a single clock cycle.</p><p style='margin-top:6px'><strong>2. Solution:</strong> Use Master-Slave JK Flip-Flop (Master triggered on positive edge, Slave triggered on negative edge) or Edge-Triggered Flip-Flop.</p>"
  },
  {
    subject: "OBJECT ORIENTED PROGRAMMING",
    question: "Explain the Diamond Problem in Multiple Inheritance and how Virtual Base Class solves it.",
    answer: "<p><strong>1. Diamond Problem:</strong> Class D inherits from both B and C, which both inherit from A. D gets two duplicate copies of A's members, causing compiler ambiguity.</p><p style='margin-top:6px'><strong>2. C++ Fix:</strong> Declare inheritance as <code style='color:#4ade80;font-family:JetBrains Mono,monospace'>class B : virtual public A</code> and <code style='color:#4ade80;font-family:JetBrains Mono,monospace'>class C : virtual public A</code> so only ONE copy of A exists in D.</p>"
  },
  {
    subject: "DESCRIPTIVE STATISTICS",
    question: "State the empirical relationship between Mean, Median, and Mode, and define CV.",
    answer: "<p><strong>1. Empirical Formula:</strong> \\(\\text{Mode} = 3(\\text{Median}) - 2(\\text{Mean})\\)</p><p style='margin-top:6px'><strong>2. Coefficient of Variation:</strong> \\(CV = \\frac{\\sigma}{\\bar{x}} \\times 100\\%\\)</p><p style='margin-top:6px'><strong>3. Interpretation:</strong> Dataset with lower CV is more consistent and stable.</p>"
  },
  {
    subject: "LINUX OPERATING SYSTEM",
    question: "Explain the difference between Hard Links and Soft (Symbolic) Links in Linux.",
    answer: "<p><strong>1. Hard Link (ln file link):</strong> Direct pointer to the file inode. Deleting original file does NOT destroy hard link data.</p><p style='margin-top:6px'><strong>2. Soft Link (ln -s file link):</strong> Pointer to the pathname (shortcut). If original file is moved/deleted, soft link breaks (dangling link).</p>"
  },
  {
    subject: "PYTHON PROGRAMMING",
    question: "Explain Python Generators and the yield keyword with a code snippet.",
    answer: "<p><strong>1. Generator:</strong> A function that returns an iterator using <code style='color:#4ade80;font-family:JetBrains Mono,monospace'>yield</code> instead of <code style='color:#4ade80;font-family:JetBrains Mono,monospace'>return</code>.</p><p style='margin-top:6px'><strong>2. Advantage:</strong> Lazy evaluation (generates 1 item at a time in memory instead of storing 1 million items in RAM).</p>"
  },
  {
    subject: "MANAGEMENT PRACTICES",
    question: "List Henri Fayol's 14 Principles of Management with Gangplank concept.",
    answer: "<p><strong>Core Principles:</strong> Division of Work, Authority &amp; Responsibility, Discipline, Unity of Command, Unity of Direction, Subordination of Interest, Remuneration, Centralization, Scalar Chain, Order, Equity, Stability of Tenure, Initiative, Esprit de Corps.</p><p style='margin-top:6px'><strong>Gangplank:</strong> Direct horizontal communication bypassing hierarchy in emergency.</p>"
  }
];

let fcCurrent = 0, fcFlipped = false;
function updateFlashcardView() {
  fcFlipped = false;
  document.getElementById('flashcard-element').classList.remove('flipped');
  const d = flashcardsData[fcCurrent];
  document.getElementById('fc-subject').innerText = d.subject;
  document.getElementById('fc-index').innerText = `Card ${fcCurrent + 1} of ${flashcardsData.length}`;
  document.getElementById('fc-question').innerText = d.question;
  document.getElementById('fc-answer').innerHTML = d.answer;
  if (window.renderMathInElement) {
    renderMathInElement(document.getElementById('fc-answer'), {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });
  }
}
function flipFlashcard() {
  fcFlipped = !fcFlipped;
  document.getElementById('flashcard-element').classList.toggle('flipped', fcFlipped);
}
function nextFlashcard() {
  fcCurrent = (fcCurrent + 1) % flashcardsData.length;
  updateFlashcardView();
}
function prevFlashcard() {
  fcCurrent = (fcCurrent - 1 + flashcardsData.length) % flashcardsData.length;
  updateFlashcardView();
}

// ══════════════════════════════════════════
// STREAK & GITHUB-STYLE HEATMAP LOGIC
// ══════════════════════════════════════════
function renderHeatmapAndStreak() {
  const container = document.getElementById('github-heatmap-grid');
  if (!container) return;
  container.innerHTML = '';

  let currentStreak = 0;
  let totalBlocksDone = 0;
  const totalPossible = 30 * 4; // 120 blocks

  calendarDays.forEach((d) => {
    let dayBlocks = 0;
    ['m', 'a', 'e', 'n'].forEach(s => {
      if (appState.tasks[`${d.day}_${s}`]) {
        dayBlocks++;
        totalBlocksDone++;
      }
    });

    if (dayBlocks > 0) {
      currentStreak++;
    }

    // Heatmap tile colors
    let bg = '#161b26', border = '#272e3f', textColor = '#717684', shadow = 'none';
    if (dayBlocks === 1) { bg = '#0e4429'; border = '#006d32'; textColor = '#86efac'; }
    else if (dayBlocks === 2) { bg = '#006d32'; border = '#26a641'; textColor = '#bbf7d0'; }
    else if (dayBlocks === 3) { bg = '#26a641'; border = '#39d353'; textColor = '#ffffff'; }
    else if (dayBlocks === 4) { bg = '#39d353'; border = '#4ade80'; textColor = '#000000'; shadow = '0 0 8px rgba(57,211,83,0.5)'; }

    const isCurrent = d.day === currentCalDay;

    const tile = document.createElement('div');
    tile.style.cssText = `
      aspect-ratio: 1;
      border-radius: 6px;
      background: ${bg};
      border: 1.5px solid ${isCurrent ? '#60a5fa' : border};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: ${shadow};
      position: relative;
    `;
    tile.title = `${d.date} (${d.dow}): ${dayBlocks}/4 Blocks (${Math.round((dayBlocks/4)*100)}%) · Click to inspect`;
    tile.onmouseenter = () => { tile.style.transform = 'scale(1.15)'; tile.style.zIndex = '10'; };
    tile.onmouseleave = () => { tile.style.transform = 'scale(1)'; tile.style.zIndex = '1'; };
    tile.onclick = () => {
      loadDayDetail(d.day);
      setCalView('day');
    };

    tile.innerHTML = `
      <span style="font-size:10px;font-weight:800;color:${textColor};font-family:'JetBrains Mono',monospace">${d.day}</span>
      <span style="font-size:7px;color:${textColor};opacity:0.85;line-height:1">${dayBlocks}/4</span>
    `;

    container.appendChild(tile);
  });

  // Update Streak & Total Stats
  const streakBadge = document.getElementById('streak-badge');
  if (streakBadge) {
    streakBadge.innerText = `🔥 ${currentStreak} Day${currentStreak === 1 ? '' : 's'} Active`;
    streakBadge.className = currentStreak > 0 ? 'tag tag-green' : 'tag tag-zinc';
  }

  const totalStat = document.getElementById('total-blocks-stat');
  if (totalStat) {
    const percent = Math.round((totalBlocksDone / totalPossible) * 100);
    totalStat.innerHTML = `<span style="color:#4ade80;font-weight:800">${totalBlocksDone}</span> / 120 Blocks <span style="color:#717684">(${percent}%)</span>`;
  }
}

// ══════════════════════════════════════════
// CROSS-DEVICE SYNC ENGINE (QR & URL HASH)
// ══════════════════════════════════════════
function getSyncPayload() {
  const payload = {
    v: 1,
    t: appState.tasks || {},
    d: appState.currentDay || 1,
    a: appState.activeTab || 'schedule',
    ts: Date.now()
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function openSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  const encoded = getSyncPayload();
  const url = `${window.location.origin}${window.location.pathname}?sync=${encoded}`;

  const qrImg = document.getElementById('sync-qr-img');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(url)}`;
  }

  const input = document.getElementById('sync-code-input');
  if (input) input.value = encoded;
}

function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (modal) modal.style.display = 'none';
}

function copySyncLink() {
  const encoded = getSyncPayload();
  const url = `${window.location.origin}${window.location.pathname}?sync=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('btn-copy-sync');
    if (btn) {
      btn.innerHTML = '<span>✅ Copied Link to Clipboard!</span>';
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.innerHTML = '<span>📋 Copy 1-Click Sync Link</span>';
        btn.style.background = '#2563eb';
      }, 3000);
    }
  }).catch(() => {
    prompt('Copy this sync link to paste on your phone:', url);
  });
}

function importSyncCode(rawStr) {
  try {
    const code = rawStr || (document.getElementById('sync-code-input') ? document.getElementById('sync-code-input').value.trim() : '');
    if (!code) return;
    const decoded = JSON.parse(decodeURIComponent(escape(atob(code))));
    if (decoded && decoded.t) {
      appState.tasks = { ...appState.tasks, ...decoded.t };
      if (decoded.d) appState.currentDay = decoded.d;
      if (decoded.a) appState.activeTab = decoded.a;
      saveState();

      loadDayDetail(appState.currentDay);
      showSection(appState.activeTab);
      renderMonthGrid();
      renderHeatmapAndStreak();

      closeSyncModal();
      showToast('🎉 Progress Synced Successfully Across Devices!');
    }
  } catch (err) {
    alert('Invalid sync code. Please make sure the entire code was copied correctly.');
  }
}

function checkUrlSync() {
  const params = new URLSearchParams(window.location.search);
  const syncData = params.get('sync');
  if (syncData) {
    importSyncCode(syncData);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ══════════════════════════════════════════
// LIVE DATE & PACE RADAR ENGINE
// ══════════════════════════════════════════
function getTodayDayNum() {
  const now = new Date();
  // Month 8 is September in JS (0-indexed: Jan=0, Sep=8)
  if (now.getFullYear() === 2026 && now.getMonth() === 8) {
    return Math.min(30, Math.max(1, now.getDate()));
  }
  return 1; // Default to Day 1
}

function updateDateAndPaceRadar() {
  const todayDay = getTodayDayNum();
  const d = calendarDays.find(item => item.day === todayDay) || calendarDays[0];

  // Update Date Display
  const monthLbl = document.getElementById('today-month-lbl');
  const numLbl = document.getElementById('today-num-lbl');
  const fullStr = document.getElementById('today-full-str');
  const subStr = document.getElementById('today-sub-str');
  const badgeLbl = document.getElementById('today-badge-lbl');

  if (monthLbl) monthLbl.innerText = 'SEPT';
  if (numLbl) numLbl.innerText = todayDay < 10 ? '0' + todayDay : todayDay;
  if (fullStr) fullStr.innerText = `${d.dow}, ${d.date} 2026`;
  if (badgeLbl) badgeLbl.innerText = `TODAY · DAY ${todayDay} OF 30`;

  const daysLeft = Math.max(0, 30 - todayDay);
  if (subStr) {
    subStr.innerText = `Runway: ${daysLeft} Day${daysLeft === 1 ? '' : 's'} remaining until October 1 Exams`;
  }

  // Calculate Pace:
  let actualDone = 0;
  calendarDays.forEach(dayItem => {
    ['m', 'a', 'e', 'n'].forEach(s => {
      if (appState.tasks[`${dayItem.day}_${s}`]) actualDone++;
    });
  });

  const now = new Date();
  const currentHour = now.getHours();
  let todayExpected = 1;
  if (currentHour >= 14 && currentHour < 18) todayExpected = 2;
  else if (currentHour >= 18 && currentHour < 22) todayExpected = 3;
  else if (currentHour >= 22) todayExpected = 4;

  const expectedBlocks = ((todayDay - 1) * 4) + todayExpected;
  const delta = actualDone - expectedBlocks;

  const iconEl = document.getElementById('pace-status-icon');
  const titleEl = document.getElementById('pace-status-title');
  const descEl = document.getElementById('pace-status-desc');

  if (delta > 0) {
    if (iconEl) iconEl.innerText = '🚀';
    if (titleEl) { titleEl.innerText = `Pace: Ahead (+${delta} Block${delta > 1 ? 's' : ''})`; titleEl.style.color = '#4ade80'; }
    if (descEl) descEl.innerText = `Cushion buffer active · On track for 25+`;
  } else if (delta === 0) {
    if (iconEl) iconEl.innerText = '🟢';
    if (titleEl) { titleEl.innerText = 'Pace: Perfect · On Schedule'; titleEl.style.color = '#4ade80'; }
    if (descEl) descEl.innerText = `0 blocks behind · Pacing for Oct 1`;
  } else if (delta === -1) {
    if (iconEl) iconEl.innerText = '🟡';
    if (titleEl) { titleEl.innerText = 'Pace: 1 Block Pending'; titleEl.style.color = '#fbbf24'; }
    if (descEl) descEl.innerText = `Easy 1.5h catchup in tonight's block`;
  } else {
    const behind = Math.abs(delta);
    if (iconEl) iconEl.innerText = '⚠️';
    if (titleEl) { titleEl.innerText = `Pace: ${behind} Blocks Behind`; titleEl.style.color = '#fb7185'; }
    if (descEl) descEl.innerText = `Schedule catch-up sprint this weekend`;
  }

  // Milestone Countdown
  const milestoneEl = document.getElementById('milestone-status-txt');
  if (milestoneEl) {
    if (todayDay < 14) {
      milestoneEl.innerText = `Sept 14 · Passing Lock (${14 - todayDay}d left)`;
    } else if (todayDay < 28) {
      milestoneEl.innerText = `Sept 28 · Distinction Lock (${28 - todayDay}d left)`;
    } else {
      milestoneEl.innerText = `Oct 1 · Exam Day Ready (${Math.max(0, 30 - todayDay)}d left)`;
    }
  }
}

function goToToday() {
  const todayDay = getTodayDayNum();
  loadDayDetail(todayDay);
  setCalView('day');
  const inspector = document.getElementById('cal-view-day');
  if (inspector) inspector.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════
// PWA SERVICE WORKER & INSTALL LOGIC
// ══════════════════════════════════════════
let deferredInstallPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.style.display = 'inline-flex';
});

function installPwa() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        const btn = document.getElementById('btn-pwa-install');
        if (btn) btn.style.display = 'none';
      }
      deferredInstallPrompt = null;
    });
  } else {
    alert('To install this app on your phone:\n• iPhone/Safari: Tap Share (square with arrow) → "Add to Home Screen"\n• Android/Chrome: Tap 3 dots (⋮) → "Install app" or "Add to Home screen"');
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
      .catch(err => console.log('ServiceWorker registration error:', err));
  });
}

// ── INITIAL LOAD ──
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  checkUrlSync();
  renderSubjects('all');
  generateRandomArray();
  updateGateSim();
  setNormalForm('unnorm');
  computeLiveStats();
  updateChmod();
  updateFlashcardView();
  renderMonthGrid();
  populateDayDropdown();
  loadDayDetail(appState.currentDay || getTodayDayNum());
  renderHeatmapAndStreak();
  updateDateAndPaceRadar();
  showSection(appState.activeTab || 'schedule');
});