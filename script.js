class TaskManagerApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('aegis_tasks_v3')) || [];
        this.currentTheme = localStorage.getItem('aegis_theme') || 'dark';
        this.columnSorts = { todo: 'default', inprogress: 'default', done: 'default' };
        
        this.initDOMReferences();
        this.initEventListeners();
        this.applySavedTheme();
        this.renderBoard();
    }

    initDOMReferences() {
        this.todoContainer = document.getElementById('todoContainer');
        this.inprogressContainer = document.getElementById('inprogressContainer');
        this.doneContainer = document.getElementById('doneContainer');
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskIdField = document.getElementById('taskIdField');
        this.searchInput = document.getElementById('globalSearchInput');
        this.themeToggle = document.getElementById('themeToggle');
        this.efficiencyMetric = document.getElementById('efficiencyMetric');
        this.globalProgressBar = document.getElementById('globalProgressBar');
        this.totalCountText = document.getElementById('totalTasksCount');
        this.progressCountText = document.getElementById('inProgressCount');
        this.completedCountText = document.getElementById('completedTasksCount');
        this.exportBtn = document.getElementById('exportDataBtn');
        this.importFile = document.getElementById('importDataFile');
    }

    initEventListeners() {
        document.getElementById('openModalBtn').addEventListener('click', () => this.openFormModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeFormModal());
        document.getElementById('cancelModalBtn').addEventListener('click', () => this.closeFormModal());
        this.taskForm.addEventListener('submit', (e) => this.handleFormCommit(e));
        this.searchInput.addEventListener('input', () => this.renderBoard());
        this.themeToggle.addEventListener('click', () => this.toggleThemeMatrix());

        // Backup Actions Binding
        this.exportBtn.addEventListener('click', () => this.exportWorkspaceData());
        this.importFile.addEventListener('change', (e) => this.importWorkspaceData(e));

        // Column Sorting Mechanisms
        document.querySelectorAll('.sort-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                this.columnSorts[column] = e.target.value;
                this.renderBoard();
            });
        });

        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', (e) => e.preventDefault());
            column.addEventListener('drop', (e) => this.handleCardDrop(e));
        });
    }

    openFormModal(taskToEdit = null) {
        this.taskForm.reset();
        if (taskToEdit) {
            this.modalTitle.textContent = "Modify Architecture Payload";
            this.taskIdField.value = taskToEdit.id;
            document.getElementById('taskTitle').value = taskToEdit.title;
            document.getElementById('taskDesc').value = taskToEdit.description;
            document.getElementById('taskPriority').value = taskToEdit.priority;
            document.getElementById('taskDeadline').value = taskToEdit.deadline;
            
            // Map subtask array configuration back to clean flat string representation
            const subtaskStrings = (taskToEdit.subtasks || []).map(s => s.text);
            document.getElementById('taskSubtasks').value = subtaskStrings.join(', ');
        } else {
            this.modalTitle.textContent = "Initialize Task Payload";
            this.taskIdField.value = "";
            document.getElementById('taskDeadline').value = new Date().toISOString().split('T')[0];
        }
        this.taskModal.classList.add('open');
    }

    closeFormModal() { this.taskModal.classList.remove('open'); }

    handleFormCommit(event) {
        event.preventDefault();
        const id = this.taskIdField.value;
        
        // Checklist Subtask Token Parsing Subsystem
        const rawSubtasks = document.getElementById('taskSubtasks').value.split(',');
        const processedSubtasks = rawSubtasks
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => ({ text: s, completed: false }));

        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDesc').value.trim(),
            priority: document.getElementById('taskPriority').value,
            deadline: document.getElementById('taskDeadline').value,
        };

        if (id) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                // Keep pre-existing checked elements statuses if modified contents match sizes
                if (processedSubtasks.length === this.tasks[index].subtasks?.length) {
                    taskData.subtasks = this.tasks[index].subtasks.map((st, i) => ({ ...st, text: processedSubtasks[i].text }));
                } else {
                    taskData.subtasks = processedSubtasks;
                }
                this.tasks[index] = { ...this.tasks[index], ...taskData };
            }
        } else {
            const newTask = {
                id: 'task_' + Math.random().toString(36).substr(2, 9),
                status: 'todo',
                subtasks: processedSubtasks,
                ...taskData
            };
            this.tasks.push(newTask);
        }
        this.syncState();
        this.closeFormModal();
    }

    toggleSubtaskState(taskId, subtaskIndex) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.subtasks && task.subtasks[subtaskIndex]) {
            task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
            this.syncState();
        }
    }

    deleteTaskNode(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.syncState();
    }

    // Native Drag and Drop Lifecycle Hooks
    handleCardDragStart(e, task) {
        e.dataTransfer.setData('text/plain', task.id);
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    handleCardDragEnd(e) { e.target.classList.remove('dragging'); }

    handleCardDrop(e) {
        const targetColumn = e.currentTarget.closest('.kanban-column');
        if (!targetColumn) return;
        const targetStatus = targetColumn.dataset.status;
        const taskId = e.dataTransfer.getData('text/plain');
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status !== targetStatus) {
            task.status = targetStatus;
            this.syncState();
        }
    }

    // Export/Import Files Subsystem
    exportWorkspaceData() {
        const fileString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.tasks));
        const anchorNode = document.createElement('a');
        anchorNode.setAttribute("href", fileString);
        anchorNode.setAttribute("download", "AegisTask_Workspace_Backup.json");
        anchorNode.click();
    }

    importWorkspaceData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsedData = JSON.parse(e.target.result);
                if (Array.isArray(parsedData)) {
                    this.tasks = parsedData;
                    this.syncState();
                    alert("Workspace data structure imported successfully!");
                } else { alert("Malformed data layer formatting identified."); }
            } catch (err) { alert("Failed parsing target backup JSON file."); }
        };
        reader.readAsText(file);
    }

    recalculateMetricsTelemetry() {
        const total = this.tasks.length;
        const todo = this.tasks.filter(t => t.status === 'todo').length;
        const progress = this.tasks.filter(t => t.status === 'inprogress').length;
        const done = this.tasks.filter(t => t.status === 'done').length;

        this.totalCountText.textContent = total;
        this.progressCountText.textContent = progress;
        this.completedCountText.textContent = done;
        
        document.getElementById('todoBadge').textContent = todo;
        document.getElementById('inprogressBadge').textContent = progress;
        document.getElementById('doneBadge').textContent = done;

        const yieldRate = total > 0 ? Math.round((done / total) * 100) : 0;
        this.efficiencyMetric.textContent = `${yieldRate}%`;
        this.globalProgressBar.style.width = `${yieldRate}%`;
    }

    // Pipeline Lane Sorter Operations Engine
    sortLaneArray(tasksArray, rule) {
        if (rule === 'priority') {
            const weights = { high: 3, medium: 2, low: 1 };
            return [...tasksArray].sort((a, b) => weights[b.priority] - weights[a.priority]);
        }
        if (rule === 'deadline') {
            return [...tasksArray].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        }
        return tasksArray;
    }

    renderBoard() {
        const searchQuery = this.searchInput.value.toLowerCase().trim();
        this.todoContainer.innerHTML = '';
        this.inprogressContainer.innerHTML = '';
        this.doneContainer.innerHTML = '';

        const filteredTasks = this.tasks.filter(task => {
            const matchesContent = task.title.toLowerCase().includes(searchQuery) || task.description.toLowerCase().includes(searchQuery);
            const matchesSubtasks = task.subtasks?.some(st => st.text.toLowerCase().includes(searchQuery)) || false;
            return matchesContent || matchesSubtasks;
        });

        // Split arrays dynamically to allow independent column sort rules processing
        const todoGroup = filteredTasks.filter(t => t.status === 'todo');
        const inprogressGroup = filteredTasks.filter(t => t.status === 'inprogress');
        const doneGroup = filteredTasks.filter(t => t.status === 'done');

        this.sortLaneArray(todoGroup, this.columnSorts.todo).forEach(t => this.todoContainer.appendChild(this.createCardNodeElement(t)));
        this.sortLaneArray(inprogressGroup, this.columnSorts.inprogress).forEach(t => this.inprogressContainer.appendChild(this.createCardNodeElement(t)));
        this.sortLaneArray(doneGroup, this.columnSorts.done).forEach(t => this.doneContainer.appendChild(this.createCardNodeElement(t)));

        this.recalculateMetricsTelemetry();
    }

    createCardNodeElement(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('draggable', 'true');

        // Dynamic Time Difference Calculator (Urgency Alarm Subsystem)
        const dayDifference = Math.ceil((new Date(task.deadline) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
        let deadlineClass = "deadline-badge";
        let deadlineLabel = task.deadline;
        
        if (task.status !== 'done') {
            if (dayDifference < 0) { deadlineClass += " urgent"; deadlineLabel = `Overdue (${Math.abs(dayDifference)}d)`; }
            else if (dayDifference === 0) { deadlineClass += " urgent"; deadlineLabel = "Due Today"; }
            else if (dayDifference === 1) { deadlineClass += " urgent"; deadlineLabel = "Due Tomorrow"; }
        }

        // Subtask Checklist UI Generator String
        let subtasksHTML = '';
        if (task.subtasks && task.subtasks.length > 0) {
            subtasksHTML = `<div class="card-subtasks-wrapper">`;
            task.subtasks.forEach((st, index) => {
                subtasksHTML += `
                    <div class="subtask-item ${st.completed ? 'completed-task' : ''}" data-index="${index}">
                        <input type="checkbox" ${st.completed ? 'checked' : ''}>
                        <span>${st.text}</span>
                    </div>`;
            });
            subtasksHTML += `</div>`;
        }
        
        card.innerHTML = `
            <div class="card-tags">
                <span class="priority-tag ${task.priority}">${task.priority}</span>
                <div class="card-actions-menu">
                    <button class="card-btn edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="card-btn delete"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            <h4>${task.title}</h4>
            <p>${task.description || '<i>No description logged.</i>'}</p>
            ${subtasksHTML}
            <div class="card-footer">
                <span class="${deadlineClass}"><i class="fa-regular fa-calendar-days"></i> ${deadlineLabel}</span>
                <span>ID: ${task.id.split('_')[1]}</span>
            </div>
        `;

        // Interactive Checkbox Click Handlers
        card.querySelectorAll('.subtask-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid card-level misfires
                const subIndex = parseInt(item.dataset.index);
                this.toggleSubtaskState(task.id, subIndex);
            });
        });

        card.querySelector('.edit').addEventListener('click', () => this.openFormModal(task));
        card.querySelector('.delete').addEventListener('click', () => this.deleteTaskNode(task.id));
        card.addEventListener('dragstart', (e) => this.handleCardDragStart(e, task));
        card.addEventListener('dragend', (e) => this.handleCardDragEnd(e));
        return card;
    }

    syncState() {
        localStorage.setItem('aegis_tasks_v3', JSON.stringify(this.tasks));
        this.renderBoard();
    }

    toggleThemeMatrix() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('aegis_theme', this.currentTheme);
        this.applySavedTheme();
    }

    applySavedTheme() { document.documentElement.setAttribute('data-theme', this.currentTheme); }
}

document.addEventListener('DOMContentLoaded', () => { window.AppInstanceCore = new TaskManagerApp(); });
