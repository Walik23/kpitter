<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p class="register-link">
      Don't have an account? <router-link to="/register">Create one!</router-link>
    </p>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  setup() {
    const updateAuthorization = inject("updateAuthorization");
    return { updateAuthorization };
  },
  methods: {
    async handleLogin() {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (response.status === 204) {
        localStorage.setItem("username", this.username);
        localStorage.setItem("password", this.password);

        this.updateAuthorization(true);

        this.$router.push("/me");
      } else if (response.status === 401) {
        this.errorMessage = "Incorrect username or password.";
      } else {
        this.errorMessage = "An error occurred while logging in. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
  .login {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
  }

  h2 {
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 1rem;
    margin-top: 0.5rem;
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

  .error {
    color: red;
    font-size: 0.9rem;
    text-align: center;
  }

  .register-link {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .register-link a {
    color: #4caf50;
    text-decoration: none;
    font-weight: bold;
  }

  .register-link a:hover {
    text-decoration: underline;
  }
</style>
