
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
  journal: "",
  journalDate: "",
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

document.querySelectorAll("[data-mood]").forEach(button => {
  button.addEventListener("click", () => {
    selectedMood = button.dataset.mood;
    state.mood = selectedMood;
    saveState();
    renderMood();
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
