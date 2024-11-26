let db;
let serialNumber = 1;
let listEntries = {};
let editingName = null;
let editingItem = null;


const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore('listEntries', { keyPath: 'name' });
    objectStore.createIndex('serialNumber', 'serialNumber', { unique: false });
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadEntries();
};

request.onerror = (event) => {
    console.error('Database error:', event.target.error);
};


function loadEntries() {
    const transaction = db.transaction('listEntries', 'readonly');
    const objectStore = transaction.objectStore('listEntries');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
        listEntries = {};
        event.target.result.forEach(entry => {
            listEntries[entry.name] = entry;
        });
        serialNumber = Math.max(...Object.values(listEntries).map(entry => entry.serialNumber), 0) + 1;
        updateListTable();
    };
}


function saveEntries() {
    const transaction = db.transaction('listEntries', 'readwrite');
    const objectStore = transaction.objectStore('listEntries');

    Object.entries(listEntries).forEach(([name, entry]) => {
        objectStore.put({ name, ...entry });
    });
}

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

document.getElementById('isImmediate').addEventListener('change', function() {
    const dueDateField = document.getElementById('dueDateField');
    const isImmediate = this.value === 'yes';
    dueDateField.classList.toggle('hidden', !isImmediate);
    document.getElementById('dueDate').required = isImmediate;
});

document.getElementById('listForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const isImmediate = document.getElementById('isImmediate').value === 'yes';
    const dueDate = document.getElementById('dueDate').value || 'N/A';

    if (editingName) {
        if (name !== editingName) {
            const entry = listEntries[editingName];
            delete listEntries[editingName];
            listEntries[name] = { ...entry, dueDate: isImmediate ? dueDate : 'N/A' };
        } else {
            listEntries[name].dueDate = isImmediate ? dueDate : 'N/A';
        }
        editingName = null;
    } else if (!listEntries[name]) {
        listEntries[name] = { serialNumber, items: [], noOfItems: 0, dueDate: isImmediate ? dueDate : 'N/A' };
        serialNumber++;
    } else {
        alert('This list name already exists!');
        return;
    }
    saveEntries();
    updateListTable();
    this.reset();
    document.getElementById('dueDateField').classList.add('hidden');
    document.getElementById('dueDate').required = false;
});

function addRowToListTable(name, isImmediate, dueDate) {
    const tableBody = document.getElementById('listTable').querySelector('tbody');
    let existingRow = null;
    for (let i = 0; i < tableBody.rows.length; i++) {
        if (tableBody.rows[i].dataset.name === name) {
            existingRow = tableBody.rows[i];
            break;
        }
    }
    let row;
    if (existingRow) {
        row = existingRow;
    } else {
        row = tableBody.insertRow();
        row.dataset.name = name;
    }
    row.innerHTML = `
        <td>${listEntries[name].serialNumber}</td>
        <td><a href="#" onclick="showItemsTab('${name}')">${name}</a></td>
        <td>${isImmediate ? 'yes' : 'no'}</td>
        <td>${isImmediate ? dueDate : 'N/A'}</td>
        <td>${listEntries[name].noOfItems}</td>
        <td>
            <button onclick="editEntry('${name}')">✏️</button>
            <button onclick="confirmDeleteEntry('${name}', this)"> 🗑️</button>
        </td>
    `;
}

function confirmDeleteEntry(name, button) {
    if (confirm('Are you sure you want to delete this entry?')) {
        deleteEntry(name, button);
    }
}

function deleteEntry(name, button) {
    button.closest('tr').remove();
    delete listEntries[name];
    saveEntries();
}

function editEntry(name) {
    const entry = listEntries[name];
    document.getElementById('name').value = name;
    document.getElementById('isImmediate').value = entry.dueDate === 'N/A' ? 'no' : 'yes';
    document.getElementById('dueDate').value = entry.dueDate === 'N/A' ? '' : entry.dueDate;
    document.getElementById('dueDateField').classList.toggle('hidden', entry.dueDate === 'N/A');
    editingName = name;
}

function showItemsTab(listName) {
    showTab('items-tab');
    const container = document.getElementById('items-container');
    container.innerHTML = `
        <h3 id="close">
            List Name: <span id="currentListName">${listName}</span>
            <button onclick="enableListDropdown()"><b>X</b></button>
        </h3>
        <select id="listDropdown" class="hidden">
            <option value="">Select a List</option>
            ${Object.keys(listEntries).map(name => `<option value="${name}">${name}</option>`).join('')}
        </select>
        <form id="itemsForm">
            <input type="hidden" id="listName" value="${listName}">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
            <br>
            <label for="ListName">List:</label>
            <input type="text" id="ListName" name="ListName" value="${listName}" readonly>
            <br><br>
            <button type="submit">Add Item</button>
        </form>
        <h3>Items for ${listName}</h3>
        <table id="itemsTable">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Title</th>
                    <th>List</th>
                    <th>Additional data</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${generateItemsTable(listName)}
            </tbody>
        </table>
    `;

    document.getElementById('itemsForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const listName = document.getElementById('listName').value;

        if (editingItem) { 
            const { listName, itemIndex } = editingItem;
            const item = listEntries[listName].items[itemIndex];
            item.title = title;        
            editingItem = null; 
        } else { 
            const newItem = { title, subItems: [] };
            listEntries[listName].items.push(newItem);
            listEntries[listName].noOfItems++;
        }

        saveEntries(); 
        updateItemsTable(listName); 
        updateNoOfItemsInListTab(listName); 
        this.reset(); 
    });
}

function enableListDropdown() {
    const dropdown = document.getElementById('listDropdown');
    dropdown.classList.toggle('hidden');
    const currentListName = document.getElementById('currentListName');

    dropdown.onchange = function() {
        const selectedList = this.value;
        if (selectedList) {
            currentListName.innerText = selectedList;
            document.getElementById('listName').value = selectedList;
            showItemsTab(selectedList); 
            this.classList.add('hidden'); 
        }
    };
}

function generateItemsTable(listName) {
    const list = listEntries[listName];
    return list.items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.title}</td>
            <td>${listName}</td>
            <td id="subitems-${index}">
                ${item.subItems.length > 0 ? item.subItems.map(subItem => `
                    <div>
                        ${subItem.customFields ? '<br>' + Object.entries(subItem.customFields).map(([key, val]) => `<strong>${key}:</strong> ${val}`).join('<br>') : ''}
                    </div>
                `).join('<br>') : 'None'}
            </td>
            <td style="background-color: #f4f4f4; border: 2px solid transparent;">
                <button type="button" class="accordion-title" onclick="toggleAccordion(this)">Add</button>
                <div class="accordion-content" style="display: none;">
                    <form class="subitem-form" style="background-color:#f4f4f4;">
                        <input type="text" id="customFieldName-${index}" placeholder="Custom Field Name">
                        <input type="text" id="customFieldValue-${index}" placeholder="Custom Field Value">
                        <button type="button" onclick="addSubItem('${listName}', ${index})">Add Sub-item</button>
                    </form>
                </div>
            </td>
            <td>
                <button onclick="editItem('${listName}', ${index})">✏️</button>
                <button onclick="confirmDeleteItem('${listName}', ${index}, this)">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function toggleAccordion(button) {
    const content = button.nextElementSibling;
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function addSubItem(listName, itemIndex) {
    const form = document.querySelector(`#itemsTable tbody tr:nth-child(${itemIndex + 1}) .subitem-form`);
    const inputs = form.querySelectorAll('input');
    const values = Array.from(inputs).map(input => input.value.trim());

    if (values.slice(0, 5).every(value => value)) {
        const newSubItem = { customFields: {} };

        const customFieldName = document.getElementById(`customFieldName-${itemIndex}`).value.trim();
        const customFieldValue = document.getElementById(`customFieldValue-${itemIndex}`).value.trim();
        if (customFieldName) {
            newSubItem.customFields[customFieldName] = customFieldValue || 'N/A';
        }

        listEntries[listName].items[itemIndex].subItems.push(newSubItem);
        updateSubItems(listName, itemIndex);
        inputs.forEach(input => input.value = '');
        saveEntries();
    }
}

function updateSubItems(listName, itemIndex) {
    const subItemsCell = document.getElementById(`subitems-${itemIndex}`);
    const subItems = listEntries[listName].items[itemIndex].subItems || [];

    if (subItems.length === 0) {
        subItemsCell.innerHTML = 'None';
        return;
    }

    subItemsCell.innerHTML = subItems.map(subItem => `
        <div>
            ${subItem.customFields ? Object.entries(subItem.customFields)
                .map(([key, val]) => `<strong>${key}:</strong> ${val}`)
                .join('<br>') : ''}
        </div>
    `).join('<br>');
}

function updateNoOfItemsInListTab(listName) {
    const list = listEntries[listName];
    const row = document.querySelector(`#listTable tbody tr[data-name="${listName}"]`);
    if (row) {
        row.cells[4].innerText = list.noOfItems;
    }
}

function updateItemsTable(listName) {
    const tableBody = document.getElementById('itemsTable').querySelector('tbody');
    tableBody.innerHTML = generateItemsTable(listName);
}

function updateListTable() {
    const tableBody = document.getElementById('listTable').querySelector('tbody');
    tableBody.innerHTML = '';  
    for (const [name, entry] of Object.entries(listEntries).sort((a, b) => a[1].serialNumber - b[1].serialNumber)) {
        addRowToListTable(name, entry.dueDate !== 'N/A', entry.dueDate);
    }
}

function confirmDeleteItem(listName, itemIndex, button) {
    if (confirm('Are you sure you want to delete this item?')) {
        deleteItem(listName, itemIndex, button);
    }
}

function deleteItem(listName, itemIndex, button) {
    const item = listEntries[listName].items[itemIndex];
    listEntries[listName].items.splice(itemIndex, 1);
    listEntries[listName].noOfItems--;
    updateNoOfItemsInListTab(listName); 
    saveEntries(); 
    updateItemsTable(listName); 
}

function editItem(listName, itemIndex) {
    const item = listEntries[listName].items[itemIndex];
    document.getElementById('title').value = item.title;
    editingItem = { listName, itemIndex }; 
}

function showAllItemsTab() {
    showTab('all-items-tab');
    const tableBody = document.getElementById('allItemsTable').querySelector('tbody');
    tableBody.innerHTML = ''; 

    let serialNumber = 1;
    let hasItems = false;

    for (const [listName, list] of Object.entries(listEntries)) {
        if (list.items.length > 0) {
            hasItems = true;
            list.items.forEach(item => {
                const subItemsDisplay = item.subItems.length > 0 
                    ? item.subItems.map(subItem => `
                        <div>
                            ${subItem.customFields ? '<br>' + Object.entries(subItem.customFields).map(([key, val]) => `<strong>${key}:</strong> ${val}`).join('<br>') : ''}
                        </div>
                    `).join('<br>') 
                    : 'None';

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${serialNumber++}</td>
                    <td>${listName}</td>
                    <td>${item.title}</td>
                    <td>${subItemsDisplay}</td>
                    <td>${list.dueDate || 'N/A'}</td>
                `;
            });
        }
    }

    if (!hasItems) {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="5">No items available</td>`;
    }
}

loadEntries();
