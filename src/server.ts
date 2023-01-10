import fastify, { FastifyInstance } from 'fastify';
import fastifyAuth from '@fastify/auth'
export class HTTPServer{
    private server: FastifyInstance;
    constructor(private port){
        this.server = fastify({logger: true})
    }
    getLibraryObject(){
        return this.server;
    }
    async start(onRegisterAuth: (fastify: FastifyInstance)=>void, onValidateToken: (token: string) => Promise<boolean>){
        this.server.decorate(
            'verifyJWT', async (request, reply, done) => {
                let authValid = await onValidateToken(request.headers.authorization);
                if(authValid?.['email']){
                    this.server.log.info('valid authorization', authValid);
                }
                else{
                    reply.status(401).send({message: 'Unauthorized'});
                }
            }
        ).register(fastifyAuth).after(()=>{
            onRegisterAuth(this.server);
        });
        try{
            await this.server.listen({
                host: '0.0.0.0',
                port: this.port,
            });
        }
        catch(err){
            this.server.log.fatal("Failed to start server");
            this.server.log.error(err);
            process.exit(1);
        }
    }
}