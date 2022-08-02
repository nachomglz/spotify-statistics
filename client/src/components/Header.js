import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
   return (
      <header className="header">
         <div className="header-content">
            <div className="header-content-left">
               <NavLink to={"/"} className="logo-container">
                  <img
                     src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Black.png"
                     alt="logo spotify"
                  />
               </NavLink>
            </div>
            <div className="header-content-right">
               <nav className="header-navigation-container">
                  <NavLink to={"/login"}>Login</NavLink>
                  <NavLink to={"/profile"}>Profile</NavLink>
               </nav>
            </div>
         </div>
      </header>
   );
};

export default Header;
