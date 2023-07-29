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
var currentTaskId = null; // Track the ID of the current main task being processed
var subtaskCounter = 1;
var searchInput = null;
var reminders = [];
nlp.plugin(compromiseDates); // load the plugin

function extractDueDate(input) {
    var doc = nlp(input);
    // find and interpret each date in the text
    var dates = doc.dates().get()[0];
    // return the text
    return dates ? new Date(dates.end) : null;
}

// Function to handle reminder creation
function createReminder() {
    // Show the palette/modal to capture reminder details
    openReminderPalette();
}

// Function to open the reminder palette/modal
function openReminderPalette() {
    var reminderPalette = document.getElementById("reminderPalette");
    reminderPalette.style.display = "block";
}

// Function to save the reminder
function saveReminder() {
    var reminderText = document.getElementById("reminderText").value;
    var reminderDate = document.getElementById("reminderDate").value;

    // Perform any necessary validation on the reminderText and reminderDate
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

    // Create a new reminder object and store it somewhere (e.g., an array)
    var newReminder = {
        id: reminders.length + 1,
        text: reminderText,
        date: reminderDate,
    };

    // Add the new reminder to the reminders array
    reminders.push(newReminder);

    // Save the reminders array to local storage
    localStorage.setItem("reminders", JSON.stringify(reminders));

    // Log the reminder creation activity
    var logEntry = {
        timestamp: new Date().toISOString(),
        action: "Add Reminder",
        reminder: newReminder.text,
    };
    log.push(logEntry);
    localStorage.setItem("log", JSON.stringify(log));

    // Close the reminder palette/modal
    closeReminderPalette();
}

// Function to cancel the reminder creation
function cancelReminder() {
    closeReminderPalette();
}

// Function to close the reminder palette/modal
function closeReminderPalette() {
    var reminderPalette = document.getElementById("reminderPalette");
    reminderPalette.style.display = "none";
}

// Add event listeners for the "Save Reminder" and "Cancel" buttons
document
    .getElementById("saveReminderButton")
    .addEventListener("click", saveReminder);
document
    .getElementById("cancelReminderButton")
    .addEventListener("click", cancelReminder);

// Add event listener to the "Create Reminder" button
document
    .getElementById("createReminderButton")
    .addEventListener("click", function () {
        openReminderPalette();
    });

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
            listToRender[mainTaskIndex].subtasks.push({
                text: subtaskText,
                done: false,
                id: subtaskCounter,
            });
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
    closeToDoPalette();
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
    console.log(startDateTime.value, endDateTime.value);
    for (var i = 0; i < listOfItems.length; ++i) {
        if (filterToDoItems["missed"] && (listOfItems[i].done || listOfItems[i].dueDate > currDateTime))
        {
            continue;
        }
        if (filterToDoItems["pending"] && listOfItems[i].done) 
        {
            continue;
        }
        currDateTime = listOfItems[i].dueDate;
        if (startDateTime.value === "" && endDateTime.value === "")
        {
            listToRender.push(listOfItems[i]);
        }
        else if (startDateTime.value == "" && endDateTime.value >= currDateTime)
        {
            listToRender.push(listOfItems[i]);
        }
        else if (endDateTime.value == "" && startDateTime.value <= currDateTime)
        {
            listToRender.push(listOfItems[i]);
        }
        else if (startDateTime.value <= currDateTime && endDateTime.value >= currDateTime)
        {
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
});

function search() {
    if (searchInput.length == 0) {
        // If the search input is empty, show all tasks
        return;
    }

    // Search for tasks with names similar to the search input
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
    if(item.subtasks.length > 0)
    {
        var subtaskHeading = document.createElement('h3');
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
        element.style.backgroundColor = "#28a745";
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
        // Add edit functionality for subtasks
        var subtaskEditButton = document.createElement("button");
        subtaskEditButton.style.color = "white";
        subtaskEditButton.style.backgroundColor = "blue";
        subtaskEditButton.innerHTML = "Edit";
        subtaskEditButton.addEventListener("click", function () {
            subtask.editing = !subtask.editing;
            subtaskPara.readOnly = !subtaskPara.readOnly;
            var val = subtaskPara.value;
            if(!subtask.editing)
            {
                var index = listOfItems.findIndex((task) => task.id === item.id);
                var index2 = listOfItems[index].subtasks.findIndex((curr) => subtask.id === curr.id);
                listOfItems[index].subtasks[index2].text = val;
            }
            render();
            saveListOfItemsToLocalStorage(); // Save changes to local storage
        });

        // Add delete functionality for subtasks
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
                    saveListOfItemsToLocalStorage(); // Save changes to local storage
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
            render();
            saveListOfItemsToLocalStorage(); // Save changes to local storage
        });

        var subtaskPara = document.createElement("textarea");
        if (subtask.editing) {
            subtaskEditButton.style.backgroundColor = "grey";
            subtaskEditButton.innerHTML = "Save";
            subtaskPara.readOnly = false; 
            subtaskPara.addEventListener("input", function () {
                subtask.text = subtaskPara.textContent;
                saveListOfItemsToLocalStorage(); // Save changes to local storage
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
        subtaskButtons.appendChild(subtaskDeleteButton); // Add the delete button
        subtaskButtons.appendChild(subtaskDoneButton);
        subtaskButtons.appendChild(subtaskEditButton);
        subtaskContainer.appendChild(subtaskButtons);
        subtasksDiv.appendChild(subtaskContainer);
    });

    return element;
}

// function to add a new item to the toDo List
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
    count += 1;
    listOfItems.push(newItem);
    render();
    logActivity("Add", `"${val}" task added.`);
    newItemTextBox.value = "";
}

function loadRemindersFromLocalStorage() {
    var storedReminders = localStorage.getItem("reminders");
    reminders = storedReminders ? JSON.parse(storedReminders) : [];
}

// Function to check for due reminders and send alerts
function checkReminders() {
    var currentDate = new Date();
    var currentTime = currentDate.getTime();

    // Create an array to store the IDs of triggered reminders
    var triggeredReminderIds = [];

    reminders.forEach(function (reminder) {
        var reminderDate = new Date(reminder.date);
        var reminderTime = reminderDate.getTime();

        // If the reminder date has passed and it has not triggered an alert yet
        if (
            reminderTime <= currentTime &&
            !triggeredReminderIds.includes(reminder.id)
        ) {
            // Show the alert for the reminder
            alert("Reminder: " + reminder.text);

            // Add the ID of the triggered reminder to the array
            triggeredReminderIds.push(reminder.id);
        }
    });

    // Remove the triggered reminders from the reminders array
    reminders = reminders.filter(function (reminder) {
        return !triggeredReminderIds.includes(reminder.id);
    });

    // Save the updated reminders array to local storage
    saveRemindersToLocalStorage();
}

// Function to save the reminders array to Local Storage
function saveRemindersToLocalStorage() {
    localStorage.setItem("reminders", JSON.stringify(reminders));
}

// Function to initialize the application
function initialize() {
    loadRemindersFromLocalStorage();
    // Call the checkReminders function every minute (adjust the interval as needed)
    setInterval(checkReminders, 30000); // 60000 milliseconds = 1 minute
}

// Function to handle to-do task creation
function createToDoTask() {
    // Show the palette/modal to capture to-do task details
    openToDoPalette();
}

// Function to open the to-do task palette/modal
function openToDoPalette() {
    var toDoPalette = document.getElementById("toDoPalette");
    toDoPalette.style.display = "block";
}

// Function to cancel the to-do task creation
function cancelToDoTask() {
    closeToDoPalette();
}

// Function to close the to-do task palette/modal
function closeToDoPalette() {
    var toDoPalette = document.getElementById("toDoPalette");
    toDoPalette.style.display = "none";
}

// Add event listeners for the "Press to submit" and "Cancel" buttons in the to-do palette
document
    .getElementById("cancelToDoButton")
    .addEventListener("click", cancelToDoTask);

// Add event listener to the "Create a new to do task" button
document.getElementById("createToDo").addEventListener("click", function () {
    createToDoTask();
});

// Call the initialize function to start the application
initialize();
