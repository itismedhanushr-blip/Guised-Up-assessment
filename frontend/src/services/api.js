/**
 * Guised Up API Service Client
 * Handles authenticated communication with Laravel/Node API Gateway
 */

const API_BASE_URL = 'http://localhost:8010/api';

export async function fetchFeed(page = 1, limit = 20, token = 'sanctum_token_1_secret') {
  try {
    const response = await fetch(`${API_BASE_URL}/feed?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch feed error:', error);
    throw error;
  }
}

export async function searchPosts(query, token = 'sanctum_token_1_secret') {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function createPost(postData, token = 'sanctum_token_1_secret') {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
}

export async function logInteraction(postId, type = 'reaction', token = 'sanctum_token_1_secret') {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ post_id: postId, type }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Log interaction error:', error);
    throw error;
  }
}
