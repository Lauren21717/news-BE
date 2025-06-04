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

describe('GET /api/articles/:article_id', () => {
  test('200: responds with status 200', () => {
      return request(app)
          .get('/api/articles/1')
          .expect(200);
  });

  test('200: responds with a single article object', () => {
      return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
              expect(body.article).toMatchObject({
                  article_id: 1,
                  title: expect.any(String),
                  topic: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(String),
                  votes: expect.any(Number),
                  article_img_url: expect.any(String),
                  comment_count: expect.any(Number)
              });
          });
  });

  test('404: responds with error when article does not exist', () => {
      return request(app)
          .get('/api/articles/999')
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Article not found');
          });
  });

  test('400: responds with error when given invalid article_id', () => {
      return request(app)
          .get('/api/articles/not-a-number')
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('200: responds with status 200 for article with comments', () => {
      return request(app)
          .get('/api/articles/1/comments')
          .expect(200);
  });

  test('200: responds with correct number of comments for article 1', () => {
      return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
              expect(body.comments).toHaveLength(11);
          });
  });

  test('200: comments are sorted by created_at in descending order', () => {
      return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
              expect(body.comments).toBeSortedBy('created_at', { descending: true });
          });
  });

  test('200: each comment has the correct properties', () => {
      return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
              body.comments.forEach((comment) => {
                  expect(comment).toMatchObject({
                      comment_id: expect.any(Number),
                      votes: expect.any(Number),
                      created_at: expect.any(String),
                      author: expect.any(String),
                      body: expect.any(String),
                      article_id: 1
                  });
              });
          });
  });

  test('200: responds with empty array when article exists but has no comments', () => {
      return request(app)
          .get('/api/articles/2/comments')
          .expect(200)
          .then(({ body }) => {
              expect(body.comments).toEqual([]);
          });
  });

  test('404: responds with error when article does not exist', () => {
      return request(app)
          .get('/api/articles/999/comments')
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Article not found');
          });
  });

  test('400: responds with error when given invalid article_id', () => {
      return request(app)
          .get('/api/articles/not-a-number/comments')
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });
});