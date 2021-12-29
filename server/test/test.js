const { app } = require("../app");
const request = require("supertest");
const { deleteAllUsers, createUser } = require("./services");
const assert = require("assert");

describe("User Manager Modüle Tests", () => {
    var user1 = {
        username: "timur",
        user_name: "timur",
        user_surname: "password",
        user_password: "password",
        user_email: "normal45@admin.com",
        user_type: "ADMIN",
    };
    before(async () => {
        await deleteAllUsers();
        await createUser(user1);
    });

    var commonHeaders = {
        "Content-Type": "application/json",
        "x-access-token": "",
    };
    describe("authUser Tests", () => {
        it("test checks status success", function (done) {
            request(app)
                .post("/?redirectURL=http://localhost:3011")
                .set({ "Content-Type": "application/json" })
                .send({
                    username: "timur",
                    user_password: "password"
                })
                .expect(200, done);
        });
        it("authUser, test checks response of the function ", function (done) {
            request(app)
                .post("/?redirectURL=http://localhost:3021")
                .set({ "Content-Type": "application/json" })
                .send({
                    username: "timur",
                    user_password: "password"
                })
                .expect(200, done)
                .expect((response) => {
                    commonHeaders['x-access-token'] = response.body.Access_Token
                    assert.ok(response.body.response);
                });
        });
    });
    describe("isAccessTokenValid Tests", () => {
        it("test checks status success", function (done) {
            request(app)
                .get("/token/?redirectURL=http://localhost:3021")
                .set(commonHeaders)
                .expect(200, done);
        });
        it("isAccessTokenValid, test checks response of the function ", function (done) {
            request(app)
                .get("/token/?redirectURL=http://localhost:3021")
                .set(commonHeaders)
                .expect(200, done)
                .expect((response) => {
                    assert.ok(response.body.response);
                });
        });
    });
});
