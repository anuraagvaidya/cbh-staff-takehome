import {pathToFileURL} from 'url'
import { SalaryRecordAPI, UserAPI } from "./api.js";
import { SalaryRecordController } from "./db/salary-controller.js";
import { DBClient } from "./db/mock-db-client.js";
import { HTTPServer } from "./server.js";
import { UserController } from "./db/user-controller.js";

export class App {
    private server: HTTPServer;
    private salaryRecordAPI: SalaryRecordAPI;
    private salaryRecordController: SalaryRecordController;
    private userAPI: UserAPI;
    private userController: UserController;
    private dbClient: DBClient;
    constructor() {
        this.dbClient = new DBClient();
        this.salaryRecordController = new SalaryRecordController(this.dbClient);
        this.userController = new UserController(this.dbClient, process.env.JWT_SECRET || 'dummyJWTSecret');
    }
    async start(){
        //we wait for the dummy user to be created first before starting the server
        let userCreated = await this.userController.addUser('dummy@clipboardhealth.com', 'dummy')
        console.log('userCreated',userCreated);
        this.server = new HTTPServer(process.env.PORT || 3000);    
        this.salaryRecordAPI = new SalaryRecordAPI(this.server, this.salaryRecordController);
        this.userAPI = new UserAPI(this.server, this.userController);
        await this.server.start((fastify)=>{
            this.salaryRecordAPI.attachRoutes(fastify);
        },async (token: string) => {
            return this.userController.validateToken(token);
        });

        // Uncomment the below to see the data in the DB every 10 seconds
        // setInterval(()=>{
        //     this.dbClient.printAllData();
        // },10000);
    }
}


if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const app = new App();
    app.start();
}