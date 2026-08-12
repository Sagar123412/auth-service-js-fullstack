import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { roles } from "../../src/constants";

describe("POST auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //start jwt mock
    jwks.start();
    //truncate database
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("happy path", () => {
    it("should return 200 status code", async () => {
      const accessToken = jwks.token({
        sub: "1",
        role: roles.CUSTOMER,
      });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      //AAA rute

      //add a user to database
      const userData = {
        firstName: "ss",
        lastName: "s",
        email: "sagarsfsdfsdf@gmail.com",
        password: "@Ss12345",
      };

      const userRepository = connection.getRepository(User);

      const data = await userRepository.save({
        ...userData,
        role: roles.CUSTOMER,
      });

      //creating access token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      //setting up a cookie with the request
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      //Assert
      // Check if user id matches with registered user
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not return the password field", async () => {
      // Register user
      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "test@gmail.com",
        password: "@SSs1234",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // Assert
      // Check if user id matches with registered user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password",
      );
    });

    it("should return 401 status code if token does not exists", async () => {
      // Register user
      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "rakesh@mern.space",
        password: "@S3password",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: roles.CUSTOMER,
      });

      // Add token to cookie
      const response = await request(app).get("/auth/self").send();
      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
