import React, { useState, useEffect } from "react";
import Login from "./component/Login";
import First from "./component/First";

const App = () => {
  const [isReady, setIsReady] = useState(false);  
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // wait for Login to run validity check
    const status = localStorage.getItem("auth_ready");
    if (status === "true") {
      setLoggedIn(true);
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b1120",
        color: "white"
      }}>
        Loading...
      </div>
    );
  }

  return loggedIn ? (
    <First/>
  ) : (
    <Login onSuccess={() => setLoggedIn(true)} />
  );
};

export default App;
