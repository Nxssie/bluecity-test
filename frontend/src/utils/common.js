// return the user data from the session storage
export const getUser = () => {
  const userStr = sessionStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  else return null;
}

// return the current user id from the session storage
export const getCurrentUserId = () => {
  const userStr = sessionStorage.getItem('apiUser');
  if (userStr) return JSON.parse(userStr).id;
  else return null;
}

// return the token from the session storage
export const getToken = () => {
  return sessionStorage.getItem('token') || null;
}

// return the user data from the session storage
export const getApiUser = () => {
  const userStr = sessionStorage.getItem('apiUser');
  if (userStr) return JSON.parse(userStr);
  else return null;
}

export const setApiUser = (apiUser) => {
  sessionStorage.setItem('apiUser', JSON.stringify(apiUser));
}

// return the token from the session storage
export const getApiToken = () => {
  return sessionStorage.getItem('apiToken') || null;
}

// remove the token and user from the session storage
export const removeUserSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('apiToken');
  sessionStorage.removeItem('apiUser');
}

// set the token and user from the session storage
export const setUserSession = (token, user, apiToken, apiUser) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('apiToken', apiToken);
  sessionStorage.setItem('apiUser', JSON.stringify(apiUser));
}

// set distance to open box
export const setDistanceToOpenBox = (distance) => {
  sessionStorage.setItem('distance', distance);
}

// return the distance to open box
export const getDistanceToOpenBox = () => {
  let distance = sessionStorage.getItem('distance') || "1";
  return parseInt(distance);
}

// set "do not show this again"
export const setSessionDoNotShowThisAgain = (doNotShowThisAgain) => {
  sessionStorage.setItem('doNotShowThisAgain', doNotShowThisAgain);
}

// return "do not show this again"
export const getSessionDoNotShowThisAgain = () => {
  let doNotShowThisAgain = sessionStorage.getItem('doNotShowThisAgain') || "false";
  return doNotShowThisAgain === "true" ? true : false;
}

// Geolocation
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}