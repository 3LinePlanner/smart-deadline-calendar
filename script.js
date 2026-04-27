let tasks = [];
let topCount = 0;

function getPriorityValue(priority) {
    if (priority === "high") return 1;
    if (priority === "medium") return 2;
    return 3;
}

// LOAD
function loadTasks() {
    let saved = localStorage.getItem("tasks");

    if (saved) {
        tasks = JSON.parse(saved);
    }

    renderTasks();
    loadCalendar();
}

// RENDER
function renderTasks() {
    document.getElementById("topPriority").innerHTML = "";
    document.getElementById("todoList").innerHTML = "";
    topCount = 0;

    let sortedTasks = [...tasks].sort((a, b) => {
    if (a.done && !b.done) return 1;
if (!a.done && b.done) return -1; 

    let dateA = new Date(a.date);
    let dateB = new Date(b.date);

    // 1. Urutkan berdasarkan tanggal (lebih dekat dulu)
    if (dateA - dateB !== 0) {
        return dateA - dateB;
    }

    // 2. Kalau tanggal sama → lihat prioritas
    return getPriorityValue(a.priority) - getPriorityValue(b.priority);
});

    sortedTasks.forEach((t) => {
        let li = document.createElement("li");
        li.classList.add(t.priority);

        if (t.done) li.classList.add("done");

        // TEXT
        let text = document.createElement("span");
        text.textContent = `${t.type} - ${t.task} (${t.date})`;

        // DELETE BUTTON
        let del = document.createElement("span");
        del.textContent = " 🗑️";
        del.className = "delete-btn";

        // 🗑️ HAPUS (AMAN)
        del.addEventListener("click", function (e) {
            e.stopPropagation(); // penting!
            deleteTask(t.id);
        });

        li.appendChild(text);
        li.appendChild(del);

        // ✔️ DONE (klik 1x)
        li.addEventListener("click", function () {
            t.done = !t.done;
            saveData();
        });

        // MASUK LIST
        if (t.priority === "high" && topCount < 3) {
            document.getElementById("topPriority").appendChild(li);
            topCount++;
        } else {
            document.getElementById("todoList").appendChild(li);
        }
    });

    updateProgress();
}

// TAMBAH
function addTask() {
    let task = document.getElementById("task").value;
    let date = document.getElementById("date").value;
    let priority = document.getElementById("priority").value;
    let type = document.getElementById("type").value;

    if (!task) {
        alert("Isi dulu!");
        return;
    }

    tasks.push({
        id: Date.now(),
        task,
        date,
        priority,
        type,
        done: false
    });

    saveData();

    document.getElementById("task").value = "";
    document.getElementById("date").value = "";
}

// SIMPAN
function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    loadCalendar();
}

// HAPUS (PASTI BENAR)
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
}

// SEARCH (BERFUNGSI)
function searchTask() {
    let keyword = document.getElementById("search").value.toLowerCase();

    let items = document.querySelectorAll("#todoList li");

    items.forEach(item => {
        let text = item.textContent.toLowerCase();

        if (text.includes(keyword)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

// PROGRESS
function updateProgress() {
    let done = tasks.filter(t => t.done).length;
    let total = tasks.length;

    let percent = total === 0 ? 0 : (done / total) * 100;

    document.getElementById("progressFill").style.width = percent + "%";
}

// KALENDER
function loadCalendar() {
    let cal = document.getElementById("calendar");
    cal.innerHTML = "";

    for (let i = 1; i <= 30; i++) {
        let d = document.createElement("div");
        d.classList.add("day");
        d.innerText = i;

        tasks.forEach(t => {
            let taskDate = new Date(t.date).getDate();

            if (taskDate === i) {
                d.style.background = t.done ? "gray" : "green";
                d.style.color = "white";
            }
        });

        cal.appendChild(d);
    }
}

function checkDeadline() {
    let today = new Date();
    today.setHours(0,0,0,0);

    let notifBox = document.getElementById("notifBox");
    notifBox.innerHTML = "";

    tasks.forEach(t => {
        let taskDate = new Date(t.date);
        taskDate.setHours(0,0,0,0);

        let diff = (taskDate - today) / (1000 * 60 * 60 * 24);

        if (!t.done) {
            let message = "";
            let className = "";

            if (diff === 0) {
                message = `🔴 ${t.task} deadline hari ini!`;
                className = "today";
            } else if (diff === 1) {
                message = `⚠️ ${t.task} deadline besok!`;
                className = "soon";
            } else if (diff < 0) {
                message = `⏳ ${t.task} sudah lewat deadline!`;
                className = "late";
            }

            if (message) {
                let div = document.createElement("div");
                div.className = `notif ${className}`;

                div.innerHTML = `
                    <span>${message}</span>
                    <span class="close-btn">✖</span>
                `;

                // tombol close
                div.querySelector(".close-btn").onclick = () => {
                    div.remove();
                };

                // auto hilang 5 detik
                let timeout = setTimeout(() => {
    div.remove();
}, 15000);

div.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
});

div.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
        div.remove();
    }, 5000);
});

                notifBox.appendChild(div);
            }
        }
    });
}
// START
loadTasks();
checkDeadline();