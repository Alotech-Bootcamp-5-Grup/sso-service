const { app } = require("../app");
const request = require("supertest");
const { deleteAllUsers, createUser } = require("./services");
const assert = require("assert");

describe("SSO AUTH Service Tests", () => {
    var user1 = {
        username: "timur",
        user_name: "timur",
        user_surname: "password",
        user_password: "password",
        user_email: "normal45@admin.com",
        user_type: "ADMIN",
    };
    before(async () => {
        // tüm testlerimizden önce veritabanıdaki tüm kullanıcıları siliyoruz
        // bunu yapma sebebimiz tüm kullanıcıları silmeden yeni oluşturulacak kullanıcının
        // id numarasından emin olamayacağımız için tüm kullanıcıları silip 
        // oluşturulan yeni kullanıcının id numarasının 1 olmasını sağlıyoruz.
        await deleteAllUsers();

        // tüm kullanıcıları sildikten sonra örnek bir kullanıcıyı oluşturuyoruz
        // bunun sebebi yazıcağımız testlerin düzgün çalışması için kullanıcının bilgilerinin 
        // beklediğimiz şekilde olmasını sağlamak için. 
        await createUser(user1);
    });

    // burada servislerimizin headerlarını set ediyoruz
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

                    // burada auth servisimizde kullanıcı auth ettiğimiz için bir token dönüyor bize ve 
                    // bizde isAccessTokenValid servisinin testini yazabilmemiz için buradaki token'a ihtiyacımız olduğu için 
                    // commonHeaders'ın x-access-token değerine set ediyoruz.
                    commonHeaders['x-access-token'] = response.body.Access_Token
                    assert.ok(response.body.response);
                });
        });
    });
    describe("isAccessTokenValid Tests", () => {
        it("test checks status success", function (done) {
            request(app)
                .get("/token/?redirectURL=http://localhost:3021")
                //burada token'ı set ettiğimiz header'ı kullanıyoruz
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
