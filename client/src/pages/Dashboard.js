import { useContext, useEffect } from "react";
import { AuthContext } from "../components/AuthContext";

const Dashboard = ({ code }) => {
   const { accessToken, user } = useContext(AuthContext);

   useEffect(() => {
      console.log(accessToken);
      console.log(user);
   }, []);

   return <div className="container">
      if you can see this page, it means you're logged in :)
   </div>;
};

export default Dashboard;
