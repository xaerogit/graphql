// API Endpoints //
const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";
const kjGraphQL = "https://01.kood.tech/api/graphql-engine/v1/graphql";

// Main JS //
const removeToken = () => localStorage.removeItem("jwt");
const saveToken = (token) => {
  if (token) {
    localStorage.setItem("jwt", token);
    console.debug("Token saved to localStorage:");  // Confirm it was saved
  } else {
    console.error("No token provided to saveToken");
  }
}
const getToken = (token) => {
  localStorage.getItem("jwt");
  console.debug("Retrieved token:", token)
  return token
}
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
  console.debug(response)
  
  if (!response.ok) {
    throw new Error("Invalid credentials");
  }
  
  const data = await response.json();
  console.debug("Token received from login response:", data.jwt);
  return data.jwt;
}

function fetchQuery(query) {
  const token = getToken();
  console.log("Token in fetchQuery:", token);
  return fetch(kjGraphQL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: query })
  })
  .then(res => {
    // console.debug("Fetch response status:", res.status);
    return res.json();
  })
  .then(data => {
    console.debug("Data received from fetchQuery:", data);
    saveToken(token)
    return data;
  })
  .catch(error => {
    console.error("Error in fetchQuery:", error);
  });
}

function getQuery() {
  fetchQuery(`
    query {
      user {
        auditRatio
        firstName
        lastName
        email
        createdAt
        login
      }
      xp: transaction(where: {
        _and: [
          {type: {_eq: "xp"}},
          {path: {_nlike: "%piscine%"}}
        ]
      }) {
        type
        path
        createdAt
        amount
        object {
          name
        }
      }
    }
    `).then(data => {
      console.log("GraphQL Query Result:", data); // Log the final result
    }).catch(error => {
      console.error("Error in getQuery:", error);
    });
  }

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    
    try {
      const token = await login(username, password);
      saveToken(token);
      document.getElementById("loginUsername").value = ""
      document.getElementById("loginPassword").value = ""
      // console.debug("Login Success")
      console.debug(getToken()) 
      loginDiv.style.display = "none"
      document.getElementById("graphQlMain").style.display = "block"
      getQuery()
    } catch (error) {
      document.getElementById("errorFlair").textContent = error.message;
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
