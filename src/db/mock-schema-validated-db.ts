export interface columnsDefinition {
    name: string,
    type: string,
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
    operation: 'none' | 'sum' | 'average' | 'min' | 'max',
    column: string,
    alias?: string,
}
export class MockDB {
    tables:{
        columns: columnsDefinition[],
        data: any
    }
    constructor(){

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
            if(column.type === 'string'){
                if(typeof data[column.name] !== 'string'){
                    erroredColumns.push({
                        name: column.name,
                        error: 'Expected string, got ' + typeof data[column.name],
                    });
                }
            }
            else if(column.type === 'number'){
                if(typeof data[column.name] !== 'number'){
                    erroredColumns.push({
                        name: column.name,
                        error: 'Expected number, got ' + typeof data[column.name],
                    });
                }
            }
            else if(column.type === 'boolean'){
                if(typeof data[column.name] !== 'boolean'){
                    erroredColumns.push({
                        name: column.name,
                        error: 'Expected boolean, got ' + typeof data[column.name],
                    });
                }
            }
        }
        return erroredColumns;
    }
    async insert(tableName: string, data: any){
        let erroredColumns = await this.validateData(tableName, data);
        if(erroredColumns.length > 0){
            throw new Error('Invalid data: ' + erroredColumns.map(column => column.name + ' ' + column.error).join(', '));
        }
        else {
            // making a copy of data since for this mock db, we are sharing the same object between the db and the api
            let id = this.tables[tableName].data.length;
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
            return data.reduce((sum: number, data: any) => sum + Number(data[operation.column]), 0) / data.length;
        }
        else if(operation.operation === 'min'){
            return data.reduce((min: number, data: any) => Math.min(min, Number(data[operation.column])), Infinity);
        }
        else if(operation.operation === 'max'){
            return data.reduce((max: number, data: any) => Math.max(max, Number(data[operation.column])), -Infinity);
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