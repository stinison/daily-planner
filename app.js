let tasks = [];

// =========================
// HJÄLPFUNKTIONER FÖR DATUM
// =========================
function dateToString(date) {

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");

}

function stringToDate(dateString) {

    let parts = dateString.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


// =========================
// DAGENS DATUM
// =========================
const date = new Date();

document.getElementById("date").innerText =
    date.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


const todoList = document.getElementById("todoList");

const button = document.getElementById("newTask");

const editModal = document.getElementById("editModal");

const editTaskInput = document.getElementById("editTaskInput");

const editTaskDate = document.getElementById("editTaskDate");

const editTaskRepeat = document.getElementById("editTaskRepeat");

const cancelEdit = document.getElementById("cancelEdit");

const saveEdit = document.getElementById("saveEdit");

let taskBeingEdited = null;

const editScope = document.getElementById("editScope");

const editScopeSelect = document.getElementById("editScopeSelect");


// =========================
// LÄGG TILL AKTIVITET
// =========================
button.addEventListener("click", function () {

    let input =
        document.getElementById("taskInput");

    let text =
        input.value;

    let dateInput =
        document.getElementById("taskDate");

    let selectedDate =
        dateInput.value;

    let repeatInput =
        document.getElementById("taskRepeat");

    let repeat =
        repeatInput.value;


    if (text === "") {
        return;
    }


    if (selectedDate === "") {

        alert("Välj ett datum.");

        return;

    }


    let task = {

        id: Date.now(),

        text: text,

        completed: false,

        date: selectedDate,

        repeat: repeat

    };


    tasks.push(task);


    // Skapa alla dagar direkt om aktiviteten ska upprepas

    if (repeat === "daily") {

        createRecurringTasks();

    }


    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );


    renderTasks();


    input.value = "";

});


// =========================
// LADDA SPARADE AKTIVITETER
// =========================
let savedTasks =
    localStorage.getItem("tasks");


if (savedTasks) {

    tasks =
        JSON.parse(savedTasks);


    createRecurringTasks();


    renderTasks();

}


// =========================
// RENSA ALLA AKTIVITETER
// =========================
const clearButton =
    document.getElementById("clearTasks");


clearButton.addEventListener("click", function () {

    let confirmClear =
        confirm(
            "Är du säker på att du vill radera alla aktiviteter?"
        );


    if (!confirmClear) {
        return;
    }


    tasks = [];


    localStorage.removeItem("tasks");


    renderTasks();

});


// =========================
// SKAPA ÅTERKOMMANDE AKTIVITETER
// =========================
function createRecurringTasks() {

    let today =
        new Date();


    let todayString =
        dateToString(today);


    let recurringTasks =
        tasks.filter(task =>
            task.repeat === "daily"
        );


    let newTasks = [];


    recurringTasks.forEach(task => {

        let currentDate =
            stringToDate(task.date);


        while (true) {

            let dateString =
                dateToString(currentDate);


            // Vi har kommit efter idag

            if (dateString > todayString) {

                break;

            }


            // Kontrollera om dagens
            // genererade aktivitet redan finns

            let alreadyExists =
                tasks.some(otherTask =>
                    otherTask.recurringId === task.id &&
                    otherTask.date === dateString
                );


            // Startdatumet är själva
            // originalaktiviteten

            if (
                dateString !== task.date &&
                !alreadyExists
            ) {

                newTasks.push({

                    id:
                        Date.now() +
                        Math.random(),

                    text:
                        task.text,

                    completed:
                        false,

                    date:
                        dateString,

                    repeat:
                        "generated",

                    recurringId:
                        task.id

                });

            }


            // Nästa dag

            currentDate.setDate(
                currentDate.getDate() + 1
            );

        }

    });


    tasks.push(...newTasks);


    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// =========================
// VISA AKTIVITETER
// =========================
function renderTasks() {

    todoList.innerHTML = "";


    let groupedTasks = {};


    tasks.forEach(task => {

        if (!groupedTasks[task.date]) {

            groupedTasks[task.date] = [];

        }


        groupedTasks[task.date].push(task);

    });


    // Sortera datumen
    let sortedDates =
        Object.keys(groupedTasks)
            .sort((a, b) => {

                let today =
                    new Date();


                let todayString =
                    dateToString(today);


                let pastA =
                    a < todayString;

                let pastB =
                    b < todayString;


                if (pastA && !pastB) {
                    return 1;
                }


                if (!pastA && pastB) {
                    return -1;
                }


                return a.localeCompare(b);

            });


    // Visa varje datum
    sortedDates.forEach(date => {

        let title =
            document.createElement("h2");


        title.innerText =
            formatDate(date);


        todoList.appendChild(title);


        groupedTasks[date]
            .forEach(task => {

                let div =
                    document.createElement("div");


                div.className =
                    "task";


                div.innerHTML = `
                    <input type="checkbox">
                    <span>${task.text}</span>
                    <button class="editButton">✏️</button>
                    <button class="deleteButton">🗑️</button>
                `;


                let checkbox = div.querySelector("input");

                let editButton = div.querySelector(".editButton");

                let deleteButton = div.querySelector(".deleteButton");


                checkbox.checked = task.completed;


                checkbox.onchange = function () {

                    task.completed = checkbox.checked;

                    localStorage.setItem("tasks", JSON.stringify(tasks));

                };

                editButton.onclick = function () {

                    taskBeingEdited = task;

                    editTaskInput.value = task.text;
                    editTaskDate.value = task.date;

                    editTaskRepeat.value =
                        task.repeat === "generated"
                            ? "none"
                            : task.repeat;
                    
                    if (task.repeat === "generated" || task.repeat === "daily"){

                        editScope.style.display = "block";
                    }
                    else {
                        editScope.style.display = "none";
                    }

                    editModal.style.display = "flex";

                };

                deleteButton.onclick = function () {

                    tasks = tasks.filter(t => t.id !== task.id);

                    localStorage.setItem("tasks", JSON.stringify(tasks));


                    renderTasks();

                };

                todoList.appendChild(div);

            });

    });

}


// =========================
// FORMATERA DATUM
// =========================
function formatDate(dateString) {

    let date = stringToDate(dateString);


    let today = new Date();


    let tomorrow = new Date();


    tomorrow.setDate(today.getDate() + 1);

    let dateText =
        date.toLocaleDateString(
            "sv-SE",
            {weekday: "long", day: "numeric", month: "long"}
        );

    if (dateToString(date) === dateToString(today)) {

        return "Idag\n" + dateText;

    }


    if (dateToString(date) === dateToString(tomorrow)) {

        return "Imorgon\n" + dateText;

    }


    return dateText;

}

saveEdit.onclick = function () {

    if (!taskBeingEdited) {
        return;
    }

    let newText = editTaskInput.value.trim();

    let newDate = editTaskDate.value;

    let newRepeat = editTaskRepeat.value;

    let scope = editScopeSelect.value;


    if (newText === "") {

        alert("Ange en aktivitet.");
        return;

    }


    if (newDate === "") {
        
        alert("Välj ett datum.");
        return;

    }

    // =========================
    // ENDAST DENNA DAG
    // =========================

    if (taskBeingEdited.repeat === "generated" && scope === "single") {

        taskBeingEdited.text = newText;

        taskBeingEdited.date = newDate;

        taskBeingEdited.repeat = "none";

    }


    // =========================
    // HELA SERIEN
    // =========================

    else if (taskBeingEdited.repeat === "generated" && scope === "series") {

        let originalTask = tasks.find(t => t.id === taskBeingEdited.recurringId);

        if (originalTask) {

            originalTask.text = newText;

            originalTask.date = newDate;

            originalTask.repeat = newRepeat;

            // Ta bort gamla kopior
            tasks = tasks.filter(t => t.recurringId !== originalTask.id);
                 
            // Skapa serien igen

            createRecurringTasks();

        }

    }


    // =========================
    // ORIGINALAKTIVITET
    // =========================

    else {

        taskBeingEdited.text = newText;

        taskBeingEdited.date = newDate;

        taskBeingEdited.repeat = newRepeat;


        if (newRepeat !== "daily") {

            tasks = tasks.filter(t => t.recurringId !== taskBeingEdited.id);

        } 
        else {

            createRecurringTasks();

        }

    }


    localStorage.setItem("tasks", JSON.stringify(tasks));


    taskBeingEdited = null;


    editModal.style.display = "none";


    renderTasks();

};

cancelEdit.onclick = function () {

    taskBeingEdited = null;

    editModal.style.display = "none";
};