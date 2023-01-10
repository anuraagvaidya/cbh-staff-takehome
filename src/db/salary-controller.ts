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
        this.initialize();
    }
    async initialize(){
        this.dbClient.createTable('salary_records', [
            {name: 'id', type: 'string', optional:true},
            {name: 'name', type: 'string'},
            {name: 'salary', type: 'string'},
            {name: 'currency', type: 'string'},
            {name: 'department', type: 'string'},
            {name: 'sub_department', type: 'string'},
            {name: 'on_contract', type: 'boolean', optional:true},
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
    async getDepartments(){
        let departments = await this.dbClient.aggregate('salary_records', [{
            operation: 'distinct',
            column: 'department',
            alias: 'department'
        }], [
            {type:'exists', column: 'department', value: true},
        ]);
        console.log('getDepartments', departments);
        return departments.department;
    }
    async getSummaryStatistics(){
        let result = await this.dbClient.aggregate('salary_records', [
            {operation: 'min', column: 'salary', alias: 'min'},
            {operation: 'max', column: 'salary', alias: 'max'},
            {operation: 'average', column: 'salary', alias: 'mean'},
        ], []);
        console.log('getSummaryStatistics', result);
        if(result.length === 0){
            return {
                min: 0,
                max: 0,
                mean: 0,
            };
        }
        return result as SummaryStatistics;
    }
    async getSummaryStatisticsForOnContract(){
        let result = await this.dbClient.aggregate('salary_records', [
            {operation: 'min', column: 'salary', alias: 'min'},
            {operation: 'max', column: 'salary', alias: 'max'},
            {operation: 'average', column: 'salary', alias: 'mean'},
        ], [
            {type:'exists', column: 'on_contract', value: true},
        ]);
        console.log('getSummaryStatisticsForOnContract', result);
        if(result.length === 0){
            return {
                min: 0,
                max: 0,
                mean: 0,
            };
        }
        return result as SummaryStatistics;
    }
    async getSummaryStatisticsForAllDepartments(){
        let departments = await this.getDepartments();
        let departmentWiseSummaryStatistics: {[department: string]: SummaryStatistics} = {};
        for(let department of departments){
            let result = await this.dbClient.aggregate('salary_records', [
                {operation: 'min', column: 'salary', alias: 'min'},
                {operation: 'max', column: 'salary', alias: 'max'},
                {operation: 'average', column: 'salary', alias: 'mean'},
            ], [
                {type:'equals', column: 'department', value: department},
            ]);
            console.log('getSummaryStatisticsForAllDepartments department='+department, result);
            departmentWiseSummaryStatistics[department] = result as SummaryStatistics;
        }
        return departmentWiseSummaryStatistics;
    }

    // create statistics for all sub departments under each department
    async getSummaryStatisticsForAllSubDepartments(){
        let departments = await this.getDepartments();
        let departmentWiseSummaryStatistics: {[department: string]: {[sub_department: string]: SummaryStatistics}} = {};
        for(let department of departments){
            let sub_departments = await this.dbClient.aggregate('salary_records', [{
                operation: 'distinct',
                column: 'sub_department',
                alias: 'sub_department'
            }], [
                {type:'equals', column: 'department', value: department},
            ]);
            let sub_departmentWiseSummaryStatistics: {[sub_department: string]: SummaryStatistics} = {};
            for(let sub_department of (sub_departments.sub_department || [])){
                let result = await this.dbClient.aggregate('salary_records', [
                    {operation: 'min', column: 'salary', alias: 'min'},
                    {operation: 'max', column: 'salary', alias: 'max'},
                    {operation: 'average', column: 'salary', alias: 'mean'},
                ], [
                    {type:'equals', column: 'department', value: department},
                    {type:'equals', column: 'sub_department', value: sub_department},
                ]);
                sub_departmentWiseSummaryStatistics[sub_department] = result as SummaryStatistics;
            }
            departmentWiseSummaryStatistics[department] = sub_departmentWiseSummaryStatistics;
        }
        return departmentWiseSummaryStatistics;
    }
}