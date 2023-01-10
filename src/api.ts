import { NewSalaryRecord, SalaryRecordController } from "./db/salary-controller.js";
import { DBClient } from "./db/mock-db-client.js";
import { HTTPServer } from "./server.js";
import { UserController } from "./db/user-controller.js";
import { FastifyInstance } from "fastify";
export class SalaryRecordAPI {
    constructor(private server: HTTPServer, private salaryRecordController: SalaryRecordController){
    }
    async attachRoutes(fastify: FastifyInstance){
        this.attachAddNewRecord(fastify);
        this.attachDeleteRecordById(fastify);
        this.attachGetSummaryStatisticsAll(fastify);
        this.attachGetSummaryStatisticsForOnContract(fastify);
        this.attachGetSummaryStatisticsForAllDepartments(fastify);
        this.attachGetSummaryStatisticsForAllSubDepartments(fastify);
    }
    async attachAddNewRecord(fastify: FastifyInstance){
        fastify.route({
            method: 'POST',
            url: '/api/salary/add-new-record',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
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
                            data: {
                                insertedId: {type: 'string'},
                            },
                            errorCode: {type: 'string', optional: true},
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                let body = request.body as NewSalaryRecord;
                try{
                    let resp = await this.salaryRecordController.addNewRecord(body);
                    reply.send({
                        status: 'success',
                        data: resp,
                    });
                }
                catch(err){
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            },
        })
    }
    async attachDeleteRecordById(fastify: FastifyInstance){
        fastify.route({
            method: 'DELETE',
            url: '/api/salary/delete-record-by-id',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
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
                            data: {
                                type: 'object',
                                properties: {
                                    deletedRecords: {type: 'number'},
                                }
                            },
                            errorCode: {type: 'string', optional: true},                         
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
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });
    }
    async attachGetSummaryStatisticsAll(fastify: FastifyInstance){
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-all',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
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
                        },
                        errorCode: {type: 'string', optional: true},
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
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });
    }
    async attachGetSummaryStatisticsForOnContract(fastify: FastifyInstance){
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-for-on-contract',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
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
                            },
                            errorCode: {type: 'string', optional: true},
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
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });
    }
    async attachGetSummaryStatisticsForAllDepartments(fastify: FastifyInstance){
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-all-departments',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
            schema:{
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {
                                type: 'object',
                                patternProperties: {
                                    '.*': {
                                        type: 'object',
                                        properties: {
                                            min: {type: 'number'},
                                            max: {type: 'number'},
                                            mean: {type: 'number'},
                                        }
                                    }
                                }
                            },
                            errorCode: {type: 'string', optional: true},
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                try{
                    let result = await this.salaryRecordController.getSummaryStatisticsForAllDepartments();
                    reply.send({
                        status: 'success',
                        data: result,
                    });
                }
                catch(err){
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });
    }
    async attachGetSummaryStatisticsForAllSubDepartments(fastify: FastifyInstance){
        fastify.route({
            method: 'GET',
            url: '/api/salary/get-summary-statistics-all-sub-departments',
            preHandler: fastify.auth([
                fastify['verifyJWT'],
            ]),
            schema:{
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {
                                type: 'object',
                                patternProperties: {
                                    '.*': {
                                        type: 'object',
                                        patternProperties: {
                                            '.*': {
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
                            errorCode: {type: 'string', optional: true},
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                try{
                    let result = await this.salaryRecordController.getSummaryStatisticsForAllSubDepartments();
                    reply.send({
                        status: 'success',
                        data: result,
                    });
                }
                catch(err){
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });
    }
}

export class UserAPI {
    constructor(private server: HTTPServer, private userController: UserController) {
        this.attachLogin();
    }
    attachLogin(){
        let fastify = this.server.getLibraryObject();
        fastify.route({
            method: 'POST',
            url: '/api/user/login',
            schema:{
                body: {
                    type: 'object',
                    properties: {
                        email: {type: 'string'},
                        password: {type: 'string'},
                    },
                    additionalProperties: false,
                    required: ['email', 'password'],
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: {type: 'string'},
                            data: {
                                type: 'object',
                                properties: {
                                    token: {type: 'string'},
                                }
                            },
                            errorCode: {type: 'string', optional: true},
                        }
                    }
                }
            },
            handler: async (request, reply) => {
                try{
                    let result = await this.userController.login(request.body['email'], request.body['password']);
                    if(result){
                        reply.send({
                            status: 'success',
                            data: {
                                token: result,
                            },
                        });
                    }
                    else{
                        reply.send({
                            status: 'error',
                            errorCode: 'invalid-credentials',
                            errorMessage: 'Invalid credentials',
                        });
                    }
                }
                catch(err){
                    console.error(err);
                    reply.send({
                        status: 'error',
                        errorCode: err.code,
                    });
                }
            }
        });

    }
}