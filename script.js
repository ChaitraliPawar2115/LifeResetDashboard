
const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "lifeResetDashboardV1";

const defaultState = {
  habits: [false, false, false, false],
  tasks: [
    { id: 1, text: "Plan my day", completed: false },
    { id: 2, text: "Spend 20 minutes learning", completed: false },
    { id: 3, text: "Take a break for myself", completed: false }
  ],
  nextTaskId: 4,
  mood: "",
  moodHistory: [],
  journal: "",
  journalDate: "",
  sleepHistory: [],
  dark: false
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultState);

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultState),
      ...parsed,
      sleepHistory: Array.isArray(parsed.sleepHistory)
        ? parsed.sleepHistory.filter(entry =>
            entry &&
            typeof entry.date === "string" &&
            Number.isFinite(entry.hours) &&
            entry.hours >= 0 &&
            entry.hours <= 24
            )
        : [],
      moodHistory: Array.isArray(parsed.moodHistory)
        ? parsed.moodHistory
        : [],
      habits: Array.isArray(parsed.habits) && parsed.habits.length === 4
        ? parsed.habits.map(Boolean)
        : [...defaultState.habits],
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks.filter(task =>
            task &&
            Number.isInteger(task.id) &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
          )
        : [...defaultState.tasks.map(task => ({ ...task }))],
      nextTaskId: Number.isInteger(parsed.nextTaskId)
        ? parsed.nextTaskId
        : 4
    };
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();
let selectedMood = state.mood;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function updateStats() {
  const completedHabits = state.habits.filter(Boolean).length;
  $("#habitStat").textContent = `${completedHabits} / ${state.habits.length}`;
  $("#habitProgress").style.width =
    `${(completedHabits / state.habits.length) * 100}%`;

  const remaining = state.tasks.filter(task => !task.completed).length;
  $("#taskStat").textContent = remaining;
  $("#moodStat").textContent = selectedMood || "Not set";
}

function renderHabits() {
  document.querySelectorAll("[data-habit]").forEach(input => {
    const index = Number(input.dataset.habit);
    input.checked = Boolean(state.habits[index]);
  });

  
  const message = $("#habitProgressMessage");
  const completed = state.habits.filter(Boolean).length;

  if (message) {
    if (completed === 0) {
      message.textContent = "Every little step counts. Start with one habit! 🌱";
    } else if (completed < 2) {
      message.textContent = "You're off to a start. Keep going! 🌿";
    } else if (completed < 4) {
      message.textContent = "You're making progress. Be proud of yourself! 🌷";
    } else {
      message.textContent = "Amazing! You completed all your habits today! ✨";
    }
  }

  updateStats();
}


function renderTasks() {
  const list = $("#taskList");
  list.replaceChildren();

  state.tasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-row${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveState();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => {
      state.tasks = state.tasks.filter(entry => entry.id !== task.id);
      saveState();
      renderTasks();
    });

    item.append(checkbox, text, remove);
    list.append(item);
  });

  $("#taskMessage").textContent = state.tasks.length
    ? "You can do this, one step at a time."
    : "Your list is clear. Add a new task whenever you need one.";

  updateStats();
}

$("#taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("#taskInput");
  const text = input.value.trim();
  if (!text) return;

  state.tasks.push({
    id: state.nextTaskId++,
    text,
    completed: false
  });

  saveState();
  renderTasks();
  input.value = "";
  input.focus();
});

document.querySelectorAll("[data-habit]").forEach(input => {
  input.addEventListener("change", () => {
    const index = Number(input.dataset.habit);
    state.habits[index] = input.checked;
    saveState();
    renderHabits();
  });
});

function renderMood() {
  document.querySelectorAll("[data-mood]").forEach(button => {
    const selected = button.dataset.mood === selectedMood;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  updateStats();
}


function renderMoodHistory() {
  const list = $("#moodHistoryList");
  if (!list) return;

  list.replaceChildren();

  if (!state.moodHistory.length) {
    const item = document.createElement("li");
    item.textContent = "Your mood history will appear here. 🌱";
    list.append(item);
    return;
  }

  state.moodHistory.forEach(entry => {
    const item = document.createElement("li");
    const date = new Date(entry.date + "T00:00:00");

    item.textContent =
      `${date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })} — ${entry.mood}`;

    list.append(item);
  });
}


document.querySelectorAll("[data-mood]").forEach(button => {
  button.addEventListener("click", () => {
    selectedMood = button.dataset.mood;
    state.mood = selectedMood;

    const today = new Date().toISOString().slice(0, 10);

    const existingEntry = state.moodHistory.find(
      entry => entry.date === today
    );

    if (existingEntry) {
      existingEntry.mood = selectedMood;
    } else {
      state.moodHistory.unshift({
        date: today,
        mood: selectedMood
      });
    }

    saveState();
    renderMood();
    renderMoodHistory();
  });
});


$("#saveJournal").addEventListener("click", () => {
  state.journal = $("#journalEntry").value;
  state.journalDate = new Date().toISOString().slice(0, 10);

  const saved = saveState();
  $("#journalMessage").textContent = saved
    ? "Your reflection is saved on this device. ♡"
    : "Could not save. Check your browser storage settings.";

  if (saved) {
    selectedMood = state.mood;
  }
});

$("#themeToggle").addEventListener("click", () => {
  state.dark = !state.dark;
  document.body.classList.toggle("dark", state.dark);
  $("#themeToggle").textContent = state.dark ? "☀" : "☾";
  saveState();
});

function initialize() {
  document.body.classList.toggle("dark", state.dark);
  $("#themeToggle").textContent = state.dark ? "☀" : "☾";

  const today = new Date().toISOString().slice(0, 10);
  if (state.journalDate === today) {
    $("#journalEntry").value = state.journal;
  } else {
    $("#journalEntry").value = "";
  }

  renderHabits();
  renderTasks();
  renderMood();
}

initialize();

const dailyQuotes = [
  "Small steps every day lead to big changes.",
  "You don't have to be perfect to make progress.",
  "Take a breath. You are doing better than you think.",
  "A fresh start can happen at any moment.",
  "Be proud of how far you have come.",
  "Your only competition is who you were yesterday."
];

const quoteHeading = document.querySelector(".quote-banner h2");

if (quoteHeading) {
  const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
  quoteHeading.textContent = dailyQuotes[randomIndex];
}


let timerSeconds = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  $("#timerDisplay").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

$("#startTimer").addEventListener("click", () => {
  if (timerInterval !== null) return;

  $("#timerMessage").textContent = "Focus on one thing at a time. 🌱";

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    }

    if (timerSeconds === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      $("#timerMessage").textContent = "Session complete! Take a little break. 🎉";
    }
  }, 1000);
});

$("#pauseTimer").addEventListener("click", () => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("#timerMessage").textContent = "Timer paused. Take a breath. ♡";
  }
});

$("#resetTimer").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 25 * 60;
  updateTimerDisplay();
  $("#timerMessage").textContent = "Ready when you are. 🌱";
});

updateTimerDisplay();


const sleepDateInput = $("#sleepDate");
const sleepHoursInput = $("#sleepHours");

// Use today's date in local time
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

sleepDateInput.value = getLocalDateString();

function renderSleepGraph() {
  const graph = $("#sleepGraph");
  if (!graph) return;

  graph.replaceChildren();

  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = getLocalDateString(date);

    days.push({
      date: dateKey,
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      entry: state.sleepHistory.find(item => item.date === dateKey)
    });
  }

  const NS = "http://www.w3.org/2000/svg";
  const makeSvg = (tag, attrs, content) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
    if (content !== undefined) element.textContent = content;
    graph.append(element);
    return element;
  };

  const left = 35;
  const right = 340;
  const top = 20;
  const bottom = 165;
  const maxHours = 12;

  // Horizontal grid lines and hour labels
  for (let hour = 0; hour <= maxHours; hour += 3) {
    const y = bottom - (hour / maxHours) * (bottom - top);

    makeSvg("line", {
      x1: left, y1: y, x2: right, y2: y,
      stroke: "currentColor", "stroke-opacity": "0.15"
    });

    makeSvg("text", {
      x: 27, y: y + 4,
      "text-anchor": "end",
      fill: "currentColor",
      "font-size": "10"
    }, String(hour));
  }

  const points = days.map((day, index) => {
    const x = left + index * ((right - left) / 6);
    const hours = day.entry ? day.entry.hours : null;
    const y = hours === null ? null :
      bottom - (Math.min(hours, maxHours) / maxHours) * (bottom - top);

    return { ...day, x, y, hours };
  });

  // Connect only consecutive recorded days
  let segment = [];

  function drawSegment() {
    if (segment.length > 1) {
      makeSvg("polyline", {
        points: segment.map(p => `${p.x},${p.y}`).join(" "),
        fill: "none",
        stroke: "#78977b",
        "stroke-width": "3",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      });
    }
    segment = [];
  }

  points.forEach(point => {
    if (point.hours === null) {
      drawSegment();
      return;
    }
    segment.push(point);
  });
  drawSegment();

  points.forEach(point => {
    if (point.hours !== null) {
      makeSvg("circle", {
        cx: point.x, cy: point.y, r: 4,
        fill: "#78977b",
        stroke: "currentColor",
        "stroke-width": "1"
      });

      makeSvg("text", {
        x: point.x, y: point.y - 9,
        "text-anchor": "middle",
        fill: "currentColor",
        "font-size": "10",
        "font-weight": "600"
      }, `${point.hours}h`);
    }

    makeSvg("text", {
      x: point.x, y: 185,
      "text-anchor": "middle",
      fill: "currentColor",
      "font-size": "9"
    }, point.label);
  });
}

function renderSleepHistory() {
  const list = $("#sleepHistoryList");
  if (!list) return;

  list.replaceChildren();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const cutoffKey = getLocalDateString(cutoff);
  const todayKey = getLocalDateString();

  const entries = state.sleepHistory
    .filter(entry => entry.date >= cutoffKey && entry.date <= todayKey)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!entries.length) {
    const item = document.createElement("li");
    item.textContent = "No sleep records yet. Add your first entry above. 🌱";
    list.append(item);
    return;
  }

  entries.forEach(entry => {
    const item = document.createElement("li");
    const date = new Date(entry.date + "T00:00:00");

    item.textContent =
      `${date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })} — ${entry.hours} hours`;

    list.append(item);
  });
}

$("#sleepForm").addEventListener("submit", event => {
  event.preventDefault();

  const date = sleepDateInput.value;
  const hours = Number(sleepHoursInput.value);

  if (!date || date > getLocalDateString() ||
      !Number.isFinite(hours) || hours < 0 || hours > 24) {
    $("#sleepMessage").textContent =
      "Please choose a valid date and enter between 0 and 24 hours.";
    return;
  }

  const existing = state.sleepHistory.find(entry => entry.date === date);

  if (existing) {
    existing.hours = hours;
  } else {
    state.sleepHistory.push({ date, hours });
  }

  // Keep only the most recent 30 days of records
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const cutoffKey = getLocalDateString(cutoff);
  const todayKey = getLocalDateString();

  state.sleepHistory = state.sleepHistory.filter(
    entry => entry.date >= cutoffKey && entry.date <= todayKey
  );

  const saved = saveState();

  $("#sleepMessage").textContent = saved
    ? `Saved ${hours} hour${hours === 1 ? "" : "s"} of sleep. 🌙`
    : "Could not save. Check your browser storage settings.";

  renderSleepGraph();
  renderSleepHistory();
});

renderSleepGraph();
renderSleepHistory();
