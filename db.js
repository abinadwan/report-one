"use strict";
/* Local-only storage adapter. Never silently discard older user data. */
class DBStorage {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.key = "retailpulse-db";
    this.activeKey = "retailpulse-active-table";
    this.backupKey = "retailpulse-db-backup-before-v2";
    this.readOnly = false;
    this.migrationPending = false;
    this.original = null;
    this.db = this.load();
  }

  load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid database root");
      const migrated = {};
      for (const [name, table] of Object.entries(parsed)) {
        if (!table || !Array.isArray(table.columns) || !Array.isArray(table.data)) throw new Error("Invalid table");
        const columns = table.columns.filter((column) => column !== "id");
        if (columns.some((column) => typeof column !== "string") || new Set(columns).size !== columns.length) throw new Error("Invalid columns");
        const defs = columns.map((name) => {
          const existing = (table.columnDefs || []).find((def) => def.name === name);
          return { name, type: ["text", "number", "date"].includes(existing?.type) ? existing.type : "text" };
        });
        const used = new Set();
        let next = 1;
        const data = table.data.map((row) => {
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
        const maxUsed = used.size ? Math.max(...used) : 0;
        const counter = Number(table.nextId);
        const nextId = Number.isSafeInteger(counter) && counter > maxUsed ? counter : maxUsed + 1;
        migrated[name] = { columns: ["id", ...columns], columnDefs: defs, data, nextId };
        if (!table.columnDefs || table.nextId !== nextId ||
            table.columns.length !== migrated[name].columns.length ||
            data.some((row, index) => row.id !== table.data[index].id)) this.migrationPending = true;
      }
      if (this.migrationPending) this.original = raw;
      return migrated;
    } catch (_) {
      this.readOnly = true;
      return {};
    }
  }

  persist(next) {
    if (this.readOnly) throw new Error("تعذر قراءة البيانات السابقة. لن يتم استبدالها. خذ نسخة من التخزين أولًا.");
    try {
      if (this.migrationPending && this.original !== null && this.storage.getItem(this.backupKey) === null) {
        this.storage.setItem(this.backupKey, this.original);
      }
      this.storage.setItem(this.key, JSON.stringify(next));
      this.db = next;
      this.migrationPending = false;
      this.original = null;
    } catch (_) {
      throw new Error("فشل الحفظ المحلي. تحقق من المساحة وإعدادات المتصفح؛ البيانات القديمة لم تُستبدل.");
    }
  }

  tables() { return Object.keys(this.db); }
  getTable(name) { return this.db[name] || null; }
  getColumns(name) { return this.getTable(name)?.columns || []; }
  getColumnDefs(name) { return this.getTable(name)?.columnDefs || []; }
  getData(name) { return this.getTable(name)?.data || []; }
  getNextId(name) { return this.getTable(name)?.nextId || 1; }

  getActive() {
    try {
      const name = this.storage.getItem(this.activeKey);
      return name && this.getTable(name) ? name : null;
    } catch (_) { return null; }
  }
  openTable(name) {
    if (!this.getTable(name)) throw new Error("الجدول غير موجود");
    const active = this.getActive();
    if (active && active !== name) throw new Error("أغلق الجدول الحالي قبل فتح جدول آخر");
    try { this.storage.setItem(this.activeKey, name); }
    catch (_) { throw new Error("تعذر فتح جلسة الجدول بسبب التخزين المحلي"); }
  }
  closeTable() {
    try { this.storage.removeItem(this.activeKey); }
    catch (_) { throw new Error("تعذر إغلاق جلسة الجدول"); }
  }
  createTable(name, defs) {
    name = name.trim();
    if (this.getActive()) throw new Error("أغلق الجدول الحالي قبل إنشاء جدول جديد");
    if (!name || name.length > 100 || ["__proto__", "constructor", "prototype"].includes(name))
      throw new Error("اسم الجدول غير صالح");
    if (Object.prototype.hasOwnProperty.call(this.db, name)) throw new Error("اسم الجدول مستخدم بالفعل");
    if (!Array.isArray(defs) || !defs.length) throw new Error("أضف عمودًا واحدًا على الأقل");
    const names = defs.map((d) => d.name?.trim());
    if (names.some((n) => !n || n.length > 100 || n === "id" || n === "legacyId") || new Set(names).size !== names.length)
      throw new Error("أسماء الأعمدة فارغة أو مكررة أو محجوزة");
    if (defs.some((d) => !["text", "number", "date"].includes(d.type))) throw new Error("نوع عمود غير معروف");
    const columnDefs = defs.map((d, i) => ({ name: names[i], type: d.type }));
    this.persist({ ...this.db, [name]: { columns: ["id", ...names], columnDefs, nextId: 1, data: [] } });
    this.openTable(name);
  }
  validate(def, value) {
    const text = String(value ?? "").trim();
    if (!text) throw new Error("الحقل «" + def.name + "» مطلوب");
    if (text.length > 2000) throw new Error("القيمة طويلة جدًا في «" + def.name + "»");
    if (def.type === "number") {
      if (!Number.isFinite(Number(text))) throw new Error("أدخل رقمًا صحيحًا في «" + def.name + "»");
      return Number(text);
    }
    if (def.type === "date") {
      const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(text + "T00:00:00Z") : null;
      if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text)
        throw new Error("أدخل تاريخًا صحيحًا في «" + def.name + "»");
    }
    return text;
  }
  insert(tableName, values) {
    if (this.getActive() !== tableName) throw new Error("افتح الجدول أولًا");
    const table = this.getTable(tableName);
    if (!table) throw new Error("الجدول غير موجود");
    const row = { id: table.nextId };
    table.columnDefs.forEach((def) => { row[def.name] = this.validate(def, values[def.name]); });
    const replacement = { ...table, nextId: table.nextId + 1, data: [...table.data, row] };
    this.persist({ ...this.db, [tableName]: replacement });
    return row;
  }
  updateCell(tableName, id, column, value) {
    if (this.getActive() !== tableName) throw new Error("افتح الجدول أولًا");
    const table = this.getTable(tableName);
    const def = table?.columnDefs.find((entry) => entry.name === column);
    if (!def) throw new Error("لا يمكن تعديل هذا الحقل");
    const index = table.data.findIndex((row) => row.id === id);
    if (index < 0) throw new Error("السجل غير موجود");
    const checked = this.validate(def, value);
    const rows = table.data.map((row, i) => i === index ? { ...row, [column]: checked } : row);
    this.persist({ ...this.db, [tableName]: { ...table, data: rows } });
  }
}
window.RetailDB = new DBStorage();
