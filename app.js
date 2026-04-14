import {
  LinkedList,
  Stack,
  Queue,
  MaxHeapPriorityQueue,
  mergeSortTasks,
  linearSearchByTitle,
  binarySearchByExactTitle
} from "./dsa.js";

const STORAGE_KEY = "task_scheduler_state_v1";
const THEME_KEY = "task_scheduler_theme";

const taskList = new LinkedList();
const deletedStack = new Stack();
const executionQueue = new Queue();

const refs = {
  form: document.getElementById("task-form"),
  taskId: document.getElementById("task-id"),
  title: document.getElementById("title"),
  priority: document.getElementById("priority"),
  deadline: document.getElementById("deadline"),
  cancelEdit: document.getElementById("cancel-edit"),
  taskList: document.getElementById("task-list"),
  stackList: document.getElementById("stack-list"),
  queueList: document.getElementById("queue-list"),
  status: document.getElementById("status"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  clearSearch: document.getElementById("clear-search"),
  sortPriority: document.getElementById("sort-priority"),
  sortDeadline: document.getElementById("sort-deadline"),
  priorityView: document.getElementById("priority-view"),
  queueView: document.getElementById("queue-view"),
  undoDelete: document.getElementById("undo-delete"),
  themeToggle: document.getElementById("theme-toggle")
};

let filteredTaskId = null;

function createId() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function priorityText(priority) {
  if (priority === 3) {
    return "High";
  }
  if (priority === 2) {
    return "Medium";
  }
  return "Low";
}

function showStatus(message) {
  refs.status.textContent = message;
}

function saveState() {
  const state = {
    tasks: taskList.toArray(),
    deleted: deletedStack.toArray(),
    queue: executionQueue.toArray()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rebuildStructuresFromTasks(tasks) {
  while (taskList.length > 0) {
    taskList.removeById(taskList.head.value.id);
  }
  let i;
  for (i = 0; i < tasks.length; i += 1) {
    taskList.append(tasks[i]);
  }
}

function restoreState() {
  const stateRaw = localStorage.getItem(STORAGE_KEY);
  if (!stateRaw) {
    return;
  }
  try {
    const parsed = JSON.parse(stateRaw);
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const deleted = Array.isArray(parsed.deleted) ? parsed.deleted : [];
    const queue = Array.isArray(parsed.queue) ? parsed.queue : [];

    let i;
    for (i = 0; i < tasks.length; i += 1) {
      taskList.append(tasks[i]);
    }
    for (i = deleted.length - 1; i >= 0; i -= 1) {
      deletedStack.push(deleted[i]);
    }
    for (i = 0; i < queue.length; i += 1) {
      executionQueue.enqueue(queue[i]);
    }
  } catch (error) {
    showStatus("State load failed, starting clean.");
  }
}

function renderTaskList(tasksToRender = null) {
  const source = tasksToRender || taskList.toArray();
  refs.taskList.innerHTML = "";

  if (source.length === 0) {
    refs.taskList.innerHTML = "<li class='task-item'>No tasks found.</li>";
    return;
  }

  let i;
  for (i = 0; i < source.length; i += 1) {
    const task = source[i];
    const li = document.createElement("li");
    li.className = "task-item";
    if (filteredTaskId && filteredTaskId === task.id) {
      li.classList.add("highlight");
    }

    li.innerHTML = `
      <div class="task-row">
        <strong>${task.title}</strong>
        <span class="pill">${priorityText(task.priority)}</span>
      </div>
      <div class="task-row">
        <span>Deadline: ${task.deadline}</span>
        <span>ID: ${task.id}</span>
      </div>
      <div class="task-row">
        <button class="btn secondary edit-btn" data-id="${task.id}">Edit</button>
        <button class="btn danger delete-btn" data-id="${task.id}">Delete</button>
      </div>
    `;
    refs.taskList.appendChild(li);
  }
}

function renderStack() {
  const items = deletedStack.toArray();
  refs.stackList.innerHTML = "";

  if (items.length === 0) {
    refs.stackList.innerHTML = "<li class='task-item'>Stack empty.</li>";
    return;
  }

  let i;
  for (i = 0; i < items.length; i += 1) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.textContent = `${items[i].title} (${priorityText(items[i].priority)})`;
    refs.stackList.appendChild(li);
  }
}

function renderQueue() {
  const items = executionQueue.toArray();
  refs.queueList.innerHTML = "";

  if (items.length === 0) {
    refs.queueList.innerHTML = "<li class='task-item'>Queue empty.</li>";
    return;
  }

  let i;
  for (i = 0; i < items.length; i += 1) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.textContent = `${i + 1}. ${items[i].title} - ${priorityText(items[i].priority)}`;
    refs.queueList.appendChild(li);
  }
}

function renderAll() {
  renderTaskList();
  renderStack();
  renderQueue();
}

function clearForm() {
  refs.form.reset();
  refs.taskId.value = "";
  refs.cancelEdit.classList.add("hidden");
}

function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

function addTask(task) {
  taskList.append(task);
  executionQueue.enqueue(task);
  saveState();
  renderAll();
}

function updateTask(updatedTask) {
  taskList.updateById(updatedTask.id, () => updatedTask);

  const queueItems = executionQueue.toArray();
  let i;
  for (i = 0; i < queueItems.length; i += 1) {
    if (queueItems[i].id === updatedTask.id) {
      queueItems[i] = updatedTask;
    }
  }
  while (executionQueue.size > 0) {
    executionQueue.dequeue();
  }
  for (i = 0; i < queueItems.length; i += 1) {
    executionQueue.enqueue(queueItems[i]);
  }

  saveState();
  renderAll();
}

function deleteTask(taskId) {
  const deleted = taskList.removeById(taskId);
  if (!deleted) {
    showStatus("Task not found.");
    return;
  }
  deletedStack.push(deleted);

  const queueItems = executionQueue.toArray();
  while (executionQueue.size > 0) {
    executionQueue.dequeue();
  }
  let i;
  for (i = 0; i < queueItems.length; i += 1) {
    if (queueItems[i].id !== taskId) {
      executionQueue.enqueue(queueItems[i]);
    }
  }

  saveState();
  renderAll();
  showStatus(`Deleted "${deleted.title}". Use Undo to restore.`);
}

function undoDelete() {
  const task = deletedStack.pop();
  if (!task) {
    showStatus("Undo stack is empty.");
    return;
  }
  taskList.prepend(task);
  executionQueue.enqueue(task);
  saveState();
  renderAll();
  showStatus(`Restored "${task.title}" from stack.`);
}

function sortByPriority() {
  const tasks = taskList.toArray();
  const sorted = mergeSortTasks(tasks, (a, b) => b.priority - a.priority);
  rebuildStructuresFromTasks(sorted);
  saveState();
  renderTaskList();
  showStatus("Sorted by priority (High to Low) using merge sort.");
}

function sortByDeadline() {
  const tasks = taskList.toArray();
  const sorted = mergeSortTasks(tasks, (a, b) => {
    const dayA = new Date(a.deadline).getTime();
    const dayB = new Date(b.deadline).getTime();
    return dayA - dayB;
  });
  rebuildStructuresFromTasks(sorted);
  saveState();
  renderTaskList();
  showStatus("Sorted by nearest deadline using merge sort.");
}

function showPriorityQueueView() {
  const heap = new MaxHeapPriorityQueue();
  const tasks = taskList.toArray();
  let i;
  for (i = 0; i < tasks.length; i += 1) {
    heap.enqueue(tasks[i]);
  }
  const view = heap.toSortedArrayDesc();
  renderTaskList(view);
  showStatus("Priority Queue view using Max Heap (highest first).");
}

function showQueueView() {
  renderTaskList(executionQueue.toArray());
  showStatus("Queue view in FIFO execution order.");
}

function findTaskByTitle() {
  const query = refs.searchInput.value.trim();
  if (!query) {
    filteredTaskId = null;
    renderTaskList();
    showStatus("Enter a title to search.");
    return;
  }
  const tasks = taskList.toArray();
  const index = linearSearchByTitle(tasks, query);
  if (index < 0) {
    filteredTaskId = null;
    renderTaskList();
    showStatus("No title match found by linear search.");
    return;
  }
  filteredTaskId = tasks[index].id;

  const titleSorted = mergeSortTasks(tasks, (a, b) => {
    if (a.title.toLowerCase() < b.title.toLowerCase()) {
      return -1;
    }
    if (a.title.toLowerCase() > b.title.toLowerCase()) {
      return 1;
    }
    return 0;
  });
  const binaryIndex = binarySearchByExactTitle(titleSorted, query);
  renderTaskList();
  if (binaryIndex >= 0) {
    showStatus("Task found by linear search and exact binary search.");
  } else {
    showStatus("Partial match found by linear search (exact binary did not match).");
  }
}

function clearSearch() {
  refs.searchInput.value = "";
  filteredTaskId = null;
  renderTaskList();
  showStatus("Search cleared.");
}

refs.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = {
    id: refs.taskId.value || createId(),
    title: refs.title.value.trim(),
    priority: Number(refs.priority.value),
    deadline: refs.deadline.value
  };
  if (!task.title || !task.deadline) {
    showStatus("Title and deadline are required.");
    return;
  }
  if (refs.taskId.value) {
    updateTask(task);
    showStatus(`Updated "${task.title}".`);
  } else {
    addTask(task);
    showStatus(`Added "${task.title}" to linked list and queue.`);
  }
  clearForm();
});

refs.cancelEdit.addEventListener("click", () => {
  clearForm();
  showStatus("Edit cancelled.");
});

refs.taskList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const id = target.getAttribute("data-id");
  if (!id) {
    return;
  }
  if (target.classList.contains("delete-btn")) {
    deleteTask(id);
  }
  if (target.classList.contains("edit-btn")) {
    const task = taskList.findById(id);
    if (!task) {
      showStatus("Task no longer exists.");
      return;
    }
    refs.taskId.value = task.id;
    refs.title.value = task.title;
    refs.priority.value = String(task.priority);
    refs.deadline.value = task.deadline;
    refs.cancelEdit.classList.remove("hidden");
    showStatus(`Editing "${task.title}".`);
  }
});

refs.undoDelete.addEventListener("click", undoDelete);
refs.sortPriority.addEventListener("click", sortByPriority);
refs.sortDeadline.addEventListener("click", sortByDeadline);
refs.priorityView.addEventListener("click", showPriorityQueueView);
refs.queueView.addEventListener("click", showQueueView);
refs.searchBtn.addEventListener("click", findTaskByTitle);
refs.clearSearch.addEventListener("click", clearSearch);
refs.themeToggle.addEventListener("click", toggleTheme);

loadTheme();
restoreState();
renderAll();
showStatus("Task Scheduler ready.");
