// State
let tasks = [];
let currentFilter = 'all';
let editingId = null;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Initialize
function init() {
    // Requirements stated: "maintain task status during the current browser session"
    // Using sessionStorage fulfills this requirement natively.
    const storedTasks = sessionStorage.getItem('tasks');
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    renderTasks();
}

// Save tasks to Session Storage
function saveTasks() {
    sessionStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
}

// Toggle Task Status
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Edit Task
function openEditModal(id, text) {
    editingId = id;
    editInput.value = text;
    editModal.classList.add('active');
    editInput.focus();
}

function closeEditModal() {
    editingId = null;
    editModal.classList.remove('active');
}

function saveEdit() {
    const newText = editInput.value.trim();
    if (newText === '') return;

    tasks = tasks.map(task => {
        if (task.id === editingId) {
            return { ...task, text: newText };
        }
        return task;
    });
    
    saveTasks();
    closeEditModal();
    renderTasks();
}

// Clear Completed
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Filter Tasks
function setFilter(filterType) {
    currentFilter = filterType;
    
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
        }
    });
    
    renderTasks();
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        let emptyMessage = "No tasks found.";
        if (currentFilter === 'active') emptyMessage = "No active tasks.";
        if (currentFilter === 'completed') emptyMessage = "No completed tasks.";
        
        taskList.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="checkbox" onclick="toggleTask('${task.id}')">
                    <i class="fas fa-check"></i>
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="openEditModal('${task.id}', '${escapeQuotes(task.text)}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }

    // Update count
    const activeCount = tasks.filter(task => !task.completed).length;
    taskCount.innerText = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
}

// Utility to escape HTML to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Utility to escape quotes for inline function arguments
function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);

cancelEditBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEdit();
});
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

// Run init
init();
