const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("qs");
const bodyParser = require("body-parser");
const { application } = require("express");

const app = express();
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
).use(bodyParser.json());

const redirect_uri = "http://localhost:3000";
const client_id = "bd4b4eec036a4d159663b93c32b6d811";
const client_secret = "cc1d7541477948b2acac2eb34682867c";

const BASE64_AUTH_STRING = Buffer.from(client_id + ":" + client_secret).toString("base64");

app.post("/login", async (req, res) => {
   // Get the code from the request
   const code = req.body.code;
   if (!code) return res.status(401).send({ status: "failed", message: "No code was provided" });

   // Create data object
   const data = qs.stringify({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
   });

   // Make post request to get the access token
   axios
      .post("https://accounts.spotify.com/api/token", data, {
         headers: {
            Accept: "application/json",
            Authorization: `Basic ${BASE64_AUTH_STRING}`,
            "Content-Type": "application/x-www-form-urlencoded",
         },
      })
      .then(({ data }) => {
         res.cookie("refresh_token", data.refresh_token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
         return res.send({
            status: "success",
            access_token: data.access_token,
            expires_in: data.expires_in,
         });
      })
      .catch(({ response }) => {
         return res.send({
            status: "failed",
            error: response.data.error,
            error_description: response.data.error_description,
         });
      });
});

app.get("/refresh_token", (req, res) => {
   const refreshToken = req.query.refreshToken;
   if (refreshToken) {
      // make request to spotify api to get the token refreshed

      const data = qs.stringify({
         refresh_token: refreshToken,
         grant_type: "refresh_token",
      });
      axios
         .post("https://accounts.spotify.com/api/token", data, {
            headers: {
               Accept: "application/json",
               Authorization: `Basic ${BASE64_AUTH_STRING}`,
               "Content-Type": "application/x-www-form-urlencoded",
            },
         })
         .then(({ data }) => {
            if (data.access_token)
               return res.status(200).send({
                  status: "success",
                  access_token: data.access_token,
                  token_type: data.token_type,
               });
         })
         .catch(({ response }) => {
            console.log(respose)
            return res.send({
               status: "failed",
               error: response.data.error,
               error_description: response.data.error_description,
            });
         });
   } else {
      return res.status(401).send({
         status: "failed",
         message: "No refresh token provided",
      });
   }
});

app.get("/user_playlists", (req, res) => {
   const { accessToken, user_id} = req.query
   if(accessToken && user_id) {
      // make request to endpoint: https://api.spotify.com/v1/users/user_id/playlists
      axios.get(`https://api.spotify.com/v1/users/${user_id}/playlists?limit=50`, { headers: {
         "Authorization": `Bearer ${accessToken}`,
         "Content-Type": "application/json"
      }}).then(({data}) => {
         if(data) {
            const items = data.items
            return res.status(200).send({
               status: "success",
               playlists: items
            })
         } else {
            return res.status(400).send({
               status: "failed",
               message: "No playlists were found for this account"
            })
         }
      }).catch(err => {
         console.log(err)
         return res.status(500).send({ status: "failed", message: "An unexpected error has occured"})
      })
   }
})

app.get("/currently_playing", (req, res) => {
   const {accessToken} = req.query

   // make request to spotify api
   // this will get the recently played tracks in the past 10 years
   axios.get("https://api.spotify.com/v1/me/player/currently-playing", { headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
   }}).then((response) => {
      console.log(response.status)
      return res.status(200).send({
         status: "success",
         song: response.data
      })
   }).catch((error) => {
      if(error.response?.status === 429) {
         // Too many requests, get retry time from headers
         console.log("retry after: " + error.response?.headers['retry-after'])
         return res.status(error.response?.status).send({
            status: "failed",
            message: "Too many requests",
            'retry-after': error.response?.headers['retry-after']
         })
      } else {
         console.error(error)
         return res.status(error.response?.status).send({
            status: "failed",
            message: error.response?.data?.message
         })
      }
   })
})

app.get("/recently_played", (req,res) => {
   const {accessToken} = req.query

   // make request to spotify api
   // this will get the recently played tracks in the past 10 years
   axios.get("https://api.spotify.com/v1/me/player/recently-played?after=1343634991&limit=50", { headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
   }}).then(({data}) => {
      return res.status(200).send({
         status: "success",
         ...data
      })
   }).catch(({response}) => {
      return res.status(403).send({
         status: "failed",
         ...response.data.error
      })
   })

})

app.listen(3001, () => {
   console.log("Server running on port 3001");
});
