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
    if(!response.ok){
        if(response.status === 403){
          document.getElementById("errorFlair").textContent = Error;
        }
    }
    loginDiv.style.display = "none"
    document.getElementById("graphQlMain").style.display = "inline-block"
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
  });
}

function renderSkillsChart(labels, series) {
  const options = {
    chart: {
      type: 'pie',
      width:  400,
      height: 350,
    },
    series: series,
    labels: labels,
    title: {
      align: 'center'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const chart = new ApexCharts(document.querySelector("#skillsChart"), options);
  chart.render();
}

function renderXPChart(data) {
  const options = {
    chart: {
      type: 'line',
      width: 400,
      height: 350,
    },
    series: [{
      name: 'XP Amount',
      data: data
    }],
    xaxis: {
      type: 'datetime',
    },
    title: {
      text: 'XP Over Time',
      align: 'center'
    }
  };

  // Initialize and render the chart
  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}
