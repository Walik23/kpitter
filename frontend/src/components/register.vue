<template>
  <div class="register-form">
    <h2>Registration</h2>
    <form @submit.prevent="register">
      <div>
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="Enter username (use Latin alphabet/numbers)"
          required
        />
      </div>
      <div>
        <label for="full_name">Full Name:</label>
        <input
          id="full_name"
          v-model="form.full_name"
          type="text"
          placeholder="Enter full name (optional)"
        />
      </div>
      <div>
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Enter password"
          required
        />
      </div>
      <button type="submit">Register</button>
    </form>
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>
  
<script>
  export default {
    data() {
      return {
        form: {
          username: "",
          full_name: "",
          password: "",
        },
        error: null,
      };
    },
    methods: {
      async register() {
        this.error = null;
        try {
          const response = await fetch("http://localhost:8000/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          });
  
          if (response.ok) {
            this.$router.push("/login");
          } else if (response.status === 409) {
            const errorData = await response.json();
            this.error = errorData.detail || "User already exists.";
          } else if (response.status === 422) {
            this.error = "Validation error. Please check your input.";
          } else {
            this.error = "An unknown error occurred.";
          }
        } catch (err) {
          this.error = "Unable to connect to the server.";
        }
      },
    },
  };
</script>
  
<style>
  .register-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .register-form h2 {
    text-align: center;
  }
  
  .register-form div {
    margin-bottom: 1rem;
  }
  
  .register-form label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .register-form input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding-right: 1rem;
    box-sizing: border-box;
  }
  
  .register-form button {
    width: 100%;
    padding: 0.5rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .register-form button:hover {
    background-color: #45a049;
  }
  
  .error {
    color: red;
    text-align: center;
    margin-top: 1rem;
  }
</style>
  