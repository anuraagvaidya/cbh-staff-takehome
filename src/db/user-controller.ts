import { DBClient } from "./mock-db-client.js";
import jwt from 'jsonwebtoken';

export class UserController {
    constructor(private dbClient: DBClient, private jwtSecret: string){
        this.initialize();
    }
    async initialize(){
        this.dbClient.createTable('users', [
            {name: 'email', type: 'string'},
            {name: 'password', type: 'string'},
        ]);
    }
    async addUser(email: string, password: string){
        return this.dbClient.insert('users', {email, password});
    }
    async login(email: string, password: string){
        //because we are using a dummy in-memory DB, I didn't bother to hash the password, otherwise I would have used bcrypt or something similar
        let user = await this.dbClient.selectOneFromTable('users', ['email', 'password'], [
            {type: 'equals', column: 'email', value: email},
            {type: 'equals', column: 'password', value: password},
        ]);
        if(user){
            return jwt.sign({email}, this.jwtSecret);
        }
        else{
            return null;
        }
    }
    async validateToken(token: string){
        const justToken = token?.replace('Bearer ', '');
        try{
            let decoded = jwt.verify(justToken, this.jwtSecret);
            return decoded;
        }
        catch(e){
            return null;
        }
    }

}