var count = 1;
var regex = /^\s*$/;
var submitButton = document.getElementById("submitButton");
var newItemTextBox = document.getElementById("newToDoItem");
var listOfToDoItems = document.getElementById("listOfToDoItems");
var newItemPriority = document.getElementById("priorityList");
var newItemDueDate = document.getElementById("dueDate");
var sortingFunction = prioritySortingfunction;
var priorityTable = { High: 1, Low: -1, Medium: 0 };
var currDateTime = formatDateToDatetimeLocal(new Date());
var filterTags = [];
var filterCategories = [];
var pendingOnlyButton = document.getElementById("pendingOnly");
var displayAllTasks = document.getElementById("displayAllTasks");
var displayMissedTasks = document.getElementById("displayMissedTasks");
var filterToDoItems = { missed: false, pending: false };
var sortingAlgoSelection = document.getElementById("sortTasksBy");
var startDateTime = document.getElementById("startDateTime");
var endDateTime = document.getElementById("endDateTime");
var log = JSON.parse(localStorage.getItem("log")) || [];
// var clearAll = document.getElementById("clearAll");

function logActivity(action, task) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        task,
    };

    // Store log in local storage
    const log = JSON.parse(localStorage.getItem("log")) || [];
    log.push(logEntry);
    localStorage.setItem("log", JSON.stringify(log));
}

// clearAll.addEventListener("click", function(){
// 	listOfItems = [];
// 	localStorage.clear();
// 	newItemTextBox = "";
// 	newItemPriority.value = "Low";
// 	filterCategories = [];
// 	filterTags = [];
// 	count = 1
// 	sortingAlgoSelection = prioritySortingfunction;
// 	filterToDoItems = {missed:false, pending:false};
// 	render();
// });

listOfItems = getlistOfItemsFromLocalStorage();
render();
count = listOfItems.length + 1;

function newItemToAdd() {
    newItem(newItemTextBox.value, priorityList.value, newItemDueDate.value);
}

pendingOnlyButton.addEventListener("click", function () {
    renderPending();
});

startDateTime.addEventListener("change", function () {
    render();
});

endDateTime.addEventListener("change", function () {
    render();
});

sortingAlgoSelection.addEventListener("change", function () {
    changeSortingAlgo();
    render();
});

displayAllTasks.addEventListener("click", function () {
    renderAll();
});

displayMissedTasks.addEventListener("click", function () {
    renderMissedTasks();
});

submitButton.addEventListener("click", function () {
    newItemToAdd();
});

newItemTextBox.addEventListener(
    "keydown",
    (event) => {
        var name = event.key;
        if (name == "Enter") {
            newItemToAdd();
        }
    },
    false
);

// sortTasksBySelection.addEventListener("change", function () {
//     const selectedOption = sortTaksBySelection.value;
//     if (selectedOption == "Priority") sortingFunction = prioritySortingfunction;
//     else sortingFunction = dueDateSortingFunction;
//     render();
// });

// API call to add a lot of tasks
// fetch("https://jsonplaceholder.typicode.com/todos")
//     .then((response) =>
//     {
//         if (!response.ok)
//         {
//             throw new Error("Network response was not OK");
//         }
//         return response.json();
//     })
//     .then((data) =>
//     {
//         // Process the received data
//         data.forEach(element => {
//             var ele = {id:element.id, text:element.title, done:element.completed};
//             var newItem = createListItem(ele);
//             count += 1;
//             listOfToDoItems.appendChild(newItem);
//             listOfItems.push(newItem);
//         });
//     })
//     .catch((error) =>
//     {
//         // Handle any errors that occurred during the fetch request
//         console.log("Error:", error.message);
//     });

// Function to retrieve the listOfItems from Local Storage
function getlistOfItemsFromLocalStorage() {
    var storedList = localStorage.getItem("listOfItems");
    return storedList ? JSON.parse(storedList) : [];
}

// Function to save the listOfItems to Local Storage
function saveListOfItemsToLocalStorage() {
    localStorage.setItem("listOfItems", JSON.stringify(listOfItems));
}

function prioritySortingfunction(a, b) {
    if (a.done != b.done) return a.done ? 1 : -1;
    else if (a.done && b.done) return a.id < b.id ? -1 : 1;
    if (priorityTable[a.priority] == priorityTable[b.priority])
        return a.id < b.id ? -1 : 1;
    return priorityTable[a.priority] > priorityTable[b.priority] ? -1 : 1;
}

function dueDateSortingFunction(a, b) {
    if (a.done != b.done) return a.done ? 1 : -1;
    return a.dueDate < b.dueDate ? -1 : 1;
}

function renderAll() {
    filterToDoItems["pending"] = false;
    filterToDoItems["missed"] = false;
    render();
}

function renderMissedTasks() {
    filterToDoItems["missed"] = !filterToDoItems["missed"];
    render();
}

function renderPending() {
    filterToDoItems["pending"] = !filterToDoItems["pending"];
    render();
}

function render() {
    currDateTime = formatDateToDatetimeLocal(new Date());
    listOfToDoItems.innerHTML = "";
    listOfItems.sort(sortingFunction);
    for (var i = 0; i < listOfItems.length; ++i) {
        if (
            filterToDoItems["missed"] &&
            (listOfItems[i].done || listOfItems[i].dueDate > currDateTime)
        )
            continue;
        if (filterToDoItems["pending"] && listOfItems[i].done) continue;
        if (startDateTime.value == "" && endDateTime.value == "")
            listOfToDoItems.appendChild(createListItem(listOfItems[i]));
        else if (startDateTime.value == "" && endDateTime.value >= currDateTime)
            listOfToDoItems.appendChild(createListItem(listOfItems[i]));
        else if (endDateTime.value == "" && startDateTime.value <= currDateTime)
            listOfToDoItems.appendChild(createListItem(listOfItems[i]));
        else if (
            startDateTime.value <= currDateTime &&
            endDateTime.value >= currDateTime
        )
            listOfToDoItems.appendChild(createListItem(listOfItems[i]));
    }
    saveListOfItemsToLocalStorage();
}

function deleteItem(id) {
    var index = 0;
    for (var i = 0; i < listOfItems.length; i++) {
        if (listOfItems[i].id == id) index = i;
    }
    listOfItems.splice(index, 1);
    render();
	const deletedTask = listOfItems.find(item => item.id == id);
    logActivity('Delete', deletedTask.text);
}

function changeStatus(id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].done = !listOfItems[i].done;
            break;
        }
    }
    render();
	const changedTask = listOfItems.find(item => item.id == id);
    const action = changedTask.done ? 'Marked as Done' : 'Marked as Pending';
    logActivity(action, changedTask.text);
}

function editTask(id, value) {
    var index = listOfItems.findIndex((item) => item.id === id);
    if (listOfItems[index].editing) {
        listOfItems[index].text = value;
    }
    listOfItems[index].editing = !listOfItems[index].editing;
    render();
	const editedTask = listOfItems.find(item => item.id == id);
    logActivity('Edit', `Edited "${editedTask.text}" to "${value}"`);
}

function formatDateToDatetimeLocal(date) {
    const year = date.getFullYear().toString().padStart(4, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function changeDueDate(value, id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].dueDate = value;
        }
    }
    render();
	const changedTask = listOfItems.find(item => item.id == id);
    logActivity('Due Date Change', `"${changedTask.text}" due date changed to "${value}"`);
  }
}

function changeSortingAlgo() {
    if (sortingAlgoSelection.value == "Due Date")
        sortingFunction = dueDateSortingFunction;
    else sortingFunction = prioritySortingfunction;
    render();
}

function changePriority(value, id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].priority = value;
        }
    }
    render();
	const changedTask = listOfItems.find(item => item.id == id);
    logActivity('Priority Change', `"${changedTask.text}" priority changed to "${value}"`);
}

function addCategoryToItem(val, id) {
    if (regex.test(val)) return;
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].categories.push(val);
            return;
        }
    }
    render();
	const changedTask = listOfItems.find(item => item.id == id);
    logActivity('Category Added', `"${val}" category added to "${changedTask.text}"`);
}

function addTagToItem(val, id) {
    if (regex.test(val)) return;
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].tags.push(val);
            return;
        }
    }
    render();
	const changedTask = listOfItems.find(item => item.id == id);
    logActivity('Tag Added', `"${val}" tag added to "${changedTask.text}"`);
}

// function to create a new To Do List item
function createListItem(item) {
    var element = document.createElement("div");
    var para = document.createElement("textarea");
    var buttons = document.createElement("div");
    var priorityList = document.createElement("select");
    var delButton = document.createElement("button");
    var doneButton = document.createElement("button");
    var editButton = document.createElement("button");
    var dueDateDiv = document.createElement("div");
    var dueDate = document.createElement("input");
    var dueDateLabel = document.createElement("label");
    var addCategoryBox = document.createElement("input");
    var addTagBox = document.createElement("input");

    addCategoryBox.type = "text";
    addCategoryBox.placeholder = "add category";
    addCategoryBox.addEventListener(
        "keydown",
        (event) => {
            var name = event.key;
            if (name == "Enter") {
                addCategoryToItem(addCategoryBox.value, item.id);
                addCategoryBox.value = "";
            }
        },
        false
    );

    addTagBox.type = "text";
    addTagBox.placeholder = "add tag";
    addTagBox.addEventListener(
        "keydown",
        (event) => {
            var name = event.key;
            if (name == "Enter") {
                addTagToItem(addTagBox.value, item.id);
                addTagBox.value = "";
            }
        },
        false
    );

    dueDateDiv.appendChild(dueDateLabel);
    dueDateDiv.append(dueDate);
    dueDateLabel.setAttribute("for", "dueDate");
    dueDateLabel.innerHTML = "Due Date for this task: ";

    buttons.appendChild(delButton);
    buttons.appendChild(doneButton);
    buttons.appendChild(editButton);
    buttons.appendChild(priorityList);

    element.appendChild(para);
    element.appendChild(buttons);
    element.appendChild(dueDateDiv);
    element.appendChild(addCategoryBox);
    element.appendChild(addTagBox);

    element.className = "listItem";
    element.id = "listItemNo" + String(item.id);

    dueDate.type = "datetime-local";
    dueDate.value = item.dueDate;
    dueDate.readOnly = false;
    dueDate.id = "dueDate";
    dueDate.addEventListener("change", function () {
        changeDueDate(dueDate.value, item.id);
    });

    delButton.style.backgroundColor = "black";
    delButton.style.color = "white";
    delButton.innerHTML = "Delete";
    delButton.addEventListener("click", function () {
        deleteItem(element.id);
    });

    if (item.done) doneButton.style.backgroundColor = "green";
    else doneButton.style.backgroundColor = "red";
    doneButton.style.color = "white";
    if (item.done) doneButton.innerHTML = "Done";
    else doneButton.innerHTML = "Pending";
    doneButton.addEventListener("click", function () {
        changeStatus(item.id);
    });

    para.style.backgroundColor = "#87ACA3";
    para.style.border = "0px";
    para.style.display = "initial";
    para.style.width = "400px";
    para.style.height = "fit-content";
    para.style.borderRadius = "5px";
    para.style.border = "5px solid transparent";
    para.style.resize = "none";
    para.innerHTML = item.text;

    editButton.style.color = "white";
    if (item.editing) {
        para.readOnly = false;
        editButton.style.backgroundColor = "grey";
        editButton.innerHTML = "Save";
        para.focus(); // Add this line to focus on the textarea when in editing mode
    } else {
        para.readOnly = true;
        editButton.style.backgroundColor = "blue";
        editButton.innerHTML = "Edit";
    }
    editButton.addEventListener("click", function () {
        editTask(item.id, para.value);
    });

    buttons.style.width = "100%";
    buttons.classList.add("row");

    var highOption = document.createElement("option");
    highOption.value = "High";
    highOption.innerHTML = "High";
    var mediumOption = document.createElement("option");
    mediumOption.value = "Medium";
    mediumOption.innerHTML = "Medium";
    var lowOption = document.createElement("option");
    lowOption.value = "Low";
    lowOption.innerHTML = "Low";

    priorityList.appendChild(highOption);
    priorityList.appendChild(mediumOption);
    priorityList.appendChild(lowOption);
    priorityList.value = item.priority;
    priorityList.addEventListener("change", function () {
        changePriority(priorityList.value, item.id);
    });

    if (priorityList.value == "Low") {
        element.style.backgroundColor = "lightblue";
    } else if (priorityList.value == "High") {
        element.style.backgroundColor = "red";
    } else {
        element.style.backgroundColor = "#87ACA3";
    }

    return element;
}

// function to add a new item to the toDo List
function newItem(val, priorityVal, dueDateVal) {
    if (regex.test(val)) return;
    if (dueDateVal == "") {
        const currentDate = new Date();
        // ... Calculate the due date ...
        const dueDateObject = new Date(currentDate);
        dueDateObject.setDate(dueDateObject.getDate() + 7);
        const formattedDueDate = formatDateToDatetimeLocal(dueDateObject);
        dueDateVal = formattedDueDate;
    }
    var newItem = {
        id: count,
        text: val,
        done: false,
        priority: priorityVal,
        dueDate: dueDateVal,
        tags: [],
        categories: [],
        editing: false,
    };
    count += 1;
    listOfItems.push(newItem);
    render();
    newItemTextBox.value = "";
}
