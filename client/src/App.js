import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import axios from "axios";
import { AuthContext } from "./components/AuthContext";
import cookie from "react-cookie";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";
import Header from "./components/Header";

const App = () => {
   const queryParams = new URLSearchParams(window.location.search);
   const code = queryParams.get("code");

   const [user, setUser] = useState(null);
   const [accessToken, setAccessToken] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      setLoading(true);
      (async () => {
         /**
          * 1. Check if there's a code in the url
          * 2. If there's a code, it means that the user just logged in so we have to get the accesstoken and refreshtoken from spotify's server
          * 3. If there's not a code, check if there's a refreshtoken in the cookies, if so, get the accesstoken from spotify's server
          * 4. If there's not a refreshtoken nor a code, it means that the user is not loggedin
          */
         const refreshToken = cookie.load("refresh_token");

         if (code && code !== "") {
            window.history.pushState({}, null, "/");
            // get accessToken and refreshToken from spotify's server (make request to the local API to get it)
            try {
               const res = await axios.post("http://localhost:3001/login", { code }, { withCredentials: true });
               if (res.data.status === "failed" && res.data.error === "invalid_grant") {
                  setUser({});
               } else {
                  if (res.data.access_token) setAccessToken(res.data.access_token);
                  else {
                     setAccessToken("");
                  }
               }
            } catch (e) {
               setUser({});
               setAccessToken("");
            }
         } else if (refreshToken && refreshToken !== "") {
            // get access token from server
            try {
               const { data } = await axios.get(`http://localhost:3001/refresh_token?refreshToken=${refreshToken}`);
               if (data.access_token && data.access_token !== "") {
                  setAccessToken(data.access_token);
               } else {
                  // if the token is invalid, remove it from the cookies
                  if (data.error && data.error === "invalid_grant") cookie.remove("refresh_token");
                  setAccessToken("");
                  setUser({});
               }
            } catch (e) {
               console.log(e);
               setAccessToken("");
               setUser({});
            }
         } else {
            // there's no code nor refresh token
            setUser({});
            setAccessToken("");
         }
      })();
      setLoading(false);
   }, []);

   useEffect(() => {
      setLoading(true);
      if (accessToken) {
         axios
            .get(`https://api.spotify.com/v1/me`, {
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
            })
            .then(({ data }) => {
               if (data) setUser(data);
            })
            .catch((err) => {
               setUser({});
               console.log(err);
            });
      }
      setLoading(false);
   }, [accessToken]);

   return loading ? (
      <Loading />
   ) : (
      user !== null && accessToken !== null && (
         <AuthContext.Provider value={{ user, accessToken, setUser, setAccessToken, loading, setLoading }}>
            <BrowserRouter>
               <Header />
               <Routes>
                  <Route
                     path="/"
                     element={
                        <ProtectedRoute>
                           <Dashboard />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/profile"
                     element={
                        <ProtectedRoute>
                           <Profile />
                        </ProtectedRoute>
                     }
                  />
                  <Route path="/login" element={<Login />} />
               </Routes>
            </BrowserRouter>
         </AuthContext.Provider>
      )
   );
};

export default App;
