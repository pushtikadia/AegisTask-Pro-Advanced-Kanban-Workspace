class TaskManagerApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('aegis_tasks_v2')) || [];
        this.currentTheme = localStorage.getItem('aegis_theme') || 'dark';
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
    }

    initEventListeners() {
        document.getElementById('openModalBtn').addEventListener('click', () => this.openFormModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeFormModal());
        document.getElementById('cancelModalBtn').addEventListener('click', () => this.closeFormModal());
        this.taskForm.addEventListener('submit', (e) => this.handleFormCommit(e));
        this.searchInput.addEventListener('input', () => this.renderBoard());
        this.themeToggle.addEventListener('click', () => this.toggleThemeMatrix());

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
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDesc').value.trim(),
            priority: document.getElementById('taskPriority').value,
            deadline: document.getElementById('taskDeadline').value,
        };

        if (id) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index !== -1) this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            const newTask = {
                id: 'task_' + Math.random().toString(36).substr(2, 9),
                status: 'todo',
                createdAt: new Date().toLocaleDateString(),
                ...taskData
            };
            this.tasks.push(newTask);
        }
        this.syncState();
        this.closeFormModal();
    }

    deleteTaskNode(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.syncState();
    }

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

    renderBoard() {
        const searchQuery = this.searchInput.value.toLowerCase().trim();
        this.todoContainer.innerHTML = '';
        this.inprogressContainer.innerHTML = '';
        this.doneContainer.innerHTML = '';

        const filteredTasks = this.tasks.filter(task => {
            return task.title.toLowerCase().includes(searchQuery) || task.description.toLowerCase().includes(searchQuery);
        });

        filteredTasks.forEach(task => {
            const card = this.createCardNodeElement(task);
            if (task.status === 'todo') this.todoContainer.appendChild(card);
            if (task.status === 'inprogress') this.inprogressContainer.appendChild(card);
            if (task.status === 'done') this.doneContainer.appendChild(card);
        });
        this.recalculateMetricsTelemetry();
    }

    createCardNodeElement(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('draggable', 'true');
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
            <div class="card-footer">
                <span><i class="fa-regular fa-calendar-days"></i> ${task.deadline}</span>
                <span>ID: ${task.id.split('_')[1]}</span>
            </div>
        `;
        card.querySelector('.edit').addEventListener('click', () => this.openFormModal(task));
        card.querySelector('.delete').addEventListener('click', () => this.deleteTaskNode(task.id));
        card.addEventListener('dragstart', (e) => this.handleCardDragStart(e, task));
        card.addEventListener('dragend', (e) => this.handleCardDragEnd(e));
        return card;
    }

    syncState() {
        localStorage.setItem('aegis_tasks_v2', JSON.stringify(this.tasks));
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
