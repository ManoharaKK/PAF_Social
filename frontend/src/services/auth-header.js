export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    console.log("Using auth token:", user.token.substring(0, 10) + "...");
    return { 
      'Authorization': 'Bearer ' + user.token,
      'Content-Type': 'application/json'
    };
  } else {
    console.log("No auth token available");
    return { 'Content-Type': 'application/json' };
  }
} 