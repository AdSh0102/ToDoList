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
var filterTasksByCategoriesInput = document.getElementById(
    "filterTasksByCategories"
);
var searchBox = document.getElementById("searchInput");
var filterTasksByTagsInput = document.getElementById("filterTasksByTags");
var listToRender = [];
var currentTaskId = null;
var subtaskCounter = 1;
var searchInput = null;
var reminders = [];
nlp.plugin(compromiseDates);

function extractDueDate(input) {
    var doc = nlp(input);
    var dates = doc.dates().get()[0];
    return dates ? new Date(dates.end) : null;
}

function createReminder() {
    openReminderPalette();
}

function openReminderPalette() {
    var reminderPalette = document.getElementById("reminderPalette");
    reminderPalette.style.display = "block";
}

function saveReminder() {
    var reminderText = document.getElementById("reminderText").value;
    var reminderDate = document.getElementById("reminderDate").value;

    if (reminderDate == "") {
        reminderDate = extractDueDate(reminderDate);
        if (reminderDate != null)
            reminderDate = formatDateToDatetimeLocal(reminderDate);
        if (reminderDate == null) {
            var currentDate = new Date();
            var dueDateObject = new Date(currentDate);
            dueDateObject.setDate(dueDateObject.getDate() + 7);
            var formattedDueDate = formatDateToDatetimeLocal(dueDateObject);
            reminderDate = formattedDueDate;
        }
    }

    var newReminder = {
        id: reminders.length + 1,
        text: reminderText,
        date: reminderDate,
    };

    reminders.push(newReminder);

    localStorage.setItem("reminders", JSON.stringify(reminders));

    var logEntry = {
        timestamp: new Date().toISOString(),
        action: "Add Reminder",
        reminder: newReminder.text,
    };
    log.push(logEntry);
    localStorage.setItem("log", JSON.stringify(log));

    closeReminderPalette();
}

function cancelReminder() {
    closeReminderPalette();
}

function closeReminderPalette() {
    var reminderPalette = document.getElementById("reminderPalette");
    reminderPalette.style.display = "none";
}

document
    .getElementById("saveReminderButton")
    .addEventListener("click", saveReminder);
document
    .getElementById("cancelReminderButton")
    .addEventListener("click", cancelReminder);

document
    .getElementById("createReminderButton")
    .addEventListener("click", function () {
        openReminderPalette();
    });

function openModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "block";
}

function closeModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "none";
}

var subtaskInput = document.getElementById("subtaskInput");
var addSubtaskButton2 = document.getElementById("addSubtaskButton2");
var closeModalButton = document.getElementById("closeModal");

addSubtaskButton2.addEventListener("click", function () {
    var subtaskText = subtaskInput.value.trim();
    if (subtaskText !== "") {
        var mainTaskIndex = listToRender.findIndex(
            (task) => task.id === currentTaskId
        );
        if (mainTaskIndex !== -1) {
            listToRender[mainTaskIndex].subtasks.push({
                text: subtaskText,
                done: false,
                id: subtaskCounter,
            });
            ++subtaskCounter;
            render();
            var logEntry = {
                timestamp: new Date().toISOString(),
                action: "Add Subtask",
                task: listOfItems[mainTaskIndex].text,
                subtask: subtaskText,
            };
            log.push(logEntry);
            localStorage.setItem("log", JSON.stringify(log));
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
            filterTasksByCategoriesInput.value = "";
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
            filterTasksByTagsInput.value = "";
            render();
        }
    }
});

function showAllTasks() {
    listToRender = [];
    listOfItems.forEach((task) => {
        listToRender.push(task);
    });
    selectedPriorities = [];
    filterTags = [];
    filterCategories = [];
    render();
}

document
    .getElementById("showAllTasksButton")
    .addEventListener("click", function () {
        showAllTasks();
    });

var selectedPriorities = [];

function filterByPriority(priority) {
    if (priority in selectedPriorities) {
        selectedPriorities.filter((element) => element !== priority);
    } else {
        selectedPriorities.push(priority);
    }
    var filteredTasks = listOfItems.filter((task) =>
        selectedPriorities.includes(task.priority)
    );
    listToRender = filteredTasks;
    renderList(filteredTasks);
}

document
    .getElementById("filterHighPriority")
    .addEventListener("click", function () {
        filterByPriority("High");
    });

document
    .getElementById("filterMediumPriority")
    .addEventListener("click", function () {
        filterByPriority("Medium");
    });

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

    log.push(logEntry);
    localStorage.setItem("log", JSON.stringify(log));
}

listOfItems = getlistOfItemsFromLocalStorage();
render();
count = listOfItems.length + 1;

function newItemToAdd() {
    newItem(newItemTextBox.value, newItemPriority.value, newItemDueDate.value);
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
    closeToDoPalette();
});

function getlistOfItemsFromLocalStorage() {
    var storedList = localStorage.getItem("listOfItems");
    return storedList ? JSON.parse(storedList) : [];
}

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
    filterCategories = [];
    filterTags = [];
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
        ) {
            continue;
        }
        if (filterToDoItems["pending"] && listOfItems[i].done) {
            continue;
        }
        currDateTime = listOfItems[i].dueDate;
        if (startDateTime.value === "" && endDateTime.value === "") {
            listToRender.push(listOfItems[i]);
        } else if (
            startDateTime.value == "" &&
            endDateTime.value >= currDateTime
        ) {
            listToRender.push(listOfItems[i]);
        } else if (
            endDateTime.value == "" &&
            startDateTime.value <= currDateTime
        ) {
            listToRender.push(listOfItems[i]);
        } else if (
            startDateTime.value <= currDateTime &&
            endDateTime.value >= currDateTime
        ) {
            listToRender.push(listOfItems[i]);
        }
    }
    listToRender.sort(sortingFunction);
    filterByTags();
    filterByCategories();
    renderList(listToRender);
    saveListOfItemsToLocalStorage();
}

searchBox.addEventListener("keypress", function (event) {
    if (event.key != "Enter") return;
    searchInput = searchBox.value;
    search();
    searchBox.value = "";
});

function search() {
    if (searchInput.length == 0) {
        return;
    }

    var filteredTasks = listOfItems.filter((task) => {
        if (task.text.toLowerCase().includes(searchInput.toLowerCase()))
            return true;
        var okay = 0;
        task.subtasks.forEach((subtask) => {
            if (subtask.text.toLowerCase().includes(searchInput.toLowerCase()))
                okay = 1;
        });
        if (okay == 1) return true;
    });

    listToRender = filteredTasks;
    renderList(filteredTasks);
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
    var index = -1;
    for (var i = 0; i < listOfItems.length; i++) {
        if (listOfItems[i].id == id) index = i;
    }
    if (index == -1) return;
    logActivity("Delete", listOfItems[index].text);
    listOfItems.splice(index, 1);
    render();
}

function changeStatus(id) {
    for (var i = 0; i < listOfItems.length; ++i) {
        if (listOfItems[i].id == id) {
            listOfItems[i].done = !listOfItems[i].done;
            for (var j = 0; j < listOfItems[i].subtasks.length; ++j) {
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
            console.log(id);
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

    addSubtaskButton.classList.add("addSubtaskButton");
    addSubtaskButton.textContent = "Add Subtask";
    addSubtaskButton.addEventListener("click", function () {
        currentTaskId = item.id;
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
    dueDateLabel.innerHTML = "Due Date: ";

    buttons.appendChild(delButton);
    buttons.appendChild(doneButton);
    buttons.appendChild(editButton);
    buttons.appendChild(priorityList);

    element.appendChild(para);
    element.appendChild(buttons);
    element.appendChild(dueDateDiv);
    element.appendChild(addCategoryBox);
    element.appendChild(addTagBox);
    if (item.subtasks.length > 0) {
        var subtaskHeading = document.createElement("h3");
        subtaskHeading.innerHTML = "Subtasks";
        subtaskHeading.style.margin = "10px";
        element.append(subtaskHeading);
    }
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
        deleteItem(item.id);
    });

    if (item.done) doneButton.style.backgroundColor = "green";
    else doneButton.style.backgroundColor = "red";
    doneButton.style.color = "white";
    if (item.done) doneButton.innerHTML = "Done";
    else doneButton.innerHTML = "Pending";
    doneButton.addEventListener("click", function () {
        changeStatus(item.id);
    });

    para.style.backgroundColor = "white";
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
        para.focus();
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
        element.style.backgroundColor = "#7ead89";
    } else if (priorityList.value == "High") {
        element.style.backgroundColor = "#f44336";
    } else {
        element.style.backgroundColor = "#ffc107";
    }
    element.style.borderColor = element.style.backgroundColor;

    item.subtasks.forEach((subtask) => {
        var subtaskContainer = document.createElement("div");
        subtaskContainer.className = "subtask-container";
        subtaskContainer.style.width = "300px";
        var subtaskEditButton = document.createElement("button");
        subtaskEditButton.style.color = "white";
        subtaskEditButton.style.backgroundColor = "blue";
        subtaskEditButton.innerHTML = "Edit";
        subtaskEditButton.addEventListener("click", function () {
            subtask.editing = !subtask.editing;
            subtaskPara.readOnly = !subtaskPara.readOnly;
            var val = subtaskPara.value;
            if (!subtask.editing) {
                var index = listOfItems.findIndex(
                    (task) => task.id === item.id
                );
                var index2 = listOfItems[index].subtasks.findIndex(
                    (curr) => subtask.id === curr.id
                );
                listOfItems[index].subtasks[index2].text = val;
                var logEntry = {
                    timestamp: new Date().toISOString(),
                    action: "Edit Subtask",
                    task: item.text,
                    subtask: subtask.text,
                    editedTo: val,
                };
                log.push(logEntry);
                localStorage.setItem("log", JSON.stringify(log));
            }
            render();
            saveListOfItemsToLocalStorage();
        });

        var subtaskDeleteButton = document.createElement("button");
        subtaskDeleteButton.style.color = "white";
        subtaskDeleteButton.style.backgroundColor = "black";
        subtaskDeleteButton.innerHTML = "Delete";
        subtaskDeleteButton.addEventListener("click", function () {
            var mainTaskIndex = listOfItems.findIndex(
                (task) => task.id === item.id
            );
            if (mainTaskIndex !== -1) {
                var subtaskIndex = listOfItems[
                    mainTaskIndex
                ].subtasks.findIndex((sub) => sub.id === subtask.id);
                if (subtaskIndex !== -1) {
                    listOfItems[mainTaskIndex].subtasks.splice(subtaskIndex, 1);
                    render();
                    saveListOfItemsToLocalStorage();
                    var logEntry = {
                        timestamp: new Date().toISOString(),
                        action: "Delete Subtask",
                        task: item.text,
                        subtask: subtask.text,
                    };
                    log.push(logEntry);
                    localStorage.setItem("log", JSON.stringify(log));
                }
            }
        });

        var subtaskDoneButton = document.createElement("button");
        if (subtask.done) subtaskDoneButton.style.backgroundColor = "green";
        else subtaskDoneButton.style.backgroundColor = "red";
        subtaskDoneButton.style.color = "white";
        if (subtask.done) subtaskDoneButton.innerHTML = "Done";
        else subtaskDoneButton.innerHTML = "Pending";
        subtaskDoneButton.addEventListener("click", function () {
            subtask.done = !subtask.done;
            logActivity();
            render();
            saveListOfItemsToLocalStorage();
        });

        var subtaskPara = document.createElement("textarea");
        if (subtask.editing) {
            subtaskEditButton.style.backgroundColor = "grey";
            subtaskEditButton.innerHTML = "Save";
            subtaskPara.readOnly = false;
            subtaskPara.addEventListener("input", function () {
                subtask.text = subtaskPara.textContent;
                saveListOfItemsToLocalStorage();
            });
        } else {
            subtaskPara.readOnly = true;
            subtaskEditButton.style.backgroundColor = "blue";
            subtaskEditButton.innerHTML = "Edit";
        }
        subtaskPara.style.backgroundColor = "white";
        subtaskPara.style.display = "initial";
        subtaskPara.style.height = "fit-content";
        subtaskPara.style.width = "300px";
        subtaskPara.style.borderRadius = "5px";
        subtaskPara.style.border = "5px solid transparent";
        subtaskPara.style.resize = "none";
        subtaskPara.textContent = subtask.text;
        subtaskPara.style.minWidth = "100px";

        var subtaskButtons = document.createElement("div");
        subtaskContainer.appendChild(subtaskPara);
        subtaskButtons.appendChild(subtaskDeleteButton);
        subtaskButtons.appendChild(subtaskDoneButton);
        subtaskButtons.appendChild(subtaskEditButton);
        subtaskContainer.appendChild(subtaskButtons);
        subtasksDiv.appendChild(subtaskContainer);
    });

    element.draggable = true;

    return element;
}

function newItem(val, priorityVal, dueDateVal) {
    if (regex.test(val)) return;
    if (dueDateVal == "") {
        dueDateVal = extractDueDate(val);
        if (dueDateVal != null)
            dueDateVal = formatDateToDatetimeLocal(dueDateVal);
        if (dueDateVal == null) {
            var currentDate = new Date();
            var dueDateObject = new Date(currentDate);
            dueDateObject.setDate(dueDateObject.getDate() + 7);
            var formattedDueDate = formatDateToDatetimeLocal(dueDateObject);
            dueDateVal = formattedDueDate;
        }
    }
    var newItemTemp = {
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
    count += 1;
    listOfItems.push(newItemTemp);
    render();
    logActivity("Add", `"${val}" task added.`);
    newItemTextBox.value = "";
}

function loadRemindersFromLocalStorage() {
    var storedReminders = localStorage.getItem("reminders");
    reminders = storedReminders ? JSON.parse(storedReminders) : [];
}

function checkReminders() {
    var currentDate = new Date();
    var currentTime = currentDate.getTime();

    var triggeredReminderIds = [];

    reminders.forEach(function (reminder) {
        var reminderDate = new Date(reminder.date);
        var reminderTime = reminderDate.getTime();

        if (
            reminderTime <= currentTime &&
            !triggeredReminderIds.includes(reminder.id)
        ) {
            alert("Reminder: " + reminder.text);
            triggeredReminderIds.push(reminder.id);
        }
    });

    reminders = reminders.filter(function (reminder) {
        return !triggeredReminderIds.includes(reminder.id);
    });

    saveRemindersToLocalStorage();
}

function saveRemindersToLocalStorage() {
    localStorage.setItem("reminders", JSON.stringify(reminders));
}

function initialize() {
    loadRemindersFromLocalStorage();
    setInterval(checkReminders, 30000);
}

function createToDoTask() {
    openToDoPalette();
}

function openToDoPalette() {
    var toDoPalette = document.getElementById("toDoPalette");
    toDoPalette.style.display = "block";
}

function cancelToDoTask() {
    closeToDoPalette();
}

function closeToDoPalette() {
    var toDoPalette = document.getElementById("toDoPalette");
    toDoPalette.style.display = "none";
}

document
    .getElementById("cancelToDoButton")
    .addEventListener("click", cancelToDoTask);

document.getElementById("createToDo").addEventListener("click", function () {
    createToDoTask();
});

initialize();

document.addEventListener("DOMContentLoaded", function () {
    // Variables to store the dragged task and the drop target
    let draggedTask = null;
    let dropTarget = null;

    // Add dragstart event listener to the task divs
    document.addEventListener("dragstart", function (event) {
        // Set the data (taskId) to be transferred during the drag
        event.dataTransfer.setData("text/plain", event.target.id);
        // Store the dragged task
        draggedTask = event.target;
    });

    // Add dragenter event listener to the drop zone (listOfToDoItems)
    listOfToDoItems.addEventListener("dragenter", function (event) {
        event.preventDefault();
        // Set the drop target
        dropTarget = event.target;
    });

    // Add dragover event listener to the drop zone (listOfToDoItems)
    listOfToDoItems.addEventListener("dragover", function (event) {
        event.preventDefault();
        // Scroll the list of tasks if needed
        const rect = listOfToDoItems.getBoundingClientRect();
        const offset = event.clientY - rect.top;
        const height = rect.bottom - rect.top;
        const scrollThreshold = 50;
        const scrollSpeed = 10;

        if (offset < scrollThreshold) {
            listOfToDoItems.scrollTop -= scrollSpeed;
        } else if (offset > height - scrollThreshold) {
            listOfToDoItems.scrollTop += scrollSpeed;
        }
    });

    // Add drop event listener to the drop zone (listOfToDoItems)
    listOfToDoItems.addEventListener("drop", function (event) {
        event.preventDefault();
        // Get the taskId from the data transfer
        const taskId = event.dataTransfer.getData("text/plain");
        // Find the task div by its ID
        const taskDiv = document.getElementById(taskId);
        // Get the index of the drop target task
        const dropTargetIndex = Array.from(listOfToDoItems.children).indexOf(dropTarget);

        // Check if the task is dropped above or below the drop target
        const draggedTaskIndex = Array.from(listOfToDoItems.children).indexOf(draggedTask);
        if (draggedTaskIndex < dropTargetIndex) {
            // Move the task div below the drop target
            listOfToDoItems.insertBefore(taskDiv, dropTarget.nextSibling);
        } else {
            // Move the task div above the drop target
            listOfToDoItems.insertBefore(taskDiv, dropTarget);
        }
        // Clear the drop target and dragged task
        dropTarget = null;
        draggedTask = null;
    });
});
