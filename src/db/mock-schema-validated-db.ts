export interface columnsDefinition {
    name: string,
    type: string,
    optional?: boolean,
}
interface ErroredColumn{
    name: string,
    error: string,
}
export interface DBCondition{
    type: 'exists' | 'not-exists' | 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'greater-than-or-equals' | 'less-than-or-equals',
    column: string,
    value: any,
}
export interface ColumnSelection{
    operation: 'none' | 'sum' | 'average' | 'min' | 'max' | 'distinct' | 'count',
    column: string,
    alias?: string,
}
export class MockDB {
    tables:{
        [tableName: string]: {
            columns: columnsDefinition[],
            data: any
        }
    }
    constructor(){
        this.tables = {};
    }
    printAllData(){
        console.log(JSON.stringify(this.tables));
    }
    async createTable(tableName: string, columnsDefinition: columnsDefinition[]){
        this.tables[tableName] = {
            columns: columnsDefinition,
            data: [],
        };
    }
    private async validateData(tableName: string, data: any){
        let erroredColumns: ErroredColumn[] = [];
        for(let column of this.tables[tableName].columns){
            if(data[column.name] === undefined){
                if(!column.optional){
                    erroredColumns.push({
                        name: column.name,
                        error: 'missing',
                    });
                }
            }
            else {
                if(column.type === 'string'){
                    if(typeof data[column.name] !== 'string'){
                        erroredColumns.push({
                            name: column.name,
                            error: 'not a string',
                        });
                    }
                }
                else if(column.type === 'number'){
                    if(typeof data[column.name] !== 'number'){
                        erroredColumns.push({
                            name: column.name,
                            error: 'not a number',
                        });
                    }
                }
                else if(column.type === 'boolean'){
                    if(typeof data[column.name] !== 'boolean'){
                        erroredColumns.push({
                            name: column.name,
                            error: 'not a boolean',
                        });
                    }
                }
                else if(column.type === 'date'){
                    if(typeof data[column.name] !== 'string'){
                        erroredColumns.push({
                            name: column.name,
                            error: 'not a string',
                        });
                    }
                    else {
                        let date = new Date(data[column.name]);
                        if(isNaN(date.getTime())){
                            erroredColumns.push({
                                name: column.name,
                                error: 'not a valid date',
                            });
                        }
                    }
                }
            }
        }
        return erroredColumns;        
    }
    async insert(tableName: string, data: any){
        let erroredColumns = await this.validateData(tableName, data);
        if(erroredColumns.length > 0){
            const e = new Error('Invalid data: ' + erroredColumns.map(column => column.name + ' ' + column.error).join(', '));
            e['code'] = 'invalid-data-in-insert';
            throw e;
        }
        else {
            // making a copy of data since for this mock db, we are sharing the same object between the db and the api
            let id = '' + this.tables[tableName].data.length;
            const newData = {id, ...data};
            this.tables[tableName].data.push(newData);
            return {insertedId: id};
        }
    }
    async delete(tableName: string, id: string){
        let index = this.tables[tableName].data.findIndex((data: any) => data.id === id);
        let deletedRecordsCount = 0;
        if(index === -1){
            deletedRecordsCount = 0;
        }
        else {
            this.tables[tableName].data.splice(index, 1);
            deletedRecordsCount = 1;
        }
        return {deletedRecords: deletedRecordsCount};
    }
    private matchConditions(conditions: DBCondition[], data: any){
        for(let condition of conditions){
            if(condition.type === 'exists'){
                if(!data[condition.column]){
                    return false;
                }
            }
            else if(condition.type === 'not-exists'){
                if(data[condition.column]){
                    return false;
                }
            }
            else if(condition.type === 'equals'){
                if(data[condition.column] !== condition.value){
                    return false;
                }
            }
            else if(condition.type === 'not-equals'){
                if(data[condition.column] === condition.value){
                    return false;
                }
            }
            else if(condition.type === 'greater-than'){
                if(data[condition.column] <= condition.value){
                    return false;
                }
            }
            else if(condition.type === 'less-than'){
                if(data[condition.column] >= condition.value){
                    return false;
                }
            }
            else if(condition.type === 'greater-than-or-equals'){
                if(data[condition.column] < condition.value){
                    return false;
                }
            }
            else if(condition.type === 'less-than-or-equals'){
                if(data[condition.column] > condition.value){
                    return false;
                }
            }
        }
        return true;
    }
    private performOperation(operation: ColumnSelection, data: any){
        if(operation.operation === 'none'){
            return data[operation.column];
        }
        else if(operation.operation === 'sum'){
            return data.reduce((sum: number, data: any) => sum + Number(data[operation.column]), 0);
        }
        else if(operation.operation === 'average'){
            if(data.length === 0){
                return 0;
            }
            return data.reduce((sum: number, data: any) => sum + Number(data[operation.column]), 0) / data.length;
        }
        else if(operation.operation === 'min'){
            return data.reduce((min: number, data: any) => Math.min(min, Number(data[operation.column])), Infinity);
        }
        else if(operation.operation === 'max'){
            return data.reduce((max: number, data: any) => Math.max(max, Number(data[operation.column])), -Infinity);
        }
        else if(operation.operation === 'distinct'){
            return [...new Set(data.map((data: any) => data[operation.column]))];
        }
        else if(operation.operation === 'count'){
            return data.length;
        }
    }
    async aggregate(tableName: string, columns: ColumnSelection[], conditions: DBCondition[]){
        let data = this.tables[tableName].data;
        if(conditions){
            data = data.filter((data: any) => this.matchConditions(conditions, data));
        }
        let result: any = {};
        for(let column of columns){
            result[column.alias || column.column] = this.performOperation(column, data);
        }
        return result;
    }
    async selectManyFromTable(tableName: string, columns: string[], conditions: DBCondition[]){
        let data = this.tables[tableName].data;
        if(conditions){
            data = data.filter((data: any) => this.matchConditions(conditions, data));
        }
        let result: any[] = [];
        for(let row of data){
            let newRow: any = {};
            for(let column of columns){
                newRow[column] = row[column];
            }
            result.push(newRow);
        }
        return result;
    }
    async selectOneFromTable(tableName: string, columns: string[], conditions: DBCondition[]){
        let data = this.tables[tableName].data;
        if(conditions){
            data = data.filter((data: any) => this.matchConditions(conditions, data));
        }
        if(data.length === 0){
            return null;
        }
        else {
            let result: any = {};
            for(let column of columns){
                result[column] = data[0][column];
            }
            return result;
        }
    }
}