var count = 1;
var regex = /^\s*$/;
var submitButton = document.getElementById("submitButton");
var newItemTextBox = document.getElementById("newToDoItem");
var listOfToDoItems = document.getElementById("listOfToDoItems");
listOfItems = [];

submitButton.addEventListener("click", function(){
    newItem(newItemTextBox.value);
});

newItemTextBox.addEventListener('keydown', (event) => {
    var name = event.key;
    if (name == 'Enter' )
    {
        newItem(newItemTextBox.value);
    }
}, false);

fetch("https://jsonplaceholder.typicode.com/todos")
    .then((response) => 
    {
        if (!response.ok) 
        {
            throw new Error("Network response was not OK");
        }
        return response.json();
    })
    .then((data) => 
    {
        // Process the received data
        data.forEach(element => {
            var ele = {id:element.id, text:element.title, done:element.completed};
            var newItem = createListItem(ele);
            count += 1;
            listOfToDoItems.appendChild(newItem);
            listOfItems.push(newItem);
        });
    })
    .catch((error) => 
    {
        // Handle any errors that occurred during the fetch request
        console.log("Error:", error.message);
    });


function render()
{
    listOfToDoItems.innerHTML = "";
    for(var i=0;i<listOfItems.length;++i)
    {
        listOfToDoItems.appendChild(listOfItems[i]);
    }
}

function deleteItem(id)
{
    var index = 0;
    for(var i=0;i<listOfItems.length;i++)
    {
        if(listOfItems[i].id == id)
            index = i;
    }
    listOfItems.splice(index, 1);
    listOfToDoItems.innerHTML = "";
    render();
}

function changeStatus(elem)
{
    if(elem.style.backgroundColor == 'green')
    {
        elem.style.backgroundColor = 'red'
        elem.innerHTML = "Pending";
    }
    else
    {
        elem.style.backgroundColor = 'green';
        elem.innerHTML = "Done";
    }
}

function editTask(id)
{
    var editButton = document.getElementById(id).getElementsByTagName('button')[2];
    var para = document.getElementById(id).getElementsByTagName('textarea')[0];

    if(editButton.innerHTML == 'Save')
    {
        editButton.style.backgroundColor = 'blue';
        editButton.innerHTML = 'Edit';
        para.readOnly = true;
        return;
    }

    editButton.style.backgroundColor = 'grey';
    editButton.innerHTML = 'Save';
    para.readOnly = false;
}

function createListItem(item)
{
    var element = document.createElement('div');
    var para = document.createElement('textarea');
    var buttons = document.createElement('div');

    var delButton = document.createElement('button');
    var doneButton = document.createElement('button');
    var editButton = document.createElement('button');
    
    buttons.appendChild(delButton);
    buttons.appendChild(doneButton);
    buttons.appendChild(editButton);

    element.appendChild(para);
    element.appendChild(buttons);

    element.className = "listItem";
    element.id = "listItemNo" + String(item.id);

    delButton.style.backgroundColor = 'black';
    delButton.style.color = 'white';
    delButton.innerHTML = "Delete";
    delButton.addEventListener("click", function(){
        deleteItem(element.id);
    });
    
    if(item.done)
        doneButton.style.backgroundColor = 'green';
    else
        doneButton.style.backgroundColor = 'red';
    doneButton.style.color = 'white';
    if(item.done)
        doneButton.innerHTML = "Done";
    else
        doneButton.innerHTML = "Pending";
    doneButton.addEventListener("click", function(){
        changeStatus(doneButton);
    });

    para.style.backgroundColor = '#87ACA3';
    para.style.border = '0px';
    para.style.display = 'initial';
    para.style.width = '400px';
    para.style.height = 'fit-content';
    para.style.borderRadius = '5px';
    para.style.border = '5px solid transparent';
    para.style.resize = 'none';
    para.innerHTML = item.text;
    para.readOnly = 'true';

    editButton.style.backgroundColor = 'blue';
    editButton.style.color = 'white';
    editButton.innerHTML = "Edit";
    editButton.addEventListener("click", function(){
        editTask(element.id);
    });

    buttons.style.width = "100%";
    buttons.classList.add('row');

    return element;
}

function newItem(val)
{
    if(regex.test(val))
        return;
    var newItem = {id:count, text:val, done:false};
    count += 1;
    var newItem = createListItem(newItem);
    listOfToDoItems.appendChild(newItem);
    listOfItems.push(newItem);
    newItemTextBox.value = "";
}

// Assignment 3 - 
// Todo list 
// maintain a list of todo items  - keep a array in memory - [{ taskDetails : "do homework", id : 1}, { taskDetails : "sleep", id : 2}]
// function to add to the array
// function to remove a particular element in the array

// UI - 
// text box with save button
// click event on the save button, and call the add array function
// clear the text box
// list of items to be displayed after click - from the array - RENDER FUNCTION to create UI of the list 
// delete button next to each task in list 
// on click delete, pass ID of the task and remove from array
// rerender the list after delete