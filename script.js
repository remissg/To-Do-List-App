let inp = document.querySelector("#input-box");
let dateInput = document.querySelector("#date-input");
let timeInput = document.querySelector("#time-input");
let categoryInput = document.querySelector("#category-input"); // NEW
let listContainer = document.querySelector("#list-container");
let addTaskBtn = document.querySelector("#add-task");
let nightTogBtn = document.querySelector("#theme-toggle");
let body = document.querySelector("body");

addTaskBtn.addEventListener("click", addTask);
nightTogBtn.addEventListener("click", toggleNightMode);

function addTask() {
    // 1. Validation
    if(inp.value.trim() === ''){
        alert("You must write something to add a task!");
        return;
    } 

    const taskText = inp.value.trim();
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    const categoryValue = categoryInput.value; // NEW

    // 2. Build Task Details (Category and Date/Time)
    let categoryTag = '';
    if (categoryValue) {
        // Use a span with a specific class for category
        categoryTag = `<span class="category-tag">${categoryValue}</span>`;
    }

    let dateTimeString = '';
    if (dateValue || timeValue) {
        // Format the date/time string
        const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString() : '';
        const formattedTime = timeValue || '';
        
        const displayString = (formattedDate ? formattedDate : '') + (formattedTime ? (formattedDate ? ' at ' : '') + formattedTime : '');
        
        // Use a span with a specific class for combined details
        dateTimeString = `<span class="task-details" data-date="${dateValue}" data-time="${timeValue}">Due: ${displayString}</span>`;
    }
    
    // 3. Create new task element
    let li = document.createElement("li");
    
    if (categoryValue){
        li.classList.add(`category-${categoryValue}`);
    }

    li.innerHTML = `
        ${categoryTag}
        ${taskText} 
        ${dateTimeString}
    `;
    listContainer.appendChild(li);

    // 4. Create Edit button (.edit)
    let edit = document.createElement("span");
    edit.classList.add("edit")
    edit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    li.appendChild(edit);

    // 5. Create Delete button 
    let del = document.createElement("span");
    del.classList.add("del");
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    li.appendChild(del);

    // 6. Clear inputs and save
    inp.value = "";
    dateInput.value = "";
    timeInput.value = "";
    categoryInput.value = ""; // Clear category
    saveData();
}

listContainer.addEventListener("click", function(e){
    // Check if the LI itself was clicked (not a button/span inside it)
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
        saveData();
    }
    else if(e.target.closest(".del")){
        e.target.closest("li").remove();
        saveData();
    }
    else if(e.target.closest(".edit")){
        let li = e.target.closest("li");
        
        // Find the text content, ignoring the spans (.category-tag, .task-details)
        let nodes = Array.from(li.childNodes);
        let taskText = nodes.filter(node => node.nodeType === 3) // Filter for Text Nodes (type 3)
                            .map(node => node.textContent.trim())
                            .filter(text => text.length > 0)
                            .join(' ') || '';
        
        let newText = prompt("Edit your task:", taskText);

        if (newText !== null && newText.trim() !== '') {
            // Remove existing text nodes
            nodes.forEach(node => {
                if (node.nodeType === 3) {
                    node.remove();
                }
            });
            
            // Prepend the new text node
            li.prepend(document.createTextNode(newText.trim() + " ")); 
            
            saveData();
        }
    }
}, false);

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
    localStorage.setItem("theme", body.classList.contains("night-mode") ? "night" : "day");
}

function showTask(){
    // The innerHTML retrieval handles the full structure
    listContainer.innerHTML = localStorage.getItem("data");
    loadTheme();
}

// --- Night Toggle Functions ---

function toggleNightMode() {
    body.classList.toggle("night-mode");
    
    const icon = nightTogBtn.querySelector('i');
    
    if (body.classList.contains("night-mode")) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    saveData(); 
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "night") {
        body.classList.add("night-mode");
        nightTogBtn.querySelector('i').classList.remove('fa-moon');
        nightTogBtn.querySelector('i').classList.add('fa-sun');
    } else {
        body.classList.remove("night-mode");
        nightTogBtn.querySelector('i').classList.remove('fa-sun');
        nightTogBtn.querySelector('i').classList.add('fa-moon');
    }
}

// --- Notification Logic ---

function checkTaskNotifications() {
    const now = new Date();
    const tasks = document.querySelectorAll("#list-container li");

    tasks.forEach(li => {
        // Skip completed or already notified tasks
        if (li.classList.contains("checked") || li.dataset.notified === 'true') {
            return;
        }

        const detailsSpan = li.querySelector(".task-details");
        if (detailsSpan) {
            const dateValue = detailsSpan.dataset.date;
            const timeValue = detailsSpan.dataset.time;

            // Proceed only if both date and time are set
            if (dateValue && timeValue) {
                const taskDueDate = new Date(`${dateValue}T${timeValue}`);

                // Check if the task's due time is in the past
                if (now >= taskDueDate) {
                    // Extract the main task text for the alert
                    const taskText = Array.from(li.childNodes)
                        .filter(node => node.nodeType === 3) // Text nodes only
                        .map(node => node.textContent.trim())
                        .join(' ');

                    alert(`Reminder: Your task "${taskText}" is due!`);

                    // Mark as notified to prevent repeated alerts
                    li.dataset.notified = 'true';
                    saveData(); // Save the notified state
                }
            }
        }
    });
}

// Run the check every 30 seconds
setInterval(checkTaskNotifications, 30000);


showTask();