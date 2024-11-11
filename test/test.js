const chai = require("chai");
const http = require("chai-http");
const logger = require("../utils/logger");
const { connectDB, disconnectDB } = require("../utils/mongoDBConn");
const User = require("../models/User");
require("dotenv").config();
const MONGO_STRING = `${process.env.DEMO1_MONGO_STRING}`;
chai.use(http);
let app = require("../index");

describe(`TESTS ON "/users"`, function () {
    let userToken;
    let adminToken;
    this.timeout(30000);
    before(async () => {
        logger.info("Tests starting:");
        await connectDB(MONGO_STRING);
        chai.request(app)
            .post("/users/login")
            .type("json")
            .send({
                email: "mainadmin@mail.com",
                password: "pAs$w0rd",
            })
            .end((err, res) => {
                adminToken = res.body.access;
                // console.log("adminToken: ", adminToken);
            });
        chai.request(app)
            .post("/users/login")
            .type("json")
            .send({
                email: "mainuser@mail.com",
                password: "pAs$w0rd",
            })
            .end((err, res) => {
                userToken = res.body.access;
                // console.log("userToken: ", userToken);
            });
    });
    after(async () => {
        await chai
            .request(app)
            .patch("/users")
            .type("json")
            .send({
                username: "MainUser",
                email: "mainuser@mail.com",
                password: "pAs$w0rd",
            })
            .set("Authorization", `Bearer ${userToken}`);
        await disconnectDB();
        logger.info("Testing ends");
    });
    it(`[Not Authenticated User] POST "/users/register"`, (done) => {
        chai.request(app)
            .post("/users/register")
            .type("json")
            .send({
                username: "NewUser",
                email: "newuser@mail.com",
                password: "pAs$w0rd",
            })
            .end((err, res) => {
                chai.expect(res.status).to.equal(201);
                chai.expect(res.body).to.have.property("success").that.equals(true);
                chai.expect(res.body).to.have.property("message").that.equals("Registered Successfully");
                done();
            });
    });
    it(`[Authenticated User] POST "/users/register"`, (done) => {
        chai.request(app)
            .post("/users/register")
            .type("json")
            .send({
                username: "NewUser",
                email: "newuser@mail.com",
                password: "pAs$w0rd",
            })
            .set("Authorization", `Bearer ${adminToken}`)
            .end((err, res) => {
                chai.expect(res.status).to.equal(403);
                chai.expect(res.body).to.have.property("success").that.equals(false);
                chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                done();
            });
    });
    it(`[Not Authenticated User] POST "/users/login"`, (done) => {
        chai.request(app)
            .post("/users/login")
            .type("json")
            .send({
                email: "newuser@mail.com",
                password: "pAs$w0rd",
            })
            .end((err, res) => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body).to.have.property("success").that.equals(true);
                chai.expect(res.body).to.have.property("message").that.equals("User access granted.");
                chai.expect(res.body).to.have.property("access").that.is.a("string");
                done();
            });
    });
    it(`[Authenticated User] POST "/users/login"`, (done) => {
        chai.request(app)
            .post("/users/login")
            .type("json")
            .send({
                email: "newuser@mail.com",
                password: "pAs$w0rd",
            })
            .set("Authorization", `Bearer ${adminToken}`)
            .end((err, res) => {
                chai.expect(res.status).to.equal(403);
                chai.expect(res.body).to.have.property("success").that.equals(false);
                chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                done();
            });
    });
    it(`[Not Authenticated User] GET "/users"`, (done) => {
        chai.request(app)
            .get("/users")
            .end((err, res) => {
                chai.expect(res.status).to.equal(403);
                chai.expect(res.body).to.have.property("success").that.equals(false);
                chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                done();
            });
    });
    it(`[Authenticated User] GET "/users"`, (done) => {
        chai.request(app)
            .get("/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .end((err, res) => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body).to.have.property("success").that.equals(true);
                chai.expect(res.body).to.have.property("message").that.equals("User data found.");
                chai.expect(res.body).to.have.property("user").that.is.a("object");
                done();
            });
    });
    it(`[Not Authenticated User] PATCH "/users"`, (done) => {
        let updated = {
            username: "UpdatedMainUser",
            email: "updatedmainuser@mail.com",
            password: "pAs$w0rd",
        };
        chai.request(app)
            .patch("/users")
            .type("json")
            .send(updated)
            .end((err, res) => {
                chai.expect(res.status).to.equal(403);
                chai.expect(res.body).to.have.property("success").that.equals(false);
                chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                done();
            });
    });
    it(`[Authenticated User] PATCH "/users"`, (done) => {
        let updated = {
            username: "UpdatedMainUser",
            email: "updatedmainuser@mail.com",
            password: "pAs$w0rd",
        };
        chai.request(app)
            .patch("/users")
            .type("json")
            .send(updated)
            .set("Authorization", `Bearer ${userToken}`)
            .end((err, res) => {
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body).to.have.property("success").that.equals(true);
                chai.expect(res.body).to.have.property("message").that.equals("User updated successfully.");
                chai.expect(res.body).to.have.property("user").that.is.a("object");
                chai.expect(res.body.user).to.have.property("username").that.equals(updated.username);
                chai.expect(res.body.user).to.have.property("email").that.equals(updated.email);
                done();
            });
    });
});
