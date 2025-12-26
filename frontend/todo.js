let todos = JSON.parse(localStorage.getItem("todos")) || [];

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function addTask() {
  const text = document.getElementById("taskInput").value;
  if (!text) return;
  todos.push({ text, done: false });
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

function render() {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  todos.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggle(${i})">
      ${t.text}
      <button onclick="removeTask(${i})">x</button>
    `;
    ul.appendChild(li);
  });

  updateProgress();
}

function updateProgress() {
  const done = todos.filter(t => t.done).length;
  const percent = todos.length
  ? Math.max(done / todos.length, 0.01)
  : 0;

  document.getElementById("fill").style.width = `${percent * 100}%`;

  const img = document.getElementById("progressImage");
  const txt = document.getElementById("progressText");

  if (percent === 0.01) {
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

render();
