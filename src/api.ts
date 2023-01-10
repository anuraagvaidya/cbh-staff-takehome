import { NewSalaryRecord, SalaryRecordController } from "./db/controller.js";
import { HTTPServer } from "./server.js";
export class SalaryRecordAPI {
    private salaryRecordController: SalaryRecordController;
    constructor(private server: HTTPServer){
    }
    async addNewRecord(record: NewSalaryRecord){
        let fastify = this.server.getLibraryObject();
        fastify.route({
            method: 'POST',
            url: '/api/salary/add-new-record',
            schema:{
                body: {
                    type: 'object',
                    properties: {
                        name: {type: 'string'},
                        salary: {type: 'string'},
                        currency: {type: 'string'},
                        department: {type: 'string'},
                        sub_department: {type: 'string'},
                        on_contract: {type: 'boolean'},
                    },
                    additionalProperties: false,
                    required: ['name', 'salary', 'currency', 'department', 'sub_department'],
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {type: 'boolean'},
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                let body = request.body as NewSalaryRecord;
                try{
                    this.salaryRecordController.addNewRecord(body);
                }
                catch(err){
                    reply.send({
                        status: 'error',
                        errorMessage: err.message,
                    });
                }
            },
        })
    }
    async deleteRecordById(id: string){
        let fastify = this.server.getLibraryObject();
        fastify.route({
            method: 'DELETE',
            url: '/api/salary/delete-record-by-id',
            schema:{
                body: {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                    },
                    additionalProperties: false,
                    required: ['id'],
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {type: 'number'},                            
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                let body = request.body as {id: string};
                try{
                    let result = await this.salaryRecordController.deleteById(body.id);
                    reply.send({
                        status: 'success',
                        data: result,
                    });
                }
                catch(err){
                    reply.send({
                        status: 'error',
                        errorMessage: err.message,
                    });
                }
            }
        });
    }
    async getSummaryStatisticsAll(){
        let fastify = this.server.getLibraryObject();
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-all',
            schema:{
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {
                                type: 'object',
                                properties: {
                                    min: {type: 'number'},
                                    max: {type: 'number'},
                                    mean: {type: 'number'},
                                }
                            }
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                try{
                    let result = await this.salaryRecordController.getSummaryStatistics();
                    reply.send({
                        status: 'success',
                        data: result,
                    });
                }
                catch(err){
                    reply.send({
                        status: 'error',
                        errorMessage: err.message,
                    });
                }
            }
        });
    }
    async getSummaryStatisticsForOnContract(){
        let fastify = this.server.getLibraryObject();
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-for-on-contract',
            schema:{
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {
                                type: 'object',
                                properties: {
                                    min: {type: 'number'},
                                    max: {type: 'number'},
                                    mean: {type: 'number'},
                                }
                            }
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                try{
                    let result = await this.salaryRecordController.getSummaryStatisticsForOnContract();
                    reply.send({
                        status: 'success',
                        data: result,
                    });
                }
                catch(err){
                    reply.send({
                        status: 'error',
                        errorMessage: err.message,
                    });
                }
            }
        });
    }
}