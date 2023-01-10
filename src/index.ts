import { HTTPServer } from "./server.js";

class App {
    private server: HTTPServer;
    constructor() {
        this.server = new HTTPServer(3000);
        this.server.start();
    }
}
new App();