import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import "./First.css";

const WS_URL = "wss://robotmanagerv1test.qikpod.com/smartdisplay/data";

const NO_DATA_MESSAGE =
  "Market is closed or not able to get records. Please try again after some time.";

const First = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastPricesRef = useRef({});

  const showNoData = useCallback(() => {
    setRecords([]);
    setError(NO_DATA_MESSAGE);
  }, []);

  const connectWebSocket = useCallback(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      setError("");

      // Heartbeat / ping every 5 seconds
      heartbeatRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, 5000);
    };

    wsRef.current.onmessage = (event) => {
      try {
        if (!event?.data) {
          showNoData();
          return;
        }

        const payload = JSON.parse(event.data);

        // 404 or invalid payload
        if (!payload || payload === 404) {
          showNoData();
          return;
        }

        // { data: [] }
        if (
          payload.data &&
          Array.isArray(payload.data) &&
          payload.data.length === 0
        ) {
          showNoData();
          return;
        }

        // [] empty array
        if (Array.isArray(payload) && payload.length === 0) {
          showNoData();
          return;
        }

        // Normalize response
        const list = Array.isArray(payload)
          ? payload
          : payload.data
          ? payload.data
          : [payload];

        if (!list || list.length === 0) {
          showNoData();
          return;
        }

        // Detect price change for flash animation
        const updated = list.map((item) => {
          const prev =
            lastPricesRef.current[item.instrument_token];
          const flash =
            prev !== undefined &&
            prev !== item.last_price;

          lastPricesRef.current[item.instrument_token] =
            item.last_price;

          return { ...item, __flash: flash };
        });

        setRecords(updated);
        setError("");

        // Remove flash after animation
        setTimeout(() => {
          setRecords((prev) =>
            prev.map((r) => ({ ...r, __flash: false }))
          );
        }, 600);
      } catch (err) {
        console.error("WebSocket parse error:", err);
        showNoData();
      }
    };

    wsRef.current.onclose = () => {
      clearInterval(heartbeatRef.current);
      setTimeout(connectWebSocket, 1000); // auto-reconnect
    };

    wsRef.current.onerror = () => {
      wsRef.current.close();
    };
  }, [showNoData]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      wsRef.current?.close();
      clearInterval(heartbeatRef.current);
    };
  }, [connectWebSocket]);

  return (
    <div className="rm-page">
      <header className="rm-header">
        <div>
          <h1 className="rm-title">Live Market</h1>
          <p className="rm-subtitle">
            Real-time <span className="rm-highlight">Data</span>
          </p>
        </div>
        <div className="rm-status-pill">
          <span className="rm-dot" />
          Live
        </div>
      </header>

      {/* Fixed popup for 404 / no data */}
      {error && records.length === 0 && (
        <div className="rm-center-message">{error}</div>
      )}

      {/* Cards (render ONLY when data exists) */}
      {records.length > 0 && (
        <div className="rm-grid">
          {records.map((item) => {
            const change = Number(item.change) || 0;
            const isPositive = change >= 0;
            const isFut =
              (item.instrument_type || "").toUpperCase() === "FUT";

            return (
              <div
                key={item.instrument_token}
                className={`rm-card ${
                  isPositive ? "rm-glow-green" : "rm-glow-red"
                }`}
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
                    <div
                      className={`rm-price ${
                        item.__flash ? "rm-price-flash" : ""
                      }`}
                    >
                      ₹{Number(item.last_price).toFixed(2)}
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
                  <div className="rm-meta-item">
                    <span className="rm-meta-label">Expiry</span>
                    <span className="rm-meta-value">
                      {item.expiry
                        ? new Date(item.expiry).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  {!isFut ? (
                    <div className="rm-meta-item">
                      <span className="rm-meta-label">Strike</span>
                      <span className="rm-meta-value">{item.strike}</span>
                    </div>
                  ) : (
                    <div className="rm-meta-item" />
                  )}

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
                    <div className="rm-oi-block" />
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
                    Updated: {new Date().toLocaleTimeString()}
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
