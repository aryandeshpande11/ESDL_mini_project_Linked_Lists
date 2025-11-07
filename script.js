// script.js — Linked List Virtual Lab
// Contains Node & LinkedList classes, testing, and DOM integration (render & event handlers).

/* -----------------------
   Data structure section
   ----------------------- */

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  insertAtBeginning(data) {
    const node = new Node(data);
    node.next = this.head;
    this.head = node;
    this.length++;
    return true;
  }

  insertAtEnd(data) {
    const node = new Node(data);
    if (!this.head) {
      this.head = node;
      this.length++;
      return true;
    }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
    this.length++;
    return true;
  }

  insertAt(data, position) {
    // position: 0-based insertion index. If position == length => append.
    if (position < 0 || position > this.length) {
      console.warn(`Invalid position ${position}. Valid range: 0..${this.length}`);
      return false;
    }
    if (position === 0) return this.insertAtBeginning(data);
    if (position === this.length) return this.insertAtEnd(data);

    const node = new Node(data);
    let prev = null;
    let cur = this.head;
    let idx = 0;
    while (idx < position) {
      prev = cur;
      cur = cur.next;
      idx++;
    }
    prev.next = node;
    node.next = cur;
    this.length++;
    return true;
  }

  deleteFromBeginning() {
    if (!this.head) return null;
    const removed = this.head;
    this.head = this.head.next;
    removed.next = null;
    this.length--;
    return removed.data;
  }

  deleteFromEnd() {
    if (!this.head) return null;
    if (!this.head.next) {
      const val = this.head.data;
      this.head = null;
      this.length--;
      return val;
    }
    let prev = null;
    let cur = this.head;
    while (cur.next) {
      prev = cur;
      cur = cur.next;
    }
    prev.next = null;
    this.length--;
    return cur.data;
  }

  search(data) {
    // returns { index, node } of first match, or null
    let cur = this.head;
    let idx = 0;
    while (cur) {
      if (String(cur.data) === String(data)) return { index: idx, node: cur };
      cur = cur.next;
      idx++;
    }
    return null;
  }

  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) { arr.push(cur.data); cur = cur.next; }
    return arr;
  }

  clear() {
    this.head = null;
    this.length = 0;
  }
}

/* -----------------------
   Quick logic tests (console)
   ----------------------- */

(function logicSelfTest(){
  const ll = new LinkedList();
  console.log('--- LinkedList Self Test START ---');

  console.assert(ll.length === 0, 'empty length');
  ll.insertAtEnd(1); ll.insertAtEnd(2); ll.insertAtBeginning(0);
  console.assert(ll.toArray().join(',') === '0,1,2', 'insert sequence ok');

  ll.insertAt('X', 1); // 0, X, 1, 2
  console.assert(ll.toArray().join(',') === '0,X,1,2', 'insertAt middle ok');

  const del1 = ll.deleteFromBeginning(); // removes 0
  console.assert(del1 === 0, 'delete beginning ok');

  const del2 = ll.deleteFromEnd(); // removes 2
  console.assert(del2 === 2, 'delete end ok');

  console.assert(ll.search('X').index === 0 || ll.search('X').index === 1, 'search returns something');

  ll.clear();
  console.assert(ll.length === 0 && ll.head === null, 'clear ok');

  console.log('--- LinkedList Self Test END ---');
})();

/* -----------------------
   DOM + Render + Events
   ----------------------- */

const app = {
  ll: new LinkedList(),
  dom: {
    trainArea: null,
    lengthSpan: null,
    valueInput: null,
    posInput: null,
    searchInput: null,
    animateToggle: null
  },
  lastHighlightedIndex: null
};

function createEngineElement() {
  const engine = document.createElement('div');
  engine.className = 'engine';
  engine.innerHTML = `<div class="label">ENGINE (head)</div>`;
  return engine;
}

function createConnector() {
  const c = document.createElement('div');
  c.className = 'connector';
  return c;
}

function createCarriageElement(value, idx) {
  const c = document.createElement('div');
  c.className = 'carriage';
  c.dataset.index = idx;
  c.innerHTML = `<div class="value">${escapeHtml(String(value))}</div>`;
  return c;
}

// very small utility to avoid raw HTML injections of user-supplied text
function escapeHtml(s) {
  return s.replace(/[&<>"'`=\/]/g, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
}

function render(animate = true) {
  const area = app.dom.trainArea;
  // clear existing but preserve scroll
  const prevScroll = area.scrollLeft;
  while (area.firstChild) area.removeChild(area.firstChild);

  // Engine
  const engine = createEngineElement();
  area.appendChild(engine);

  // if empty show placeholder
  if (!app.ll.head) {
    const placeholder = document.createElement('div');
    placeholder.style.marginLeft = '12px';
    placeholder.style.color = '#64748b';
    placeholder.textContent = 'The train is empty. Add a carriage!';
    area.appendChild(placeholder);
    updateLength();
    return;
  }

  // iterate nodes
  let cur = app.ll.head;
  let idx = 0;
  while (cur) {
    // connector
    const conn = createConnector();
    area.appendChild(conn);

    // carriage
    const carr = createCarriageElement(cur.data, idx);
    if (animate && app.dom.animateToggle.checked) {
      carr.classList.add('fade-in');
    }
    area.appendChild(carr);

    // highlight if needed
    if (app.lastHighlightedIndex === idx) {
      setTimeout(()=> carr.classList.add('highlight'), 20);
    }

    cur = cur.next;
    idx++;
  }

  // update length
  updateLength();
  // restore scroll
  setTimeout(()=> { area.scrollLeft = Math.max(0, area.scrollWidth - area.clientWidth); }, 40);
}

function updateLength() {
  app.dom.lengthSpan.textContent = app.ll.length;
}

/* Event handlers */
function setupDOMRefs() {
  app.dom.trainArea = document.getElementById('trainArea');
  app.dom.lengthSpan = document.getElementById('lengthSpan');
  app.dom.valueInput = document.getElementById('valueInput');
  app.dom.posInput = document.getElementById('posInput');
  app.dom.searchInput = document.getElementById('searchInput');
  app.dom.animateToggle = document.getElementById('animateToggle');

  // Buttons
  document.getElementById('insertBeginningBtn').addEventListener('click', ()=>{
    const v = app.dom.valueInput.value.trim();
    if (v === '') return flashInput(app.dom.valueInput);
    app.ll.insertAtBeginning(v);
    app.lastHighlightedIndex = 0;
    render(true);
    clearInputs();
  });

  document.getElementById('insertEndBtn').addEventListener('click', ()=>{
    const v = app.dom.valueInput.value.trim();
    if (v === '') return flashInput(app.dom.valueInput);
    app.ll.insertAtEnd(v);
    app.lastHighlightedIndex = app.ll.length - 1;
    render(true);
    clearInputs();
  });

  document.getElementById('insertAtBtn').addEventListener('click', ()=>{
    const v = app.dom.valueInput.value.trim();
    const posRaw = parseInt(app.dom.posInput.value);
    const pos = Number.isFinite(posRaw) ? posRaw : NaN;
    if (v === '') return flashInput(app.dom.valueInput);
    if (!Number.isFinite(pos)) return flashInput(app.dom.posInput);
    const ok = app.ll.insertAt(v, pos);
    if (!ok) {
      flashInvalid(app.dom.posInput);
      return;
    }
    app.lastHighlightedIndex = pos;
    render(true);
    clearInputs();
  });

  document.getElementById('deleteBeginningBtn').addEventListener('click', ()=>{
    if (!app.ll.head) return vibrateArea();
    const removed = app.ll.deleteFromBeginning();
    flashAction(`${removed} removed from beginning`);
    app.lastHighlightedIndex = null;
    render(true);
  });

  document.getElementById('deleteEndBtn').addEventListener('click', ()=>{
    if (!app.ll.head) return vibrateArea();
    const removed = app.ll.deleteFromEnd();
    flashAction(`${removed} removed from end`);
    app.lastHighlightedIndex = null;
    render(true);
  });

  document.getElementById('clearBtn').addEventListener('click', ()=>{
    app.ll.clear();
    app.lastHighlightedIndex = null;
    render(true);
  });

  document.getElementById('searchBtn').addEventListener('click', ()=>{
    const v = app.dom.searchInput.value.trim();
    if (v === '') return flashInput(app.dom.searchInput);
    const res = app.ll.search(v);
    if (!res) {
      flashAction(`Value not found: ${v}`);
      app.lastHighlightedIndex = null;
      render(true);
      return;
    }
    app.lastHighlightedIndex = res.index;
    render(true);
    flashAction(`Found '${v}' at index ${res.index}`);
  });

  document.getElementById('resetHighlightBtn').addEventListener('click', ()=>{
    app.lastHighlightedIndex = null;
    render(false);
  });

  document.getElementById('downloadStateBtn').addEventListener('click', ()=>{
    const state = { array: app.ll.toArray(), length: app.ll.length, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linked_list_state.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // keyboard enter convenience
  [app.dom.valueInput, app.dom.searchInput].forEach(inp => {
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('insertEndBtn').click(); });
  });

  // click-to-search carriage highlight
  app.dom.trainArea.addEventListener('click', (ev) => {
    const node = ev.target.closest('.carriage');
    if (!node) return;
    const idx = Number(node.dataset.index);
    app.lastHighlightedIndex = idx;
    render(false);
  });
}

/* tiny UX helpers */

function flashInput(el) {
  el.classList.add('invalid');
  el.style.outline = '2px solid rgba(239,68,68,0.12)';
  setTimeout(()=> { el.classList.remove('invalid'); el.style.outline = ''; }, 700);
}

function flashInvalid(el) {
  flashInput(el);
  flashAction('Invalid position');
}

function vibrateArea() {
  const area = app.dom.trainArea;
  area.style.transition = 'transform 80ms';
  area.style.transform = 'translateX(-6px)';
  setTimeout(()=> { area.style.transform = 'translateX(6px)'; }, 80);
  setTimeout(()=> { area.style.transform = ''; }, 160);
}

function flashAction(msg) {
  // small ephemeral toast using console (keeps UI simple)
  console.log('[Train Lab] ' + msg);
}

/* helper to clear inputs */
function clearInputs() {
  app.dom.valueInput.value = '';
  app.dom.posInput.value = '';
  app.dom.searchInput.value = '';
}

/* initialize app */
document.addEventListener('DOMContentLoaded', () => {
  setupDOMRefs();
  // optional: preload some nodes for demo
  app.ll.insertAtEnd('A');
  app.ll.insertAtEnd('B');
  app.ll.insertAtEnd('C');
  render(false);
});
