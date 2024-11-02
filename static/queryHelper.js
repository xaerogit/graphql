import { getToken } from "./graphql.mjs";
// This file only serves to fetch the queries.
// :)
export function fetchQuery(query) {
  const kjGraphQL = "https://01.kood.tech/api/graphql-engine/v1/graphql";
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
