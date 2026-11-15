# جدولة | Jadwala

**جداولك، بياناتك، بطريقتك.** / **Your tables. Your data. Your way.**

A lightweight open-source bilingual (العربية / English) table builder and data-entry app. Create Excel-style tables directly in your browser without a backend.

**Live:** https://abinadwan.github.io/report-one/ · **Editor:** https://abinadwan.github.io/report-one/db.html · **License:** [MIT](LICENSE)

> **Important:** Jadwala is a browser-based table editor, **not** a server database or a native Excel (`.xlsx`) editor. Export is available as CSV (opens in Excel) or JSON. The sample table on the home page is illustrative.

## العربية

### المميزات

- **إنشاء الجداول:** اسم جدول وأعمدة من الأنواع **نص / رقم / تاريخ / قائمة منسدلة**؛ مع تخصيص خيارات القائمة.
- **تسجيل البيانات:** صف إدخال دائم؛ اضغط **Enter** للتنقل بين الحقول وحفظ الصف في النهاية. أرقام **ID** تسلسلية تلقائية ولا يعاد استخدامها بعد حذف صف.
- **تعديل الجدول:** اضغط على الخلية لتعديلها، أو على رمز القلم بجانب العمود لتغيير اسمه أو نوعه أو خياراته أو حذفه. إضافة الأعمدة متاحة في نفس صفحة إدخال البيانات.
- **إدارة الصفوف:** **مسح القيم** يفرّغ الصف ويحافظ على ID؛ أما **حذف الصف** فيزيل السجل. تظهر رسالة تأكيد قبل العمليات الحذفية.
- **إدارة الجلسات:** جدول نشط واحد في كل مرة. أغلقه قبل إنشاء جدول جديد أو فتح جدول محفوظ آخر.
- **التصدير:** ملفات **CSV** بترميز UTF-8 مع BOM لفتح العربية في Excel، أو **JSON** يتضمن تعريفات الحقول والسجلات.
- **اللغة والمظهر:** تبديل **العربية (RTL)** و**English (LTR)** من الصفحتين، مع الوضع الليلي/النهاري. لا يغيّر تبديل اللغة أسماء الجداول أو القيم التي سجلها المستخدم.

### التشغيل

1. افتح [الصفحة الرئيسية](https://abinadwan.github.io/report-one/) ثم اختر **ابدأ إنشاء جدول**.
2. أدخل اسم الجدول وأسماء الأعمدة وأنواعها واضغط **إنشاء وفتح الجدول**.
3. أدخل القيم في الصف الأخير باستخدام **Enter**، أو اضغط **حفظ الصف**.
4. عدّل الخلايا والحقول مباشرة، أو استخدم أزرار مسح القيم وحذف الصف.
5. أغلق الجدول قبل فتح آخر، أو صدّر **CSV / JSON** للاحتفاظ بنسخة.

### التخزين والقيود

تُحفظ البيانات داخل **localStorage** في المتصفح، وليس على خادم. لا توجد حسابات أو مزامنة بين الأجهزة. **مسح بيانات الموقع أو تغيير الجهاز قد يؤدي إلى فقد السجلات.** صدّر JSON دوريًا؛ الاستيراد والاستعادة من الواجهة **غير متاحين حاليًا**. لا تستخدم النموذج الأولي للبيانات الحساسة أو الإنتاجية.

تبقى مفاتيح التخزين القديمة متوافقة:
- `retailpulse-db` — الجداول والسجلات.
- `retailpulse-active-table` — الجدول المفتوح.
- `retailpulse-theme` — المظهر.
- `jadwala-lang` — اللغة.

قبل ترحيل البيانات القديمة تُحفظ نسخة محلية تحت `retailpulse-db-backup-before-v2` عند أول كتابة. توجد أيضًا لقطات محلية قبل تعديل التعريفات والعمليات الحذفية، لكنها **لا تغني عن التصدير الخارجي**. لا يُدعم التحرير المتزامن من عدة تبويبات.

---

## English

### Features

- **Custom tables:** Define text, number, date and dropdown columns, with your own dropdown options.
- **Fast entry:** A persistent new row; **Enter** advances and saves. IDs are sequential and never reused.
- **Edit in place:** Edit saved cells, rename and change column types or options, add columns and delete columns directly in the grid.
- **Row actions:** **Clear values** preserves the record and ID; **Delete row** removes it. Destructive changes require confirmation.
- **Table sessions:** One active table at a time. Close a table to open or create another.
- **Export:** **CSV** (UTF-8 with BOM; opens in Excel) or **JSON** including data and schema.
- **Bilingual UI:** Switch between **Arabic (RTL)** and **English (LTR)** from either page. Light and dark themes are supported. User-authored values are never translated.

### Getting started

1. Open the [live app](https://abinadwan.github.io/report-one/) and select **Create a table**.
2. Name the table, add columns and choose their types, then select **Create and open table**.
3. Enter records in the final row with **Enter** or **Save row**.
4. Edit cells and column definitions in place, clear values or delete rows.
5. Close the active table before opening another, and export **CSV / JSON** if needed.

### Storage and limitations

Table data lives in browser **localStorage**, not a server. There is no login, multi-device sync or automatic cloud backup. Clearing site storage can remove records. Export JSON regularly; **import/restore via the UI is not yet supported**. Do not store sensitive or production-critical information.

Existing storage keys remain unchanged for compatibility; language preference uses `jadwala-lang`. The app stores local safety snapshots before migration and destructive edits, but they are not external backups. Concurrent editing from multiple tabs is unsupported.

### Run locally

Open `index.html` in a modern browser or host the folder as a static site. No build step or package manager is required. Google Fonts and Font Awesome are loaded from external CDNs when available.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Service landing page |
| `home.css` | Responsive landing styles |
| `db.html` | Table creation and data-entry UI |
| `db.css` | Responsive editor styles and RTL/LTR adjustments |
| `builder.js` | Grid interactions, keyboard navigation, column/row actions and export |
| `db.js` | Local storage, validation, schema migration and data operations |
| `i18n.js` | Shared Arabic/English translations and language preference |
| `style.css` | Shared styles and design tokens |
| `script.js` | Legacy simulated dashboard code, not loaded by the current pages |
| `.github/workflows/static.yml` | Static GitHub Pages deployment from `main` |
| `LICENSE` | MIT open-source license |

## Licensing and contribution

The project’s **original source code** is available under the [MIT License](LICENSE). Third-party assets (such as Tajawal via Google Fonts and Font Awesome) retain **their own licenses**. The project license does not change their terms.

The app is an **early prototype**; further work could include import/restore, record search, synchronization and a real backend. Issues and pull requests are welcome through [GitHub](https://github.com/abinadwan/report-one).

© 2026 Jadwala contributors.
