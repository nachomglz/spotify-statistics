import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthContext";
import axios from "axios"

const Profile = () => {
   const { user, accessToken } = useContext(AuthContext);
   
   const DEFAULT_REQUEST_DELAY = 1000;

   const [playlists, setPlaylists] = useState([])
   const [currentSong, setCurrentSong] = useState({})

   useEffect(()=> {
      ( async () => {
         // if the user is not null, get the number of playlist and currently playing track from spotify's API
         if(user) {

            // get user's playlists
            try {
               let {data} = await axios.get(`http://localhost:3001/user_playlists?user_id=${user.id}&accessToken=${accessToken}`)
               if(data && data.status === "success") {
                  setPlaylists(data.playlists)
               }
            } catch(e) {
               console.log(e)
            }

         }
      })()
   }, [user])

   useEffect(() => {
      ( async () => {
         await makeCurrentSongRequest(DEFAULT_REQUEST_DELAY)
      })()
   }, [])

   const makeCurrentSongRequest = async (delay) => {
      // settimeout with that time
      setTimeout(() => {
         ( async () => {
            // Create a timer that checks if the song has changed every 5 seconds (while in the profile page)
            try {
               let res = await axios.get(`http://localhost:3001/currently_playing?accessToken=${accessToken}`)
               if(res.data && res.data !== "" && res.data.status === "success") {
                  setCurrentSong(res.data.song)
                  makeCurrentSongRequest(DEFAULT_REQUEST_DELAY)
               }
            } catch(error) {
               if(error?.response?.status === 429){
                  // Get retry-after 
                  const {data} = error.response
                  console.log(data['retry-after'] * 1000)
                  makeCurrentSongRequest(data['retry-after'] * 1000)
               } else {
                  makeCurrentSongRequest(DEFAULT_REQUEST_DELAY)
               }
            }
         })()

      }, delay)
   }


   return (
      <div className="container">
         <h1>My profile</h1>
         <div className="user-data-container">

            <div className="top-data">
               <div className="top-data-img">
                  <img src={user.images[0].url} alt="" />
               </div>
               <div className="top-data-info">
                  <p>Name: <strong>{user.display_name}</strong></p>
                  <p>Email: <strong>{user.email}</strong></p>
                  <p>Country: {user.country}</p>
                  <p>tipo: {user.product}</p>
               </div>
            </div>
            <div className="bottom-data">
               <div className="bottom-data-left">
                  <h2>Playlists: {playlists?.length}</h2>
                  <ul>
                     {playlists?.map((playlist, key) => (
                        <li key={key}><a href={playlist.href}>{playlist.name}</a> {playlist.public ? <strong>Public</strong>: <strong>Private</strong>}</li>
                     ) )}

                  </ul>
               </div>
               <div className="bottom-data-right">
                  <h2>Currently playing song:</h2>
                  <img src={currentSong?.item?.album.images[0].url} alt="blablabla" height={currentSong?.item?.album.images[0].height / 3} width={currentSong?.item?.album.images[0].width / 3}/>
                  <p><b>{currentSong?.item?.name}</b></p>
                  <p><small>{currentSong?.item?.artists[0]?.name}</small></p>
                  <br />
                  <div>
                     {(currentSong?.item?.duration_ms - currentSong?.progress_ms) / 1000}
                  </div>
               </div>
            </div>

         </div>

      </div>
   );
};

export default Profile;
