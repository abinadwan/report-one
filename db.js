"use strict";
/* Browser-only prototype storage. Not a server database. */
class DBStorage {
  constructor() {
    this.key = "retailpulse-db";
    this.db = this.load();
  }
  load() {
    try {
      const value = localStorage.getItem(this.key);
      if (!value) return {};
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid schema");
      return parsed;
    } catch (_) {
      // Do not overwrite existing malformed data automatically.
      this.readOnly = true;
      return {};
    }
  }
  save(next) {
    if (this.readOnly) throw new Error("البيانات المحفوظة غير قابلة للقراءة. احفظ نسخة منها قبل التعديل.");
    try {
      localStorage.setItem(this.key, JSON.stringify(next));
      this.db = next;
    } catch (_) {
      throw new Error("تعذر حفظ البيانات محليًا. تحقق من مساحة التخزين وإعدادات المتصفح.");
    }
  }
  tables() { return Object.keys(this.db); }
  createTable(name, columns) {
    if (Object.prototype.hasOwnProperty.call(this.db, name)) throw new Error("الجدول موجود بالفعل");
    if (!Array.isArray(columns) || !columns.length) throw new Error("أضف عمودًا واحدًا على الأقل");
    const names = columns.map((c) => c.name);
    if (names.some((n) => !n || n === "id") || new Set(names).size !== names.length)
      throw new Error("أسماء الأعمدة غير صالحة أو مكررة");
    const next = { ...this.db, [name]: { columns: ["id", ...names], data: [] } };
    this.save(next);
  }
  insert(table, row) {
    const current = this.db[table];
    if (!current) throw new Error("الجدول غير موجود");
    const entry = { ...row, id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2) };
    const next = { ...this.db, [table]: { ...current, data: [...current.data, entry] } };
    this.save(next);
  }
  getColumns(table) { return this.db[table]?.columns ?? []; }
  getData(table) { return this.db[table]?.data ?? []; }
  deleteAll(table) {
    if (this.db[table]) this.save({ ...this.db, [table]: { ...this.db[table], data: [] } });
  }
}
window.RetailDB = new DBStorage();
