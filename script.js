"use strict";

/* =========================================
   EXPENSEFLOW — DAY 42
   Interactive Expense Tracker
========================================= */

const STORAGE_KEY = "expenseflow_expenses_v2";

let expenses = [];
let editingId = null;


/* =========================================
   DOM REFERENCES
========================================= */

const expenseForm = document.getElementById("expenseForm");

const expenseIdInput = document.getElementById("expenseId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const sortSelect = document.getElementById("sortSelect");

const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const visibleCount = document.getElementById("visibleCount");
const categoryCount = document.getElementById("categoryCount");

const categorySummary = document.getElementById("categorySummary");

const currentYear = document.getElementById("currentYear");


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadExpenses();

  setToday();

  currentYear.textContent = new Date().getFullYear();

  render();

  expenseForm.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", resetForm);

  clearAllBtn.addEventListener("click", clearAllExpenses);

  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);
  dateFilter.addEventListener("change", render);
  sortSelect.addEventListener("change", render);

  expenseList.addEventListener("click", handleExpenseActions);

  document.addEventListener("keydown", handleKeyboard);

  updateSubmitState();
}


/* =========================================
   LOCAL STORAGE
========================================= */

function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      expenses = [];
      return;
    }

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      expenses = parsed.filter(isValidExpense);
    } else {
      expenses = [];
    }

  } catch (error) {
    console.error("Unable to load expenses:", error);
    expenses = [];
  }
}


function saveExpenses() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(expenses)
    );

  } catch (error) {
    console.error("Unable to save expenses:", error);

    showMessage(
      "Unable to save data in browser storage.",
      "error"
    );
  }
}


function isValidExpense(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    Number.isFinite(Number(item.amount)) &&
    typeof item.category === "string" &&
    typeof item.date === "string"
  );
}


/* =========================================
   DATE
========================================= */

function setToday() {
  if (!dateInput.value) {
    const today = new Date();

    dateInput.value = formatInputDate(today);
  }
}


function formatInputDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


/* =========================================
   FORM SUBMISSION
========================================= */

function handleSubmit(event) {
  event.preventDefault();

  clearErrors();

  const data = getFormData();

  if (!validateForm(data)) {
    return;
  }

  if (editingId) {
    updateExpense(data);
  } else {
    addExpense(data);
  }
}


function getFormData() {
  return {
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value
  };
}


/* =========================================
   VALIDATION
========================================= */

function validateForm(data) {
  let valid = true;

  if (!data.title) {
    setFieldError(
      "titleError",
      "Please enter an expense title."
    );

    valid = false;
  }

  if (
    !Number.isFinite(data.amount) ||
    data.amount <= 0
  ) {
    setFieldError(
      "amountError",
      "Enter an amount greater than ₹0."
    );

    valid = false;
  }

  if (!data.category) {
    setFieldError(
      "categoryError",
      "Please select a category."
    );

    valid = false;
  }

  if (!data.date) {
    setFieldError(
      "dateError",
      "Please select a date."
    );

    valid = false;
  }

  return valid;
}


function setFieldError(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
  }
}


function clearErrors() {
  document.querySelectorAll(".field-error").forEach(
    element => {
      element.textContent = "";
    }
  );
}


/* =========================================
   ADD EXPENSE
========================================= */

function addExpense(data) {
  const expense = {
    id: generateId(),
    title: data.title,
    amount: data.amount,
    category: data.category,
    date: data.date,
    createdAt: Date.now()
  };

  expenses.push(expense);

  saveExpenses();

  render();

  resetForm();

  showMessage(
    "Expense added successfully.",
    "success"
  );
}


/* =========================================
   UPDATE EXPENSE
========================================= */

function updateExpense(data) {
  const index = expenses.findIndex(
    expense => expense.id === editingId
  );

  if (index === -1) {
    showMessage(
      "Expense could not be found.",
      "error"
    );

    resetForm();
    return;
  }

  expenses[index] = {
    ...expenses[index],
    title: data.title,
    amount: data.amount,
    category: data.category,
    date: data.date
  };

  saveExpenses();

  render();

  resetForm();

  showMessage(
    "Expense updated successfully.",
    "success"
  );
}


/* =========================================
   ID GENERATOR
========================================= */

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}


/* =========================================
   RESET FORM
========================================= */

function resetForm() {
  expenseForm.reset();

  editingId = null;

  expenseIdInput.value = "";

  formTitle.textContent = "Add New Expense";

  submitBtn.textContent = "Add Expense";

  clearErrors();

  setToday();

  updateSubmitState();
}


function updateSubmitState() {
  submitBtn.disabled = false;
}


/* =========================================
   EDIT / DELETE
========================================= */

function handleExpenseActions(event) {
  const button = event.target.closest(
    "button[data-action]"
  );

  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (!id) {
    return;
  }

  if (action === "edit") {
    editExpense(id);
  }

  if (action === "delete") {
    deleteExpense(id);
  }
}


function editExpense(id) {
  const expense = expenses.find(
    item => item.id === id
  );

  if (!expense) {
    return;
  }

  editingId = id;

  expenseIdInput.value = id;

  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;

  formTitle.textContent = "Edit Expense";

  submitBtn.textContent = "Update Expense";

  clearErrors();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function deleteExpense(id) {
  const expense = expenses.find(
    item => item.id === id
  );

  if (!expense) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${expense.title}"?`
  );

  if (!confirmed) {
    return;
  }

  expenses = expenses.filter(
    item => item.id !== id
  );

  saveExpenses();

  render();

  if (editingId === id) {
    resetForm();
  }

  showMessage(
    "Expense deleted successfully.",
    "success"
  );
}


/* =========================================
   CLEAR ALL
========================================= */

function clearAllExpenses() {
  if (expenses.length === 0) {
    showMessage(
      "There are no expenses to clear.",
      "error"
    );

    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete all expense records?"
  );

  if (!confirmed) {
    return;
  }

  expenses = [];

  saveExpenses();

  resetForm();

  render();

  showMessage(
    "All expense records have been cleared.",
    "success"
  );
}


/* =========================================
   FILTERING
========================================= */

function getFilteredExpenses() {
  const searchTerm =
    searchInput.value.trim().toLowerCase();

  const selectedCategory =
    categoryFilter.value;

  const selectedDate =
    dateFilter.value;

  let result = [...expenses];

  /* SEARCH */

  if (searchTerm) {
    result = result.filter(expense =>
      expense.title.toLowerCase().includes(searchTerm) ||
      expense.category.toLowerCase().includes(searchTerm)
    );
  }


  /* CATEGORY */

  if (selectedCategory !== "all") {
    result = result.filter(
      expense =>
        expense.category === selectedCategory
    );
  }


  /* DATE */

  if (selectedDate !== "all") {
    result = result.filter(
      expense => matchesDateFilter(
        expense.date,
        selectedDate
      )
    );
  }


  /* SORT */

  result.sort(
    createSortFunction(sortSelect.value)
  );

  return result;
}


/* =========================================
   DATE FILTER LOGIC
========================================= */

function matchesDateFilter(
  expenseDate,
  filter
) {
  const today = new Date();

  const expense = new Date(
    `${expenseDate}T00:00:00`
  );

  if (Number.isNaN(expense.getTime())) {
    return false;
  }


  if (filter === "today") {
    return (
      formatInputDate(expense) ===
      formatInputDate(today)
    );
  }


  if (filter === "week") {
    const start = new Date(today);

    start.setHours(0, 0, 0, 0);

    start.setDate(
      start.getDate() - 6
    );

    const end = new Date(today);

    end.setHours(23, 59, 59, 999);

    return (
      expense >= start &&
      expense <= end
    );
  }


  if (filter === "month") {
    return (
      expense.getFullYear() ===
        today.getFullYear() &&
      expense.getMonth() ===
        today.getMonth()
    );
  }


  return true;
}


/* =========================================
   SORTING
========================================= */

function createSortFunction(sortType) {

  switch (sortType) {

    case "oldest":
      return (a, b) =>
        dateValue(a) - dateValue(b);

    case "high":
      return (a, b) =>
        Number(b.amount) -
        Number(a.amount);

    case "low":
      return (a, b) =>
        Number(a.amount) -
        Number(b.amount);

    case "az":
      return (a, b) =>
        a.title.localeCompare(
          b.title,
          "en",
          { sensitivity: "base" }
        );

    case "newest":
    default:
      return (a, b) =>
        dateValue(b) - dateValue(a);
  }
}


function dateValue(expense) {
  const value = new Date(
    `${expense.date}T00:00:00`
  ).getTime();

  return Number.isNaN(value)
    ? 0
    : value;
}


/* =========================================
   RENDER
========================================= */

function render() {
  const filteredExpenses =
    getFilteredExpenses();

  renderExpenseList(filteredExpenses);

  updateStatistics(filteredExpenses);

  renderCategorySummary(filteredExpenses);
}


/* =========================================
   EXPENSE LIST RENDERING
========================================= */

function renderExpenseList(items) {

  expenseList.replaceChildren();

  if (items.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");


  items.forEach(expense => {

    const article =
      document.createElement("article");

    article.className = "expense-item";


    const main =
      document.createElement("div");

    main.className = "expense-main";


    const title =
      document.createElement("h4");

    title.className = "expense-title";

    title.textContent = expense.title;


    const meta =
      document.createElement("div");

    meta.className = "expense-meta";


    const category =
      document.createElement("span");

    category.className = "category-badge";

    category.textContent =
      expense.category;


    const date =
      document.createElement("span");

    date.textContent =
      formatDisplayDate(expense.date);


    meta.append(
      category,
      date
    );


    main.append(
      title,
      meta
    );


    const right =
      document.createElement("div");

    right.className = "expense-right";


    const amount =
      document.createElement("strong");

    amount.className = "expense-amount";

    amount.textContent =
      formatCurrency(expense.amount);


    const actions =
      document.createElement("div");

    actions.className = "expense-actions";


    const editButton =
      createActionButton(
        "Edit",
        "edit",
        expense.id
      );


    const deleteButton =
      createActionButton(
        "Delete",
        "delete",
        expense.id
      );

    deleteButton.classList.add("delete");


    actions.append(
      editButton,
      deleteButton
    );


    right.append(
      amount,
      actions
    );


    article.append(
      main,
      right
    );


    expenseList.append(article);
  });
}


function createActionButton(
  text,
  action,
  id
) {
  const button =
    document.createElement("button");

  button.type = "button";

  button.className = "action-btn";

  button.textContent = text;

  button.dataset.action = action;

  button.dataset.id = id;

  return button;
}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics(items) {

  const allCategories =
    new Set(
      expenses.map(expense =>
        expense.category
      )
    );


  const visibleTotal =
    items.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );


  totalAmount.textContent =
    formatCurrency(visibleTotal);

  expenseCount.textContent =
    expenses.length;

  visibleCount.textContent =
    items.length;

  categoryCount.textContent =
    allCategories.size;
}


/* =========================================
   CATEGORY SUMMARY
========================================= */

function renderCategorySummary(items) {

  categorySummary.replaceChildren();

  if (items.length === 0) {
    return;
  }


  const categoryTotals = {};


  items.forEach(expense => {

    const category =
      expense.category;

    const amount =
      Number(expense.amount);


    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }


    categoryTotals[category] += amount;
  });


  const sortedCategories =
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]);


  const maximum =
    sortedCategories.length
      ? sortedCategories[0][1]
      : 0;


  sortedCategories.forEach(
    ([category, amount]) => {

      const row =
        document.createElement("div");

      row.className = "category-row";


      const top =
        document.createElement("div");

      top.className = "category-top";


      const name =
        document.createElement("span");

      name.className = "category-name";

      name.textContent = category;


      const value =
        document.createElement("span");

      value.className = "category-value";

      value.textContent =
        formatCurrency(amount);


      top.append(
        name,
        value
      );


      const bar =
        document.createElement("div");

      bar.className = "category-bar";


      const progress =
        document.createElement("div");

      progress.className =
        "category-progress";


      const percentage =
        maximum > 0
          ? (amount / maximum) * 100
          : 0;


      progress.style.width =
        `${percentage}%`;


      bar.append(progress);

      row.append(
        top,
        bar
      );

      categorySummary.append(row);
    }
  );
}


/* =========================================
   CURRENCY
========================================= */

function formatCurrency(amount) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }
  ).format(Number(amount) || 0);
}


/* =========================================
   MESSAGES
========================================= */

function showMessage(
  message,
  type
) {

  formMessage.textContent =
    message;

  formMessage.className =
    `form-message ${type}`;


  window.clearTimeout(
    showMessage.timer
  );


  showMessage.timer =
    window.setTimeout(() => {

      formMessage.textContent = "";

      formMessage.className =
        "form-message";

    }, 3500);
}


/* =========================================
   KEYBOARD
========================================= */

function handleKeyboard(event) {

  if (
    event.key === "Escape" &&
    editingId
  ) {
    resetForm();

    showMessage(
      "Edit mode cancelled.",
      "success"
    );
  }
    }
