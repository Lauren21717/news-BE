const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const endpointsJson = require("../endpoints.json");

// Seed test data before each test
beforeEach(() => {
  return seed(testData);
});

// Close db connection after each test
afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('GET /api/topics', () => {
  test('200: responds with status 200', () => {
    return request(app)
      .get('/api/topics')
      .expect(200);
  });

  test('200: responds with correct number of topics', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
      });
  });

  test('200: each topic has the correct properties', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
            img_url: expect.any(String)
          });
        });
      });
  });
});

describe('GET /api/articles', () => {
  test('200: responds with status 200', () => {
    return request(app)
      .get('/api/articles')
      .expect(200);
  });

  test('200: responds with correct number of articles', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
      });
  });

  test('200: articles are sorted by created_at in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('created_at', { descending: true });
      });
  });

  test('200: each article has the correct properties', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          });
        });
      });
  });

  test('200: articles do not include body property', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty('body');
        });
      });
  });
});

describe('GET /api/users', () => {
  test('200: responds with status 200', () => {
      return request(app)
          .get('/api/users')
          .expect(200);
  });

  test('200: responds with correct number of users', () => {
      return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body }) => {
              expect(body.users).toHaveLength(4);
          });
  });

  test('200: each user has the correct properties', () => {
      return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body }) => {
              body.users.forEach((user) => {
                  expect(user).toMatchObject({
                      username: expect.any(String),
                      name: expect.any(String),
                      avatar_url: expect.any(String)
                  });
              });
          });
  });
});