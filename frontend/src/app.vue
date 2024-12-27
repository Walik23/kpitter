<template>
  <div id="app">
    <header>
      <nav>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/users">Users</router-link></li>
          <div class="right-section">
            <li v-if="!isAuthorized"><router-link to="/login">Login</router-link></li>
            <li v-else>
              <button @click="logout" class="logout-button">Logout</button>
            </li>
            <li v-if="isAuthorized"><router-link to="/me">My Profile</router-link></li>
          </div>
        </ul>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; 2024 KPitter. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { ref, provide } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const router = useRouter();

    const isAuthorized = ref(
      localStorage.getItem("username") && localStorage.getItem("password")
    );

    const updateAuthorization = (state) => {
      isAuthorized.value = state;
    };

    const logout = () => {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      updateAuthorization(false);
      router.push("/login");
    };

    provide("updateAuthorization", updateAuthorization);

    return {
      isAuthorized,
      logout,
    };
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: #4caf50;
  color: white;
  padding: 1rem;
}

header ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

header ul .right-section {
  display: flex;
  margin-left: auto;
  gap: 1rem;
}

header a {
  color: white;
  text-decoration: none;
}

header a:hover {
  text-decoration: underline;
}

.logout-button {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.logout-button:hover {
  background: #d43f3f;
}

main {
  flex: 1;
  padding: 2rem;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {

  header {
    padding: 1rem;
    text-align: center;
  }

  main {
    padding: 1rem;
  }

  footer {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  header ul {
    gap: 0.5rem;
  }

  header a,
  .logout-button {
    font-size: 0.9rem;
  }

  .logout-button {
    padding: 0.3rem 0.8rem;
  }

  main {
    padding: 0.5rem;
  }

  footer {
    font-size: 0.8rem;
  }
}
</style>

