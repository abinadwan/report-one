"use strict";

/* RetailPulse table builder. Data stays in this browser's localStorage. */
document.addEventListener("DOMContentLoaded", () => {
  const db = window.RetailDB;
  const $ = (id) => document.getElementById(id);
  const columns = $("columnsContainer");
  const selected = $("selectTable");
  const tableContainer = $("dataTableContainer");
  const addRow = $("addRowBtn");
  const titles = { "create-table": "إنشاء جدول", "manage-data": "إدخال بيانات" };

  function notify(message, error = false) {
    const el = document.createElement("div");
    el.className = "toast " + (error ? "error" : "success");
    el.textContent = message;
    $("toastContainer").appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function showSection(section) {
    if (!titles[section]) return;
    Object.keys(titles).forEach((key) => {
      $(key).className = key === section ? "active-section" : "hidden-section";
    });
    document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
      link.closest(".nav-item").classList.toggle("active", link.dataset.target === section);
    });
    $("pageTitle").textContent = titles[section];
  }

  function addColumn() {
    const row = document.createElement("div");
    row.className = "column-row";
    const name = document.createElement("input");
    name.className = "column-name";
    name.placeholder = "اسم العمود";
    name.setAttribute("aria-label", "اسم العمود");
    const type = document.createElement("select");
    type.className = "column-type";
    type.setAttribute("aria-label", "نوع العمود");
    [["text", "نص"], ["number", "رقم"], ["date", "تاريخ"]].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      type.appendChild(option);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-danger";
    remove.textContent = "حذف";
    remove.setAttribute("aria-label", "حذف العمود");
    remove.addEventListener("click", () => row.remove());
    row.append(name, type, remove);
    columns.appendChild(row);
    name.focus();
  }

  function loadTableList(preferred) {
    const tables = db.tables();
    const previous = preferred || selected.value;
    selected.replaceChildren();
    if (!tables.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "لا توجد جداول بعد";
      selected.appendChild(option);
      addRow.disabled = true;
      tableContainer.textContent = "أنشئ جدولًا أولًا من قسم إنشاء جدول.";
      return;
    }
    tables.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      selected.appendChild(option);
    });
    if (tables.includes(previous)) selected.value = previous;
    addRow.disabled = false;
    renderTable();
  }

  function renderTable() {
    const name = selected.value;
    tableContainer.replaceChildren();
    if (!name) return;
    const headers = db.getColumns(name);
    const rows = db.getData(name);
    const table = document.createElement("table");
    table.className = "data-table";
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    headers.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      headers.forEach((column) => {
        const td = document.createElement("td");
        td.textContent = row[column] == null ? "" : String(row[column]);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    const status = document.createElement("p");
    status.className = "table-status";
    status.textContent = rows.length ? "عدد السجلات: " + rows.length : "الجدول فارغ. اضغط إضافة صف.";
    tableContainer.appendChild(status);
  }

  function startRowEntry() {
    const name = selected.value;
    if (!name || tableContainer.querySelector(".entry-form")) return;
    const fields = db.getColumns(name).filter((column) => column !== "id");
    if (!fields.length) { notify("لا يحتوي الجدول على أعمدة", true); return; }
    const form = document.createElement("form");
    form.className = "entry-form";
    const inputs = {};
    fields.forEach((column) => {
      const wrapper = document.createElement("label");
      wrapper.className = "form-group";
      const label = document.createElement("span");
      label.textContent = column;
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("aria-label", column);
      input.maxLength = 2000;
      wrapper.append(label, input);
      form.appendChild(wrapper);
      inputs[column] = input;
    });
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "btn btn-success";
    save.textContent = "حفظ الصف";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn btn-secondary";
    cancel.textContent = "إلغاء";
    cancel.addEventListener("click", () => form.remove());
    form.append(save, cancel);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const row = {};
      fields.forEach((column) => { row[column] = inputs[column].value.trim(); });
      try {
        db.insert(name, row);
        renderTable();
        notify("تم حفظ الصف");
      } catch (error) { notify(error.message || "تعذر حفظ الصف", true); }
    });
    tableContainer.appendChild(form);
    inputs[fields[0]].focus();
  }

  document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showSection(link.dataset.target);
      if (link.dataset.target === "manage-data") loadTableList();
    });
  });
  $("addColumnBtn").addEventListener("click", addColumn);
  $("saveTableBtn").addEventListener("click", () => {
    const name = $("newTableName").value.trim();
    const names = Array.from(columns.querySelectorAll(".column-name")).map((input) => input.value.trim());
    if (!name) return notify("أدخل اسم الجدول", true);
    if (name.length > 100) return notify("اسم الجدول طويل جدًا", true);
    if (!names.length || names.some((value) => !value)) return notify("أدخل اسمًا لكل عمود", true);
    if (names.includes("id") || new Set(names).size !== names.length) return notify("أسماء الأعمدة يجب أن تكون فريدة وألا تتضمن id", true);
    try {
      db.createTable(name, names.map((value, index) => ({
        name: value,
        type: columns.querySelectorAll(".column-type")[index].value
      })));
      $("newTableName").value = "";
      columns.replaceChildren();
      addColumn();
      loadTableList(name);
      showSection("manage-data");
      notify("تم إنشاء الجدول");
    } catch (error) { notify(error.message || "تعذر إنشاء الجدول", true); }
  });
  selected.addEventListener("change", renderTable);
  addRow.addEventListener("click", startRowEntry);

  // The database page shares the same saved theme as the dashboard.
  const toggle = $("dbThemeToggle");
  function applyTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("light-mode", !dark);
    toggle.textContent = dark ? "الوضع النهاري" : "الوضع الليلي";
    toggle.setAttribute("aria-pressed", String(dark));
  }
  try { applyTheme(localStorage.getItem("retailpulse-theme") === "dark"); }
  catch (_) { applyTheme(false); }
  toggle.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark-mode");
    applyTheme(dark);
    try { localStorage.setItem("retailpulse-theme", dark ? "dark" : "light"); }
    catch (_) { notify("تعذر حفظ تفضيل الثيم", true); }
  });

  addColumn();
  loadTableList();
  showSection("create-table");
});
