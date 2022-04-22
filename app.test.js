jest.useFakeTimers();
const request = require('supertest');
const app = require('./app.js');

describe("GET /api/ping", () => {

  test("should respond with 200 status code", async () => {
    const response = await request(app).get('/api/ping');
    expect(response.statusCode).toBe(200);
  });

  test("should respond with expected content", async () => {
    const response = await request(app).get('/api/ping');
    expect(response.text).toBe('{"success":true}');
  });
  
});

describe("GET /api/posts", () => {
  
  describe("when provided with valid query parameters", () => {
    
    test("should respond with 200 status code",  async () => {
      const response = await  request(app)
        .get('/api/posts')
        .query({
        'tags' : 'tech',
        'direction' : 'asc',
        'sortBy' : 'reads'
      });
      expect(response.statusCode).toBe(200);
      
   });

    test("should respond with json object ",  async () => {
      const response = await  request(app)
      .get('/api/posts')
      .query({
        'tags' : 'tech,health',
        'direction' : 'asc',
        'sortBy' : 'reads'
      });
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    });
    
    test("should respond with no duplicate posts ",  async () => {
      const response = await  request(app)
      .get('/api/posts')
      .query({
        'tags' : 'tech,health',
        'direction' : 'asc',
        'sortBy' : 'reads'
      });
      // create unique set of posts and compre it with number or post in response body
      const set = new Set(response.body.posts);
      expect(response.body.posts.length).toEqual(set.size);
    });



  });

  describe("when provided with invalid query parameters", () => {
    
    test("should respond with 400 status code", async () => {
      const invalidQueries = [
        { 'direction' : 'desc', 'sortBy' : 'id' },
        { 'tags' : 'science', 'direction' : 'down', },
        { 'tags' : 'science', 'sortBy' : 'name' }
      ];

      for ( const query of invalidQueries) {
        const response = await request(app).get('/api/posts').query(query);
        expect(response.statusCode).toBe(400);
      }
      
    });

    test("should respond with expected error message when provided with no tags", async () => {
      const response = await  request(app)
        .get('/api/posts')
        .query({ 'direction' : 'desc', 'sortBy' : 'id' })
      expect(response.text).toBe('{"error":"Tags parameter is required"}');
    });

    test("should respond with expected error message when provided with invalid direction", async () => {
      const response = await  request(app)
        .get('/api/posts')
        .query({ 'tags': 'tech','direction' : 'up', 'sortBy' : 'id' })
      expect(response.text).toBe('{"error":"direction parameter is invalid"}');
    });

    test("should respond with expected error message when provided with invalid sortBy", async () => {
      const response = await request(app).get('/api/posts').query(
        { 'tags': 'health','direction' : 'asc', 'sortBy' : 'length' }
      );
      expect(response.text).toBe('{"error":"sortBy parameter is invalid"}');
    });

  })

});

