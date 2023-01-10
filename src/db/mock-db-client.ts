import { columnsDefinition, ColumnSelection, DBCondition, MockDB } from "./mock-schema-validated-db.js";
export class DBClient {
    private db: MockDB;
    constructor(){
        this.db = new MockDB();
    }
    printAllData(){
        this.db.printAllData();
    }
    async createTable(tableName: string, columnsDefinition: columnsDefinition[]){
        return this.db.createTable(tableName, columnsDefinition);
    }
    async insert(tableName: string, data: any){
        return this.db.insert(tableName, data);
    }
    async delete(tableName: string, id: string){
        return this.db.delete(tableName, id);
    }
    async aggregate(tableName: string, columns: ColumnSelection[], condition: DBCondition[]){
        return this.db.aggregate(tableName, columns, condition);
    }
    async selectManyFromTable(tableName: string, columns: string[], condition: DBCondition[]){
        return this.db.selectManyFromTable(tableName, columns, condition);
    }
    async selectOneFromTable(tableName: string, columns: string[], condition: DBCondition[]){
        return this.db.selectOneFromTable(tableName, columns, condition);
    }
}