// API Endpoints //
const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";
const kjGraphQL = "https://01.kood.tech/api/graphql-engine/v1/graphql";

// Main JS //
const removeToken = () => localStorage.removeItem("jwt");
const loginDiv = document.getElementById("loginDiv")
const saveToken = (token) => {
  if (token) {
    localStorage.setItem("jwt", token);
    console.debug("Token saved to localStorage:", token); 
  }
}
const getToken = () => {
  const token = localStorage.getItem("jwt");
  console.debug("Retrieved token:", token)
  return token
}

const login = async (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  const response = await fetch(kjSignInEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${credentials}`
    }
  })
  .then(response => {
    return response.json();
 })
 .then(data => {
    if (data){
        const jwtToken = data;
        saveToken(jwtToken)
        getQuery(jwtToken)
        console.debug('== Getting Query ==')
    }
 })
}

function fetchQuery(query) {
  return fetch(kjGraphQL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: query })
  })
  .then(res => {
    console.debug("Fetch response status:", res.status);
    return res.json();
  })
  .then(data => {
    console.debug("Data received from fetchQuery:", data);
    return data;
  })
  .catch(error => {
    console.error("Error in fetchQuery:", error);
  });
}

function getQuery() {
  fetchQuery(`
    {
    user {
      id
      createdAt
      firstName
      auditRatio
    }
  }`).then(data => {
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
      document.getElementById("loginUsername").value = ""
      document.getElementById("loginPassword").value = ""
      console.debug(getToken()) 
      loginDiv.style.display = "none"
      document.getElementById("graphQlMain").style.display = "block"
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
