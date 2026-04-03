document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let tasks = JSON.parse(localStorage.getItem('tasksFlow_tasks')) || [];
    let currentFilter = 'all';

    // --- DOM Elements ---
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');
    const itemsLeftElement = document.getElementById('items-left');
    const clearBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // --- Core Functions ---

    // Save to Local Storage
    const saveTasks = () => {
        localStorage.setItem('tasksFlow_tasks', JSON.stringify(tasks));
    };

    // Add a new task
    const addTask = (text) => {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        render();
    };

    // Toggle completion status
    const toggleTask = (id) => {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        // Just re-render everything for simplicity, could also toggle classes directly for perf
        render();
    };

    // Delete a task
    const deleteTask = (id) => {
        // Find DOM element to add fade-out animation before removal
        const li = document.querySelector(`[data-id="${id}"]`);
        if (li) {
            li.classList.add('fade-out');
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                render();
            }, 300); // Matches animation duration
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            render();
        }
    };

    // Clear completed tasks
    const clearCompleted = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        render();
    };

    // Update filter selection
    const setFilter = (filter) => {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        render();
    };

    // Render tasks based on filter
    const render = () => {
        list.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                    <p>No tasks here. You're all caught up!</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;

                li.innerHTML = `
                    <label class="checkbox-container">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <button class="delete-btn" aria-label="Delete task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                `;

                // Event listener for checkbox
                const checkbox = li.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                // Event listener for delete button
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                list.appendChild(li);
            });
        }

        updateStats();
    };

    // Update bottom stats
    const updateStats = () => {
        const activeTasksCount = tasks.filter(task => !task.completed).length;
        itemsLeftElement.textContent = `${activeTasksCount} item${activeTasksCount !== 1 ? 's' : ''} left`;

        // Show/hide clear completed button
        const hasCompleted = tasks.some(task => task.completed);
        clearBtn.style.opacity = hasCompleted ? '1' : '0.5';
        clearBtn.style.pointerEvents = hasCompleted ? 'auto' : 'none';
    };

    // Escaping input to prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // --- Event Listeners ---

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text !== '') {
            addTask(text);
            input.value = '';
        }
    });

    clearBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // --- Initial Initialization ---
    render();
});
