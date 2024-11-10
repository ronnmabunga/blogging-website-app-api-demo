const chai = require("chai");
const http = require("chai-http");
const { connectDB, disconnectDB } = require("../utils/mongoDBConn");
require("dotenv").config();
const MONGO_STRING = process.env.DEMO1_MONGO_STRING;
chai.use(http);
let app = require("../index");

describe(`TESTS ON "/"`, () => {
    before(async () => {
        await connectDB(MONGO_STRING);
    });
    after(async () => {
        await disconnectDB();
    });
    let token = "token";
    it(`POST ON "/test"`, (done) => {
        chai.request(app)
            .post("/test")
            .type("json")
            .send({
                prop: "value",
            })
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res.status).to.equal(200);
                done();
            });
    });
});
