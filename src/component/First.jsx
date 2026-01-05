import React, { useEffect, useRef, useState } from "react";
import "./First.css";

const API_URL = "https://robotmanagerv1test.qikpod.com/smartdisplay/data";

// number formatter → K / M / B
const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num;
};

const First = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);

  const prevPrices = useRef({});

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);

      if (res.status === 404) {
        setIs404(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];

      setRecords(list);
      setIs404(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // every 1 sec
    return () => clearInterval(interval);
  }, []);

  if (is404) {
    return (
      <div className="rm-center-message">
        <h2>No live market data</h2>
        <p>Please try again later</p>
      </div>
    );
  }

  return (
    <div className="rm-page">
      <header className="rm-header">
        <div>
          <h1 className="rm-title">Live Market</h1>
          <p className="rm-subtitle">
            Updating every <span className="rm-highlight">1 second</span>
          </p>
        </div>
        <div className="rm-status-pill">
          <span className="rm-dot" /> Live
        </div>
      </header>

      {loading && <div className="rm-info-box">Loading data…</div>}

      <div className="rm-grid">
        {records.map((item) => {
          const change = Number(item.change) || 0;
          const isPositive = change >= 0;
          const isFut = (item.instrument_type || "").toUpperCase() === "FUT";

          const prev = prevPrices.current[item.instrument_token];
          const flashClass =
            prev && prev !== item.last_price
              ? item.last_price > prev
                ? "price-up"
                : "price-down"
              : "";

          prevPrices.current[item.instrument_token] = item.last_price;

          return (
            <div
              key={item.instrument_token}
              className={`rm-card ${isPositive ? "rm-glow-green" : "rm-glow-red"}`}
            >
              {/* Header */}
              <div className="rm-card-header">
                <div>
                  <div className="rm-symbol">{item.name}</div>
                  <div className="rm-name">{item.tradingsymbol}</div>
                </div>
                <div className="rm-instrument-type">
                  {item.instrument_type}
                </div>
              </div>

              {/* Price */}
              <div className="rm-price-row">
                <div>
                  <div className="rm-price-label">Last Price</div>
                  <div className={`rm-price ${flashClass}`}>
                    ₹{item.last_price.toFixed(2)}
                  </div>
                </div>
                <div
                  className={`rm-change-pill ${
                    isPositive ? "rm-change-up" : "rm-change-down"
                  }`}
                >
                  {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </div>
              </div>

              {/* Meta */}
              <div className="rm-meta-grid">
                {!isFut ? (
                  <div className="rm-meta-item">
                    <span className="rm-meta-label">Strike</span>
                    <span className="rm-meta-value">{item.strike}</span>
                  </div>
                ) : (
                  <div className="rm-meta-item"></div>
                )}

                <div className="rm-meta-item">
                  <span className="rm-meta-label">Expiry</span>
                  <span className="rm-meta-value">
                    {new Date(item.expiry).toLocaleDateString()}
                  </span>
                </div>

                <div className="rm-meta-item">
                  <span className="rm-meta-label">Yday Volume</span>
                  <span className="rm-meta-value">
                    {formatNumber(item.yesterday_volume)}
                  </span>
                </div>
              </div>

              {/* OI */}
              <div className="rm-oi-section">
                <div className="rm-oi-block">
                  <div className="rm-oi-label">Open Interest</div>
                  <div className="rm-oi-value">
                    {formatNumber(item.oi)}
                  </div>
                </div>

                {!isFut ? (
                  <div className="rm-oi-block">
                    <div className="rm-oi-label">Change in OI</div>
                    <div className="rm-oi-value">
                      {formatNumber(item.change_in_oi)}
                    </div>
                  </div>
                ) : (
                  <div className="rm-oi-block"></div>
                )}

                <div className="rm-oi-block">
                  <div className="rm-oi-label">Volume Traded</div>
                  <div className="rm-oi-value">
                    {formatNumber(item.volume_traded)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="rm-card-footer">
                <span className="rm-updated">
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default First;

