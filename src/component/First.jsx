import React, { useEffect, useState, useRef } from "react";
import "./First.css";

const API_URL = "https://robotmanagerv1test.qikpod.com/smartdisplay/data";

const First = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Popup Control
  const [showPopup, setShowPopup] = useState(false);

  // 🔹 Interval Ref
  const intervalRef = useRef(null);

  const fetchData = async (isManual = false) => {
    try {
      setError("");

      const res = await fetch(API_URL);

      // ❌ If API fails
      if (!res.ok) {
        if ([404, 502].includes(res.status)) {
          throw new Error("AUTH_ERROR");
        } else {
          throw new Error(`HTTP error: ${res.status}`);
        }
      }

      const response = await res.json();

      // ✅ Normalize response
      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (typeof response === "object" && response !== null) {
        list = [response];
      }

      setRecords(list);
      setLoading(false);

      // ✅ Hide popup if success
      setShowPopup(false);

      // ✅ Restart auto refresh if manual refresh worked
      if (isManual && !intervalRef.current) {
        startPolling();
      }
    } catch (err) {
      console.error("API Error:", err);

      setLoading(false);

      // ❌ Stop polling
      stopPolling();

      // ❌ Show popup
      setShowPopup(true);

      setError("Need to login the site");
    }
  };

  // 🔹 Start Auto Polling
  const startPolling = () => {
    stopPolling();

    fetchData();

    intervalRef.current = setInterval(() => {
      fetchData();
    }, 1000);
  };

  // 🔹 Stop Auto Polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startPolling();

    return () => stopPolling();
  }, []);

  // ✅ IST formatter
  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  // 🔹 Manual Refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchData(true);
  };

  return (
    <div className="rm-page">

      {/* ================= ERROR POPUP ================= */}
      {showPopup && (
        <div className="rm-popup-overlay">
          <div className="rm-popup-box glitch">
            <h2>⚠️ System Error</h2>

            <p>Need to login the site</p>

            <button onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN UI ================= */}

      <header className="rm-header">
        <div>
          <h1 className="rm-title">Live Market</h1>
          <p className="rm-subtitle">
            Updating every <span className="rm-highlight">seconds</span>
          </p>
        </div>

        <div className="rm-status-pill">
          <span className="rm-dot" />
          Live
        </div>
      </header>

      {loading && !showPopup && (
        <div className="rm-info-box">Loading latest data…</div>
      )}

      {!loading && records.length === 0 && !error && !showPopup && (
        <div className="rm-info-box">No data available</div>
      )}

      {!loading && !error && records.length > 0 && !showPopup && (
        <div className="rm-grid">
          {records.map((item) => {
            const change = Number(item.change) || 0;
            const isPositive = change >= 0;
            const isFut =
              (item.instrument_type || "").toUpperCase() === "FUT";

            return (
              <div
                key={item.instrument_token || item.tradingsymbol}
                className={`rm-card ${
                  isPositive ? "rm-glow-green" : "rm-glow-red"
                }`}
              >
                {/* Header */}
                <div className="rm-card-header">
                  <div>
                    <div className="rm-symbol">{item.name || "-"}</div>
                    <div className="rm-name">{item.tradingsymbol || "-"}</div>
                  </div>

                  <div className="rm-instrument-type">
                    {item.instrument_type || "-"}
                  </div>
                </div>

                {/* Price */}
                <div className="rm-price-row">
                  <div>
                    <div className="rm-price-label">Last Price</div>

                    <div className="rm-price">
                      ₹{Number(item.last_price || 0).toFixed(2)}
                    </div>
                  </div>

                  <div
                    className={`rm-change-pill ${
                      isPositive ? "rm-change-up" : "rm-change-down"
                    }`}
                  >
                    {isPositive ? "▲" : "▼"}{" "}
                    {Math.abs(change).toFixed(2)}%
                  </div>
                </div>

                {/* Meta */}
                <div className="rm-meta-grid">
                  {!isFut ? (
                    <div className="rm-meta-item">
                      <span className="rm-meta-label">Strike</span>
                      <span className="rm-meta-value">
                        {item.strike ?? "-"}
                      </span>
                    </div>
                  ) : (
                    <div className="rm-meta-item"></div>
                  )}

                  <div className="rm-meta-item">
                    <span className="rm-meta-label">Expiry</span>
                    <span className="rm-meta-value">
                      {item.expiry
                        ? new Date(item.expiry).toLocaleDateString("en-IN")
                        : "-"}
                    </span>
                  </div>

                  <div className="rm-meta-item rm-yt-space">
                    <span className="rm-meta-label yesterday-volume-label">
                      Yday Volume
                    </span>

                    <span className="rm-meta-value">
                      {item.yesterday_volume ?? "-"}
                    </span>
                  </div>
                </div>

                {/* OI */}
                <div className="rm-oi-section">
                  <div className="rm-oi-block">
                    <div className="rm-oi-label">Open Interest</div>
                    <div className="rm-oi-value">{item.oi ?? "-"}</div>
                  </div>

                  {!isFut ? (
                    <div className="rm-oi-block">
                      <div className="rm-oi-label">Change in OI</div>
                      <div className="rm-oi-value">
                        {item.change_in_oi ?? "-"}
                      </div>
                    </div>
                  ) : (
                    <div className="rm-oi-block"></div>
                  )}

                  <div className="rm-oi-block">
                    <div className="rm-oi-label">Volume Traded</div>
                    <div className="rm-oi-value">
                      {item.volume_traded ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="rm-card-footer">
                  <span className="rm-updated">
                    Updated:{" "}
                    {item.updated_at
                      ? formatIST(item.updated_at)
                      : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default First;