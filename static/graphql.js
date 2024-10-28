// API Endpoints //
const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";
const kjGraphQL = "https://01.kood.tech/api/graphql-engine/v1/graphql";

// Main JS //
const saveToken = (token) => localStorage.setItem("jwt", token);
const getToken = () => localStorage.getItem("jwt");
const removeToken = () => localStorage.removeItem("jwt");
const loginDiv = document.getElementById("loginDiv")

const login = async (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  const response = await fetch(kjSignInEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error("Invalid credentials");
  }
  const data = await response.json();
  return data.jwt;  // JWT token
};


const fetchGraphQL = async (query) => {
  const jwt = getToken();
  const response = await fetch(kjGraphQL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const result = await response.json();
  return result.data;
};

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const errorMessage = document.getElementById("errorFlair");
    
    try {
      const token = await login(username, password);
      saveToken(token);
      console.debug("Login Success")
      loginDiv.style.display = "none"
      const graphQlMain = document.getElementById("graphQlMain")
      graphQlMain.style.display = "block"

    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });
}

if (document.getElementById("logoutButton")) {
  document.getElementById("logoutButton").addEventListener("click", () => {
    removeToken();
    graphQlMain.style.display = "none"
    loginDiv.style.display = "block"
  });
}


