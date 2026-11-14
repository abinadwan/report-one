/**
 *  RetailDB – Simple localStorage DB wrapper
 */
class DBStorage {
  constructor(){
    this.key="retailpulse-db";
    this.db=this.load()||{}; // { tableName: { columns: [], data: [] } }
  }
  load(){return JSON.parse(localStorage.getItem(this.key));}
  save(){localStorage.setItem(this.key,JSON.stringify(this.db));}
  tables(){return Object.keys(this.db);}
  createTable(name,columns){
    if(this.db[name]) throw new Error(`الجدول "${name}" موجودٌ بالفعل`);
    const allCols=["id",...columns.map(c=>c.name)];
    this.db[name]={columns:allCols,data:[]};
    this.save();
  }
  insert(table,row){
    const tbl=this.db[table];
    if(!tbl) throw new Error(`الجدول "${table}" غير موجود`);
    row.id=Date.now()+Math.random();
    tbl.data.push(row);
    this.save();
  }
  getColumns(table){return this.db[table]?.columns??[];}
  getData(table){return this.db[table]?.data??[];}
  deleteAll(table){if(this.db[table]){this.db[table].data=[];this.save();}}
}
window.RetailDB=new DBStorage();
