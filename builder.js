"use strict";
/* RetailPulse keyboard-first grid with editable column schema. */
document.addEventListener("DOMContentLoaded", () => {
  const db = window.RetailDB;
  const $ = (id) => document.getElementById(id);
  const columns = $("columnsContainer");
  const selected = $("selectTable");
  const host = $("dataTableContainer");
  const schemaColumns = $("schemaColumns");
  const titles = {
    "create-table": "إنشاء جدول",
    "manage-data": "إدخال البيانات",
    "manage-columns": "إدارة الأعمدة"
  };
  const types = [
    ["text", "نص"],
    ["number", "رقم"],
    ["date", "تاريخ"],
    ["select", "قائمة منسدلة"]
  ];
  let draft = {};
  let editor = null;
  let schemaDirty = false;
  let currentPage = "create-table";

  function notify(message, error = false) {
    const node = document.createElement("div");
    node.className = "toast " + (error ? "error" : "success");
    node.textContent = message;
    $("toastContainer").append(node);
    setTimeout(() => node.remove(), 4000);
  }
  function status(message) { $("editorStatus").textContent = message; }
  function hasDraft() { return Object.values(draft).some((value) => String(value ?? "").trim()); }
  function discardEditor() {
    if (editor) {
      editor.input.value = editor.original;
      editor.input.blur();
      editor = null;
    }
    draft = {};
  }
  function mayLeave(targetPage) {
    if (currentPage === targetPage) return true;
    if (currentPage === "manage-data" &&
        (hasDraft() || (editor && editor.input.value !== editor.original))) {
      if (!window.confirm("هناك إدخال أو تعديل لم يُحفظ. هل تريد تجاهله؟")) return false;
      discardEditor();
    }
    if (currentPage === "manage-columns" && schemaDirty) {
      if (!window.confirm("تعديلات أنواع الأعمدة لم تُحفظ. هل تريد تجاهلها؟")) return false;
      schemaDirty = false;
    }
    return true;
  }
  function show(page) {
    if (!titles[page]) return;
    Object.keys(titles).forEach((key) => {
      $(key).classList.toggle("active-section", key === page);
      $(key).classList.toggle("hidden-section", key !== page);
    });
    document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
      link.closest(".nav-item").classList.toggle("active", link.dataset.target === page);
    });
    currentPage = page;
    $("pageTitle").textContent = titles[page];
    if (page === "manage-columns") renderSchema();
  }

  function typeSelect(type = "text", ariaLabel = "نوع الحقل") {
    const select = document.createElement("select");
    select.className = "column-type";
    select.setAttribute("aria-label", ariaLabel);
    types.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    });
    select.value = type;
    return select;
  }
  function optionsEditor(options = [], isNew = false) {
    const label = document.createElement("label");
    label.className = "form-group options-group";
    const description = document.createElement("span");
    description.textContent = isNew ? "خيارات القائمة (خيار في كل سطر)" : "خيارات القائمة (خيار في كل سطر؛ احفظ لتطبيقها)";
    const textarea = document.createElement("textarea");
    textarea.className = "column-options";
    textarea.rows = 3;
    textarea.placeholder = "جديد\nقيد التنفيذ\nمكتمل";
    textarea.value = options.join("\n");
    textarea.setAttribute("aria-label", description.textContent);
    label.append(description, textarea);
    return label;
  }
  function showOptions(typeSelectElement, optionsGroup) {
    optionsGroup.hidden = typeSelectElement.value !== "select";
  }
  function getOptions(textarea) {
    return textarea.value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  }
  function readDefinition(row, name) {
    const type = row.querySelector(".column-type").value;
    const def = { name: name ?? row.querySelector(".column-name").value.trim(), type };
    if (type === "select") def.options = getOptions(row.querySelector(".column-options"));
    return def;
  }

  function addColumn(initialName = "", initialType = "text", initialOptions = []) {
    const wrapper = document.createElement("div");
    wrapper.className = "column-row definition-row";
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
    const type = typeSelect(initialType);
    const options = optionsEditor(initialOptions, true);
    showOptions(type, options);
    type.addEventListener("change", () => showOptions(type, options));
    const remove = document.createElement("button");
    remove.className = "btn btn-danger";
    remove.type = "button";
    remove.textContent = "حذف";
    remove.addEventListener("click", () => {
      wrapper.remove();
      if (!columns.children.length) addColumn();
    });
    wrapper.append(name, type, options, remove);
    columns.append(wrapper);
    name.focus();
  }

  function getActive() { return db.getActive(); }
  function refresh(preferred) {
    const names = db.tables();
    const desired = preferred || getActive() || selected.value;
    selected.replaceChildren();
    if (!names.length) {
      const option = document.createElement("option");
      option.textContent = "لا توجد جداول";
      option.value = "";
      selected.append(option);
    } else {
      names.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        selected.append(option);
      });
      if (names.includes(desired)) selected.value = desired;
    }
    const active = getActive();
    $("newTableName").disabled = !!active || db.readOnly;
    $("addColumnBtn").disabled = !!active || db.readOnly;
    $("saveTableBtn").disabled = !!active || db.readOnly;
    columns.querySelectorAll("input,select,textarea,button").forEach((node) => {
      node.disabled = !!active || db.readOnly;
    });
    $("activeNotice").textContent = db.readOnly
      ? "تعذر قراءة بعض البيانات المحفوظة؛ التحرير متوقف لحمايتها."
      : active ? "الجدول «" + active + "» مفتوح. أغلقه قبل إنشاء جدول آخر." :
        "يمكن إنشاء جدول جديد أو فتح جدول محفوظ.";
    selected.disabled = !!active;
    $("openTableBtn").disabled = !!active || !names.length || db.readOnly;
    $("closeTableBtn").disabled = !active;
    $("schemaShortcutBtn").disabled = !active || db.readOnly;
    $("exportCsvBtn").disabled = !names.length;
    $("exportJsonBtn").disabled = !names.length;
    document.querySelectorAll('.nav-link[data-target="manage-columns"]').forEach((link) => {
      link.setAttribute("aria-disabled", active && !db.readOnly ? "false" : "true");
    });
    renderGrid();
  }

  function makeInput(def, originalValue = "") {
    let input;
    if (def.type === "select") {
      input = document.createElement("select");
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "اختر...";
      input.append(empty);
      (def.options || []).forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        input.append(option);
      });
    } else {
      input = document.createElement("input");
      input.type = def.type === "number" ? "number" : def.type === "date" ? "date" : "text";
      if (def.type === "number") input.step = "any";
      if (def.type === "text") input.maxLength = 2000;
      input.placeholder = def.name;
    }
    input.className = "grid-input";
    input.value = originalValue == null ? "" : String(originalValue);
    return input;
  }

  function renderGrid() {
    host.replaceChildren();
    editor = null;
    const name = getActive() || selected.value;
    const table = db.getTable(name);
    if (!table) { status("لا توجد جداول. أنشئ جدولًا أولًا."); return; }
    const active = getActive() === name && !db.readOnly;
    status(active
      ? "الجدول المفتوح: " + name + " — " + table.data.length + " سجلات — الحفظ تلقائي"
      : "الجدول مغلق: " + name + " — " + table.data.length + " سجلات — افتحه للتعديل");
    const grid = document.createElement("table");
    grid.className = "data-table editor-table";
    const thead = document.createElement("thead");
    const header = document.createElement("tr");
    [...table.columns, ...(active ? ["إجراء"] : [])].forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column === "id" ? "ID" : column;
      header.append(th);
    });
    thead.append(header);
    grid.append(thead);
    const tbody = document.createElement("tbody");

    function editCell(cell, row, def) {
      if (!active || editor) return;
      const original = String(row[def.name] ?? "");
      const input = makeInput(def, original);
      input.setAttribute("aria-label", "تعديل " + def.name + " للسجل " + row.id);
      cell.replaceChildren(input);
      const editing = { input, original };
      editor = editing;
      let cancelled = false;
      function finish(commit) {
        if (editor !== editing) return;
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
        editor = null;
        const stored = db.getData(name).find((record) => record.id === row.id);
        cell.textContent = String(stored?.[def.name] ?? "");
      }
      input.addEventListener("keydown", (event) => {
        if (event.isComposing) return;
        if (event.key === "Escape") {
          event.preventDefault();
          cancelled = true;
          finish(false);
          cell.focus();
        }
        if (event.key === "Enter" && def.type !== "select") {
          event.preventDefault();
          finish(true);
          cell.focus();
        }
      });
      if (def.type === "select") input.addEventListener("change", () => finish(true));
      input.addEventListener("blur", () => finish(!cancelled));
      input.focus();
      if (typeof input.select === "function" && def.type !== "select") input.select();
    }

    table.data.forEach((row) => {
      const tr = document.createElement("tr");
      const id = document.createElement("td");
      id.className = "id-cell";
      id.textContent = String(row.id);
      tr.append(id);
      table.columnDefs.forEach((def) => {
        const td = document.createElement("td");
        td.textContent = String(row[def.name] ?? "");
        if (active) {
          td.className = "editable-cell";
          td.tabIndex = 0;
          td.title = "اضغط لتعديل الخلية";
          td.addEventListener("click", () => editCell(td, row, def));
          td.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === "F2") {
              event.preventDefault();
              editCell(td, row, def);
            }
          });
        }
        tr.append(td);
      });
      if (active) tr.append(document.createElement("td"));
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
        const input = makeInput(def, draft[def.name] ?? "");
        input.classList.add("new-row-input");
        input.setAttribute("aria-label", "إدخال " + def.name);
        input.addEventListener("input", () => { draft[def.name] = input.value; });
        input.addEventListener("change", () => { draft[def.name] = input.value; });
        cell.append(input);
        newRow.append(cell);
        return input;
      });
      function saveNewRow() {
        const values = {};
        table.columnDefs.forEach((def, i) => { values[def.name] = inputs[i].value; });
        try {
          db.insert(name, values);
          draft = {};
          renderGrid();
          host.querySelector(".new-row-input")?.focus();
        } catch (error) {
          notify(error.message, true);
          const missing = inputs.find((input) => !input.value.trim());
          (missing || inputs[inputs.length - 1]).focus();
        }
      }
      inputs.forEach((input, index) => {
        input.addEventListener("keydown", (event) => {
          if (event.isComposing || event.key !== "Enter" || input.tagName === "SELECT") return;
          event.preventDefault();
          if (index < inputs.length - 1) inputs[index + 1].focus();
          else saveNewRow();
        });
        if (input.tagName === "SELECT") {
          input.addEventListener("change", () => {
            if (index < inputs.length - 1) {
              inputs[index + 1].focus();
            } else if (inputs.every((field) => field.value.trim())) {
              // A last-column dropdown choice completes the entire row.
              saveNewRow();
            }
          });
          input.addEventListener("keyup", (event) => {
            if (event.key === "Enter" && !event.isComposing && document.activeElement === input && input.value) {
              if (index < inputs.length - 1) inputs[index + 1].focus();
              else saveNewRow();
            }
          });
        }
      });
      const controls = document.createElement("td");
      const save = document.createElement("button");
      save.className = "btn btn-success";
      save.type = "button";
      save.textContent = "حفظ الصف";
      save.addEventListener("click", saveNewRow);
      controls.append(save);
      newRow.append(controls);
      tbody.append(newRow);
    }
    grid.append(tbody);
    host.append(grid);
  }

  function renderSchema() {
    schemaColumns.replaceChildren();
    schemaDirty = false;
    const name = getActive();
    $("schemaTableName").textContent = name || "لا يوجد جدول مفتوح";
    $("schemaStatus").textContent = name ? "تُطبّق الأنواع على كل خلايا الجدول بعد الحفظ." : "افتح جدولًا من قسم إدخال البيانات.";
    $("saveSchemaBtn").disabled = !name || db.readOnly;
    $("addExistingColumnBtn").disabled = !name || db.readOnly;
    if (!name) return;
    const definitions = db.getColumnDefs(name);
    definitions.forEach((def) => {
      const row = document.createElement("div");
      row.className = "schema-definition";
      const label = document.createElement("span");
      label.className = "schema-name";
      label.textContent = def.name;
      const type = typeSelect(def.type, "نوع العمود " + def.name);
      const choices = optionsEditor(def.options || []);
      showOptions(type, choices);
      type.addEventListener("change", () => { showOptions(type, choices); schemaDirty = true; });
      choices.querySelector("textarea").addEventListener("input", () => { schemaDirty = true; });
      row.append(label, type, choices);
      schemaColumns.append(row);
    });
  }

  function collectSchema() {
    const names = db.getColumnDefs(getActive()).map((def) => def.name);
    return [...schemaColumns.children].map((row, index) => readDefinition(row, names[index]));
  }
  function switchPage(page) {
    if (page === "create-table" && getActive()) {
      notify("أغلق الجدول الحالي قبل إنشاء جدول جديد", true);
      return;
    }
    if (page === "manage-columns" && (!getActive() || db.readOnly)) {
      notify("افتح جدولًا أولًا لتعديل أعمدته", true);
      return;
    }
    if (!mayLeave(page)) return;
    if (currentPage === "manage-data" && page !== "manage-data") discardEditor();
    show(page);
    if (page === "manage-data") refresh();
  }

  document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      switchPage(link.dataset.target);
    });
  });
  $("schemaShortcutBtn").addEventListener("click", () => switchPage("manage-columns"));

  $("addColumnBtn").addEventListener("click", () => addColumn());
  $("saveTableBtn").addEventListener("click", () => {
    const name = $("newTableName").value.trim();
    const defs = [...columns.querySelectorAll(".definition-row")].map((row) => readDefinition(row));
    try {
      db.createTable(name, defs);
      $("newTableName").value = "";
      columns.replaceChildren();
      addColumn();
      draft = {};
      refresh(name);
      show("manage-data");
      host.querySelector(".new-row-input")?.focus();
      notify("تم إنشاء الجدول وفتحه");
    } catch (error) { notify(error.message, true); }
  });

  selected.addEventListener("change", () => { draft = {}; renderGrid(); });
  $("openTableBtn").addEventListener("click", () => {
    try {
      db.openTable(selected.value);
      draft = {};
      refresh();
      host.querySelector(".new-row-input")?.focus();
      notify("تم فتح الجدول");
    } catch (error) { notify(error.message, true); }
  });
  $("closeTableBtn").addEventListener("click", () => {
    if (!mayLeave("closed-table")) return;
    try {
      discardEditor();
      schemaDirty = false;
      db.closeTable();
      refresh();
      show("manage-data");
      notify("تم إغلاق الجدول دون حذف بياناته");
    } catch (error) { notify(error.message, true); }
  });

  $("saveSchemaBtn").addEventListener("click", () => {
    const name = getActive();
    if (!name) return notify("افتح جدولًا أولًا", true);
    try {
      const defs = collectSchema();
      const preview = db.previewSchema(name, defs);
      if (!preview.changed) {
        schemaDirty = false;
        notify("لا توجد تغييرات في الأنواع");
        return;
      }
      const records = db.getData(name).length;
      if (records > 0) {
        const message = preview.converted
          ? "سيتم تحويل " + preview.converted + " قيمة إلى النوع الجديد. هل تريد اعتماد تعديل أنواع الأعمدة؟"
          : "ستتغير قواعد الإدخال والتحقق لهذا الجدول، مع الاحتفاظ بالسجلات الموجودة. هل تريد المتابعة؟";
        if (!window.confirm(message)) return;
      }
      db.updateSchema(name, defs);
      schemaDirty = false;
      renderSchema();
      refresh(name);
      notify("تم تحديث أنواع الأعمدة وخياراتها");
    } catch (error) { notify(error.message, true); }
  });

  const newType = $("existingColumnType");
  const newOptsGroup = $("existingColumnOptionsGroup");
  const newOpts = $("existingColumnOptions");
  newType.addEventListener("change", () => showOptions(newType, newOptsGroup));
  showOptions(newType, newOptsGroup);

  $("addExistingColumnBtn").addEventListener("click", () => {
    const name = getActive();
    if (!name) return notify("افتح جدولًا أولًا", true);
    if (schemaDirty) return notify("احفظ تعديلات أنواع الأعمدة أولًا", true);
    const def = { name: $("existingColumnName").value.trim(), type: newType.value };
    if (def.type === "select") def.options = getOptions(newOpts);
    try {
      db.addColumn(name, def);
      $("existingColumnName").value = "";
      newType.value = "text";
      newOpts.value = "";
      showOptions(newType, newOptsGroup);
      renderSchema();
      refresh(name);
      notify("تمت إضافة العمود إلى الجدول مع الحفاظ على السجلات");
    } catch (error) { notify(error.message, true); }
  });

  function csvField(value) {
    let result = String(value ?? "");
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(result)) result = "'" + result;
    return '"' + result.replace(/"/g, '""') + '"';
  }
  function download(text, filename, mime) {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportTable(format) {
    const name = getActive() || selected.value;
    const table = db.getTable(name);
    if (!table) return notify("اختر جدولًا أولًا", true);
    const filename = name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").slice(0, 80) || "table";
    if (format === "csv") {
      const lines = [
        table.columns.map(csvField).join(","),
        ...table.data.map((row) => table.columns.map((column) => csvField(row[column])).join(","))
      ];
      download("\uFEFF" + lines.join("\r\n"), filename + ".csv", "text/csv;charset=utf-8");
    } else {
      download(JSON.stringify({
        version: 3, name, columnDefs: table.columnDefs,
        nextId: table.nextId, data: table.data
      }, null, 2), filename + ".json", "application/json;charset=utf-8");
    }
    notify("تم تجهيز ملف التصدير");
  }
  $("exportCsvBtn").addEventListener("click", () => exportTable("csv"));
  $("exportJsonBtn").addEventListener("click", () => exportTable("json"));

  window.addEventListener("beforeunload", (event) => {
    if (!hasDraft() && !schemaDirty &&
        !(editor && editor.input.value !== editor.original)) return;
    event.preventDefault();
    event.returnValue = "";
  });
  addColumn();
  refresh();
  show(getActive() || db.tables().length ? "manage-data" : "create-table");
});
