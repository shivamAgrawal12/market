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

      const data = await res.json();

      // If API returns a single object, normalize to array
      const list = Array.isArray(data) ? data : [data];
      setRecords(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Refetch every 10 seconds
    const intervalId = setInterval(fetchData, 1010);

    // Cleanup interval on unmount
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

      {error && (
        <div className="rm-error-box">
          ⚠️ Failed to load data: <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="rm-grid">
          {records.map((item) => {
            const change = Number(item.change) || 0;
            const isPositive = change >= 0;
            const instrumentType = (item.instrument_type || "").toUpperCase();
            const isFut = instrumentType === "FUT";

            return (
              <div
                className={`rm-card ${isPositive ? "rm-glow-green" : "rm-glow-red"}`}
                key={item.instrument_token || item.tradingsymbol}
              >
                {/* Top section */}
                <div className="rm-card-header">
                  <div>
                    <div className="rm-symbol">{item.name}</div>
                    <div className="rm-name">{item.tradingsymbol}</div>
                  </div>
                  <div className="rm-instrument-type">
                    {item.instrument_type}
                  </div>
                </div>

                {/* Price section */}
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

                {/* Middle meta section */}
                <div className="rm-meta-grid">
                  {/* STRIKE - hide when FUT */}
                  {!isFut ? (
                    <div className="rm-meta-item">
                      <span className="rm-meta-label">Strike</span>
                      <span className="rm-meta-value">{item.strike}</span>
                    </div>
                  ) : (
                    <div className="rm-meta-item">{/* placeholder keeps spacing equal */}</div>
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
                    <div className="rm-yesterday-label-box">
                      <span className="rm-meta-label yesterday-volume-label">Yday Volume</span>
                    </div>
                    <span className="rm-meta-value">{item.yesterday_volume ?? "-"}</span>
                  </div>
                </div>

                {/* OI / Volume section */}
                <div className="rm-oi-section">
                  <div className="rm-oi-block">
                    <div className="rm-oi-label">Open Interest</div>
                    <div className="rm-oi-value">{item.oi ?? "-"}</div>
                  </div>

                  {/* CHANGE IN OI - hide when FUT */}
                  {!isFut && (
                    <div className="rm-oi-block">
                      <div className="rm-oi-label">Change in OI</div>
                      <div className="rm-oi-value">
                        {item.change_in_oi ?? "-"}
                      </div>
                    </div>
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
                  {/* <span className="rm-chip">
                    {item.exchange} · {item.category}
                  </span> */}
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




