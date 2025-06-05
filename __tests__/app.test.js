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
  describe('Basic functionality', () => {
    test('200: responds with correct data structure including pagination', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('articles');
          expect(body).toHaveProperty('total_count');
          expect(Array.isArray(body.articles)).toBe(true);
          expect(typeof body.total_count).toBe('number');
        });
    });

    test('200: defaults to 10 articles with correct sorting', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(10);
          expect(body.total_count).toBe(13);
          expect(body.articles).toBeSortedBy('created_at', { descending: true });
        });
    });

    test('200: each article has correct properties', () => {
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
            expect(article).not.toHaveProperty('body');
          });
        });
    });
  });

  describe('Pagination', () => {
    test('200: respects custom limit', () => {
      return request(app)
        .get('/api/articles?limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(5);
          expect(body.total_count).toBe(13);
        });
    });

    test('200: respects page parameter', () => {
      return request(app)
        .get('/api/articles?limit=5&p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(5);
          expect(body.total_count).toBe(13);
        });
    });

    test('400: responds with error for invalid limit', () => {
      return request(app)
        .get('/api/articles?limit=invalid')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request');
        });
    });

    test('400: responds with error for invalid page', () => {
      return request(app)
        .get('/api/articles?p=invalid')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request');
        });
    });
  });

  describe('Sorting queries', () => {
    test('200: can be sorted by different columns and orders', () => {
      const sortTests = [
        { query: '?sort_by=title&order=asc&limit=13', sortBy: 'title', desc: false },
        { query: '?sort_by=author&order=desc&limit=13', sortBy: 'author', desc: true },
        { query: '?sort_by=votes&limit=13', sortBy: 'votes', desc: true },
        { query: '?sort_by=comment_count&order=asc&limit=13', sortBy: 'comment_count', desc: false }
      ];

      return Promise.all(
        sortTests.map(({ query, sortBy, desc }) =>
          request(app)
            .get(`/api/articles${query}`)
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toBeSortedBy(sortBy, { descending: desc });
              expect(body.total_count).toBe(13);
            })
        )
      );
    });

    test('200: pagination works with sorting', () => {
      return request(app)
        .get('/api/articles?sort_by=votes&order=asc&limit=3')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(3);
          expect(body.articles).toBeSortedBy('votes', { descending: false });
          expect(body.total_count).toBe(13);
        });
    });

    test('400: responds with error for invalid sorting parameters', () => {
      return Promise.all([
        request(app)
          .get('/api/articles?sort_by=invalid_column')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          }),
        request(app)
          .get('/api/articles?order=invalid_order')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          })
      ]);
    });
  });

  describe('Topic filtering', () => {
    test('200: filters articles by topic with default pagination', () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(10); // Default limit
          expect(body.total_count).toBe(12); // Total mitch articles
          body.articles.forEach((article) => {
            expect(article.topic).toBe('mitch');
          });
        });
    });

    test('200: pagination works with topic filter', () => {
      return request(app)
        .get('/api/articles?topic=mitch&limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toHaveLength(5);
          expect(body.total_count).toBe(12);
          body.articles.forEach(article => {
            expect(article.topic).toBe('mitch');
          });
        });
    });

    test('200: handles edge cases for topic filtering', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
          expect(body.total_count).toBe(0);
        });
    });

    test('200: combines topic filtering with sorting', () => {
      return request(app)
        .get('/api/articles?topic=mitch&sort_by=votes&order=asc&limit=12')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('votes', { descending: false });
          expect(body.total_count).toBe(12);
          body.articles.forEach((article) => {
            expect(article.topic).toBe('mitch');
          });
        });
    });

    test('404: responds with error when topic does not exist', () => {
      return request(app)
        .get('/api/articles?topic=nonexistent')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Topic not found');
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
  describe('Basic functionality', () => {
    test('200: responds with correct data structure including pagination', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('comments');
          expect(body).toHaveProperty('total_count');
          expect(Array.isArray(body.comments)).toBe(true);
          expect(typeof body.total_count).toBe('number');
        });
    });

    test('200: defaults to 10 comments with correct sorting', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toHaveLength(10);
          expect(body.total_count).toBe(11);
          expect(body.comments).toBeSortedBy('created_at', { descending: true });
        });
    });

    test('200: each comment has correct properties', () => {
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
  });

  describe('Pagination', () => {
    test('200: respects custom limit', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toHaveLength(5);
          expect(body.total_count).toBe(11);
        });
    });

    test('200: respects page parameter', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=5&p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toHaveLength(5);
          expect(body.total_count).toBe(11);
        });
    });

    test('400: responds with error for invalid limit', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=invalid')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request');
        });
    });

    test('400: responds with error for invalid page', () => {
      return request(app)
        .get('/api/articles/1/comments?p=invalid')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request');
        });
    });
  });

  describe('Edge cases', () => {
    test('200: handles articles with no comments', () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
          expect(body.total_count).toBe(0);
        });
    });

    test('200: returns all comments when limit exceeds total', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=20')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toHaveLength(11);
          expect(body.total_count).toBe(11);
        });
    });

    test('200: returns empty array when page exceeds available comments', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=5&p=999')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
          expect(body.total_count).toBe(11);
        });
    });
  });

  describe('Error handling', () => {
    test('404: responds with error when article does not exist', () => {
      return request(app)
        .get('/api/articles/999/comments')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Article not found');
        });
    });

    test('400: responds with error for invalid article_id', () => {
      return request(app)
        .get('/api/articles/not-a-number/comments')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request');
        });
    });
  });
});

describe('POST /api/articles/:article_id/comments', () => {
  test('201: responds with status 201', () => {
      const newComment = {
          username: 'butter_bridge',
          body: 'This is a new comment'
      };
      
      return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(201);
  });

  test('201: responds with the posted comment', () => {
      const newComment = {
          username: 'butter_bridge',
          body: 'This is a new comment'
      };
      
      return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
              expect(body.comment).toMatchObject({
                  comment_id: expect.any(Number),
                  body: 'This is a new comment',
                  article_id: 1,
                  author: 'butter_bridge',
                  votes: 0,
                  created_at: expect.any(String)
              });
          });
  });

  test('404: responds with error when article does not exist', () => {
      const newComment = {
          username: 'butter_bridge',
          body: 'This is a new comment'
      };
      
      return request(app)
          .post('/api/articles/999/comments')
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Not found');
          });
  });

  test('400: responds with error when missing required fields', () => {
      const newComment = {
          username: 'butter_bridge'
          // missing body
      };
      
      return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });

  test('404: responds with error when username does not exist', () => {
      const newComment = {
          username: 'nonexistent_user',
          body: 'This is a new comment'
      };
      
      return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Not found');
          });
  });

  test('400: responds with error when invalid article_id', () => {
      const newComment = {
          username: 'butter_bridge',
          body: 'This is a new comment'
      };
      
      return request(app)
          .post('/api/articles/not-a-number/comments')
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('200: responds with status 200', () => {
      const updateVotes = { inc_votes: 1 };
      
      return request(app)
          .patch('/api/articles/1')
          .send(updateVotes)
          .expect(200);
  });

  test('200: responds with the updated article when incrementing votes', () => {
      const updateVotes = { inc_votes: 1 };
      
      return request(app)
          .patch('/api/articles/1')
          .send(updateVotes)
          .expect(200)
          .then(({ body }) => {
              expect(body.article).toMatchObject({
                  article_id: 1,
                  title: expect.any(String),
                  topic: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(String),
                  votes: 101,
                  article_img_url: expect.any(String)
              });
          });
  });

  test('200: responds with the updated article when decrementing votes', () => {
      const updateVotes = { inc_votes: -100 };
      
      return request(app)
          .patch('/api/articles/1')
          .send(updateVotes)
          .expect(200)
          .then(({ body }) => {
              expect(body.article.votes).toBe(0);
          });
  });

  test('404: responds with error when article does not exist', () => {
      const updateVotes = { inc_votes: 1 };
      
      return request(app)
          .patch('/api/articles/999')
          .send(updateVotes)
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Article not found');
          });
  });

  test('400: responds with error when inc_votes is missing', () => {
      const updateVotes = {};
      
      return request(app)
          .patch('/api/articles/1')
          .send(updateVotes)
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });

  test('400: responds with error when inc_votes is not a number', () => {
      const updateVotes = { inc_votes: 'not-a-number' };
      
      return request(app)
          .patch('/api/articles/1')
          .send(updateVotes)
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });

  test('400: responds with error when invalid article_id', () => {
      const updateVotes = { inc_votes: 1 };
      
      return request(app)
          .patch('/api/articles/not-a-number')
          .send(updateVotes)
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  test('204: responds with status 204 and no content', () => {
      return request(app)
          .delete('/api/comments/1')
          .expect(204)
          .then(({ body }) => {
              expect(body).toEqual({});
          });
  });

  test('404: responds with error when comment does not exist', () => {
      return request(app)
          .delete('/api/comments/999')
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('Comment not found');
          });
  });

  test('400: responds with error when given invalid comment_id', () => {
      return request(app)
          .delete('/api/comments/not-a-number')
          .expect(400)
          .then(({ body }) => {
              expect(body.msg).toBe('Bad request');
          });
  });

  test('204: comment is actually deleted from database', () => {
      return request(app)
          .get('/api/articles/9/comments')
          .then(({ body }) => {
              const originalCount = body.comments.length;
              
              return request(app)
                  .delete('/api/comments/1')
                  .expect(204)
                  .then(() => {
                      return request(app).get('/api/articles/9/comments');
                  })
                  .then(({ body }) => {
                      expect(body.comments).toHaveLength(originalCount - 1);
                  });
          });
  });
});

describe('GET /api/users/:username', () => {
  test('200: responds with status 200', () => {
      return request(app)
          .get('/api/users/butter_bridge')
          .expect(200);
  });

  test('200: responds with a single user object', () => {
      return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
              expect(body.user).toBeInstanceOf(Object);
              expect(Array.isArray(body.user)).toBe(false);
          });
  });

  test('200: user object has correct properties', () => {
      return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
              expect(body.user).toMatchObject({
                  username: expect.any(String),
                  name: expect.any(String),
                  avatar_url: expect.any(String)
              });
          });
  });

  test('200: responds with correct user data for butter_bridge', () => {
      return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
              expect(body.user).toMatchObject({
                  username: 'butter_bridge',
                  name: expect.any(String),
                  avatar_url: expect.any(String)
              });
          });
  });

  test('200: responds with correct user data for different user', () => {
      return request(app)
          .get('/api/users/icellusedkars')
          .expect(200)
          .then(({ body }) => {
              expect(body.user).toMatchObject({
                  username: 'icellusedkars',
                  name: expect.any(String),
                  avatar_url: expect.any(String)
              });
          });
  });

  test('404: responds with error when username does not exist', () => {
      return request(app)
          .get('/api/users/nonexistent_user')
          .expect(404)
          .then(({ body }) => {
              expect(body.msg).toBe('User not found');
          });
  });

  test('404: responds with appropriate error message format', () => {
      return request(app)
          .get('/api/users/nonexistent_user')
          .expect(404)
          .then(({ body }) => {
              expect(body).toMatchObject({
                  msg: expect.any(String)
              });
              expect(body).not.toHaveProperty('user');
          });
  });
});

describe('PATCH /api/comments/:comment_id', () => {
  test('200: responds with updated comment when incrementing votes', () => {
    const updateVotes = { inc_votes: 1 };
    
    return request(app)
      .patch('/api/comments/1')
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: 1,
          body: expect.any(String),
          votes: 17, // 16 + 1
          author: expect.any(String),
          article_id: expect.any(Number),
          created_at: expect.any(String)
        });
      });
  });

  test('200: responds with updated comment when decrementing votes', () => {
    const updateVotes = { inc_votes: -10 };
    
    return request(app)
      .patch('/api/comments/1')
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(6);
      });
  });

  test('404: responds with error when comment does not exist', () => {
    const updateVotes = { inc_votes: 1 };
    
    return request(app)
      .patch('/api/comments/999')
      .send(updateVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Comment not found');
      });
  });

  test('400: responds with error when inc_votes is missing', () => {
    return request(app)
      .patch('/api/comments/1')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('400: responds with error when inc_votes is not a number', () => {
    return request(app)
      .patch('/api/comments/1')
      .send({ inc_votes: 'not-a-number' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('POST /api/articles', () => {
  test('201: responds with status 201', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201);
  });

  test('201: responds with an article object', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty('article');
        expect(body.article).toBeInstanceOf(Object);
        expect(Array.isArray(body.article)).toBe(false);
      });
  });

  test('201: article has correct structure properties', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          author: expect.any(String),
          title: expect.any(String),
          body: expect.any(String),
          topic: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: expect.any(Number)
        });
      });
  });


  test('201: uses default image URL when article_img_url not provided', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({ article_img_url: expect.any(String), })
      });
  });

  test('201: uses provided image URL when article_img_url is provided', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch',
      article_img_url: 'https://example.com/custom-image.jpg'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article.article_img_url).toBe('https://example.com/custom-image.jpg');
      });
  });

  test('400: responds with error when required fields are missing', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('404: responds with error when author does not exist', () => {
    const newArticle = {
      author: 'nonexistent_user',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'mitch'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found');
      });
  });

  test('404: responds with error when topic does not exist', () => {
    const newArticle = {
      author: 'butter_bridge',
      title: 'Test Article',
      body: 'This is a test article body',
      topic: 'nonexistent_topic'
    };
    
    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found');
      });
  });
});
