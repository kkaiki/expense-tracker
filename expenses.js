// Load existing tabs when the page loads
document.addEventListener('DOMContentLoaded', loadTabs);

function getDates() {
    const savedTabs = JSON.parse(localStorage.getItem('dates')) || [];

    // Sort tabs by date
    savedTabs.sort((a, b) => {
        const [monthA, yearA] = a.monthYear.split('-');
        const [monthB, yearB] = b.monthYear.split('-');

        const months = Array.from({ length: 12 }, (_, i) =>
            new Date(2000, i).toLocaleString('default', { month: 'long' })
        );

        if (yearA !== yearB) {
            return yearA - yearB;
        }
        return months.indexOf(monthA) - months.indexOf(monthB);
    });

    return savedTabs;
}

function loadTabs() {
    const savedDates = getDates();

    // Clear existing tabs
    document.getElementById('datesTab').innerHTML = '';

    savedDates.forEach(dateInfo => {
        createTab(dateInfo.monthYear, dateInfo.tabId);
    });

    // Activate first tab if exists
    const firstTab = document.querySelector('.nav-link');
    if (firstTab) {
        firstTab.classList.add('active');
        firstTab.click()
    }
}

function createTab(monthYear, tabId) {
    const tabButton = `
        <li class="nav-item" role="presentation" onclick="clickTab('${tabId}')">
            <div class="nav-link position-relative d-flex align-items-center" 
                    id="${tabId}-tab" 
                    data-bs-toggle="tab" 
                    data-bs-target="#${tabId}-pane" 
                    role="tab"
                    onclick="activateTab('${tabId}')">
                <span>${monthYear}</span>
                <button class="btn btn-sm btn-danger ms-2" 
                        onclick="deleteTab('${tabId}')">×</button>
            </div>
        </li>
    `;

    document.getElementById('datesTab').insertAdjacentHTML('beforeend', tabButton);
}

function clickTab(tabId) {
    const firstTab = document.querySelector('#optionsTab .nav-link');
    if (firstTab) {
        firstTab.click();
    }

    activateTab(tabId);
    createHtmlContent(tabId);
    loadContent(tabId);
}

function addNewTab() {
    // Populate months dropdown
    const monthSelect = document.getElementById('monthInput');
    if (monthSelect.options.length === 1) { // Only populate if not already done
        const months = Array.from({ length: 12 }, (_, i) =>
            new Date(2000, i).toLocaleString('default', { month: 'long' })
        );
        months.forEach(month => {
            const option = new Option(month, month);
            monthSelect.add(option);
        });
    }

    // Set default year to current year
    document.getElementById('yearInput').value = new Date().getFullYear();

    // Clear any previous validation messages
    document.getElementById('validationMessage').textContent = '';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newTabModal'));
    modal.show();
}

function validateAndCreateDate() {
    const monthInput = document.getElementById('monthInput');
    const yearInput = document.getElementById('yearInput');
    const validationMessage = document.getElementById('validationMessage');

    // Basic validation
    if (!monthInput.value || !yearInput.value) {
        validationMessage.textContent = 'Please select both month and year.';
        return;
    }

    const year = parseInt(yearInput.value);
    if (year < 2000 || year > 2100) {
        validationMessage.textContent = 'Please enter a year between 2000 and 2100.';
        return;
    }

    const monthYear = `${monthInput.value}-${year}`;

    // Check if tab already exists
    const savedTabs = JSON.parse(localStorage.getItem('dates')) || [];
    if (savedTabs.some(tab => tab.monthYear === monthYear)) {
        validationMessage.textContent = 'This month/year combination already exists.';
        return;
    }

    // Create new tab
    const tabId = `tab-${Date.now()}`;

    // Save to localStorage and sort
    const updatedTabs = JSON.parse(localStorage.getItem('dates')) || [];
    updatedTabs.push({ monthYear, tabId });
    localStorage.setItem('dates', JSON.stringify(updatedTabs));

    // Reload all tabs to maintain order
    loadTabs();
    activateTab(tabId);

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newTabModal'));
    modal.hide();
}

function createDataObject(tabId) {
    // Initialize data structure for this tab if it doesn't exist
    const storageKey = `expenses-${tabId}`;
    if (!localStorage.getItem(storageKey)) {
        const initialData = {
            income: 0,
            budget: {
            },
            expenses: [],
            resume: {
                total: 0,
                category: {
                }
            }
        };
        localStorage.setItem(storageKey, JSON.stringify(initialData));
    }
}

function addNewBudget(tabId, event) {
    event.preventDefault();

    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    const category = document.getElementById(`new-category-${tabId}`).value;
    const budget = parseFloat(document.getElementById(`new-budget-${tabId}`).value) || 0;

    // Check if category already exists
    if (data.budget[category]) {
        alert('This category already exists!');
        return;
    }

    // Add new budget category
    data.budget[category] = budget;

    // Initialize category in resume if it doesn't exist
    if (!data.resume.category[category]) {
        data.resume.category[category] = 0;
    }

    localStorage.setItem(storageKey, JSON.stringify(data));

    // Reset form and refresh display
    event.target.reset();
    loadCategories(tabId);
    refreshAll(tabId);
}

function loadCategories(tabId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));
    const categories = Object.keys(data.budget);

    let options = '<option value="">Select Category</option>';
    options += categories.map(category =>
        `<option value="${category}">${category}</option>`
    ).join('')

    document.getElementById(`category-${tabId}`).innerHTML = options;
}

function createHtmlContent(tabId) {
    createDataObject(tabId);

    document.getElementById('expensesTabContent').innerHTML = '';

    const tabContent = `
        <div id="${tabId}-pane">
            <div class="p-3">
                <!-- Income and Budget Section -->
                <div class="mb-3">
                    <label>Monthly Income:</label>
                    <input type="number" id="income-${tabId}" class="form-control" 
                           onchange="updateIncome('${tabId}')">
                </div>

                <!-- Add Budget Accordion Form -->
                <div class="accordion accordion-flush" id="budget-accordion-${tabId}">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" 
                                  data-bs-toggle="collapse" 
                                  data-bs-target="#flush-collapseOne" 
                                  aria-expanded="false" 
                                  aria-controls="flush-collapseOne"
                                  style="background-color: #ffebee;">
                            Budgets
                          </button>
                        </h2>

                        <div id="flush-collapseOne" class="accordion-collapse collapse" 
                             data-bs-parent="#budget-accordion-${tabId}"
                             style="background-color: #ffebee;">
                            <div class="accordion-body" id="budget-form-${tabId}">   
                                <!-- Budget will be populated by refreshBudget function -->
                            </div>
                            <!-- Add new budget category form -->
                            <div class="accordion-body">
                                <form onsubmit="addNewBudget('${tabId}', event)" class="mb-3">
                                    <div class="row align-items-end">
                                        <div class="col">
                                            <label>New Category:</label>
                                            <input type="text" class="form-control" id="new-category-${tabId}" required>
                                        </div>
                                        <div class="col">
                                            <label>Budget Amount:</label>
                                            <input type="number" class="form-control" id="new-budget-${tabId}" required>
                                        </div>
                                        <div class="col">
                                            <button type="submit" class="btn btn-primary">Add Budget</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <br/>

                <!-- Expenses Summary -->
                <div id="summary-${tabId}" class="mb-3">
                    <!-- Summary will be populated by refreshSummary function -->
                </div>

                 <!-- Add Expense Form -->
                <form onsubmit="addExpense('${tabId}', event)" class="mb-3">
                    <div class="row">
                        <div class="col">
                            <input type="number" class="form-control" placeholder="Amount" 
                                   id="amount-${tabId}" required>
                        </div>
                        <div class="col">
                            <select class="form-control" id="category-${tabId}" required>
                            </select>
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" placeholder="Description" 
                                   id="description-${tabId}" required>
                        </div>
                        <div class="col">
                            <input type="date" class="form-control" placeholder="Date" 
                                   id="date-${tabId}" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="col">
                            <button type="submit" class="btn btn-primary">Add Expense</button>
                        </div>
                    </div>
                </form>

                <!-- Expenses List -->
                <div id="expenses-list-${tabId}">
                    <!-- Expenses will be populated by refreshExpenses function -->
                </div>
            </div>
        </div>
    `;

    document.getElementById('expensesTabContent').insertAdjacentHTML('beforeend', tabContent);
    loadCategories(tabId);
}

function activateTab(tabId) {
    localStorage.setItem('activeTab', tabId.split('-')[1]);
}

function deleteTab(tabId) {
    event.stopPropagation(); // Prevent tab switching when clicking delete button

    // Remove from localStorage
    const savedTabs = JSON.parse(localStorage.getItem('dates')) || [];
    const updatedTabs = savedTabs.filter(tab => tab.tabId !== tabId);
    localStorage.setItem('dates', JSON.stringify(updatedTabs));

    // Remove tab and its content from DOM
    document.getElementById(`${tabId}-tab`).parentElement.remove();
    document.getElementById(`${tabId}-pane`).remove();

    // If the deleted tab was active, activate the first remaining tab
    const remainingTabs = document.querySelectorAll('.nav-link');
    if (remainingTabs.length > 0) {
        const firstTab = remainingTabs[0];
        firstTab.classList.add('active');
        document.querySelector(firstTab.dataset.bsTarget).classList.add('show', 'active');
    }
}

function addExpense(tabId, event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById(`amount-${tabId}`).value);
    const category = document.getElementById(`category-${tabId}`).value;
    checkBudgetAlert(tabId, category, amount)

    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    const expense = {
        id: Date.now().toString(),
        amount: parseFloat(document.getElementById(`amount-${tabId}`).value),
        category: document.getElementById(`category-${tabId}`).value,
        description: document.getElementById(`description-${tabId}`).value,
        date: document.getElementById(`date-${tabId}`).value
    };

    data.expenses.push(expense);
    updateResume(data);
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Reset form and refresh display
    event.target.reset();
    refreshAll(tabId);
}

function updateResume(data) {
    // Reset resume with dynamic categories
    data.resume = {
        total: 0,
        category: Object.keys(data.budget).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {})
    };

    // Calculate totals
    data.expenses.forEach(expense => {
        data.resume.total += expense.amount;
        data.resume.category[expense.category] += expense.amount;
    });
}

function refreshBudget(data, tabId) {
    let budgetHtml = '';
    Object.keys(data.budget).forEach(category => {
        budgetHtml += `<form onsubmit="updateBudget('${tabId}', '${category}')" class="mb-3">
                    <div class="row">
                        <label>${category}</label>
                        <div class="col">
                            <input type="number" class="form-control" placeholder="Budget" 
                                   id="budget-${category}-${tabId}" value="${data.budget[category] || 0}" required>
                        </div>
                        <div class="col">
                            <button type="submit" class="btn btn-primary">Update Budget</button>
                        </div>
                    </div>
                </form>`
    });

    document.getElementById(`budget-form-${tabId}`).innerHTML = budgetHtml;
}

function refreshSummary(data, tabId) {
    let categoryBudgetHtml = '';
    Object.keys(data.resume.category).forEach(category => {
        categoryBudgetHtml += `
             <p>${category} Expenses: $${data.resume.category[category]} / $${data.budget[category] || 0} Budget</p>
         `;
    });

    const summaryHtml = `
         <div class="card">
             <div class="card-body">
                 <h5>Summary</h5>
                 <p>Total Expenses: $${data.resume.total}</p>
                 ${categoryBudgetHtml}
                 <p>Remaining Income: $${data.income - data.resume.total}</p>
             </div>
         </div>
     `;

    document.getElementById(`summary-${tabId}`).innerHTML = summaryHtml;
}

function refreshExpenses(data, tabId) {
    const expensesHtml = data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => `
        <div class="card mb-2 expense-card">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <div class="expense-title">
                            <input type="text" 
                                   value="${expense.description}" 
                                   onchange="updateExpenseField('${tabId}', '${expense.id}', 'description', this.value)"
                                   class="seamless-input fw-bold" 
                                   style="background: transparent; border: none; width: 100%;">
                        </div>
                        <div class="expense-details">
                            <select onchange="updateExpenseField('${tabId}', '${expense.id}', 'category', this.value)"
                                    class="seamless-input text-muted" 
                                    style="background: transparent; border: none; padding: 0;">
                                ${Object.keys(data.budget).map(cat =>
        `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`
    ).join('')}
                            </select>
                            <small class="text-muted ms-2">
                            <input type="date" 
                                   value="${expense.date}" 
                                   onfocusout="updateExpenseField('${tabId}', '${expense.id}', 'date', this.value)"
                                   class="seamless-input" 
                                   style="background: transparent; border: none;">
                            </small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="text-muted me-1">$</span>
                        <input type="number" 
                               value="${expense.amount}" 
                               onchange="updateExpenseField('${tabId}', '${expense.id}', 'amount', this.value)"
                               class="seamless-input text-end fw-bold" 
                               style="background: transparent; border: none; width: 100px;">
                        <button class="btn btn-outline-danger ms-2 px-3 py-2 text-dark d-flex align-items-center justify-content-center" 
                            style="min-width: 44px; height: 24px;"
                            onclick="deleteExpense('${tabId}', '${expense.id}')"
                            title="Delete">
                            <i class="bi bi-trash"></i>
                            <span class="ms-1">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById(`expenses-list-${tabId}`).innerHTML = expensesHtml;
}

function refreshAll(tabId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    refreshBudget(data, tabId);
    refreshSummary(data, tabId);
    refreshExpenses(data, tabId);
}

function loadContent(tabId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    // Load saved values
    document.getElementById(`income-${tabId}`).value = data.income;

    // Load budget inputs for existing categories
    Object.keys(data.budget).forEach(category => {
        const budgetInput = document.getElementById(`budget-${category}-${tabId}`);
        if (budgetInput) {
            budgetInput.value = data.budget[category];
        }
    });

    refreshAll(tabId);
}

function updateIncome(tabId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));
    data.income = parseFloat(document.getElementById(`income-${tabId}`).value) || 0;
    localStorage.setItem(storageKey, JSON.stringify(data));
    refreshAll(tabId);
}

function updateBudget(tabId, category) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));
    data.budget[category] = parseFloat(document.getElementById(`budget-${category}-${tabId}`).value) || 0;
    localStorage.setItem(storageKey, JSON.stringify(data));
    refreshAll(tabId);
}

function deleteExpense(tabId, expenseId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId);
    updateResume(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
    refreshAll(tabId);
}

function updateExpenseField(tabId, expenseId, field, value) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    const expenseIndex = data.expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex === -1) return;

    if (field === 'amount') {
        value = parseFloat(value) || 0;
    } else if (field === 'category') {
        const amount = data.expenses[expenseIndex].amount;
        if (!checkBudgetAlert(tabId, value, amount, expenseId)) {
            return;
        }
    }

    data.expenses[expenseIndex][field] = value;
    updateResume(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
    refreshAll(tabId);
}

function checkBudgetAlert(tabId, category, newAmount, expenseId) {
    const storageKey = `expenses-${tabId}`;
    const data = JSON.parse(localStorage.getItem(storageKey));

    const currentTotal = data.expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => {
            if (exp.id === expenseId) return sum;
            return sum + exp.amount;
        }, 0);

    const budget = data.budget[category] || 0;

    if (budget > 0 && (currentTotal + newAmount) > budget) {
        const overAmount = (currentTotal + newAmount - budget);
        const message = `${category}: Budget will be exceeded by $${overAmount}\nDo you want to continue?`;
        return confirm(message);
    }
    return true;
}
