"use strict";
/* RetailPulse local table storage. Schema changes are transactional and backed up. */
class DBStorage {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.key = "retailpulse-db";
    this.activeKey = "retailpulse-active-table";
    this.backupKey = "retailpulse-db-backup-before-v2";
    this.schemaBackupKey = "retailpulse-db-backup-before-schema-edit";
    this.destructiveBackupKey = "retailpulse-db-backup-before-last-destructive-edit";
    this.readOnly = false;
    this.migrationPending = false;
    this.original = null;
    this.db = this.load();
  }

  allowedTypes() { return ["text", "number", "date", "select"]; }

  normalizeDef(def) {
    const name = typeof def?.name === "string" ? def.name.trim() : "";
    const type = def?.type || "text";
    if (!name || name.length > 100 || ["id", "legacyId", "__proto__", "prototype", "constructor"].includes(name))
      throw new Error("اسم العمود غير صالح أو محجوز");
    if (!this.allowedTypes().includes(type)) throw new Error("نوع الحقل غير معروف: " + name);
    if (type !== "select") return { name, type };
    if (!Array.isArray(def.options)) throw new Error("أضف خيارات القائمة للحقل «" + name + "»");
    const options = def.options.map((option) => String(option).trim());
    if (!options.length || options.length > 100 || options.some((v) => !v || v.length > 100) || new Set(options).size !== options.length)
      throw new Error("خيارات «" + name + "» يجب أن تكون غير فارغة وغير مكررة (100 خيار كحد أقصى)");
    return { name, type, options };
  }

  normalizeDefs(defs) {
    if (!Array.isArray(defs) || !defs.length || defs.length > 100)
      throw new Error("أضف من عمود واحد إلى 100 عمود");
    const normalized = defs.map((def) => this.normalizeDef(def));
    if (new Set(normalized.map((def) => def.name)).size !== normalized.length)
      throw new Error("لا يسمح بتكرار أسماء الأعمدة");
    return normalized;
  }

  load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return Object.create(null);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid database root");
      const migrated = Object.create(null);
      for (const [name, table] of Object.entries(parsed)) {
        if (!table || !Array.isArray(table.columns) || !Array.isArray(table.data))
          throw new Error("Invalid table");
        const columns = table.columns.filter((column) => column !== "id");
        if (columns.some((column) => typeof column !== "string") || new Set(columns).size !== columns.length)
          throw new Error("Invalid columns");
        const existingDefs = Array.isArray(table.columnDefs) ? table.columnDefs : [];
        const defs = columns.map((column) => {
          const stored = existingDefs.find((def) => def?.name === column);
          return this.normalizeDef(stored || { name: column, type: "text" });
        });
        const used = new Set();
        let next = 1;
        const rows = table.data.map((row) => {
          if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("Invalid row");
          const copy = { ...row };
          const numeric = Number(copy.id);
          if (Number.isSafeInteger(numeric) && numeric > 0 && !used.has(numeric)) {
            copy.id = numeric;
            used.add(numeric);
            next = Math.max(next, numeric + 1);
          } else {
            if (copy.id != null) copy.legacyId = copy.id;
            while (used.has(next)) next++;
            copy.id = next++;
            used.add(copy.id);
          }
          return copy;
        });
        const maxUsed = [...used].reduce((maximum, id) => Math.max(maximum, id), 0);
        const counter = Number(table.nextId);
        const nextId = Number.isSafeInteger(counter) && counter > maxUsed ? counter : maxUsed + 1;
        migrated[name] = { ...table, columns: ["id", ...columns], columnDefs: defs, data: rows, nextId };
        if (JSON.stringify(migrated[name]) !== JSON.stringify(table)) this.migrationPending = true;
      }
      if (this.migrationPending) this.original = raw;
      return migrated;
    } catch (_) {
      this.readOnly = true;
      return Object.create(null);
    }
  }

  persist(next, schemaChange = false, destructive = false) {
    if (this.readOnly)
      throw new Error("تعذر قراءة البيانات السابقة؛ التحرير مقفل حتى لا تُستبدل البيانات.");
    try {
      const existing = this.storage.getItem(this.key);
      if (this.migrationPending && this.original !== null && this.storage.getItem(this.backupKey) === null)
        this.storage.setItem(this.backupKey, this.original);
      if (schemaChange && existing !== null && this.storage.getItem(this.schemaBackupKey) === null)
        this.storage.setItem(this.schemaBackupKey, existing);
      // Keep the immediately preceding database state before deleting any stored data.
      if (destructive && existing !== null)
        this.storage.setItem(this.destructiveBackupKey, existing);
      this.storage.setItem(this.key, JSON.stringify(next));
      this.db = next;
      this.migrationPending = false;
      this.original = null;
    } catch (_) {
      throw new Error("تعذر الحفظ محليًا. تحقق من المساحة وإعدادات المتصفح؛ لم يكتمل التعديل.");
    }
  }
  tables() { return Object.keys(this.db); }
  getTable(name) { return Object.prototype.hasOwnProperty.call(this.db, name) ? this.db[name] : null; }
  getColumns(name) { return this.getTable(name)?.columns ?? []; }
  getColumnDefs(name) { return this.getTable(name)?.columnDefs ?? []; }
  getData(name) { return this.getTable(name)?.data ?? []; }
  getNextId(name) { return this.getTable(name)?.nextId ?? 1; }

  getActive() {
    try {
      const name = this.storage.getItem(this.activeKey);
      return name && this.getTable(name) ? name : null;
    } catch (_) { return null; }
  }
  openTable(name) {
    if (!this.getTable(name)) throw new Error("الجدول غير موجود");
    const active = this.getActive();
    if (active && active !== name) throw new Error("أغلق الجدول الحالي أولًا");
    try { this.storage.setItem(this.activeKey, name); }
    catch (_) { throw new Error("تعذر فتح الجدول بسبب التخزين المحلي"); }
  }
  closeTable() {
    try { this.storage.removeItem(this.activeKey); }
    catch (_) { throw new Error("تعذر إغلاق الجدول"); }
  }
  requireOpen(name) {
    if (this.getActive() !== name) throw new Error("افتح الجدول لتعديله");
    const table = this.getTable(name);
    if (!table) throw new Error("الجدول غير موجود");
    return table;
  }
  createTable(name, definitions) {
    name = String(name || "").trim();
    if (this.getActive()) throw new Error("أغلق الجدول الحالي قبل إنشاء جدول جديد");
    if (!name || name.length > 100 || ["__proto__", "constructor", "prototype"].includes(name))
      throw new Error("اسم الجدول غير صالح");
    if (this.getTable(name)) throw new Error("اسم الجدول مستخدم بالفعل");
    const defs = this.normalizeDefs(definitions);
    this.persist({ ...this.db, [name]: { columns: ["id", ...defs.map((d) => d.name)], columnDefs: defs, nextId: 1, data: [] } });
    this.openTable(name);
  }

  validate(def, value, allowEmpty = false) {
    const raw = String(value ?? "").trim();
    if (!raw) {
      if (allowEmpty) return null;
      throw new Error("الحقل «" + def.name + "» مطلوب");
    }
    if (raw.length > 2000) throw new Error("القيمة طويلة جدًا في «" + def.name + "»");
    if (def.type === "number") {
      const num = Number(raw);
      if (!Number.isFinite(num)) throw new Error("أدخل رقمًا صالحًا في «" + def.name + "»");
      return num;
    }
    if (def.type === "date") {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + "T00:00:00Z") : null;
      if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw)
        throw new Error("أدخل تاريخًا صالحًا بصيغة YYYY-MM-DD في «" + def.name + "»");
      return raw;
    }
    if (def.type === "select") {
      if (!Array.isArray(def.options) || !def.options.includes(raw))
        throw new Error("اختر قيمة من قائمة «" + def.name + "»");
      return raw;
    }
    return raw;
  }

  insert(name, values) {
    const table = this.requireOpen(name);
    const row = { id: table.nextId };
    table.columnDefs.forEach((def) => { row[def.name] = this.validate(def, values[def.name]); });
    const updated = { ...table, nextId: table.nextId + 1, data: [...table.data, row] };
    this.persist({ ...this.db, [name]: updated });
    return row;
  }
  updateCell(name, id, column, value) {
    const table = this.requireOpen(name);
    const def = table.columnDefs.find((entry) => entry.name === column);
    if (!def) throw new Error("لا يمكن تعديل هذا الحقل");
    const index = table.data.findIndex((row) => row.id === id);
    if (index === -1) throw new Error("السجل غير موجود");
    const checked = this.validate(def, value, true);
    const data = table.data.map((row, i) => i === index ? { ...row, [column]: checked } : row);
    this.persist({ ...this.db, [name]: { ...table, data } });
  }

  addColumn(name, definition) {
    const table = this.requireOpen(name);
    const def = this.normalizeDef(definition);
    if (table.columnDefs.length >= 100) throw new Error("الحد الأقصى 100 عمود");
    if (table.columns.includes(def.name)) throw new Error("اسم العمود موجود بالفعل");
    const updated = {
      ...table,
      columns: [...table.columns, def.name],
      columnDefs: [...table.columnDefs, def],
      data: table.data.map((row) => ({ ...row, [def.name]: null }))
    };
    this.persist({ ...this.db, [name]: updated }, true);
  }

  previewColumnChange(name, previousName, definition) {
    const table = this.requireOpen(name);
    const prior = table.columnDefs.find((def) => def.name === previousName);
    if (!prior) throw new Error("العمود المراد تعديله غير موجود");
    const nextDef = this.normalizeDef(definition);
    if (nextDef.name !== previousName && table.columns.includes(nextDef.name))
      throw new Error("اسم العمود الجديد مستخدم في الجدول");
    if (nextDef.name === previousName && JSON.stringify(prior) === JSON.stringify(nextDef))
      return { changed: false, converted: 0, rows: table.data, definition: nextDef };

    let converted = 0;
    const rows = table.data.map((row) => {
      const oldValue = row[previousName];
      let nextValue = null;
      if (oldValue !== null && oldValue !== undefined && oldValue !== "") {
        try {
          nextValue = this.validate(nextDef, oldValue, true);
        } catch (error) {
          throw new Error("السجل " + row.id + ": " + error.message + " — عدّل بياناته قبل تغيير نوع العمود");
        }
      }
      if (typeof oldValue !== typeof nextValue || String(oldValue) !== String(nextValue))
        converted++;
      const nextRow = { ...row };
      if (previousName !== nextDef.name) delete nextRow[previousName];
      nextRow[nextDef.name] = nextValue;
      return nextRow;
    });
    return { changed: true, converted, rows, definition: nextDef };
  }

  updateColumn(name, previousName, definition) {
    const table = this.requireOpen(name);
    const preview = this.previewColumnChange(name, previousName, definition);
    if (!preview.changed) return false;
    const updated = {
      ...table,
      columns: table.columns.map((column) =>
        column === previousName ? preview.definition.name : column),
      columnDefs: table.columnDefs.map((def) =>
        def.name === previousName ? preview.definition : def),
      data: preview.rows
    };
    this.persist({ ...this.db, [name]: updated }, true);
    return true;
  }

  deleteColumn(name, column) {
    const table = this.requireOpen(name);
    if (!table.columnDefs.some((def) => def.name === column))
      throw new Error("لا يمكن حذف ID أو عمود غير موجود");
    if (table.columnDefs.length <= 1)
      throw new Error("يجب الإبقاء على عمود بيانات واحد على الأقل");
    const updated = {
      ...table,
      columns: table.columns.filter((value) => value !== column),
      columnDefs: table.columnDefs.filter((def) => def.name !== column),
      data: table.data.map((row) => {
        const next = { ...row };
        delete next[column];
        return next;
      })
    };
    this.persist({ ...this.db, [name]: updated }, true, true);
  }

  clearRow(name, id) {
    const table = this.requireOpen(name);
    const index = table.data.findIndex((row) => row.id === id);
    if (index < 0) throw new Error("الصف غير موجود");
    const original = table.data[index];
    if (table.columnDefs.every((def) => original[def.name] == null || original[def.name] === ""))
      return false;
    const data = table.data.map((row, i) => {
      if (i !== index) return row;
      const cleared = { ...row };
      table.columnDefs.forEach((def) => { cleared[def.name] = null; });
      return cleared;
    });
    this.persist({ ...this.db, [name]: { ...table, data } }, false, true);
    return true;
  }

  deleteRow(name, id) {
    const table = this.requireOpen(name);
    if (!table.data.some((row) => row.id === id))
      throw new Error("الصف غير موجود");
    const data = table.data.filter((row) => row.id !== id);
    // The counter is deliberately untouched; IDs are never reused.
    this.persist({ ...this.db, [name]: { ...table, data } }, false, true);
  }

  previewSchema(name, definitions) {
    const table = this.requireOpen(name);
    const defs = this.normalizeDefs(definitions);
    if (defs.length !== table.columnDefs.length ||
        defs.some((def, i) => def.name !== table.columnDefs[i].name))
      throw new Error("لا يمكن حذف أو إعادة تسمية عمود موجود من هذه الواجهة");
    const changed = defs.some((def, i) => JSON.stringify(def) !== JSON.stringify(table.columnDefs[i]));
    if (!changed) return { changed: false, converted: 0, rows: table.data, definitions: defs };
    let converted = 0;
    const rows = table.data.map((row) => {
      const updated = { ...row };
      defs.forEach((def, i) => {
        const value = row[def.name];
        if (value === undefined || value === null || value === "") return;
        let checked;
        try { checked = this.validate(def, value, true); }
        catch (error) { throw new Error("السجل " + row.id + ": " + error.message + " — عدّل البيانات قبل تغيير النوع"); }
        if (typeof checked !== typeof value || String(checked) !== String(value)) converted++;
        updated[def.name] = checked;
      });
      return updated;
    });
    return { changed, converted, rows, definitions: defs };
  }
  updateSchema(name, definitions) {
    const table = this.requireOpen(name);
    const preview = this.previewSchema(name, definitions);
    if (!preview.changed) return false;
    const updated = { ...table, columnDefs: preview.definitions, data: preview.rows };
    this.persist({ ...this.db, [name]: updated }, true);
    return true;
  }
}
window.RetailDB = new DBStorage();
