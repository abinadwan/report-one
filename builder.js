"use strict";
/* RetailPulse keyboard-first grid with editable column schema. */
document.addEventListener("DOMContentLoaded", () => {
  const db = window.RetailDB;
  const $ = (id) => document.getElementById(id);
  const columns = $("columnsContainer");
  const selected = $("selectTable");
  const host = $("dataTableContainer");
  const columnPanel = $("columnEditorPanel");
  let editingColumn = null;
  const titles = {
    "create-table": "إنشاء جدول",
    "manage-data": "إدخال البيانات"
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
    const pendingEdit = editor && editor.input.value !== editor.original;
    if (currentPage === "manage-data" && (hasDraft() || pendingEdit || schemaDirty)) {
      if (!window.confirm("هناك إدخال أو تعديل لم يُحفظ. هل تريد تجاهله؟")) return false;
      discardEditor();
      closeColumnPanel(true);
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
      if (active && column === "إجراء") {
        const plus = document.createElement("button");
        plus.type = "button";
        plus.className = "column-add-button";
        plus.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i>';
        plus.setAttribute("aria-label", "إضافة عمود جديد");
        plus.title = "إضافة عمود جديد";
        plus.addEventListener("click", () => openColumnPanel());
        const heading = document.createElement("div");
        heading.className = "column-heading";
        const label = document.createElement("span");
        label.textContent = "إجراءات";
        heading.append(label, plus);
        th.append(heading);
      } else if (active && column !== "id") {
        const label = document.createElement("span");
        label.className = "column-heading-name";
        label.textContent = column;
        const modify = document.createElement("button");
        modify.type = "button";
        modify.className = "column-edit-button";
        modify.innerHTML = '<i class="fas fa-pen" aria-hidden="true"></i>';
        modify.setAttribute("aria-label", "تعديل اسم أو نوع العمود أو حذف العمود " + column);
        modify.title = "تعديل أو حذف العمود " + column;
        modify.addEventListener("click", () => openColumnPanel(column));
        const group = document.createElement("div");
        group.className = "column-heading";
        group.append(label, modify);
        th.append(group);
      } else {
        th.textContent = column === "id" ? "ID" : column;
      }
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
      if (active) {
        const actions = document.createElement("td");
        actions.className = "row-actions-cell";
        const buttons = document.createElement("div");
        buttons.className = "row-actions";
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "row-action-button row-clear";
        clear.textContent = "مسح القيم";
        clear.title = "مسح قيم الصف رقم " + row.id + " مع إبقاء الرقم التسلسلي";
        clear.setAttribute("aria-label", clear.title);
        clear.addEventListener("click", () => {
          if (!window.confirm("مسح جميع قيم الصف رقم " + row.id + "؟ سيبقى رقم ID والسجل موجودين.")) return;
          try {
            const changed = db.clearRow(name, row.id);
            renderGrid();
            notify(changed ? "تم مسح بيانات الصف رقم " + row.id : "الصف فارغ بالفعل");
          } catch (error) { notify(error.message || "تعذر مسح بيانات الصف", true); }
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "row-action-button row-delete";
        remove.textContent = "حذف الصف";
        remove.title = "حذف الصف رقم " + row.id + " بالكامل";
        remove.setAttribute("aria-label", remove.title);
        remove.addEventListener("click", () => {
          if (!window.confirm("حذف الصف رقم " + row.id + " بالكامل؟ لن تتغير معرفات الصفوف الأخرى.")) return;
          try {
            db.deleteRow(name, row.id);
            renderGrid();
            notify("تم حذف الصف رقم " + row.id);
          } catch (error) { notify(error.message || "تعذر حذف الصف", true); }
        });
        buttons.append(clear, remove);
        actions.append(buttons);
        tr.append(actions);
      }
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

  const newType = $("existingColumnType");
  const newOptsGroup = $("existingColumnOptionsGroup");
  const newOpts = $("existingColumnOptions");
  const columnNameInput = $("existingColumnName");

  function closeColumnPanel(force = false) {
    if (!force && schemaDirty &&
        !window.confirm("هناك تعديلات غير محفوظة على تعريف العمود. هل تريد إلغاءها؟")) return false;
    columnPanel.hidden = true;
    editingColumn = null;
    schemaDirty = false;
    $("columnEditorStatus").textContent = "";
    return true;
  }

  function openColumnPanel(columnName = null) {
    const tableName = getActive();
    if (!tableName || db.readOnly) return notify("افتح الجدول أولًا لإضافة الأعمدة أو تعديلها", true);
    if (editor && editor.input.value !== editor.original) {
      notify("احفظ تعديل الخلية الحالية قبل تغيير الأعمدة", true);
      editor.input.focus();
      return;
    }
    if (!columnPanel.hidden && !closeColumnPanel()) return;
    const def = columnName ? db.getColumnDefs(tableName).find((item) => item.name === columnName) : null;
    if (columnName && !def) return notify("العمود غير موجود", true);
    editingColumn = def?.name || null;
    $("columnEditorTitle").textContent = def ? "تعديل العمود: " + def.name : "إضافة عمود جديد";
    $("columnEditorDescription").textContent = def
      ? "عدّل اسم العمود أو نوعه أو خياراته، أو احذفه. لن تُستبدل بيانات غير متوافقة دون تنبيه."
      : "حدّد اسم العمود ونوعه؛ يظهر بعد الحفظ مباشرة في جدول البيانات.";
    columnNameInput.value = def?.name || "";
    columnNameInput.readOnly = false;
    $("deleteColumnBtn").hidden = !def;
    $("deleteColumnBtn").disabled = !def || db.getColumnDefs(tableName).length <= 1;
    newType.value = def?.type || "text";
    newOpts.value = def?.options?.join("\n") || "";
    showOptions(newType, newOptsGroup);
    $("saveColumnBtn").textContent = def ? "حفظ تعديل العمود" : "إضافة العمود للجدول";
    $("columnEditorStatus").textContent = "";
    schemaDirty = false;
    columnPanel.hidden = false;
    columnPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    columnNameInput.focus();
  }

  function confirmDiscardGridDraft() {
    if (!hasDraft() && !(editor && editor.input.value !== editor.original)) return true;
    if (!window.confirm("هناك بيانات قيد الإدخال أو تعديل خلية لم يُحفظ. هل تريد تجاهلها ومتابعة العملية؟")) return false;
    discardEditor();
    return true;
  }

  function saveColumn() {
    const tableName = getActive();
    if (!tableName) return notify("افتح جدولًا أولًا", true);
    const def = { name: columnNameInput.value.trim(), type: newType.value };
    if (def.type === "select") def.options = getOptions(newOpts);
    try {
      if (editingColumn) {
        const preview = db.previewColumnChange(tableName, editingColumn, def);
        if (!preview.changed) {
          closeColumnPanel(true);
          notify("لا يوجد تعديل على العمود");
          return;
        }
        if (db.getData(tableName).length > 0) {
          const warning = preview.converted
            ? "سيتم تحويل " + preview.converted + " قيمة مع تحديث اسم أو نوع العمود. هل تعتمد التعديل؟"
            : "سيتم تغيير تعريف العمود مع الاحتفاظ ببيانات الصفوف. هل تعتمد التعديل؟";
          if (!window.confirm(warning)) return;
        }
        if (!confirmDiscardGridDraft()) return;
        db.updateColumn(tableName, editingColumn, def);
      } else {
        // Validate before abandoning an in-progress row.
        db.normalizeDef(def);
        if (!confirmDiscardGridDraft()) return;
        db.addColumn(tableName, def);
      }
      const action = editingColumn ? "تم حفظ تعديل العمود" : "تمت إضافة العمود إلى الجدول";
      closeColumnPanel(true);
      refresh(tableName);
      notify(action);
    } catch (error) {
      $("columnEditorStatus").textContent = error.message || "تعذر حفظ العمود";
      notify(error.message || "تعذر حفظ العمود", true);
    }
  }

  function deleteCurrentColumn() {
    const tableName = getActive();
    const column = editingColumn;
    if (!tableName || !column) return notify("اختر عمودًا موجودًا لحذفه", true);
    const definitions = db.getColumnDefs(tableName);
    if (definitions.length <= 1)
      return notify("يجب الإبقاء على عمود بيانات واحد على الأقل", true);
    const rowsWithValues = db.getData(tableName).filter((row) =>
      row[column] !== null && row[column] !== undefined && row[column] !== "").length;
    const warning = "هل تريد حذف العمود «" + column + "» نهائيًا؟\n" +
      "ستُحذف قيمه من جميع السجلات" +
      (rowsWithValues ? " (" + rowsWithValues + " صفوف تحتوي بيانات)" : "") +
      "، ولن تتأثر الأعمدة الأخرى أو أرقام ID.\nيمكنك تصدير JSON قبل الحذف للاحتفاظ بنسخة خارجية.";
    if (!window.confirm(warning)) return;
    if (!confirmDiscardGridDraft()) return;
    try {
      db.deleteColumn(tableName, column);
      closeColumnPanel(true);
      refresh(tableName);
      notify("تم حذف العمود «" + column + "»");
    } catch (error) { notify(error.message || "تعذر حذف العمود", true); }
  }
  function switchPage(page) {
    if (page === "create-table" && getActive()) {
      notify("أغلق الجدول الحالي قبل إنشاء جدول جديد", true);
      return;
    }
    if (!mayLeave(page)) return;
    if (page !== "manage-data") closeColumnPanel(true);
    show(page);
    if (page === "manage-data") refresh();
  }

  document.querySelectorAll(".nav-link[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      switchPage(link.dataset.target);
    });
  });
  $("schemaShortcutBtn").addEventListener("click", () => openColumnPanel());

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
      closeColumnPanel(true);
      db.closeTable();
      refresh();
      show("manage-data");
      notify("تم إغلاق الجدول دون حذف بياناته");
    } catch (error) { notify(error.message, true); }
  });

  newType.addEventListener("change", () => { showOptions(newType, newOptsGroup); schemaDirty = true; });
  newOpts.addEventListener("input", () => { schemaDirty = true; });
  columnNameInput.addEventListener("input", () => { schemaDirty = true; });
  $("saveColumnBtn").addEventListener("click", saveColumn);
  $("deleteColumnBtn").addEventListener("click", deleteCurrentColumn);
  $("cancelColumnPanelBtn").addEventListener("click", () => closeColumnPanel());

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
