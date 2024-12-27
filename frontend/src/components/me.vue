<template>
  <div class="me">
    <h2>User Information</h2>
    <div v-if="user">
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Full Name:</strong> {{ user.full_name || 'Not provided' }}</p>
      <p><strong>Number of Posts:</strong> {{ user.posts }}</p>

      <div class="create-post">
        <h3>Create a Post</h3>
        <form @submit.prevent="handleCreatePost">
          <textarea
            v-model="postContent"
            maxlength="140"
            placeholder="Enter text (up to 140 characters)"
            required
          ></textarea>
          <button type="submit" :disabled="loadingPost">Post</button>
        </form>
        <p v-if="postSuccessMessage" class="success">{{ postSuccessMessage }}</p>
        <p v-if="postErrorMessage" class="error">{{ postErrorMessage }}</p>
      </div>

      <div class="user-posts">
        <h3>Your Posts</h3>
        <ul>
          <li v-for="post in allPosts" :key="post.id">
            <p><strong>{{ post.content }}</strong></p>
            <p><strong>Date:</strong> {{ new Date(post.created_at).toLocaleString() }}</p>
            <p><strong>Likes:</strong> {{ post.likes }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p v-if="loading">Loading...</p>
      <p v-else>{{ errorMessage || 'You are not authorized.' }}</p>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        user: null,
        loading: true,
        errorMessage: "",
        postContent: "",
        loadingPost: false,
        postSuccessMessage: "",
        postErrorMessage: "",
        allPosts: [],
      };
    },
    async created() {
      await this.fetchUserData();
      await this.fetchUserPosts();
    },
    methods: {
      async fetchUserData() {
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
          this.errorMessage = "You are not authorized.";
          this.loading = false;
          return;
        }

        const credentials = btoa(`${username}:${password}`);
        try {
          const response = await fetch("http://localhost:8000/api/me", {
            method: "GET",
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          });

          if (response.ok) {
            this.user = await response.json();
          } else if (response.status === 401) {
            this.errorMessage = "Not authorized. Please log in.";
          } else {
            this.errorMessage = "An error occurred. Please try again later.";
          }
        } catch (error) {
          this.errorMessage = "Network error. Please try again.";
        } finally {
          this.loading = false;
        }
      },
      async fetchUserPosts() {
        this.allPosts = [];
        this.errorMessage = "";
        this.loading = true;

        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");
        const credentials = btoa(`${username}:${password}`);

        let page = 1;
        let posts = [];
        try {
          do {
            const response = await fetch(
              `http://localhost:8000/api/users/${username}/posts?page=${page}`,
              credentials
                ? {
                    headers: {
                      Authorization: `Basic ${credentials}`,
                    },
                  }
                : {}
            );

            if (response.ok) {
              posts = await response.json();
              this.allPosts.push(...posts);
              page++;
            } else if (response.status === 404) {
              this.errorMessage = "User not found.";
              break;
            } else {
              this.errorMessage = "An error occurred. Please try again later.";
              break;
            }

            if (!username || !password) break;
          } while (posts.length > 0);
        } catch (error) {
          this.errorMessage = "Network error. Please try again.";
        } finally {
          this.loading = false;
        }
      },
      async handleCreatePost() {
        this.postSuccessMessage = "";
        this.postErrorMessage = "";
        this.loadingPost = true;

        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
          this.postErrorMessage = "You are not authorized.";
          this.loadingPost = false;
          return;
        }

        const credentials = btoa(`${username}:${password}`);
        try {
          const response = await fetch(
            `http://localhost:8000/api/users/${username}/posts`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`,
              },
              body: JSON.stringify({ content: this.postContent }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            this.postSuccessMessage = `Post successfully created! ID: ${data.id}`;
            this.postContent = "";
            this.user.posts += 1;

            this.allPosts.unshift(data);
          } else if (response.status === 403) {
            this.postErrorMessage =
              "You cannot create posts on behalf of another user.";
          } else if (response.status === 422) {
            this.postErrorMessage = "The post does not meet the requirements.";
          } else {
            this.postErrorMessage = "An error occurred. Please try again later.";
          }
        } catch (error) {
          this.postErrorMessage = "Network error. Please try again.";
        } finally {
          this.loadingPost = false;
        }
      },
    },
  };
</script>

<style scoped>
  .me {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
  }

  h2, h3 {
    text-align: center;
  }

  li p{
    word-break: break-word;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  textarea {
    width: 100%;
    height: 120px;
    margin-top: 10px;
    padding: 0.5rem;
    font-size: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
    resize: none;
  }

  button {
    width: 100%;
    margin-top: 10px;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

  .success {
    color: green;
    text-align: center;
    margin-top: 10px;
  }

  .error {
    color: red;
    text-align: center;
    margin-top: 10px;
  }

  .user-posts ul {
    list-style: none;
    padding: 0;
  }

  .user-posts li {
    margin-bottom: 1rem;
    padding: 10px;
    background: #eaeaea;
    border-radius: 4px;
  }

  .user-posts p {
    margin: 0.5rem 0;
  }
</style>
