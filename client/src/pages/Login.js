import React, { useEffect } from "react";

const SCOPE = [
   "ugc-image-upload",
   "user-modify-playback-state",
   "user-read-playback-state",
   "user-read-currently-playing",
   "user-follow-modify",
   "user-follow-read",
   "user-read-recently-played",
   "user-read-playback-position",
   "user-top-read",
   "playlist-read-collaborative",
   "playlist-modify-public",
   "playlist-read-private",
   "playlist-modify-private",
   "app-remote-control",
   "streaming",
   "user-read-email",
   "user-read-private",
   "user-library-modify",
   "user-library-read"
];
const SCOPE_JOIN = "%20"

const AUTH_URL =
   `https://accounts.spotify.com/authorize?client_id=bd4b4eec036a4d159663b93c32b6d811&response_type=code&redirect_uri=http://localhost:3000&scope=${SCOPE.join(SCOPE_JOIN)}`;

const Login = () => {
   return (
      <div className="container">
         <div className="login-container">
            {/*
            <div className="login-container-logo">
               <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png" alt="spotify logo" />
            </div> */}
            <p>Login with your Spotify account to access your statistics</p>
            <a className="btn btn-spotify" href={AUTH_URL}>
               <img src={require("../assets/spotify-xxl.png")} alt="logo spotify" />
               Login With Spotify
            </a>
         </div>
      </div>
   );
};

export default Login;
