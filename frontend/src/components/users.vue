<template>
  <div class="get-user">
    <h2>User Information</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Enter username:</label>
        <input 
          type="text" 
          id="username" 
          v-model="inputUsername" 
          required 
          placeholder="Username"
          @input="handleInputChange" 
        />
      </div>
      <button type="submit">Get Data</button>
      <button 
        type="button" 
        @click="fetchAllPosts" 
        :disabled="!user || isInputChanged"
        class="secondary"
      >
        View Posts
      </button>
      <div class="form-group">
        <label for="postId">Enter Post ID (optional):</label>
        <input 
          type="text" 
          id="postId" 
          v-model="inputPostId" 
          placeholder="Post ID"
          @input="handlePostIdInput" 
        />
      </div>
      <button 
        type="button" 
        @click="handleViewPost" 
        :disabled="!inputPostId"
        class="tertiary"
      >
        Find Post
      </button>
    </form>

    <div v-if="user">
      <h3>Search Results:</h3>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Full Name:</strong> {{ user.full_name || "Not specified" }}</p>
      <p><strong>Number of Posts:</strong> {{ user.posts }}</p>
    </div>

    <div v-if="loading">Loading...</div>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="posts.length">
      <h3>Posts by {{ inputUsername }}:</h3>
      <ul>
        <li v-for="allPosts in posts" :key="allPosts.id">
          <p><strong>{{ allPosts.content }}</strong></p>
          <p><strong>Date:</strong> {{ new Date(allPosts.created_at).toLocaleString() }}</p>
          <div class="like-section">
            <button 
              @click="toggleLikePost(allPosts.id, allPosts.is_liked)" 
              :disabled="!isAuthorized"
              class="like-button"
            >
              {{ allPosts.is_liked ? "Remove Like" : "Like" }}
            </button>
            <span class="like-count"> {{ allPosts.likes }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="post">
      <h3>Post with ID {{ inputPostId }}:</h3>
      <p><strong>{{ post.author.username }}:</strong> {{ post.content }}</p>
      <p><strong>Date:</strong> {{ new Date(post.created_at).toLocaleString() }}</p>
      <div class="like-section">
        <button 
          @click="toggleLikePost(post.id, post.is_liked)" 
          :disabled="!isAuthorized"
          class="like-button"
        >
          {{ post.is_liked ? "Remove Like" : "Like" }}
        </button>
        <span class="like-count"> {{ post.likes }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputUsername: "",
      inputPostId: "",
      user: null,
      posts: [],
      post: null,
      loading: false,
      errorMessage: "",
      isInputChanged: false,
    };
  },
  computed: {
    isAuthorized() {
      return localStorage.getItem("username") && localStorage.getItem("password");
    },
  },
  methods: {
    async handleSubmit() {
      this.user = null;
      this.errorMessage = "";
      this.loading = true;

      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");

      const credentials = btoa(`${username}:${password}`);

      try {
        const response = await fetch(`http://localhost:8000/api/users/${this.inputUsername}`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });
        if (response.ok) {
          this.user = await response.json();
          this.posts = [];
          this.isInputChanged = false;
        } else if (response.status === 404) {
          this.errorMessage = "User not found.";
        } else {
          this.errorMessage = "An error occurred. Please try again later.";
        }
      } catch (error) {
        this.errorMessage = "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async handleViewPost() {
      this.post = null;
      this.errorMessage = "";
      this.loading = true;

      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");

      const credentials = btoa(`${username}:${password}`);

      try {
        const response = await fetch(`http://localhost:8000/api/users/${this.inputUsername}/posts/${this.inputPostId}`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });
        if (response.ok) {
          this.post = await response.json();
        } else if (response.status === 404) {
          this.errorMessage = "Post not found or incorrect user.";
        } else {
          this.errorMessage = "An error occurred. Please try again later.";
        }
      } catch (error) {
        this.errorMessage = "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async toggleLikePost(postId, isLiked) {
      this.errorMessage = "";
      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");
      const credentials = btoa(`${username}:${password}`);

      try {
        const method = isLiked ? "DELETE" : "PUT";
        const response = await fetch(
          `http://localhost:8000/api/users/${this.inputUsername}/posts/${postId}/like`,
          {
            method,
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );

        if (response.ok) {
          const postInList = this.posts.find(p => p.id === postId);
          if (postInList) {
            postInList.is_liked = !isLiked;
            postInList.likes += isLiked ? -1 : 1;
          }

          if (this.post && this.post.id === postId) {
            this.post.is_liked = !isLiked;
            this.post.likes += isLiked ? -1 : 1;
          }
        } else {
          this.errorMessage = `Failed to ${isLiked ? "remove like" : "like"}. Please try again.`;
        }
      } catch (error) {
        this.errorMessage = "Network error. Please try again.";
      }
    },
    async fetchAllPosts() {
      this.posts = [];
      this.errorMessage = "";
      this.loading = true;

      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");
      const credentials = btoa(`${username}:${password}`);

      let page = 1;
      let allPosts = [];
      try {
        do {
          const response = await fetch(
            `http://localhost:8000/api/users/${this.inputUsername}/posts?page=${page}`,
            credentials
              ? {
                  headers: {
                    Authorization: `Basic ${credentials}`,
                  },
                }
              : {}
          );

          if (response.ok) {
            allPosts = await response.json();
            this.posts.push(...allPosts);
            page++;
          } else if (response.status === 404) {
            this.errorMessage = "User not found.";
            break;
          } else {
            this.errorMessage = "An error occurred. Please try again later.";
            break;
          }

          if (!username || !password) break;
        } while (allPosts.length > 0);
      } catch (error) {
        this.errorMessage = "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    handleInputChange() {
      this.isInputChanged = true;
    },
    handlePostIdInput() {
      this.errorMessage = "";
    },
  },
};
</script>

<style scoped>
  .get-user {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
  }

  h2, h3 {
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 1rem;
    margin-top: 0.5rem;
    font-size: 1rem;
    box-sizing: border-box;
  }

  button {
    width: 48%;
    padding: 0.75rem;
    margin: 0.5rem 1%;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }

  button.secondary {
    background-color: #007bff;
  }

  button.tertiary {
    background-color: #ffa500;
  }

  button:disabled {
    background-color: #cccccc;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 1rem;
    padding: 10px;
    background: #eaeaea;
    border-radius: 4px;
  }

  p {
    margin: 0.5rem 0;
  }

  li p {
    word-break: break-word;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  .error {
    color: red;
    text-align: center;
  }

  .like-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .like-count {
    font-weight: bold;
    color: #555;
  }

  .like-button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
  }

  .like-button:disabled {
    background-color: #cccccc;
  }
</style>
