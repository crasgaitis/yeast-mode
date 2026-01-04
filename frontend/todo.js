const SECTION_COLORS = [
  "#ffd6a5",
  "#caffbf",
  "#9bf6ff",
  "#bdb2ff",
  "#fdffb6"
];

let colorIndex = 0;

function nextSectionColor() {
  const color = SECTION_COLORS[colorIndex % SECTION_COLORS.length];
  colorIndex++;
  return color;
}

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function addSection() {
  const text = document.getElementById("taskInput").value;
  if (!text) return;

  todos.push({
    type: "section",
    text,
    color: nextSectionColor()
  });

  document.getElementById("taskInput").value = "";
  save();
  render();
}

function addTask() {
  const text = document.getElementById("taskInput").value;
  if (!text) return;

  let color = "#f0f0f0";
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].type === "section") {
      color = todos[i].color;
      break;
    }
  }

  todos.push({
    type: "task",
    text,
    done: false,
    color
  });

  document.getElementById("taskInput").value = "";
  save();
  render();
}

function toggle(i) {
  todos[i].done = !todos[i].done;
  save();
  render();
}

function removeTask(i) {
  todos.splice(i, 1);
  save();
  render();
}

function removeSection(i) {
  if (todos[i].type !== "section") return;

  todos.splice(i, 1);

  // re inherit colors
  for (let j = i; j < todos.length; j++) {
    if (todos[j].type === "section") break;
    if (todos[j].type === "task") {
      todos[j].color = getInheritedColor(j);
    }
  }
  save();
  render();
}

function getSectionRange(index) {
  let start = index;
  let end = index;

  for (let i = index + 1; i < todos.length; i++) {
    if (todos[i].type === "section") break;
    end = i;
  }

  return { start, end };
}

function reflowColors() {
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].type === "task") {
      todos[i].color = getInheritedColor(i);
    }
  }
}

function moveUp(i) {
  if (i === 0) return;

  // SECTION MOVE
  if (todos[i].type === "section") {
    let prevSection = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (todos[j].type === "section") {
        prevSection = j;
        break;
      }
    }
    if (prevSection === -1) return;

    const { start, end } = getSectionRange(i);
    const block = todos.splice(start, end - start + 1);

    const insertAt = prevSection;
    todos.splice(insertAt, 0, ...block);
  }

  // TASK MOVE
  else {
    [todos[i - 1], todos[i]] = [todos[i], todos[i - 1]];
  }

  reflowColors();
  save();
  render();
}


function moveDown(i) {
  if (i === todos.length - 1) return;

  // SECTION MOVE
  if (todos[i].type === "section") {
    let nextSection = -1;
    for (let j = i + 1; j < todos.length; j++) {
      if (todos[j].type === "section") {
        nextSection = j;
        break;
      }
    }
    if (nextSection === -1) return;

    const { start, end } = getSectionRange(i);
    const block = todos.splice(start, end - start + 1);

    const insertAt = nextSection - (end - start + 1) + 1;
    todos.splice(insertAt, 0, ...block);
  }

  // TASK MOVE
  else {
    [todos[i + 1], todos[i]] = [todos[i], todos[i + 1]];
  }

  reflowColors();
  save();
  render();
}

function render() {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  todos.forEach((t, i) => {
    const li = document.createElement("li");

    if (t.type === "section") {
      li.classList.add("section");
      li.style.background = t.color;

      li.innerHTML = `
      <span class="section-text">${t.text}</span>

      <div class="controls">
        <button class="edit-color" onclick="editSectionColor(${i})">🎨</button>

        <div class="arrows">
          <button onclick="moveUp(${i})">▲</button>
          <button onclick="moveDown(${i})">▼</button>
        </div>
        <button onclick="removeSection(${i})">x</button>

      </div>
    `;
    }

    if (t.type === "task") {
      li.style.background = t.color;

      li.innerHTML = `
        <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggle(${i})">
        <span class="task-text">${t.text}</span>

        <div class="controls">
          <div class="arrows">
            <button onclick="moveUp(${i})">▲</button>
            <button onclick="moveDown(${i})">▼</button>
          </div>
          <button onclick="removeTask(${i})">x</button>
        </div>
      `;
    }

    ul.appendChild(li);
  });

  updateProgress();
}

function editSectionColor(i) {
  const newColor = prompt("Enter a hex color:", todos[i].color);
  if (!newColor) return;

  todos[i].color = newColor;

  for (let j = i + 1; j < todos.length; j++) {
    if (todos[j].type === "section") break;
    if (todos[j].type === "task") {
      todos[j].color = newColor;
    }
  }

  save();
  render();
}

function getInheritedColor(index) {
  for (let i = index; i >= 0; i--) {
    if (todos[i].type === "section") {
      return todos[i].color;
    }
  }
  return "#f0f0f0";
}

function updateProgress() {
  const tasks = todos.filter(t => t.type === "task");
  const doneTasks = tasks.filter(t => t.done);

  const percent = tasks.length
    ? Math.max(doneTasks.length / tasks.length, 0.01)
    : 0;

  document.getElementById("fill").style.width = `${percent * 100}%`;

  const img = document.getElementById("progressImage");
  const txt = document.getElementById("progressText");

  if (percent < 0.02) {
    img.src = "../assets/sad.png";
    txt.innerText = "Time to preheat...";
  } else if (percent < 0.5) {
    img.src = "../assets/rising.png";
    txt.innerText = "Dough is rising";
  } else if (percent < 1) {
    img.src = "../assets/baking.png";
    txt.innerText = "Almost baked";
  } else {
    img.src = "../assets/done.png";
    txt.innerText = "Fully baked 🥖";
  }
}

function importList() {
  document.getElementById("importModal").classList.remove("hidden");
  document.getElementById("importTextarea").value = "";
}

function closeImport() {
  document.getElementById("importModal").classList.add("hidden");
}

function submitImport() {
  const textarea = document.getElementById("importTextarea");
  const lines = textarea.value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (!lines.length) return;

  const sectionColor = nextSectionColor();
  todos.push({
    type: "section",
    text: "Imported List",
    color: sectionColor
  });

  lines.forEach(text => {
    todos.push({
      type: "task",
      text,
      done: false,
      color: sectionColor
    });
  });

  save();
  render();
  closeImport();
}


render();
