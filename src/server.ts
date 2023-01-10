import fastify, { FastifyInstance } from 'fastify';

export class HTTPServer{
    private server: FastifyInstance;
    constructor(private port){
        this.server = fastify({logger: true});
    }
    getLibraryObject(){
        return this.server;
    }
    async start(){
        try{
            await this.server.listen({
                port: this.port,
            });
        }
        catch(err){
            this.server.log.error(err);
            process.exit(1);
        }
    }
}