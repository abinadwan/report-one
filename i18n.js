"use strict";
/* Jadwala UI translations. User-authored table names and cell values are never translated. */
(() => {
  const ar = {
    appName:"جدولة", tagline:"Jadwala — إنشاء وتنظيم جداول البيانات",
    homeTitle:"جدولة | إنشاء جداول البيانات وتسجيل السجلات",
    homeDescription:"أنشئ جداول بيانات شبيهة بإكسل، حدد الأعمدة وأنواع الحقول، وسجّل البيانات وعدّلها بسهولة في متصفحك.",
    homeAria:"جدولة - الصفحة الرئيسية", mainNavigation:"التنقل الرئيسي",
    featuresNav:"مميزات الخدمة", howNav:"كيف تبدأ؟", startNow:"ابدأ الآن",
    available:"خدمة متاحة الآن", heroLead:"أنشئ جدول بياناتك،", heroAccent:"وسجّل معلوماتك بسهولة.",
    heroText:"حوّل بياناتك إلى جداول منظمة بأسلوب يشبه Excel. سمِّ الأعمدة، حدّد أنواع الحقول، وأدخل السجلات وعدّلها مباشرة داخل الجدول، دون الحاجة إلى إعداد قاعدة بيانات معقدة.",
    createCTA:"ابدأ إنشاء جدول", learnMore:"تعرف على طريقة العمل",
    localNote:"بياناتك محفوظة محليًا داخل متصفحك، وليست على خادم مركزي.",
    previewAria:"مثال توضيحي لشكل جدول بيانات",
    previewName:"جدول الطلبات", demoLabel:"معاينة توضيحية",
    colName:"الاسم", colQuantity:"الكمية", colStatus:"الحالة",
    exampleOne:"طلب أحمد", exampleTwo:"طلب سارة", exampleThree:"طلب نورة",
    completed:"مكتمل", inProgress:"قيد التنفيذ", enterName:"أدخل الاسم…",
    readyNewRow:"صف جديد جاهز للإدخال السريع",
    featuresKicker:"ما الذي تقدمه الخدمة؟",
    featuresTitle:"كل ما تحتاجه لتنظيم بياناتك في مكان واحد",
    featuresIntro:"خدمة بسيطة لبناء جداولك الخاصة وتسجيل السجلات، مع أدوات للتحكم في شكل الحقول ومحتواها.",
    featureOne:"إنشاء جداول مخصصة", featureOneDesc:"حدّد اسم الجدول وأعمدته، وأضف أعمدة جديدة أو غيّر أنواعها لاحقًا.",
    featureTwo:"حقول تناسب بياناتك", featureTwoDesc:"نص، رقم، تاريخ أو قائمة منسدلة بخيارات تحدّدها بنفسك.",
    featureThree:"تسجيل وتعديل سريع", featureThreeDesc:"أدخل السجلات باستخدام Enter، وعدّل الخلايا مباشرة مع حفظ التغييرات.",
    featureFour:"تصدير بياناتك", featureFourDesc:"نزّل جداولك بصيغة CSV القابلة للفتح في Excel، أو بصيغة JSON.",
    stepsKicker:"ثلاث خطوات فقط", stepsTitle:"من جدول فارغ إلى بيانات منظمة",
    stepsIntro:"ابدأ بنفسك دون إعدادات تقنية أو خطوات معقدة.",
    stepOne:"أنشئ الجدول", stepOneDesc:"اكتب اسم الجدول، وأضف الأعمدة وحدّد نوع كل حقل وخيارات القوائم عند الحاجة.",
    stepTwo:"سجّل البيانات", stepTwoDesc:"املأ الصفوف واحدًا بعد الآخر باستخدام لوحة المفاتيح، وعدّل أي خلية لاحقًا.",
    stepThree:"احفظ وصدّر", stepThreeDesc:"تُحفظ البيانات في المتصفح تلقائيًا. أغلق الجدول وأعد فتحه أو صدّر ملف CSV أو JSON.",
    ctaTitle:"جاهز تنظم بياناتك؟", ctaDesc:"ابدأ بجدول جديد، وأضف سجلاتك بالطريقة المناسبة لك.",
    openBuilder:"افتح منشئ الجداول", footerOne:"جدولة — أداة لتجربة إنشاء جداول البيانات وتسجيل السجلات.",
    footerTwo:"التصدير حاليًا: CSV وJSON، وليس ملف Excel .xlsx مباشرًا.",
    dbTitle:"جدولة | منشئ جداول البيانات", home:"الصفحة الرئيسية",
    newTableNav:"إنشاء جدول", dataEntryNav:"إدخال بيانات",
    returnHome:"العودة إلى الصفحة الرئيسية", createHeading:"ابدأ بإنشاء جدول جديد",
    tableNameLabel:"اسم الجدول", tableNamePlaceholder:"مثلاً: المبيعات",
    columnsTitle:"الأعمدة (الحقول)", addColumn:"إضافة عمود",
    createAndOpen:"إنشاء وفتح الجدول", tableEditor:"محرر الجداول",
    savedTables:"الجداول المحفوظة", openTable:"فتح الجدول", closeTable:"إغلاق الجدول",
    exportCSV:"تصدير CSV", exportJSON:"تصدير JSON",
    editorHelp:"اضغط Enter للانتقال بين الحقول وحفظ الصف. لتعديل عمود أو حذفه اضغط رمز القلم بجانب اسمه، ولمسح قيم صف أو حذفه استخدم أزرار الإجراءات بجانبه.",
    columnPanelAria:"إضافة أو تعديل عمود", addColumnHeading:"إضافة عمود",
    columnPanelHelp:"حدد اسم العمود ونوع الحقل. يمكنك إعادة تسمية العمود الموجود أو حذفه.",
    closePanel:"إغلاق", columnNameLabel:"اسم العمود", columnNamePlaceholder:"مثال: حالة الطلب",
    fieldType:"نوع الحقل", typeText:"نص", typeNumber:"رقم", typeDate:"تاريخ",
    typeSelect:"قائمة منسدلة", optionsLabel:"خيارات القائمة — خيار في كل سطر",
    optionsPlaceholder:"جديد\nقيد التنفيذ\nمكتمل",
    saveColumn:"حفظ العمود", deleteColumn:"حذف العمود",
    gridAria:"جدول إدخال البيانات؛ يمكن التمرير أفقيًا عند زيادة الأعمدة",
    lightMode:"الوضع النهاري", darkMode:"الوضع الليلي",
    themeLightAria:"تفعيل الوضع النهاري", themeDarkAria:"تفعيل الوضع الليلي",
    english:"English", arabic:"العربية", langToggle:"English", languageAria:"تبديل اللغة",
    stepDigitOne:"١", stepDigitTwo:"٢", stepDigitThree:"٣", inlineEditHint:"اضغط لتعديل الخلية",
    enterField:"إدخال", editField:"تعديل", record:"السجل", choose:"اختر...",
    remove:"حذف", action:"إجراءات", clearValues:"مسح القيم", deleteRow:"حذف الصف",
    saveRow:"حفظ الصف", addNewColumn:"إضافة عمود جديد",
    editColumn:"تعديل أو حذف العمود", optionsEditor:"خيارات القائمة (خيار في كل سطر)",
    optionsExisting:"خيارات القائمة (خيار في كل سطر؛ احفظ لتطبيقها)",
    noTables:"لا توجد جداول", noTablesHelp:"لا توجد جداول. أنشئ جدولًا أولًا.",
    storageReadOnly:"تعذر قراءة بعض البيانات المحفوظة؛ التحرير متوقف لحمايتها.",
    canCreate:"يمكن إنشاء جدول جديد أو فتح جدول محفوظ.",
    unsavedLeave:"هناك إدخال أو تعديل لم يُحفظ. هل تريد تجاهله؟",
    emptyTable:"اختر جدولًا أولًا", createdOpened:"تم إنشاء الجدول وفتحه",
    opened:"تم فتح الجدول", closed:"تم إغلاق الجدول دون حذف بياناته",
    exportReady:"تم تجهيز ملف التصدير", noChange:"لا يوجد تعديل على العمود",
    savedColumn:"تم حفظ تعديل العمود", addedColumn:"تمت إضافة العمود إلى الجدول",
    columnSaveFailed:"تعذر حفظ العمود", colNotFound:"العمود غير موجود",
    needOpen:"افتح جدولًا أولًا", needOpenForCols:"افتح الجدول أولًا لإضافة الأعمدة أو تعديلها",
    saveEditFirst:"احفظ تعديل الخلية الحالية قبل تغيير الأعمدة",
    missingColumn:"اختر عمودًا موجودًا لحذفه",
    keepOne:"يجب الإبقاء على عمود بيانات واحد على الأقل",
    deleteColFailed:"تعذر حذف العمود",
    clearFailed:"تعذر مسح بيانات الصف", deleteRowFailed:"تعذر حذف الصف",
    emptyAlready:"الصف فارغ بالفعل",
    cantCreateOpen:"أغلق الجدول الحالي قبل إنشاء جدول جديد",
    unsavedCol:"هناك تعديلات غير محفوظة على تعريف العمود. هل تريد إلغاءها؟",
    unsavedGrid:"هناك بيانات قيد الإدخال أو تعديل خلية لم يُحفظ. هل تريد تجاهلها ومتابعة العملية؟",
    colEditDesc:"عدّل اسم العمود أو نوعه أو خياراته، أو احذفه. لن تُستبدل بيانات غير متوافقة دون تنبيه.",
    colNewDesc:"حدّد اسم العمود ونوعه؛ يظهر بعد الحفظ مباشرة في جدول البيانات.",
    saveColumnEdit:"حفظ تعديل العمود", addColumnToTable:"إضافة العمود للجدول",
    typeNoChange:"لا يوجد تعديل على العمود",
    colChangeConfirm:"سيتم تغيير تعريف العمود مع الاحتفاظ ببيانات الصفوف. هل تعتمد التعديل؟",
    corruptDb:"تعذر قراءة البيانات السابقة؛ التحرير مقفل حتى لا تُستبدل البيانات.",
    saveDbFailed:"تعذر الحفظ محليًا. تحقق من المساحة وإعدادات المتصفح؛ لم يكتمل التعديل.",
    tableMissing:"الجدول غير موجود", closeFirst:"أغلق الجدول الحالي أولًا",
    openFailure:"تعذر فتح الجدول بسبب التخزين المحلي", closeFailure:"تعذر إغلاق الجدول",
    mustOpen:"افتح الجدول لتعديله", invalidTableName:"اسم الجدول غير صالح",
    tableExists:"اسم الجدول مستخدم بالفعل", invalidColumnName:"اسم العمود غير صالح أو محجوز",
    tooManyCols:"أضف من عمود واحد إلى 100 عمود", duplicateCols:"لا يسمح بتكرار أسماء الأعمدة",
    editNotAllowed:"لا يمكن تعديل هذا الحقل", missingRecord:"السجل غير موجود",
    maxCols:"الحد الأقصى 100 عمود", colExists:"اسم العمود موجود بالفعل",
    colEditMissing:"العمود المراد تعديله غير موجود",
    colRenameExists:"اسم العمود الجديد مستخدم في الجدول",
    noDeleteID:"لا يمكن حذف ID أو عمود غير موجود",
    rowMissing:"الصف غير موجود",
    noRenameLegacy:"لا يمكن حذف أو إعادة تسمية عمود موجود من هذه الواجهة",
    noChangeType:"نوع الحقل لم يتغير",
    createdCol:"تمت إضافة العمود إلى الجدول",
    addOneField:"اسم العمود", removeField:"حذف",
    defaultNoName:"أدخل اسم العمود", unknownError:"حدث خطأ غير متوقع",
    webLicense:"الترخيص: MIT"
  };
  const en = {
    appName:"Jadwala", tagline:"Create and organize your data tables",
    homeTitle:"Jadwala | Create tables and record data",
    homeDescription:"Create Excel-style tables, define field types, and enter or edit records directly in your browser.",
    homeAria:"Jadwala — home page", mainNavigation:"Main navigation",
    featuresNav:"Features", howNav:"How it works", startNow:"Get started",
    available:"Available now", heroLead:"Build your own tables.", heroAccent:"Record data with ease.",
    heroText:"Organize information in flexible Excel-style tables. Name your columns, choose field types, and enter or edit records directly in the grid — no complicated database setup.",
    createCTA:"Create a table", learnMore:"See how it works",
    localNote:"Your data stays in this browser, not on a central server.",
    previewAria:"Illustrative table preview", previewName:"Orders table", demoLabel:"Illustration only",
    colName:"Name", colQuantity:"Quantity", colStatus:"Status",
    exampleOne:"Ahmed's order", exampleTwo:"Sara's order", exampleThree:"Noura's order",
    completed:"Completed", inProgress:"In progress", enterName:"Enter a name…",
    readyNewRow:"A new row is ready for quick entry",
    featuresKicker:"Features", featuresTitle:"Everything you need to keep your data organized",
    featuresIntro:"Create your own tables, capture records, and choose the field structure that fits your workflow.",
    featureOne:"Custom tables", featureOneDesc:"Name tables and columns, then add columns or update their types whenever needed.",
    featureTwo:"Flexible field types", featureTwoDesc:"Text, numbers, dates, or dropdown lists with your own options.",
    featureThree:"Fast entry and editing", featureThreeDesc:"Move between fields with Enter and edit saved cells directly in the grid.",
    featureFour:"Export your records", featureFourDesc:"Export to CSV for Excel or download structured JSON data.",
    stepsKicker:"Just three steps", stepsTitle:"From blank table to organized records",
    stepsIntro:"Start without complex setup or technical knowledge.",
    stepOne:"Create a table", stepOneDesc:"Name the table, add columns, set their types, and define dropdown choices if needed.",
    stepTwo:"Enter records", stepTwoDesc:"Fill rows with your keyboard and edit any cell later.",
    stepThree:"Save and export", stepThreeDesc:"Changes are stored locally. Close and reopen a table, or export CSV or JSON.",
    ctaTitle:"Ready to organize your data?", ctaDesc:"Start with a new table and record information your way.",
    openBuilder:"Open table builder", footerOne:"Jadwala — a simple tool for creating tables and recording data.",
    footerTwo:"Exports: CSV and JSON. Native Excel .xlsx downloads are not supported yet.",
    dbTitle:"Jadwala | Table builder", home:"Home",
    newTableNav:"Create table", dataEntryNav:"Data entry",
    returnHome:"Back to home", createHeading:"Create a new table",
    tableNameLabel:"Table name", tableNamePlaceholder:"e.g. Sales",
    columnsTitle:"Columns (fields)", addColumn:"Add column",
    createAndOpen:"Create and open table", tableEditor:"Table editor",
    savedTables:"Saved tables", openTable:"Open table", closeTable:"Close table",
    exportCSV:"Export CSV", exportJSON:"Export JSON",
    editorHelp:"Use Enter to move between fields and save a row. Select the pencil beside a column to edit or delete it. Use row actions to clear cell values or delete a row.",
    columnPanelAria:"Add or edit a column", addColumnHeading:"Add a column",
    columnPanelHelp:"Choose a column name and field type. You can rename or delete an existing column.",
    closePanel:"Close", columnNameLabel:"Column name", columnNamePlaceholder:"e.g. Order status",
    fieldType:"Field type", typeText:"Text", typeNumber:"Number", typeDate:"Date",
    typeSelect:"Dropdown", optionsLabel:"Dropdown options — one per line",
    optionsPlaceholder:"New\nIn progress\nCompleted",
    saveColumn:"Save column", deleteColumn:"Delete column",
    gridAria:"Data entry table; scroll horizontally if there are many columns",
    lightMode:"Light mode", darkMode:"Dark mode",
    themeLightAria:"Switch to light mode", themeDarkAria:"Switch to dark mode",
    english:"English", arabic:"العربية", langToggle:"العربية", languageAria:"Switch language",
    stepDigitOne:"1", stepDigitTwo:"2", stepDigitThree:"3", inlineEditHint:"Click to edit this cell",
    enterField:"Enter", editField:"Edit", record:"Record", choose:"Select...",
    remove:"Remove", action:"Actions", clearValues:"Clear values", deleteRow:"Delete row",
    saveRow:"Save row", addNewColumn:"Add a new column",
    editColumn:"Edit or delete column", optionsEditor:"Dropdown options (one per line)",
    optionsExisting:"Dropdown options (one per line; save to apply)",
    noTables:"No saved tables", noTablesHelp:"No tables yet. Create one to get started.",
    storageReadOnly:"Some saved data could not be read; editing is locked to protect it.",
    canCreate:"You can create a new table or open a saved one.",
    unsavedLeave:"You have unsaved edits or entries. Discard them?",
    emptyTable:"Select a table first", createdOpened:"Table created and opened",
    opened:"Table opened", closed:"Table closed. Your data is preserved.",
    exportReady:"Export file prepared", noChange:"No changes to the column",
    savedColumn:"Column updated", addedColumn:"Column added to the table",
    columnSaveFailed:"Could not save the column", colNotFound:"Column not found",
    needOpen:"Open a table first", needOpenForCols:"Open a table before adding or editing columns",
    saveEditFirst:"Save the current cell edit before changing columns",
    missingColumn:"Select an existing column to delete",
    keepOne:"At least one data column must remain",
    deleteColFailed:"Could not delete the column",
    clearFailed:"Could not clear the row", deleteRowFailed:"Could not delete the row",
    emptyAlready:"The row is already empty",
    cantCreateOpen:"Close the current table before creating another",
    unsavedCol:"You have unsaved column changes. Discard them?",
    unsavedGrid:"You have an unsaved entry or cell edit. Discard it and continue?",
    colEditDesc:"Change the column name, type, or options — or delete it. Incompatible data will not be overwritten.",
    colNewDesc:"Choose a name and field type. The column appears in the grid after saving.",
    saveColumnEdit:"Save column changes", addColumnToTable:"Add column to table",
    typeNoChange:"No changes to the column",
    colChangeConfirm:"The column definition will be updated while keeping existing records. Continue?",
    corruptDb:"Previously saved data could not be read. Editing is locked to protect it.",
    saveDbFailed:"Unable to save locally. Check browser settings and free space; changes were not completed.",
    tableMissing:"Table not found", closeFirst:"Close the current table first",
    openFailure:"Unable to open the table because of local storage", closeFailure:"Unable to close the table",
    mustOpen:"Open the table to edit it", invalidTableName:"Invalid table name",
    tableExists:"This table name already exists", invalidColumnName:"Invalid or reserved column name",
    tooManyCols:"Add between 1 and 100 columns", duplicateCols:"Column names must be unique",
    editNotAllowed:"This field cannot be edited", missingRecord:"Record not found",
    maxCols:"Maximum of 100 columns", colExists:"Column name already exists",
    colEditMissing:"Column to edit was not found",
    colRenameExists:"The new column name is already used",
    noDeleteID:"Cannot delete the ID column or a missing column",
    rowMissing:"Row not found",
    noRenameLegacy:"This action cannot remove or rename existing columns",
    noChangeType:"Column type has not changed",
    createdCol:"Column added",
    addOneField:"Column name", removeField:"Remove",
    defaultNoName:"Enter a column name", unknownError:"An unexpected error occurred",
    webLicense:"License: MIT"
  };

  const saved = (() => {
    try { return localStorage.getItem("jadwala-lang"); }
    catch (_) { return null; }
  })();
  let language = saved === "en" ? "en" : "ar";
  const arToKey = Object.create(null);
  Object.keys(ar).forEach((key) => { if (typeof ar[key] === "string") arToKey[ar[key]] = key; });
  const patterns = [
    [/^الجدول «(.+)» مفتوح\. أغلقه قبل إنشاء جدول آخر\.$/s, (m) => 'Table “' + m[1] + '” is open. Close it before creating another.'],
    [/^الجدول المفتوح: (.*?) — (\d+) سجلات — الحفظ تلقائي$/s, (m) => 'Open table: ' + m[1] + ' — ' + m[2] + ' records — autosaved'],
    [/^الجدول مغلق: (.*?) — (\d+) سجلات — افتحه للتعديل$/s, (m) => 'Closed table: ' + m[1] + ' — ' + m[2] + ' records — open to edit'],
    [/^تعديل العمود: (.*)$/s, (m) => 'Edit column: ' + m[1]],
    [/^تعديل اسم أو نوع العمود أو حذف العمود (.*)$/s, (m) => 'Edit or delete column ' + m[1]],
    [/^تعديل أو حذف العمود (.*)$/s, (m) => 'Edit or delete column ' + m[1]],
    [/^تعديل (.*?) للسجل (\d+)$/s, (m) => 'Edit ' + m[1] + ' in record ' + m[2]],
    [/^تم حفظ تعديل السجل (\d+)$/, (m) => 'Saved changes to record ' + m[1]],
    [/^مسح قيم الصف رقم (\d+) مع إبقاء الرقم التسلسلي$/, (m) => 'Clear values in row ' + m[1] + ' while keeping its ID'],
    [/^مسح جميع قيم الصف رقم (\d+)؟ سيبقى رقم ID والسجل موجودين\.$/, (m) => 'Clear all values in row ' + m[1] + '? The record and ID will remain.'],
    [/^تم مسح بيانات الصف رقم (\d+)$/, (m) => 'Cleared values in row ' + m[1]],
    [/^حذف الصف رقم (\d+) بالكامل$/, (m) => 'Delete row ' + m[1] + ' entirely'],
    [/^حذف الصف رقم (\d+) بالكامل؟ لن تتغير معرفات الصفوف الأخرى\.$/, (m) => 'Delete row ' + m[1] + '? Other IDs will not change.'],
    [/^تم حذف الصف رقم (\d+)$/, (m) => 'Deleted row ' + m[1]],
    [/^إدخال (.*)$/s, (m) => 'Enter ' + m[1]],
    [/^سيتم تحويل (\d+) قيمة مع تحديث اسم أو نوع العمود\. هل تعتمد التعديل؟$/, (m) => 'Convert ' + m[1] + ' stored values while updating the column?'],
    [/^هل تريد حذف العمود «(.*?)» نهائيًا؟\nستُحذف قيمه من جميع السجلات(?: \((\d+) صفوف تحتوي بيانات\))?، ولن تتأثر الأعمدة الأخرى أو أرقام ID\.\nيمكنك تصدير JSON قبل الحذف للاحتفاظ بنسخة خارجية\.$/s,
      (m) => 'Permanently delete column “' + m[1] + '”? All its values will be removed' + (m[2] ? ' (' + m[2] + ' rows contain data)' : '') + '. Other columns and IDs will be kept. Export JSON first if you want an external backup.'],
    [/^تم حذف العمود «(.*?)»$/s, (m) => 'Deleted column “' + m[1] + '”'],
    [/^نوع الحقل غير معروف: (.*)$/s, (m) => 'Unknown field type: ' + m[1]],
    [/^أضف خيارات القائمة للحقل «(.*?)»$/s, (m) => 'Add dropdown options for “' + m[1] + '”'],
    [/^خيارات «(.*?)» يجب أن تكون غير فارغة وغير مكررة \(100 خيار كحد أقصى\)$/s, (m) => '“' + m[1] + '” needs unique, non-empty options (up to 100)'],
    [/^الحقل «(.*?)» مطلوب$/s, (m) => 'Field “' + m[1] + '” is required'],
    [/^القيمة طويلة جدًا في «(.*?)»$/s, (m) => 'Value is too long in “' + m[1] + '”'],
    [/^أدخل رقمًا صالحًا في «(.*?)»$/s, (m) => 'Enter a valid number in “' + m[1] + '”'],
    [/^أدخل تاريخًا صالحًا بصيغة YYYY-MM-DD في «(.*?)»$/s, (m) => 'Enter a valid YYYY-MM-DD date in “' + m[1] + '”'],
    [/^اختر قيمة من قائمة «(.*?)»$/s, (m) => 'Choose an option from “' + m[1] + '”'],
    [/^السجل (\d+): (.*?) — عدّل بياناته قبل تغيير نوع العمود$/s, (m) => 'Record ' + m[1] + ': ' + translate(m[2]) + '. Edit it before changing the column type.']
  ];
  function getLang() { return language; }
  function t(key) { return (language === "en" ? en : ar)[key] ?? ar[key] ?? key; }
  function translate(str) {
    if (language !== "en" || typeof str !== "string") return str;
    const key = arToKey[str];
    if (key) return en[key] || str;
    for (const [regex, fn] of patterns) {
      const m = str.match(regex);
      if (m) return fn(m);
    }
    return str;
  }
  function apply(root = document) {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    const labels = root.querySelectorAll("[data-i18n]");
    labels.forEach((node) => { node.textContent = t(node.dataset.i18n); });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });
    root.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.title = t(node.dataset.i18nTitle);
    });
    const title = document.querySelector("title[data-i18n]");
    if (title) title.textContent = t(title.dataset.i18n);
    const description = document.querySelector('meta[name="description"][data-i18n]');
    if (description) description.setAttribute("content", t(description.dataset.i18n));
  }
  function setLang(next) {
    if (next !== "en" && next !== "ar") return;
    language = next;
    try { localStorage.setItem("jadwala-lang", language); }
    catch (_) {}
    apply();
    window.dispatchEvent(new CustomEvent("jadwala:languagechange", { detail: { language } }));
  }
  window.JadwalaI18n = { getLang, t, translate, apply, setLang };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => apply());
  else apply();
})();