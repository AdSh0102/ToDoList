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
var resetTags = document.getElementById("resetTags");
var resetCategories = document.getElementById("resetCategories");
var pendingOnlyButton = document.getElementById("pendingOnly");
var displayAllTasks = document.getElementById("displayAllTasks");
var displayMissedTasks = document.getElementById("displayMissedTasks");
var filterToDoItems = { missed: false, pending: false };
var sortingAlgoSelection = document.getElementById("sortTasksBy");
var startDateTime = document.getElementById("startDateTime");
var endDateTime = document.getElementById("endDateTime");
var log = JSON.parse(localStorage.getItem("log")) || [];
var filterTasksByCategoriesInput = document.getElementById("filterTasksByCategories");
var searchBox = document.getElementById("searchInput");
var filterTasksByTagsInput = document.getElementById("filterTasksByTags");
var listToRender = [];
var currentTaskId = null; // Track the ID of the current main task being processed
var subtaskCounter = 1;

// Function to open the modal
function openModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "none";
}

// Add event listener to the "Add Subtask" button
var subtaskInput = document.getElementById("subtaskInput");
var addSubtaskButton = document.getElementById("addSubtaskButton");
var closeModalButton = document.getElementById("closeModal");

addSubtaskButton.addEventListener("click", function () {
    var subtaskText = subtaskInput.value.trim();
    if (subtaskText !== "") {
        var mainTaskIndex = listToRender.findIndex(
            (task) => task.id === currentTaskId
        );
        if (mainTaskIndex !== -1) {
            listToRender[mainTaskIndex].subtasks.push({text:subtaskText, done:false, id: subtaskCounter});
            ++subtaskCounter;
            render();
        }
    }
    subtaskInput.value = "";
    closeModal();
});

closeModalButton.addEventListener("click", function () {
    closeModal();
});

resetTags.addEventListener("click", function () {
    filterTags = [];
});

resetCategories.addEventListener("click", function () {
    filterCategories = [];
});

filterTasksByCategoriesInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        if (filterTasksByCategoriesInput.value == "") {
            return;
        } else {
            var temp = filterTasksByCategoriesInput.value;
            filterCategories.push(temp);
            render();
        }
    }
});

filterTasksByTagsInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        if (filterTasksByTagsInput.value == "") {
            return;
        } else {
            filterTags.push(filterTasksByTagsInput.value);
            render();
        }
    }
});

function showAllTasks() {
    listToRender = [];
    listOfItems.forEach((task) => {
        listToRender.push((task));
    });
    selectedPriorities = [];
    renderList(listToRender);
}

document
    .getElementById("showAllTasksButton")
    .addEventListener("click", function () {
        showAllTasks();
    });

var selectedPriorities = [];

function filterByPriority(priority) {
    if(priority in selectedPriorities)
    {
        selectedPriorities.filter((element) => element !== priority);
    }
    else
    {
        selectedPriorities.push(priority);
    }
    var filteredTasks = listOfItems.filter(
        (task) => selectedPriorities.includes(task.priority)
      );
    listToRender = filteredTasks;
    renderList(filteredTasks);
}

// Event listener for the "High Priority" button
document
    .getElementById("filterHighPriority")
    .addEventListener("click", function () {
        filterByPriority("High");
    });

// Event listener for the "Medium Priority" button
document
    .getElementById("filterMediumPriority")
    .addEventListener("click", function () {
        filterByPriority("Medium");
    });

// Event listener for the "Low Priority" button
document
    .getElementById("filterLowPriority")
    .addEventListener("click", function () {
        filterByPriority("Low");
    });

function logActivity(action, task) {
    var logEntry = {
        timestamp: new Date().toISOString(),
        action,
        task,
    };

    // Store log in local storage
    var log = JSON.parse(localStorage.getItem("log")) || [];
    log.push(logEntry);
    localStorage.setItem("log", JSON.stringify(log));
}

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

function renderList(listToRender) {
    listOfToDoItems.innerHTML = "";
    for (var i = 0; i < listToRender.length; ++i) {
        listOfToDoItems.appendChild(createListItem(listToRender[i]));
    }
}

function render() {
    currDateTime = formatDateToDatetimeLocal(new Date());
    listToRender = [];
    for (var i = 0; i < listOfItems.length; ++i) {
        if (
            filterToDoItems["missed"] &&
            (listOfItems[i].done || listOfItems[i].dueDate > currDateTime)
        )
            continue;
        if (filterToDoItems["pending"] && listOfItems[i].done) continue;
        if (startDateTime.value == "" && endDateTime.value == "")
            listToRender.push(listOfItems[i]);
        else if (startDateTime.value == "" && endDateTime.value >= currDateTime)
            listToRender.push(listOfItems[i]);
        else if (endDateTime.value == "" && startDateTime.value <= currDateTime)
            listToRender.push(listOfItems[i]);
        else if (
            startDateTime.value <= currDateTime &&
            endDateTime.value >= currDateTime
        )
            listToRender.push(listOfItems[i]);
    }
    listToRender.sort(sortingFunction);
    filterByTags();
    filterByCategories();
    renderList(listToRender);
    saveListOfItemsToLocalStorage();
}

function filterByCategories() {
    if (filterCategories.length == 0) {
        return;
    }
    var filteredTasks = listOfItems.filter((task) => {
        return task.categories.some((category) =>
            filterCategories.includes(category)
        );
    });
    listToRender = filteredTasks;
}

function filterByTags() {
    if (filterTags.length == 0) {
        return;
    }
    var filteredTasks = listToRender.filter((task) => {
        return task.tags.some((tag) => filterTags.includes(tag));
    });
    listToRender = filteredTasks;
}

function deleteItem(id) {
    var index = 0;
    for (var i = 0; i < listOfItems.length; i++) {
        if (listOfItems[i].id == id) index = i;
    }
    listOfItems.splice(index, 1);
    render();
    var deletedTask = listOfItems.find((item) => item.id == id);
    logActivity("Delete", deletedTask.text);
}

function changeStatus(id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].done = !listOfItems[i].done;
            for(var j=0;j<listOfItems[i].subtasks.length;++j)
            {
                listOfItems[i].subtasks[j].done = listOfItems[i].done;
            }
            break;
        }
    }
    render();
    var changedTask = listOfItems.find((item) => item.id == id);
    var action = changedTask.done ? "Marked as Done" : "Marked as Pending";
    logActivity(action, changedTask.text);
}

function editTask(id, value) {
    var index = listOfItems.findIndex((item) => item.id === id);
    if (listOfItems[index].editing) {
        listOfItems[index].text = value;
    }
    listOfItems[index].editing = !listOfItems[index].editing;
    render();
    var editedTask = listOfItems.find((item) => item.id == id);
    logActivity("Edit", `Edited "${editedTask.text}" to "${value}"`);
}

function formatDateToDatetimeLocal(date) {
    var year = date.getFullYear().toString().padStart(4, "0");
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var day = date.getDate().toString().padStart(2, "0");
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function changeDueDate(value, id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].dueDate = value;
        }
    }
    render();
    var changedTask = listOfItems.find((item) => item.id == id);
    logActivity(
        "Due Date Change",
        `"${changedTask.text}" due date changed to "${value}"`
    );
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
    var changedTask = listOfItems.find((item) => item.id == id);
    logActivity(
        "Priority Change",
        `"${changedTask.text}" priority changed to "${value}"`
    );
}

function addCategoryToItem(val, id) {
    if (regex.test(val)) return;
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].categories.push(val);
        }
    }
    render();
}

function addTagToItem(val, id) {
    if (regex.test(val)) return;
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].tags.push(val);
        }
    }
    render();
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
    var addSubtaskButton = document.createElement("button");
    var subtasksDiv = document.createElement("div");
    
    subtasksDiv.className = "subtasks";
    addSubtaskButton.textContent = "Add Subtask";
    addSubtaskButton.addEventListener("click", function () {
        currentTaskId = item.id; // Set the current main task ID
        openModal();
    });
    element.appendChild(addSubtaskButton);

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
    element.appendChild(subtasksDiv);
    element.appendChild(addSubtaskButton);

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

    item.subtasks.forEach((subtask) => {
        var subtaskContainer = document.createElement("div");
        subtaskContainer.className = "subtask-container";
        var subtaskDoneButton = document.createElement("button");
        if (subtask.done) subtaskDoneButton.style.backgroundColor = "green";
        else subtaskDoneButton.style.backgroundColor = "red";
        subtaskDoneButton.style.color = "white";
        if (subtask.done) subtaskDoneButton.innerHTML = "Done";
        else subtaskDoneButton.innerHTML = "Pending";
        subtaskDoneButton.addEventListener("click", function () {
            subtask.done = !subtask.done; // Update the done state for the clicked subtask
        
            // Find the main task (item) in the listOfItems array and update the corresponding subtask
            const mainTaskIndex = listOfItems.findIndex((task) => task.id === item.id);
            if (mainTaskIndex !== -1) {
                const subtaskIndex = listOfItems[mainTaskIndex].subtasks.findIndex(
                    (sub) => sub.id === subtask.id
                );
                if (subtaskIndex !== -1) {
                    listOfItems[mainTaskIndex].subtasks[subtaskIndex].done = subtask.done;
                }
            }
        
            if (subtask.done) subtaskDoneButton.style.backgroundColor = "green";
            else subtaskDoneButton.style.backgroundColor = "red";
            if (subtask.done) subtaskDoneButton.innerHTML = "Done";
            else subtaskDoneButton.innerHTML = "Pending";
            render();
        
            var action = subtask.done ? "Marked as Done for subtask" : "Marked as Pending for subtask";
            logActivity(action, subtask.text);
        });
        var subtaskPara = document.createElement("p");
        subtaskPara.textContent = subtask.text;
        subtaskPara.style.display = "inline";

        subtaskContainer.appendChild(subtaskDoneButton);
        subtaskContainer.appendChild(subtaskPara);
        subtasksDiv.appendChild(subtaskContainer);
    });


    return element;
}

// function to add a new item to the toDo List
function newItem(val, priorityVal, dueDateVal) {
    if (regex.test(val)) return;
    if (dueDateVal == "") {
        var currentDate = new Date();
        // ... Calculate the due date ...
        var dueDateObject = new Date(currentDate);
        dueDateObject.setDate(dueDateObject.getDate() + 7);
        var formattedDueDate = formatDateToDatetimeLocal(dueDateObject);
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
        subtasks: [],
    };
    // newItem.subtasks = subtaskss.map((subtask) => ({ text: subtask, done: false }));
    count += 1;
    listOfItems.push(newItem);
    render();
    logActivity("Add", `"${val}" task added.`);
    newItemTextBox.value = "";
}
