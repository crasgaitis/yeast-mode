const cursor = document.getElementById("butter-cursor");
let lastX = null;
let lastY = null;

document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";

  if (lastX === null) {
    lastX = e.clientX;
    lastY = e.clientY;
    return;
  }

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < 2) return;

//   const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const line = document.createElement("div");
  line.className = "melt-line";
  line.style.width = `${Math.min(dist * 1.2, 60)}px`;
  line.style.left = `${lastX}px`;
  line.style.top = `${lastY}px`;
//   line.style.transform = `rotate(${angle}deg)`;

  document.body.appendChild(line);
  setTimeout(() => line.remove(), 1200);

  lastX = e.clientX;
  lastY = e.clientY;
});