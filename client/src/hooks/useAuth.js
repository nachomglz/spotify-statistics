import React, { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code) {
   const [accessToken, setAccessToken] = useState();
   const [expiresIn, setExpiresIn] = useState();

   useEffect(() => {
      // make request to /login endpoint in our private api
      axios.post("http://localhost:3001/login", { code }, { withCredentials: true }).then(({ data }) => {
         if (data.access_token) {
            setAccessToken(data.accessToken);
         }
         if (data.expires_in) {
            setExpiresIn(data.expires_in);
         }
      });
   }, [code]);
}
