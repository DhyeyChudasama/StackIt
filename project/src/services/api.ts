const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API Request:', { url, method: options.method, body: options.body });
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: { username: string; email: string; password: string }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
    return await this.request('/auth/logout', { method: 'POST' });
  }

  // User endpoints
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(updates: { username?: string; bio?: string; avatar?: string; location?: string; website?: string }) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUserById(userId: string) {
    return await this.request(`/users/${userId}`);
  }

  // Question endpoints
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return await this.request(`/questions?${queryParams.toString()}`);
  }

  async getQuestionById(questionId: string) {
    return await this.request(`/questions/${questionId}`);
  }

  async createQuestion(questionData: { title: string; content: string; tags?: string[] }) {
    return await this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(questionId: string, updates: { title?: string; content?: string; tags?: string[] }) {
    return await this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteQuestion(questionId: string) {
    return await this.request(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async likeQuestion(questionId: string) {
    return await this.request(`/questions/${questionId}/like`, {
      method: 'POST',
    });
  }

  // Answer endpoints
  async getAnswersForQuestion(questionId: string) {
    return await this.request(`/answers/question/${questionId}`);
  }

  async createAnswer(answerData: { 
    content: string; 
    questionId: string; 
    images?: Array<{ url: string; publicId: string; caption?: string }>;
    codeBlocks?: Array<{ language: string; code: string; description?: string }>;
    references?: Array<{ title: string; url: string; description?: string }>;
  }) {
    return await this.request('/answers', {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  async updateAnswer(answerId: string, updates: { 
    content: string; 
    images?: Array<{ url: string; publicId: string; caption?: string }>;
    codeBlocks?: Array<{ language: string; code: string; description?: string }>;
    references?: Array<{ title: string; url: string; description?: string }>;
  }) {
    return await this.request(`/answers/${answerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAnswer(answerId: string) {
    return await this.request(`/answers/${answerId}`, {
      method: 'DELETE',
    });
  }

  async acceptAnswer(answerId: string) {
    return await this.request(`/answers/${answerId}/accept`, {
      method: 'PUT',
    });
  }

  async likeAnswer(answerId: string) {
    return await this.request(`/answers/${answerId}/like`, {
      method: 'POST',
    });
  }

  // Comment endpoints
  async getComments(params?: { questionId?: string; answerId?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    return await this.request(`/comments?${queryParams.toString()}`);
  }

  async createComment(commentData: { content: string; questionId?: string; answerId?: string }) {
    return await this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(commentId: string, updates: { content: string }) {
    return await this.request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteComment(commentId: string) {
    return await this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Vote endpoints
  async voteOnQuestion(questionId: string, voteType: 'upvote' | 'downvote') {
    return await this.request(`/votes/question/${questionId}`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async voteOnAnswer(answerId: string, voteType: 'upvote' | 'downvote') {
    return await this.request(`/votes/answer/${answerId}`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  // Notification endpoints
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return await this.request(`/notifications?${queryParams.toString()}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return await this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string) {
    return await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadNotificationCount() {
    return await this.request('/notifications/unread-count');
  }

  // Upload endpoints
  async uploadImage(file: File) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Upload failed');
    }

    return data;
  }

  async deleteImage(publicId: string) {
    return await this.request(`/upload/image/${publicId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService; 