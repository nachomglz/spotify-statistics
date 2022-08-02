import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
   const { user, accessToken, loading } = useContext(AuthContext);

   return !loading && accessToken !== "" && Object.keys(user).length > 0 ? (
      children
   ) : (
      <Navigate to={"/login"} replace={true} />
   );
};

export default ProtectedRoute;
