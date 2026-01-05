import React, { useEffect, useState } from "react";
import "./First.css";

const API_URL =
  "https://robotmanagerv1test.qikpod.com/smartdisplay/data";

const First = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];

      setRecords(list);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch market data");
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchData();

    // fetch every 1 second
    const interval = setInterval(fetchData, 1000);

    // cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rm-page">
      <header className="rm-header">
        <h1 className="rm-title">Live Market</h1>
        <span className="rm-subtitle">Updating every 1 second</span>
      </header>

      {loading && <div className="rm-info-box">Loading data…</div>}

      {error && <div className="rm-error-box">{error}</div>}

      <div className="rm-grid">
        {records.map((item) => (
          <div className="rm-card" key={item.instrument_token}>
            <div className="rm-card-header">
              <div>
                <div className="rm-symbol">{item.name}</div>
                <div className="rm-name">{item.tradingsymbol}</div>
              </div>
              <div className="rm-instrument-type">
                {item.instrument_type}
              </div>
            </div>

            <div className="rm-price-row">
              <div className="rm-price">
                ₹{item.last_price?.toFixed(2)}
              </div>
              <div className="rm-change">
                {item.change >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(item.change || 0).toFixed(2)}%
              </div>
            </div>

            <div className="rm-meta">
              <div>Expiry: {item.expiry}</div>
              <div>OI: {item.oi}</div>
              <div>Volume: {item.volume_traded}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default First;



