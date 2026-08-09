let tasks = [];
const date = new Date();
document.getElementById("date").innerText = date.toLocaleDateString("sv-SE", {weekday: "long", day: "numeric", month: "long", year: "numeric"})
const todoList = document.getElementById("todoList");
const button = document.getElementById("newTask");

button.addEventListener("click", function () {

    let input = document.getElementById("taskInput");
    let text = input.value;

    let dateInput = document.getElementById("taskDate");
    let selectedDate = dateInput.value;

    let repeatInput = document.getElementById("taskRepeat");
    let repeat = repeatInput.value;

    if (text == null || text == "")
        return;

    let task = {
        text: text,
        completed: false,
        date: selectedDate
        repeat: repeat
    };

    tasks.push(task);

    localStorage.setItem(
        "tasks", 
        JSON.stringify(tasks)
    );
    
    renderTasks();

    input.value = "";

});


let savedTasks = localStorage.getItem("tasks");

if(savedTasks){

    tasks = JSON.parse(savedTasks);

    createRecurringTasks();

    renderTasks();
}

const clearButton = document.getElementById("clearTasks");

clearButton.addEventListener("click", function(){

    tasks = [];

    localStorage.removeItem("tasks");

    renderTasks();

});

function createRecurringTasks(){

    let today = new Date();

    today.setHours(0,0,0,0);

    tasks.forEach(task => {

        if (task.repeat !== "daily"){
            return;
        }

        let startDate = new Date(task.date);

        startDate.setHours(0,0,0,0);

        if (startDate > today){
            return;
        }

        let todayString = today.toISOString().split("T")[0];

        let alreadyExsists = tasks.some(otherTask =>
            otherTask.text == task.text &&
            otherTask.date == todayString &&
            otherTask.repeat == "generated"
        );

        if (!alreadyExsists && tast.date !== todayString){

            task.push({
                text: task.text,
                completed: false,
                date: todayString,
                repeat: "generated"
            });

        }

    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function renderTasks(){

    todoList.innerHTML = "";

    let groupedTasks = {};

    tasks.forEach(task => {

        if(!groupedTasks[task.date]){
            groupedTasks[task.date] = [];
        }

        groupedTasks[task.date].push(task);

    });

    let sortedDates = Object.keys(groupedTasks).sort((a,b) => {

        let today = new Date();
        today.setHours(0,0,0,0);

        let dateA = new Date(a);
        let dateB = new Date(b);

        let pastA = dateA < today;
        let pastB = dateB < today;

        if(pastA && !pastB){
            return 1;
        }

        if(!pastA && pastB){
            return -1;
        }

        return dateA - dateB;

    });

    sortedDates.forEach(date => {

        let title = document.createElement("h2");

        title.innerText = formatDate(date);

        todoList.appendChild(title);

        groupedTasks[date].forEach(task => {

            let div = document.createElement("div");

            div.className = "task";

            div.innerHTML = `
                <input type="checkbox">
                <span>${task.text}</span>
                <button class="deleteButton">🗑️</button>
            `;

            let checkbox = div.querySelector("input");
            let deleteButton = div.querySelector(".deleteButton");

            checkbox.checked = task.completed;

            checkbox.onchange = () => {

                task.completed = checkbox.checked;

                localStorage.setItem(
                    "tasks",
                    JSON.stringify(tasks)
                );
            };

            deleteButton.onclick = () => {

                tasks = tasks.filter(t => t !== task);

                localStorage.setItem(
                    "tasks",
                    JSON.stringify(tasks)
                );

                renderTasks();

            };

            todoList.appendChild(div);

        });
    });

}

function formatDate(dateString){

    let date = new Date(dateString);

    let today = new Date();

    let tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    let dateText = date.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    if(date.toDateString() === today.toDateString()){
        return "Idag\n" + dateText;
    }

    if(date.toDateString() === tomorrow.toDateString()){
        return "Imorgon\n" + dateText;
    }

    return dateText;
}