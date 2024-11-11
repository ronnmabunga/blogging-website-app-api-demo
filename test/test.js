const chai = require("chai");
const http = require("chai-http");
const logger = require("../utils/logger");
const { connectDB, disconnectDB } = require("../utils/mongoDBConn");
const User = require("../models/User");
require("dotenv").config();
const MONGO_STRING = `${process.env.DEMO1_MONGO_STRING}`;
chai.use(http);
let app = require("../index");
logger.turnOffConsoleLogging();

describe(`API Tests`, function () {
    let userToken;
    let adminToken;
    this.timeout(30000);
    before(async () => {
        logger.info("Tests starting:");
        await connectDB(MONGO_STRING);
        const userResult = await chai.request(app).post("/users/login").type("json").send({
            email: "mainuser@mail.com",
            password: "pAs$w0rd",
        });
        userToken = userResult.body.access;
        // console.log("userToken: ", userToken);
        const adminResult = await chai.request(app).post("/users/login").type("json").send({
            email: "mainadmin@mail.com",
            password: "pAs$w0rd",
        });
        adminToken = adminResult.body.access;
        // console.log("adminToken: ", adminToken);
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
    describe(`Tests on "/users"`, function () {
        describe(`Correct Input Tests`, function () {
            it(`[201 | NoAuth   | POST "/users/register"       | Correct Inputs      ]`, (done) => {
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
            it(`[200 | NoAuth   | POST "/users/login"          | Correct Inputs      ]`, (done) => {
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
            it(`[200 | Auth     | GET "/users"                 |                     ]`, (done) => {
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
            it(`[200 | Auth     | PATCH "/users"               | Correct Inputs      ]`, (done) => {
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
        describe(`Authorization Tests`, function () {
            it(`[403 | Auth     | POST "/users/register"       | Correct Inputs      ]`, (done) => {
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
            it(`[403 | Auth     | POST "/users/login"          | Correct Inputs      ]`, (done) => {
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
            it(`[403 | NoAuth   | GET "/users"                 |                     ]`, (done) => {
                chai.request(app)
                    .get("/users")
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(403);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                        done();
                    });
            });
            it(`[403 | NoAuth   | PATCH "/users"               | Correct Inputs      ]`, (done) => {
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
        });
        describe(`Missing Input Tests`, function () {
            it(`[201 | NoAuth   | POST "/users/register"       | Missing username    ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        email: "newuser2@mail.com",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(201);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.equals("Registered Successfully");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Missing email       ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser3",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Missing password    ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser4",
                        email: "newuser4@mail.com",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/login"          | Missing email       ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/login"          | Missing password    ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: "newuser@mail.com",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
        });
        describe(`Invalid Input Tests`, function () {
            it(`[400 | NoAuth   | POST "/users/register"       | Non-string username ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: true,
                        email: "newuser5@mail.com",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid username");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Non-string email    ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser6",
                        email: true,
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Invalid email       ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser7",
                        email: "newuser7@$mail.com",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Non-string password ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser8",
                        email: "newuser8@mail.com",
                        password: true,
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid password");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/register"       | Invalid password    ]`, (done) => {
                chai.request(app)
                    .post("/users/register")
                    .type("json")
                    .send({
                        username: "NewUser9",
                        email: "newuser9@mail.com",
                        password: "password",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid password");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/login"          | Non-string email    ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: true,
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/login"          | Invalid email       ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: "newuser@$mail.com",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/users/login"          | Non-string password ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: "newuser@mail.com",
                        password: true,
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid password");
                        done();
                    });
            });
            it(`[400 | Auth     | PATCH "/users"               | Non-string username ]`, (done) => {
                let updated = {
                    username: true,
                    email: "updatedmainuser@mail.com",
                    password: "pAs$w0rd",
                };
                chai.request(app)
                    .patch("/users")
                    .type("json")
                    .send(updated)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid username");
                        done();
                    });
            });
            it(`[400 | Auth     | PATCH "/users"               | Non-string email    ]`, (done) => {
                let updated = {
                    username: "UpdatedMainUser",
                    email: true,
                    password: "pAs$w0rd",
                };
                chai.request(app)
                    .patch("/users")
                    .type("json")
                    .send(updated)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | Auth     | PATCH "/users"               | Invalid email       ]`, (done) => {
                let updated = {
                    username: "UpdatedMainUser",
                    email: "updatedmainuser@$mail.com",
                    password: "pAs$w0rd",
                };
                chai.request(app)
                    .patch("/users")
                    .type("json")
                    .send(updated)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | Auth     | PATCH "/users"               | Non-string password ]`, (done) => {
                let updated = {
                    username: "UpdatedMainUser",
                    email: "updatedmainuser@mail.com",
                    password: true,
                };
                chai.request(app)
                    .patch("/users")
                    .type("json")
                    .send(updated)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid password");
                        done();
                    });
            });
            it(`[400 | Auth     | PATCH "/users"               | Invalid password    ]`, (done) => {
                let updated = {
                    username: "UpdatedMainUser",
                    email: "updatedmainuser@mail.com",
                    password: "password",
                };
                chai.request(app)
                    .patch("/users")
                    .type("json")
                    .send(updated)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid password");
                        done();
                    });
            });
        });
        describe(`Failure Tests`, function () {
            describe.skip(`Not Yet Implemented`, function () {
                it(`[409 | NoAuth   | POST "/users/register" | Duplicate username  ]`, (done) => {
                    chai.request(app)
                        .post("/users/register")
                        .type("json")
                        .send({
                            username: "NewUser",
                            email: "newuser10@mail.com",
                            password: "pAs$w0rd",
                        })
                        .end((err, res) => {
                            chai.expect(res.status).to.equal(409);
                            chai.expect(res.body).to.have.property("success").that.equals(false);
                            chai.expect(res.body).to.have.property("message").that.equals("Duplicate username found");
                            done();
                        });
                });
                it(`[409 | NoAuth   | POST "/users/register" | Duplicate email     ]`, (done) => {
                    chai.request(app)
                        .post("/users/register")
                        .type("json")
                        .send({
                            username: "NewUser10",
                            email: "newuser@mail.com",
                            password: "pAs$w0rd",
                        })
                        .end((err, res) => {
                            chai.expect(res.status).to.equal(409);
                            chai.expect(res.body).to.have.property("success").that.equals(false);
                            chai.expect(res.body).to.have.property("message").that.equals("Duplicate email found");
                            done();
                        });
                });
            });
            it(`[401 | NoAuth   | POST "/users/login"          | Inexistent email    ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: "olduser@mail.com",
                        password: "pAs$w0rd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(401);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Access denied. Please provide valid credentials.");
                        done();
                    });
            });
            it(`[401 | NoAuth   | POST "/users/login"          | Incorrect password  ]`, (done) => {
                chai.request(app)
                    .post("/users/login")
                    .type("json")
                    .send({
                        email: "newuser@mail.com",
                        password: "pAs$w0rdd",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(401);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Access denied. Please provide valid credentials.");
                        done();
                    });
            });
        });
    });
    describe(`Tests on "/messages"`, function () {
        let messageId1;
        let messageId2;
        describe(`Correct Input Tests`, function () {
            it(`[200 | Admin    | GET "/messages"              |                     ]`, (done) => {
                chai.request(app)
                    .get("/messages")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(200);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.is.oneOf(["No messages found.", "Messages retrieved."]);
                        chai.expect(res.body).to.have.property("messages").that.is.a("array");
                        done();
                    });
            });
            it(`[200 | NoAuth   | POST "/messages"             | Correct Inputs      ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 1",
                        email: "name1@mail.com",
                        message: "Test Message 1",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(201);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.equals("Message created.");
                        chai.expect(res.body).to.have.property("newMessage").that.is.a("object");
                        messageId1 = res.body.newMessage._id;
                        done();
                    });
            });
            it(`[200 | Auth     | POST "/messages"             | Correct Inputs      ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 2",
                        email: "name2@mail.com",
                        message: "Test Message 2",
                    })
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(201);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.equals("Message created.");
                        chai.expect(res.body).to.have.property("newMessage").that.is.a("object");
                        messageId2 = res.body.newMessage._id;
                        done();
                    });
            });
            it(`[200 | Admin    | patch "/messages/:messageId" | Valid messageId     ]`, (done) => {
                chai.request(app)
                    .patch(`/messages/${messageId1}`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(200);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.equals("Message updated successfully");
                        chai.expect(res.body).to.have.property("foundMessage").that.is.a("object");
                        chai.expect(res.body.foundMessage).to.have.property("isRead").that.equals(true);
                        done();
                    });
            });
        });
        describe(`Authorization Tests`, function () {
            it(`[403 | NonAdmin | GET "/messages"              |                     ]`, (done) => {
                chai.request(app)
                    .get("/messages")
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(403);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                        done();
                    });
            });
            it(`[401 | NoAuth   | GET "/messages"              |                     ]`, (done) => {
                chai.request(app)
                    .get("/messages")
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(401);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Authentication Failed. Please provide valid credentials.");
                        done();
                    });
            });
            it(`[403 | NonAdmin | patch "/messages/:messageId" | Valid id            ]`, (done) => {
                chai.request(app)
                    .patch(`/messages/${messageId2}`)
                    .set("Authorization", `Bearer ${userToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(403);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("You do not have permission to access this resource.");
                        done();
                    });
            });
            it(`[401 | NoAuth   | patch "/messages/:messageId" | Valid id            ]`, (done) => {
                chai.request(app)
                    .patch(`/messages/${messageId2}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(401);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Authentication Failed. Please provide valid credentials.");
                        done();
                    });
            });
        });
        describe(`Missing Input Tests`, function () {
            it(`[201 | NoAuth   | POST "/messages"             | Missing name        ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        email: "name3@mail.com",
                        message: "Test Message 3",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(201);
                        chai.expect(res.body).to.have.property("success").that.equals(true);
                        chai.expect(res.body).to.have.property("message").that.equals("Message created.");
                        chai.expect(res.body).to.have.property("newMessage").that.is.a("object");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/messages"             | Missing email       ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 4",
                        message: "Test Message 4",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/messages"             | Missing message     ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 5",
                        email: "name5@mail.com",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Required inputs missing");
                        done();
                    });
            });
        });
        describe(`Invalid Input Tests`, function () {
            it(`[400 | NoAuth   | POST "/messages"             | Non-string name     ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: true,
                        email: "name6@mail.com",
                        message: "Test Message 6",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid name");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/messages"             | Non-string message  ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 7",
                        email: "name7@mail.com",
                        message: true,
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid message");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/messages"             | Non-string email    ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 8",
                        email: true,
                        message: "Test Message 8",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | NoAuth   | POST "/messages"             | Invalid email       ]`, (done) => {
                chai.request(app)
                    .post("/messages")
                    .type("json")
                    .send({
                        name: "Name 9",
                        email: "name9@$mail.com",
                        message: "Test Message 9",
                    })
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid email");
                        done();
                    });
            });
            it(`[400 | Admin    | patch "/messages/:messageId" | Invalid ObjectId    ]`, (done) => {
                chai.request(app)
                    .patch(`/messages/a`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(400);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("Invalid ID");
                        done();
                    });
            });
            it(`[404 | Admin    | patch "/messages/:messageId" | Inexistent id       ]`, (done) => {
                chai.request(app)
                    .patch(`/messages/6709168f57260bef131dfd1d`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(404);
                        chai.expect(res.body).to.have.property("success").that.equals(false);
                        chai.expect(res.body).to.have.property("message").that.equals("No message found.");
                        done();
                    });
            });
        });
    });

    /*
    describe(`Tests on "/blogs"`, function () {
        describe(`Correct Input Tests`, function () {});
        describe(`Authorization Tests`, function () {});
        describe(`Missing Input Tests`, function () {});
        describe(`Invalid Input Tests`, function () {});
        describe(`Failure Tests`, function () {});
    });
    */
});
