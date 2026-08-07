import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

// 1. Firebase Project Configuration
const firebaseConfig = {
  projectId: "union30-ga-chart",
  appId: "1:47390116669:web:placeholder" // Automatically links in Console
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const goalsCol = collection(db, 'goals');

// 2. Select HTML Elements
const tabLogBtn = document.getElementById('tab-log');
const tabStatsBtn = document.getElementById('tab-stats');
const panelLog = document.getElementById('panel-log');
const panelStats = document.getElementById('panel-stats');

const gkHeader = document.getElementById('gk-header');
const gkSummary = document.getElementById('gk-summary');

const gkNameInput = document.getElementById('gk-name');
const gkAgeInput = document.getElementById('gk-age');
const gkLevelInput = document.getElementById('gk-level');
const startLoggingBtn = document.getElementById('start-logging');
const gkInvalidHint = document.getElementById('gk-invalid-hint');

const stepWelcome = document.getElementById('step-welcome');
const welcomeContinueBtn = document.getElementById('welcome-continue');
const stepInfo = document.getElementById('step-info');
const stepOrigin = document.getElementById('step-origin');
const stepFinish = document.getElementById('step-finish');
const stepGoal = document.getElementById('step-goal');

const WELCOMED_KEY = 'gk-tracker-welcomed';

const confirmSheet = document.getElementById('confirm-sheet');
const confirmGk = document.getElementById('confirm-gk');
const confirmSequence = document.getElementById('confirm-sequence');
const confirmPct = document.getElementById('confirm-pct');
const confirmDismissBtn = document.getElementById('confirm-dismiss');

const statsSearchInput = document.getElementById('stats-search');
const statsRecent = document.getElementById('stats-recent');
const statsResult = document.getElementById('stats-result');
const statsEmpty = document.getElementById('stats-empty');
const statsInsight = document.getElementById('stats-insight');
const statsTotal = document.getElementById('stats-total');
const statsOrigin = document.getElementById('stats-origin');
const statsFinish = document.getElementById('stats-finish');
const statsEntry = document.getElementById('stats-entry');

// 3. Flow State
let step = 'info'; // welcome | info | origin | finish | goal
let tab = 'log'; // log | stats
let selectedOrigin = null;
let selectedFinish = null;

function gkValues() {
  return {
    name: gkNameInput.value.trim(),
    age: gkAgeInput.value.trim(),
    level: gkLevelInput.value.trim(),
  };
}

function gkIsValid() {
  const { name, age, level } = gkValues();
  return !!(name && age && level);
}

function gkSummaryLine() {
  const { name, age, level } = gkValues();
  return `${name || 'Goalkeeper'} • ${age || '—'} • ${level || '—'}`;
}

function updateStartButton() {
  const valid = gkIsValid();
  startLoggingBtn.disabled = !valid;
  gkInvalidHint.classList.toggle('hidden', valid);
}

function setStep(next) {
  step = next;
  stepWelcome.classList.toggle('hidden', step !== 'welcome');
  stepInfo.classList.toggle('hidden', step !== 'info');
  stepOrigin.classList.toggle('hidden', step !== 'origin');
  stepFinish.classList.toggle('hidden', step !== 'finish');
  stepGoal.classList.toggle('hidden', step !== 'goal');

  const showHeader = step !== 'welcome' && step !== 'info';
  gkHeader.classList.toggle('hidden', !showHeader);
  if (showHeader) gkSummary.textContent = gkSummaryLine();
}

function setTab(next) {
  tab = next;
  panelLog.classList.toggle('hidden', tab !== 'log');
  panelStats.classList.toggle('hidden', tab !== 'stats');
  tabLogBtn.classList.toggle('active', tab === 'log');
  tabStatsBtn.classList.toggle('active', tab === 'stats');
  if (tab === 'stats') loadRecentNames();
}

// --- Tab bar ---
tabLogBtn.addEventListener('click', () => setTab('log'));
tabStatsBtn.addEventListener('click', () => setTab('stats'));

// --- Welcome step ---
welcomeContinueBtn.addEventListener('click', () => {
  localStorage.setItem(WELCOMED_KEY, '1');
  setStep('info');
});

// --- GK info step ---
gkHeader.addEventListener('click', () => setStep('info'));

[gkNameInput, gkAgeInput, gkLevelInput].forEach((input) => {
  input.addEventListener('input', updateStartButton);
});

startLoggingBtn.addEventListener('click', () => {
  if (gkIsValid()) setStep('origin');
});

// --- Origin zone step ---
document.querySelectorAll('#step-origin .zone-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    selectedOrigin = tile.dataset.zone;
    setStep('finish');
  });
});

// --- Finish type step ---
document.querySelectorAll('.finish-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    selectedFinish = tile.dataset.finish;
    setStep('goal');
  });
});

// --- Goal entry step ---
document.querySelectorAll('#step-goal .zone-tile').forEach((tile) => {
  tile.addEventListener('click', () => logGoal(tile.dataset.zone));
});

async function logGoal(goalEntryZone) {
  const { name, age, level } = gkValues();
  const origin = selectedOrigin;
  const finish = selectedFinish;

  try {
    await addDoc(goalsCol, {
      goalkeeper_name: name,
      age_group: age,
      level_of_play: level,
      origin_zone: origin,
      finish_type: finish,
      goal_entry_zone: goalEntryZone,
      timestamp: serverTimestamp(),
    });

    const totalSnapshot = await getCountFromServer(query(goalsCol));
    const totalGoals = totalSnapshot.data().count;

    const matchSnapshot = await getCountFromServer(
      query(
        goalsCol,
        where('origin_zone', '==', origin),
        where('finish_type', '==', finish),
        where('goal_entry_zone', '==', goalEntryZone)
      )
    );
    const matchingGoals = matchSnapshot.data().count;
    const pct = totalGoals > 0 ? Math.round((matchingGoals / totalGoals) * 100) : 0;

    selectedOrigin = null;
    selectedFinish = null;
    setStep('origin');

    confirmGk.textContent = gkSummaryLine();
    confirmSequence.textContent = `${origin} → ${finish} → ${goalEntryZone}`;
    confirmPct.textContent = `${pct}% of all logged goals match this exact combo.`;
    confirmSheet.classList.remove('hidden');
  } catch (error) {
    console.error('Error logging goal: ', error);
    alert('⚠️ Error saving goal. Please check your network connection.');
  }
}

confirmDismissBtn.addEventListener('click', () => {
  confirmSheet.classList.add('hidden');
});

// --- Stats tab ---
async function loadRecentNames() {
  try {
    const snapshot = await getDocs(query(goalsCol, orderBy('timestamp', 'desc'), limit(50)));
    const seen = new Set();
    const names = [];
    snapshot.forEach((docSnap) => {
      const name = docSnap.data().goalkeeper_name;
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    });

    statsRecent.innerHTML = '';
    names.slice(0, 8).forEach((name) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.addEventListener('click', () => {
        statsSearchInput.value = name;
        loadStatsFor(name);
      });
      statsRecent.appendChild(chip);
    });
  } catch (error) {
    console.error('Error loading recent goalkeepers: ', error);
  }
}

let statsSearchTimer = null;
statsSearchInput.addEventListener('input', () => {
  clearTimeout(statsSearchTimer);
  const name = statsSearchInput.value.trim();
  if (!name) {
    showStatsEmpty();
    return;
  }
  statsSearchTimer = setTimeout(() => loadStatsFor(name), 300);
});

function showStatsEmpty() {
  statsResult.classList.add('hidden');
  statsEmpty.classList.remove('hidden');
}

function tally(records, key) {
  const counts = {};
  records.forEach((r) => {
    counts[r[key]] = (counts[r[key]] || 0) + 1;
  });
  return counts;
}

function renderBreakdown(container, records, key, total) {
  const counts = tally(records, key);
  const rows = Object.keys(counts)
    .map((label) => ({ label, count: counts[label], pct: Math.round((counts[label] / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  container.innerHTML = '';
  rows.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'breakdown-row';
    rowEl.innerHTML = `
      <div class="breakdown-row-top"><span>${row.label}</span><span class="count">${row.count}</span></div>
      <div class="breakdown-track"><div class="breakdown-bar" style="width:${row.pct}%"></div></div>
    `;
    container.appendChild(rowEl);
  });
}

async function loadStatsFor(name) {
  try {
    const snapshot = await getDocs(query(goalsCol, where('goalkeeper_name', '==', name)));
    if (snapshot.empty) {
      showStatsEmpty();
      return;
    }

    const records = snapshot.docs.map((docSnap) => docSnap.data());
    const total = records.length;

    const comboCounts = {};
    records.forEach((r) => {
      const key = `${r.origin_zone}|${r.finish_type}|${r.goal_entry_zone}`;
      comboCounts[key] = (comboCounts[key] || 0) + 1;
    });
    let bestKey = null;
    let bestCount = 0;
    Object.keys(comboCounts).forEach((key) => {
      if (comboCounts[key] > bestCount) {
        bestKey = key;
        bestCount = comboCounts[key];
      }
    });
    const [bestOrigin, bestFinish, bestEntry] = bestKey.split('|');
    const bestPct = Math.round((bestCount / total) * 100);

    statsInsight.textContent = `${bestOrigin} → ${bestFinish} → ${bestEntry} happens ${bestPct}% of the time for this GK — worth a warm-up drill.`;
    statsTotal.textContent = `${total} goal${total === 1 ? '' : 's'} logged for ${name}`;

    renderBreakdown(statsOrigin, records, 'origin_zone', total);
    renderBreakdown(statsFinish, records, 'finish_type', total);
    renderBreakdown(statsEntry, records, 'goal_entry_zone', total);

    statsEmpty.classList.add('hidden');
    statsResult.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading goalkeeper stats: ', error);
  }
}

// 4. Initial render
updateStartButton();
setStep(localStorage.getItem(WELCOMED_KEY) ? 'info' : 'welcome');
// Stats tab has no visible entry point right now, but stays reachable at /#stats.
setTab(window.location.hash === '#stats' ? 'stats' : 'log');
