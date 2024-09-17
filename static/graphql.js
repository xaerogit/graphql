// API Endpoints //
const kjSignInEndpoint = "https://01.kood.tech/api/auth/signin";
const kjGraphQL = "https://01.kood.tech/api/graphql-engine/v1/graphql";

// Main JS //
const loginButton = document.getElementById('loginButton');
const errorFlair = document.getElementById('errorFlair');
const loginPage = document.getElementById('login-div');
const logoutButton = document.getElementById('logoutButton');
const loginUsername = document.getElementById('loginUsername');

loginButton.addEventListener("click"
  
)
logoutButton.addEventListener("click"

)

const testQuery = async(token)=> { `
    query {
        result {
          id
          user {
            id
            login
          }
        }
      }
      `
}
