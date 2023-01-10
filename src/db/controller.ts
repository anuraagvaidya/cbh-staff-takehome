import { DBClient } from "./mock-db-client.js";

export interface SalaryRecord {
    id: string,
    name: string,
    salary: string,
    currency: string,
    department: string,
    sub_department: string,
    on_contract: boolean,
}
export interface SummaryStatistics {
    min: number,
    max: number,
    mean: number,
}
export interface NewSalaryRecord extends Omit<SalaryRecord, 'id'> {};

export class SalaryRecordController {
    constructor(private dbClient: DBClient){
    }
    async initialize(){
        this.dbClient.createTable('salary_records', [
            {name: 'id', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'salary', type: 'string'},
            {name: 'currency', type: 'string'},
            {name: 'department', type: 'string'},
            {name: 'sub_department', type: 'string'},
            {name: 'on_contract', type: 'boolean'},
        ]);
    }
    async addNewRecord(record: NewSalaryRecord){
        return this.dbClient.insert('salary_records', record);
    }
    async getAll(){
        return this.dbClient.selectManyFromTable('salary_records', ['id', 'name', 'salary', 'currency', 'department', 'sub_department', 'on_contract'], []);
    }
    async deleteById(id: string){
        return this.dbClient.delete('salary_records', id);
    }
    async getSummaryStatistics(){
        let result = await this.dbClient.aggregate('salary_records', [
            {operation: 'min', column: 'salary', alias: 'min'},
            {operation: 'max', column: 'salary', alias: 'max'},
            {operation: 'average', column: 'salary', alias: 'mean'},
        ], []);
        if(result.length === 0){
            return {
                min: 0,
                max: 0,
                mean: 0,
            };
        }
        return result[0] as SummaryStatistics;
    }
    async getSummaryStatisticsForOnContract(){
        let result = await this.dbClient.aggregate('salary_records', [
            {operation: 'min', column: 'salary', alias: 'min'},
            {operation: 'max', column: 'salary', alias: 'max'},
            {operation: 'average', column: 'salary', alias: 'mean'},
        ], [
            {type:'exists', column: 'on_contract', value: true},
        ]);
        if(result.length === 0){
            return {
                min: 0,
                max: 0,
                mean: 0,
            };
        }
        return result[0] as SummaryStatistics;
    }
}