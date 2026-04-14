class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length += 1;
  }

  prepend(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.length += 1;
  }

  removeById(id) {
    if (!this.head) {
      return null;
    }
    if (this.head.value.id === id) {
      const removed = this.head.value;
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.length -= 1;
      return removed;
    }

    let previous = this.head;
    let current = this.head.next;
    while (current) {
      if (current.value.id === id) {
        previous.next = current.next;
        if (current === this.tail) {
          this.tail = previous;
        }
        this.length -= 1;
        return current.value;
      }
      previous = current;
      current = current.next;
    }
    return null;
  }

  updateById(id, updater) {
    let current = this.head;
    while (current) {
      if (current.value.id === id) {
        current.value = updater(current.value);
        return current.value;
      }
      current = current.next;
    }
    return null;
  }

  findById(id) {
    let current = this.head;
    while (current) {
      if (current.value.id === id) {
        return current.value;
      }
      current = current.next;
    }
    return null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

class StackNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(value) {
    const node = new StackNode(value);
    node.next = this.top;
    this.top = node;
    this.size += 1;
  }

  pop() {
    if (!this.top) {
      return null;
    }
    const value = this.top.value;
    this.top = this.top.next;
    this.size -= 1;
    return value;
  }

  peek() {
    return this.top ? this.top.value : null;
  }

  toArray() {
    const result = [];
    let current = this.top;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  enqueue(value) {
    const node = new QueueNode(value);
    if (!this.front) {
      this.front = node;
      this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.size += 1;
  }

  dequeue() {
    if (!this.front) {
      return null;
    }
    const value = this.front.value;
    this.front = this.front.next;
    if (!this.front) {
      this.rear = null;
    }
    this.size -= 1;
    return value;
  }

  toArray() {
    const result = [];
    let current = this.front;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

export class MaxHeapPriorityQueue {
  constructor() {
    this.heap = [];
  }

  parentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  leftChildIndex(index) {
    return 2 * index + 1;
  }

  rightChildIndex(index) {
    return 2 * index + 2;
  }

  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  enqueue(value) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(index) {
    let current = index;
    while (current > 0) {
      const parent = this.parentIndex(current);
      if (this.heap[parent].priority >= this.heap[current].priority) {
        break;
      }
      this.swap(parent, current);
      current = parent;
    }
  }

  dequeue() {
    if (this.heap.length === 0) {
      return null;
    }
    if (this.heap.length === 1) {
      return this.heap.pop();
    }
    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return root;
  }

  heapifyDown(index) {
    let current = index;
    while (true) {
      const left = this.leftChildIndex(current);
      const right = this.rightChildIndex(current);
      let largest = current;

      if (
        left < this.heap.length &&
        this.heap[left].priority > this.heap[largest].priority
      ) {
        largest = left;
      }
      if (
        right < this.heap.length &&
        this.heap[right].priority > this.heap[largest].priority
      ) {
        largest = right;
      }
      if (largest === current) {
        break;
      }
      this.swap(current, largest);
      current = largest;
    }
  }

  toSortedArrayDesc() {
    const copy = [];
    let i;
    for (i = 0; i < this.heap.length; i += 1) {
      copy.push(this.heap[i]);
    }

    const tempHeap = new MaxHeapPriorityQueue();
    for (i = 0; i < copy.length; i += 1) {
      tempHeap.enqueue(copy[i]);
    }

    const result = [];
    let item = tempHeap.dequeue();
    while (item) {
      result.push(item);
      item = tempHeap.dequeue();
    }
    return result;
  }
}

export function mergeSortTasks(tasks, comparator) {
  if (tasks.length <= 1) {
    return tasks;
  }
  const mid = Math.floor(tasks.length / 2);
  const left = mergeSortTasks(tasks.slice(0, mid), comparator);
  const right = mergeSortTasks(tasks.slice(mid), comparator);
  return merge(left, right, comparator);
}

function merge(left, right, comparator) {
  const sorted = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (comparator(left[i], right[j]) <= 0) {
      sorted.push(left[i]);
      i += 1;
    } else {
      sorted.push(right[j]);
      j += 1;
    }
  }
  while (i < left.length) {
    sorted.push(left[i]);
    i += 1;
  }
  while (j < right.length) {
    sorted.push(right[j]);
    j += 1;
  }
  return sorted;
}

export function linearSearchByTitle(tasks, title) {
  const needle = title.trim().toLowerCase();
  let i;
  for (i = 0; i < tasks.length; i += 1) {
    if (tasks[i].title.toLowerCase().includes(needle)) {
      return i;
    }
  }
  return -1;
}

export function binarySearchByExactTitle(sortedTasks, title) {
  const needle = title.trim().toLowerCase();
  let left = 0;
  let right = sortedTasks.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = sortedTasks[mid].title.toLowerCase();
    if (current === needle) {
      return mid;
    }
    if (current < needle) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}
