"use strict";
/* RetailPulse interactive table editor: one open table, inline edits, keyboard-first entry. */
document.addEventListener("DOMContentLoaded", () => {
  const db = window.RetailDB;
  const $ = (id) => document.getElementById(id);
  const columns = $("columnsContainer");
  const selection = $("selectTable");
  const host = $("dataTableContainer");
  const titles = { "create-table": "إنشاء جدول", "manage-data": "إدخال البيانات" };
  let draft = {};
  let currentEditor = null;

  function notify(message, error = false) {
    const node = document.createElement("div");
    node.className = "toast " + (error ? "error" : "success");
    node.textContent = message;
    $("toastContainer").appendChild(node);
    setTimeout(() => node.remove(), 3500);
  }
  function status(message) { $("editorStatus").textContent = message; }
  function hasDraft() { return Object.values(draft).some((v) => String(v || "").trim() !== ""); }
  function discardPending() {
    if (!hasDraft() && !(currentEditor && currentEditor.input.value !== currentEditor.original)) return true;
    return window.confirm("هناك بيانات لم تُحفظ بعد. هل تريد تجاهلها؟");
  }
  function section(page) {
    if (!titles[page]) return;
    Object.keys(titles).forEach((key) => {
      $(key).classList.toggle("active-section", key === page);
      $(key).classList.toggle("hidden-section", key !== page);
    });
    document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
      link.closest(".nav-item").classList.toggle("active", link.dataset.target === page);
    });
    $("pageTitle").textContent = titles[page];
  }
  function applyTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("light-mode", !dark);
    $("dbThemeToggle").textContent = dark ? "الوضع النهاري" : "الوضع الليلي";
    $("dbThemeToggle").setAttribute("aria-pressed", String(dark));
  }
  try { applyTheme(localStorage.getItem("retailpulse-theme") === "dark"); }
  catch (_) { applyTheme(false); }
  $("dbThemeToggle").addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark-mode");
    applyTheme(dark);
    try { localStorage.setItem("retailpulse-theme", dark ? "dark" : "light"); }
    catch (_) { notify("تعذر حفظ تفضيل المظهر", true); }
  });

  function addColumn(initialName = "", initialType = "text") {
    const wrapper = document.createElement("div");
    wrapper.className = "column-row";
    const name = document.createElement("input");
    name.className = "column-name";
    name.placeholder = "اسم العمود";
    name.setAttribute("aria-label", "اسم العمود");
    name.maxLength = 100;
    name.value = initialName;
    name.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        addColumn();
      }
    });
    const type = document.createElement("select");
    type.className = "column-type";
    type.setAttribute("aria-label", "نوع العمود");
    [["text", "نص"], ["number", "رقم"], ["date", "تاريخ"]].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      type.append(option);
    });
    type.value = initialType;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-danger";
    remove.textContent = "حذف";
    remove.addEventListener("click", () => {
      wrapper.remove();
      if (!columns.children.length) addColumn();
    });
    wrapper.append(name, type, remove);
    columns.append(wrapper);
    name.focus();
  }
  function refresh(activeSelection) {
    const names = db.tables();
    const chosen = activeSelection || db.getActive() || selection.value;
    selection.replaceChildren();
    if (!names.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "لا توجد جداول";
      selection.append(option);
    } else {
      names.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        selection.append(option);
      });
      if (names.includes(chosen)) selection.value = chosen;
    }
    const active = db.getActive();
    $("newTableName").disabled = !!active || db.readOnly;
    $("addColumnBtn").disabled = !!active || db.readOnly;
    $("saveTableBtn").disabled = !!active || db.readOnly;
    columns.querySelectorAll("input,select,button").forEach((input) => { input.disabled = !!active || db.readOnly; });
    $("activeNotice").textContent = db.readOnly
      ? "هناك مشكلة في قراءة البيانات القديمة؛ التحرير مقفل لحماية النسخة المخزنة."
      : active ? "الجدول «" + active + "» مفتوح. أغلقه قبل إنشاء جدول جديد." : "يمكن إنشاء جدول جديد أو فتح جدول محفوظ.";
    selection.disabled = !!active;
    $("openTableBtn").disabled = !!active || !names.length || db.readOnly;
    $("closeTableBtn").disabled = !active;
    $("exportCsvBtn").disabled = !names.length;
    $("exportJsonBtn").disabled = !names.length;
    render();
  }

  function render() {
    host.replaceChildren();
    currentEditor = null;
    const name = db.getActive() || selection.value;
    if (!name) {
      status("لا توجد جداول بعد. ابدأ بإنشاء جدول.");
      return;
    }
    const table = db.getTable(name);
    if (!table) { status("الجدول غير موجود"); return; }
    const active = db.getActive() === name && !db.readOnly;
    status(active
      ? "الجدول مفتوح: " + name + " — عدد السجلات: " + table.data.length + " — الحفظ تلقائي"
      : "الجدول مغلق: " + name + " — عدد السجلات: " + table.data.length + " — افتحه للسماح بالتعديل");
    const grid = document.createElement("table");
    grid.className = "data-table editor-table";
    const thead = document.createElement("thead");
    const header = document.createElement("tr");
    table.columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column === "id" ? "ID" : column;
      header.append(th);
    });
    thead.append(header);
    grid.append(thead);
    const tbody = document.createElement("tbody");

    function editCell(cell, row, def) {
      if (!active || currentEditor) return;
      const original = String(row[def.name] ?? "");
      const input = document.createElement("input");
      input.className = "grid-input";
      input.type = def.type === "number" ? "number" : def.type === "date" ? "date" : "text";
      if (def.type === "number") input.step = "any";
      input.value = original;
      input.maxLength = 2000;
      input.setAttribute("aria-label", "تعديل " + def.name + " للسجل " + row.id);
      cell.replaceChildren(input);
      const editing = { input, original };
      currentEditor = editing;
      let cancelled = false;
      function finish(commit) {
        if (currentEditor !== editing) return;
        if (commit && !cancelled && input.value.trim() !== original) {
          try {
            db.updateCell(name, row.id, def.name, input.value);
            status("تم حفظ تعديل السجل " + row.id);
          } catch (error) {
            notify(error.message, true);
            input.focus();
            return;
          }
        }
        currentEditor = null;
        cell.textContent = String(db.getData(name).find((item) => item.id === row.id)?.[def.name] ?? "");
      }
      input.addEventListener("keydown", (event) => {
        if (event.isComposing) return;
        if (event.key === "Escape") { event.preventDefault(); cancelled = true; finish(false); cell.focus(); }
        if (event.key === "Enter") { event.preventDefault(); finish(true); cell.focus(); }
      });
      input.addEventListener("blur", () => finish(!cancelled));
      input.focus();
      input.select?.();
    }

    table.data.forEach((row) => {
      const tr = document.createElement("tr");
      const id = document.createElement("td");
      id.textContent = String(row.id);
      id.className = "id-cell";
      tr.append(id);
      table.columnDefs.forEach((def) => {
        const td = document.createElement("td");
        td.textContent = String(row[def.name] ?? "");
        if (active) {
          td.className = "editable-cell";
          td.tabIndex = 0;
          td.title = "اضغط للتعديل";
          td.addEventListener("click", () => editCell(td, row, def));
          td.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === "F2") { event.preventDefault(); editCell(td, row, def); }
          });
        }
        tr.append(td);
      });
      tbody.append(tr);
    });

    if (active) {
      const newRow = document.createElement("tr");
      newRow.className = "new-row";
      const id = document.createElement("td");
      id.className = "id-cell";
      id.textContent = String(db.getNextId(name));
      newRow.append(id);
      const inputs = table.columnDefs.map((def) => {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.className = "grid-input new-row-input";
        input.type = def.type === "number" ? "number" : def.type === "date" ? "date" : "text";
        if (def.type === "number") input.step = "any";
        input.placeholder = def.name;
        input.setAttribute("aria-label", "إدخال " + def.name);
        input.value = draft[def.name] || "";
        input.maxLength = 2000;
        input.addEventListener("input", () => { draft[def.name] = input.value; });
        cell.append(input);
        newRow.append(cell);
        return input;
      });
      inputs.forEach((input, index) => {
        input.addEventListener("keydown", (event) => {
          if (event.isComposing || event.key !== "Enter") return;
          event.preventDefault();
          if (index < inputs.length - 1) { inputs[index + 1].focus(); return; }
          const values = {};
          table.columnDefs.forEach((def, i) => { values[def.name] = inputs[i].value; });
          try {
            db.insert(name, values);
            draft = {};
            render();
            host.querySelector(".new-row-input")?.focus();
          } catch (error) {
            notify(error.message, true);
            const missing = inputs.find((field) => !field.value.trim());
            (missing || input).focus();
          }
        });
      });
      tbody.append(newRow);
    }
    grid.append(tbody);
    host.append(grid);
  }

  document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (link.dataset.target === "create-table" && db.getActive()) {
        notify("أغلق الجدول المفتوح قبل إنشاء جدول جديد", true);
        return;
      }
      section(link.dataset.target);
      if (link.dataset.target === "manage-data") refresh();
    });
  });
  $("addColumnBtn").addEventListener("click", () => addColumn());
  $("saveTableBtn").addEventListener("click", () => {
    const name = $("newTableName").value.trim();
    const defs = [...columns.querySelectorAll(".column-row")].map((row) => ({
      name: row.querySelector(".column-name").value.trim(),
      type: row.querySelector(".column-type").value
    }));
    try {
      db.createTable(name, defs);
      $("newTableName").value = "";
      columns.replaceChildren();
      addColumn();
      draft = {};
      refresh(name);
      section("manage-data");
      host.querySelector(".new-row-input")?.focus();
      notify("تم إنشاء الجدول وفتحه");
    } catch (error) { notify(error.message, true); }
  });
  selection.addEventListener("change", () => { draft = {}; render(); });
  $("openTableBtn").addEventListener("click", () => {
    try {
      db.openTable(selection.value);
      draft = {};
      refresh();
      host.querySelector(".new-row-input")?.focus();
      notify("تم فتح الجدول");
    } catch (error) { notify(error.message, true); }
  });
  $("closeTableBtn").addEventListener("click", () => {
    if (!discardPending()) return;
    try {
      if (currentEditor) {
        // The user confirmed discarding the pending edit, not saving it.
        currentEditor.input.value = currentEditor.original;
        currentEditor.input.blur();
        if (currentEditor) return;
      }
      draft = {};
      db.closeTable();
      refresh();
      notify("تم إغلاق الجدول مع الاحتفاظ بالبيانات");
    } catch (error) { notify(error.message, true); }
  });

  function csvField(value) {
    let result = String(value ?? "");
    // Prevent formula execution if users open a CSV in spreadsheet software.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(result)) result = "'" + result;
    return '"' + result.replace(/"/g, '""') + '"';
  }
  function download(text, filename, mime) {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportTable(format) {
    const name = db.getActive() || selection.value;
    const table = db.getTable(name);
    if (!table) return notify("اختر جدولًا أولًا", true);
    const filename = name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").slice(0, 80) || "table";
    if (format === "csv") {
      const csv = [table.columns.map(csvField).join(","),
        ...table.data.map((row) => table.columns.map((column) => csvField(row[column])).join(","))].join("\r\n");
      download("\uFEFF" + csv, filename + ".csv", "text/csv;charset=utf-8");
    } else {
      const json = { version: 2, name, columnDefs: table.columnDefs, nextId: table.nextId, data: table.data };
      download(JSON.stringify(json, null, 2), filename + ".json", "application/json;charset=utf-8");
    }
    notify("تم تجهيز ملف التصدير");
  }
  $("exportCsvBtn").addEventListener("click", () => exportTable("csv"));
  $("exportJsonBtn").addEventListener("click", () => exportTable("json"));

  window.addEventListener("beforeunload", (event) => {
    if (!hasDraft() && !(currentEditor && currentEditor.input.value !== currentEditor.original)) return;
    event.preventDefault();
    event.returnValue = "";
  });
  addColumn();
  refresh();
  section(db.getActive() || db.tables().length ? "manage-data" : "create-table");
});
