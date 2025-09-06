const { test, expect } = require('@playwright/test');

test.describe('JSONPlaceholder API Tests', () => {
  
  test('GET /users - should return users list', async ({ request }) => {
    const response = await request.get('/users');
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
  });

  test('GET /posts - should return posts list', async ({ request }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('title');
    expect(posts[0]).toHaveProperty('body');
  });

  test('POST /posts - should create new post', async ({ request }) => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post body',
      userId: 1
    };

    const response = await request.post('/posts', {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
  });

  test('GET /posts/1 - should return specific post', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });

  test('PUT /posts/1 - should update post', async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: 'Updated Test Post',
      body: 'Updated test post body',
      userId: 1
    };

    const response = await request.put('/posts/1', {
      data: updatedPost
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.title).toBe(updatedPost.title);
    expect(result.body).toBe(updatedPost.body);
  });

  test('DELETE /posts/1 - should delete post', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });
});