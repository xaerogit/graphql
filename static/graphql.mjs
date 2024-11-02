import { fetchQuery } from "./queryHelper.js";

// API Endpoints //
const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";

// Main JS //
const removeToken = () => localStorage.removeItem("jwt");
const loginDiv = document.getElementById("loginDiv")
const saveToken = (token) => {
  if (token) {
    localStorage.setItem("jwt", token);
    console.debug("Token saved to localStorage:", token); 
  }
}
export const getToken = () => {
  const token = localStorage.getItem("jwt");
  console.debug("Retrieved token:", token)
  return token
}

const login = async (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  return fetch(kjSignInEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    return response.json()
  })
  .then(data => {
    if(data){
      const jwtToken = data
      saveToken(jwtToken)
      getUserQuery(jwtToken)
      getXPQuery(jwtToken)
      getSkillsQuery(jwtToken)
    }
  })
  .catch(error => {
    console.error(error)
  })
}

// function fetchQuery(query) {
//   return fetch(kjGraphQL, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${getToken()}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ query: query })
//   })
//   .then(res => {
//     console.debug("Fetch response status:", res.status);
//     return res.json();
//   })
//   .then(data => {
//     console.debug("Data received from fetchQuery:", data);
//     return data;
//   })
//   .catch(error => {
//     console.error("Error in fetchQuery:", error);
//   });
// }

function getUserQuery() {
  fetchQuery(`
    {
    user {
      firstName
      lastName
      login
      email
      createdAt
      auditRatio
    }
  }`).then(data => {
      console.debug("GraphQL User Query Result:", data);
      const userData = data.data.user[0]
      if(document.getElementById("userInfo")) {
        document.getElementById("userInfo").innerHTML = `
        <p>Full Name: ${userData.firstName} ${userData.lastName}</p>
        <p>Gitea Username: ${userData.login}</p>
        <p>E-mail: ${userData.email}</div>
        <p>Audit Ratio: ${userData.auditRatio.toFixed(2)}</p>
        <p>Account Created: ${userData.createdAt}</p>
        `;
      }
      
    }).catch(error => {
      console.error("Error in getQuery:", error);
    });
}

function getXPQuery() {
  fetchQuery(`
    {
  xp: transaction(
    where: { _and: [{ type: { _eq: "xp" } }, { path: { _nlike: "%piscine%" } }] }
  ) {
    type
    path
    createdAt
    amount
    object {
      name
    }
  }
}`).then(data => {
  console.debug("GraphQL XP Query Result:", data);
  const xpData = data.data.xp[0]
  if(document.getElementById("xpGraph")){
    document.getElementById("xpGraph").innerHTML =`
    <p>${xpData}</p>`
  }
  }).catch(error => {
    console.error("Error in getQuery:", error);
  });
}

function getSkillsQuery() {
  fetchQuery(`
    {
  skills: transaction(
    limit: 100
    offset: 0
    where: { _and: [{ type: { _ilike: "%skill%" } }] }
  ) {
    type
    amount
  }
}`).then(data => {
  console.debug("GraphQL Skills Query Result:", data);
  const skillsData = data.data.skills[0]
  if(document.getElementById("skillsChart")) {
    document.getElementById("skillsChart").innerHTML = `
    <p>${skillsData}</p>`
  }
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
      // console.debug(getToken()) 
      loginDiv.style.display = "none"
      document.getElementById("graphQlMain").style.display = "inline-block"
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
