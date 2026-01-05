import React, { useEffect, useState } from "react";
import "./First.css";

const API_URL = "https://robotmanagerv1test.qikpod.com/smartdisplay/data";

const First = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const response = await res.json();

      // ✅ SAFELY NORMALIZE API RESPONSE
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
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="rm-page">
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

      {loading && <div className="rm-info-box">Loading latest data…</div>}

      {!loading && records.length === 0 && !error && (
        <div className="rm-info-box">No data available</div>
      )}

      {error && (
        <div className="rm-error-box">
          ⚠️ Failed to load data: <span>{error}</span>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
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

                {/* Meta grid */}
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
                        ? new Date(item.expiry).toLocaleDateString()
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

                {/* OI section */}
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
                      ? new Date(item.updated_at).toLocaleTimeString()
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

