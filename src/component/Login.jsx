import React, { useEffect, useState, useCallback } from "react";

const API = "/api";   // proxy path (no mixed content)

const Login = ({ onSuccess }) => {
  const [, setLoading] = useState(false);
  const [, setPopup] = useState(false);

  const callResubscribe = useCallback(async () => {
    try {
      const res = await fetch(`${API}/resubscribe`, { method: "POST" });
      const data = await res.json();

      if (data.message === "success") {
        localStorage.setItem("auth_ready", "true");
        setLoading(false);
        onSuccess();
      }
    } catch (err) {
      console.error("Resubscribe Error:", err);
      setLoading(false);
    }
  }, [onSuccess]);

  const startApp = useCallback(
    async (token) => {
      try {
        await fetch(`${API}/start_app?request_token=${token}`, {
          method: "POST",
        });

        callResubscribe();
      } catch (err) {
        console.error("Start app error:", err);
        setLoading(false);
      }
    },
    [callResubscribe]
  );

  const openLoginPopup = useCallback(
    (loginUrl) => {
      const w = 500;
      const h = 700;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;

      const popupWindow = window.open(
        loginUrl,
        "LoginPopup",
        `width=${w},height=${h},left=${left},top=${top}`
      );

      setPopup(popupWindow);

      const timer = setInterval(() => {
        try {
          if (popupWindow.closed) {
            clearInterval(timer);
            return;
          }

          const url = popupWindow.location.href;

          if (url.includes("request_token=")) {
            const token = new URL(url).searchParams.get("request_token");

            localStorage.setItem("request_token", token);
            popupWindow.close();
            clearInterval(timer);

            startApp(token);
          }
        } catch (err) {}
      }, 500);
    },
    [startApp]
  );

  useEffect(() => {
    const checkLogin = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API}/login`);
        const data = await res.json();

        if (data.valid === true) {
          await callResubscribe();
        } else {
          openLoginPopup(`${API}/login`);   
        }
      } catch (err) {
        console.error("Login error:", err);
        setLoading(false);
      }
    };

    checkLogin();
  }, [callResubscribe, openLoginPopup]);

  return (
    <div
      style={{
        height: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        flexDirection: "column",
      }}
    >
      <div className="loader"></div>
      <p style={{ marginTop: 20, opacity: 0.7 }}>
        Authenticating… please wait
      </p>

      <style>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-left-color: #22c55e;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
