import { fetchQuery } from "./queryHelper.js";
import { renderSkillsChart, renderXPChart } from "./renderCharts.js";

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
  const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";
  return fetch(kjSignInEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    if(!response.ok){
        if(response.status === 403){
          document.getElementById("errorFlair").textContent = Error;
        }
    }
    if(response.ok){
      loginDiv.style.display = "none"
      document.getElementById("graphQlMain").style.display = "block"
      document.getElementById("extras").style.display = "block"
    }
    return response.json();
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
    document.getElementById("errorFlair").textContent = Error;
  })
}

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
    const timestamp = userData.createdAt
    const date = new Date(timestamp)
    /* Estonian Timezone [Eastern Europe Time]
       In the Summer it goes to EEST [Eastern Europe Summer Time] */
    const formattedDate = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "EET" 
    });

    if(document.getElementById("userInfo")) {
      document.getElementById("userInfo").innerHTML = 
      `<div>Full Name: ${userData.firstName} ${userData.lastName}</div>
      <div>Gitea Username: ${userData.login}</div>
      <div>E-mail: ${userData.email}</div>
      <div>Audit Ratio: ${userData.auditRatio.toFixed(2)}</div>
      <div>Account Created: ${formattedDate}</div>`;
    }
    }).catch(error => {
      document.getElementById("errorFlair").textContent = error.message
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
  if(document.getElementById("xpGraph")){
    const chartData = data.data.xp.map(entry => ({
      x: new Date(entry.createdAt),
      y: entry.amount / 1000
    })).sort((a, b) => a.x - b.x);
    renderXPChart(chartData);
  }
  }).catch(error => {
    console.error("Error in getQuery:", error);
    document.getElementById("errorFlair").textContent = error.message;
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

  if(document.getElementById("skillsChart")) {
    const skillsMap = new Map();
  
    data.data.skills.forEach(element => {
      const skill = element.type.split("_")[1]; 
      if (!skillsMap.has(skill)) {
        skillsMap.set(skill, element.amount);
      } else {
        skillsMap.set(skill, skillsMap.get(skill) + element.amount);
      }
    });
  
    const labels = Array.from(skillsMap.keys());
    const series = Array.from(skillsMap.values());
    renderSkillsChart(labels, series);
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
      login(username, password);
      document.getElementById("loginUsername").value = ""
      document.getElementById("loginPassword").value = ""
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
    document.getElementById("extras").style.display = "none"
  });
}
