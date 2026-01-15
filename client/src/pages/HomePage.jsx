import React, { useState, useEffect } from "react";

// Simulated time: 1 second = 1 minute
const TIME_MULTIPLIER = 60;

export const HomePage = () => {
  // Mock data for visualization
  const [machines, setMachines] = useState([
    {
      id: 1,
      type: "washer",
      status: "available",
      user: null,
      timeRemaining: 0,
      bufferRemaining: 0,
      overstayMinutes: 0,
    },
    {
      id: 2,
      type: "washer",
      status: "in_cycle",
      user: "Alex M.",
      timeRemaining: 1840,
      bufferRemaining: 900,
      overstayMinutes: 0,
    },
    {
      id: 3,
      type: "washer",
      status: "in_buffer",
      user: "Jordan K.",
      timeRemaining: 0,
      bufferRemaining: 420,
      overstayMinutes: 0,
    },
    {
      id: 4,
      type: "washer",
      status: "overstay",
      user: "Sam R.",
      timeRemaining: 0,
      bufferRemaining: 0,
      overstayMinutes: 23,
    },
    {
      id: 5,
      type: "dryer",
      status: "available",
      user: null,
      timeRemaining: 0,
      bufferRemaining: 0,
      overstayMinutes: 0,
    },
    {
      id: 6,
      type: "dryer",
      status: "in_cycle",
      user: "Casey L.",
      timeRemaining: 2100,
      bufferRemaining: 1800,
      overstayMinutes: 0,
    },
    {
      id: 7,
      type: "dryer",
      status: "in_buffer",
      user: "Morgan T.",
      timeRemaining: 0,
      bufferRemaining: 180,
      overstayMinutes: 0,
    },
    {
      id: 8,
      type: "dryer",
      status: "available",
      user: null,
      timeRemaining: 0,
      bufferRemaining: 0,
      overstayMinutes: 0,
    },
  ]);

  const [todayRevenue, setTodayRevenue] = useState(127.5);
  const [sessionsToday, setSessionsToday] = useState(34);
  const [penaltiesCollected, setPenaltiesCollected] = useState(18.4);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [bufferSelection, setBufferSelection] = useState(0);
  const [machineToEnd, setMachineToEnd] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Simulate time passing (1 second = 1 minute in simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setMachines((prev) =>
        prev.map((machine) => {
          if (machine.status === "in_cycle") {
            const newTime = machine.timeRemaining - 60; // subtract 1 minute
            if (newTime <= 0) {
              // Check if there's buffer time
              if (machine.bufferRemaining > 0) {
                return { ...machine, status: "in_buffer", timeRemaining: 0 };
              } else {
                return {
                  ...machine,
                  status: "overstay",
                  timeRemaining: 0,
                  overstayMinutes: 1,
                };
              }
            }
            return { ...machine, timeRemaining: newTime };
          }
          if (machine.status === "in_buffer") {
            const newBuffer = machine.bufferRemaining - 60;
            if (newBuffer <= 0) {
              return {
                ...machine,
                status: "overstay",
                bufferRemaining: 0,
                overstayMinutes: 1,
              };
            }
            return { ...machine, bufferRemaining: newBuffer };
          }
          if (machine.status === "overstay") {
            const newOverstay = machine.overstayMinutes + 1;
            setPenaltiesCollected((prev) => prev + 0.1);
            return { ...machine, overstayMinutes: newOverstay };
          }
          return machine;
        })
      );
    }, 1000); // Every second = 1 minute in simulation

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#22c55e";
      case "in_cycle":
        return "#3b82f6";
      case "in_buffer":
        return "#f59e0b";
      case "overstay":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "available":
        return "AVAILABLE";
      case "in_cycle":
        return "WASHING";
      case "in_buffer":
        return "BUFFER";
      case "overstay":
        return "OVERSTAY";
      default:
        return "UNKNOWN";
    }
  };

  const calculateBufferPrice = (minutes) => {
    let total = 0;
    if (minutes >= 15) total += 0.75;
    if (minutes >= 30) total += 1.5;
    if (minutes >= 60) total += 3.0;
    if (minutes >= 120) total += 8.0;
    return total;
  };

  const bufferOptions = [
    { minutes: 0, label: "No Buffer" },
    { minutes: 15, label: "15 min" },
    { minutes: 30, label: "30 min" },
    { minutes: 60, label: "1 hour" },
    { minutes: 120, label: "2 hours" },
  ];

  // Start a new session
  const handleStartSession = () => {
    const totalPrice = 3.0 + calculateBufferPrice(bufferSelection);

    setMachines((prev) =>
      prev.map((m) =>
        m.id === selectedMachine.id
          ? {
              ...m,
              status: "in_cycle",
              user: "You",
              timeRemaining: 2400, // 40 min in seconds
              bufferRemaining: bufferSelection * 60,
              overstayMinutes: 0,
            }
          : m
      )
    );

    setTodayRevenue((prev) => prev + totalPrice);
    setSessionsToday((prev) => prev + 1);
    setSelectedMachine(null);
    setBufferSelection(0);
  };

  // End a session (pick up clothes)
  const handleEndSession = (machineId) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              status: "available",
              user: null,
              timeRemaining: 0,
              bufferRemaining: 0,
              overstayMinutes: 0,
            }
          : m
      )
    );
    setMachineToEnd(null);
  };

  const MachineCard = ({ machine }) => {
    const isWasher = machine.type === "washer";
    const statusColor = getStatusColor(machine.status);
    const isActive = machine.status !== "available";

    const handleClick = () => {
      if (machine.status === "available") {
        setSelectedMachine(machine);
      } else {
        setMachineToEnd(machine);
      }
    };

    return (
      <div
        onClick={handleClick}
        style={{
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          border: `3px solid ${statusColor}`,
          borderRadius: "16px",
          padding: "20px",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 20px ${statusColor}33, inset 0 2px 0 rgba(255,255,255,0.1)`,
          transition: "all 0.3s ease",
        }}
      >
        {/* Machine Number Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#000",
            border: "2px solid #444",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Courier New", monospace',
            fontWeight: "bold",
            fontSize: "14px",
            color: "#fff",
          }}
        >
          {machine.id}
        </div>

        {/* Machine Icon/Display */}
        <div
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 16px",
            background: "radial-gradient(circle, #333 60%, #222 100%)",
            borderRadius: "50%",
            border: "4px solid #444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "inset 0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          {/* Spinning animation for active machines */}
          {machine.status === "in_cycle" && (
            <div
              style={{
                position: "absolute",
                width: "80px",
                height: "80px",
                border: "3px dashed #3b82f6",
                borderRadius: "50%",
                animation: "spin 2s linear infinite",
              }}
            />
          )}

          {/* Center display */}
          <div
            style={{
              background: "#111",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #333",
            }}
          >
            <span style={{ fontSize: "20px" }}>{isWasher ? "🌀" : "🔥"}</span>
          </div>
        </div>

        {/* Machine Type */}
        <div
          style={{
            textAlign: "center",
            fontFamily: '"Courier New", monospace',
            fontSize: "12px",
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          {machine.type}
        </div>

        {/* Status Badge */}
        <div
          style={{
            background: statusColor,
            color: "#000",
            fontFamily: '"Courier New", monospace',
            fontWeight: "bold",
            fontSize: "11px",
            textAlign: "center",
            padding: "6px 12px",
            borderRadius: "4px",
            marginBottom: "12px",
            letterSpacing: "1px",
          }}
        >
          {getStatusLabel(machine.status)}
        </div>

        {/* Timer Display */}
        {machine.status !== "available" && (
          <div
            style={{
              background: "#000",
              border: "2px solid #333",
              borderRadius: "8px",
              padding: "12px",
              fontFamily: '"Courier New", monospace',
            }}
          >
            {machine.status === "in_cycle" && (
              <>
                <div
                  style={{
                    color: "#888",
                    fontSize: "10px",
                    marginBottom: "4px",
                  }}
                >
                  CYCLE REMAINING
                </div>
                <div
                  style={{
                    color: "#3b82f6",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {formatTime(machine.timeRemaining)}
                </div>
                <div
                  style={{ color: "#666", fontSize: "10px", marginTop: "8px" }}
                >
                  +{formatTime(machine.bufferRemaining)} buffer
                </div>
              </>
            )}
            {machine.status === "in_buffer" && (
              <>
                <div
                  style={{
                    color: "#888",
                    fontSize: "10px",
                    marginBottom: "4px",
                  }}
                >
                  BUFFER REMAINING
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {formatTime(machine.bufferRemaining)}
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "10px",
                    marginTop: "8px",
                  }}
                >
                  ⚠️ Cycle complete - remove soon
                </div>
              </>
            )}
            {machine.status === "overstay" && (
              <>
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "10px",
                    marginBottom: "4px",
                  }}
                >
                  ⚠️ OVERSTAYING
                </div>
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  +{machine.overstayMinutes} min
                </div>
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "14px",
                    marginTop: "8px",
                    fontWeight: "bold",
                  }}
                >
                  ${(machine.overstayMinutes * 0.1).toFixed(2)} penalty
                </div>
              </>
            )}

            {/* User */}
            <div
              style={{
                color: "#666",
                fontSize: "10px",
                marginTop: "12px",
                paddingTop: "8px",
                borderTop: "1px solid #333",
              }}
            >
              USER: {machine.user}
            </div>
          </div>
        )}

        {/* Available State */}
        {machine.status === "available" && (
          <div
            style={{
              background:
                "linear-gradient(180deg, #22c55e22 0%, transparent 100%)",
              border: "2px dashed #22c55e44",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{ color: "#22c55e", fontSize: "14px", fontWeight: "bold" }}
            >
              TAP TO START
            </div>
            <div
              style={{ color: "#22c55e88", fontSize: "12px", marginTop: "4px" }}
            >
              Base: $3.00 / 40 min
            </div>
          </div>
        )}

        {/* Tap to end hint for active machines */}
        {machine.status !== "available" && (
          <div
            style={{
              marginTop: "8px",
              textAlign: "center",
              color: "#555",
              fontSize: "10px",
              fontFamily: '"Courier New", monospace',
            }}
          >
            TAP TO END SESSION
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #151515 50%, #0a0a0a 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 6px 30px rgba(59, 130, 246, 0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(59, 130, 246, 0.4)";
        }}
      >
        ?
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "2px solid #333",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              margin: 0,
              letterSpacing: "-1px",
              background: "linear-gradient(90deg, #fff 0%, #888 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LAUNDRO
            <span style={{ color: "#3b82f6", WebkitTextFillColor: "#3b82f6" }}>
              SPIN
            </span>
          </h1>
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "12px",
              color: "#666",
              marginTop: "4px",
            }}
          >
            SMART LAUNDRY MANAGEMENT SYSTEM
          </div>
        </div>

        {/* Simulation Indicator */}
        <div
          style={{
            background: "#1a1a1a",
            border: "2px solid #f59e0b",
            borderRadius: "8px",
            padding: "12px 20px",
            fontFamily: '"Courier New", monospace',
          }}
        >
          <div
            style={{ color: "#f59e0b", fontSize: "10px", marginBottom: "4px" }}
          >
            ⚡ DEMO MODE
          </div>
          <div style={{ color: "#fff", fontSize: "14px" }}>1 sec = 1 min</div>
        </div>

        {/* Clock */}
        <div
          style={{
            textAlign: "right",
            fontFamily: '"Courier New", monospace',
          }}
        >
          <div style={{ fontSize: "10px", color: "#666" }}>SYSTEM TIME</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Revenue Dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          {
            label: "TODAY'S REVENUE",
            value: `$${todayRevenue.toFixed(2)}`,
            color: "#22c55e",
            icon: "💰",
          },
          {
            label: "SESSIONS TODAY",
            value: sessionsToday,
            color: "#3b82f6",
            icon: "🔄",
          },
          {
            label: "PENALTIES COLLECTED",
            value: `$${penaltiesCollected.toFixed(2)}`,
            color: "#ef4444",
            icon: "⚠️",
          },
          {
            label: "MACHINES ACTIVE",
            value: `${
              machines.filter((m) => m.status !== "available").length
            }/8`,
            color: "#f59e0b",
            icon: "⚙️",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
              border: "2px solid #333",
              borderRadius: "12px",
              padding: "20px",
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>
              {stat.icon}
            </div>
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: "10px",
                color: "#666",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: stat.color,
                fontFamily: '"Courier New", monospace',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Section Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
        }}
      >
        {/* Washers Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🌀</span>
            <h2
              style={{
                margin: 0,
                fontFamily: '"Courier New", monospace',
                fontSize: "18px",
                letterSpacing: "2px",
                color: "#888",
              }}
            >
              WASHERS
            </h2>
            <div style={{ flex: 1, height: "2px", background: "#333" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {machines
              .filter((m) => m.type === "washer")
              .map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
          </div>
        </div>

        {/* Dryers Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🔥</span>
            <h2
              style={{
                margin: 0,
                fontFamily: '"Courier New", monospace',
                fontSize: "18px",
                letterSpacing: "2px",
                color: "#888",
              }}
            >
              DRYERS
            </h2>
            <div style={{ flex: 1, height: "2px", background: "#333" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {machines
              .filter((m) => m.type === "dryer")
              .map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          background: "#111",
          borderRadius: "12px",
          border: "2px solid #222",
        }}
      >
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "10px",
            color: "#666",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          STATUS LEGEND
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            { status: "available", label: "Available - Ready for use" },
            { status: "in_cycle", label: "In Cycle - Washing/Drying" },
            { status: "in_buffer", label: "In Buffer - Prepaid grace period" },
            { status: "overstay", label: "Overstay - Penalty accruing!" },
          ].map((item) => (
            <div
              key={item.status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: getStatusColor(item.status),
                  boxShadow: `0 0 8px ${getStatusColor(item.status)}66`,
                }}
              />
              <span
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: "11px",
                  color: "#888",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Info */}
      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          background: "linear-gradient(90deg, #1a1a1a 0%, #111 100%)",
          borderRadius: "12px",
          border: "2px solid #222",
        }}
      >
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "10px",
            color: "#666",
            letterSpacing: "1px",
            marginBottom: "16px",
          }}
        >
          PRICING STRUCTURE
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "16px",
            fontFamily: '"Courier New", monospace',
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "2px solid #3b82f6",
            }}
          >
            <div
              style={{
                color: "#3b82f6",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              BASE WASH
            </div>
            <div
              style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}
            >
              $3.00
            </div>
            <div style={{ color: "#666", fontSize: "10px" }}>40 min cycle</div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                color: "#f59e0b",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              +15 MIN
            </div>
            <div
              style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}
            >
              +$0.75
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                color: "#f59e0b",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              +30 MIN
            </div>
            <div
              style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}
            >
              +$1.50
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                color: "#f59e0b",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              +1 HOUR
            </div>
            <div
              style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}
            >
              +$3.00
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                color: "#f59e0b",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              +2 HOURS
            </div>
            <div
              style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}
            >
              +$8.00
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#0a0a0a",
              borderRadius: "8px",
              border: "2px solid #ef4444",
            }}
          >
            <div
              style={{
                color: "#ef4444",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            >
              OVERSTAY
            </div>
            <div
              style={{ color: "#ef4444", fontSize: "20px", fontWeight: "bold" }}
            >
              $0.10
            </div>
            <div style={{ color: "#666", fontSize: "10px" }}>per minute</div>
          </div>
        </div>
      </div>

      {/* Start Session Modal */}
      {selectedMachine && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedMachine(null)}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
              border: "3px solid #3b82f6",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 24px",
                fontFamily: '"Courier New", monospace',
                fontSize: "18px",
                color: "#fff",
              }}
            >
              START {selectedMachine.type.toUpperCase()} #{selectedMachine.id}
            </h3>

            {/* Buffer Options */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: "10px",
                  color: "#666",
                  marginBottom: "12px",
                }}
              >
                SELECT BUFFER TIME
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {bufferOptions.map((option) => (
                  <button
                    key={option.minutes}
                    onClick={() => setBufferSelection(option.minutes)}
                    style={{
                      background:
                        bufferSelection === option.minutes
                          ? "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"
                          : "#111",
                      border: `2px solid ${
                        bufferSelection === option.minutes ? "#3b82f6" : "#333"
                      }`,
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "#fff",
                      fontFamily: '"Courier New", monospace',
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{option.label}</span>
                    <span
                      style={{
                        color: option.minutes === 0 ? "#22c55e" : "#f59e0b",
                      }}
                    >
                      {option.minutes === 0
                        ? "FREE"
                        : `+$${calculateBufferPrice(option.minutes).toFixed(
                            2
                          )}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                background: "#000",
                border: "2px solid #333",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: '"Courier New", monospace',
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#888" }}>Base Wash (40 min)</span>
                <span>$3.00</span>
              </div>
              {bufferSelection > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: '"Courier New", monospace',
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#888" }}>
                    Buffer ({bufferSelection} min)
                  </span>
                  <span style={{ color: "#f59e0b" }}>
                    +${calculateBufferPrice(bufferSelection).toFixed(2)}
                  </span>
                </div>
              )}
              <div
                style={{
                  borderTop: "2px solid #333",
                  paddingTop: "8px",
                  marginTop: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: '"Courier New", monospace',
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                <span>TOTAL</span>
                <span style={{ color: "#22c55e" }}>
                  ${(3.0 + calculateBufferPrice(bufferSelection)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setSelectedMachine(null)}
                style={{
                  flex: 1,
                  background: "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#fff",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleStartSession}
                style={{
                  flex: 2,
                  background:
                    "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#000",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                START WASH →
              </button>
            </div>

            {/* Pre-auth notice */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#111",
                borderRadius: "6px",
                fontFamily: '"Courier New", monospace',
                fontSize: "10px",
                color: "#666",
                textAlign: "center",
              }}
            >
              💳 A $10.00 hold will be placed on your card for potential
              overstay fees
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {machineToEnd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setMachineToEnd(null)}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
              border: `3px solid ${getStatusColor(machineToEnd.status)}`,
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: `0 0 60px ${getStatusColor(machineToEnd.status)}44`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 24px",
                fontFamily: '"Courier New", monospace',
                fontSize: "18px",
                color: "#fff",
              }}
            >
              END SESSION - {machineToEnd.type.toUpperCase()} #{machineToEnd.id}
            </h3>

            {/* Session Info */}
            <div
              style={{
                background: "#000",
                border: "2px solid #333",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
                fontFamily: '"Courier New", monospace',
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#888" }}>User</span>
                <span>{machineToEnd.user}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#888" }}>Status</span>
                <span style={{ color: getStatusColor(machineToEnd.status) }}>
                  {getStatusLabel(machineToEnd.status)}
                </span>
              </div>
              {machineToEnd.status === "overstay" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px solid #333",
                  }}
                >
                  <span style={{ color: "#ef4444" }}>Penalty Owed</span>
                  <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                    ${(machineToEnd.overstayMinutes * 0.1).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setMachineToEnd(null)}
                style={{
                  flex: 1,
                  background: "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#fff",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => handleEndSession(machineToEnd.id)}
                style={{
                  flex: 2,
                  background:
                    "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#fff",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                PICK UP CLOTHES ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
              border: "3px solid #3b82f6",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Courier New", monospace',
                  fontSize: "20px",
                  color: "#fff",
                }}
              >
                🧺 HOW LAUNDROSPIN WORKS
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#666",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                color: "#ccc",
                lineHeight: "1.7",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  THE PROBLEM
                </h4>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  Laundromats lose money when customers leave clothes in
                  machines after cycles end. Other customers wait, machines sit
                  idle, and owners have no way to enforce turnover.
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    color: "#22c55e",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  THE SOLUTION
                </h4>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  Customers can prepay for "buffer time" - extra minutes to pick
                  up their clothes without penalty. If they go over, they're
                  automatically charged. No confrontation needed.
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  HOW TO USE THIS DEMO
                </h4>
                <div
                  style={{
                    background: "#111",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "14px",
                  }}
                >
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#22c55e" }}>
                      1. Start a session:
                    </strong>{" "}
                    Tap any green "Available" machine
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#3b82f6" }}>
                      2. Choose buffer time:
                    </strong>{" "}
                    Pay upfront for extra grace period (or skip it)
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#f59e0b" }}>
                      3. Watch it run:
                    </strong>{" "}
                    The demo runs at 1 second = 1 minute
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#ef4444" }}>
                      4. See penalties accrue:
                    </strong>{" "}
                    If buffer expires, overstay fees kick in at $0.10/min
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    color: "#fff",
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  STATUS COLORS
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#22c55e",
                      }}
                    />
                    <span>
                      <strong>Green</strong> - Available, ready to use
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#3b82f6",
                      }}
                    />
                    <span>
                      <strong>Blue</strong> - In cycle, washing/drying
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                      }}
                    />
                    <span>
                      <strong>Yellow</strong> - Buffer time, prepaid grace
                      period
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#ef4444",
                      }}
                    />
                    <span>
                      <strong>Red</strong> - Overstay! Penalties accruing
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(90deg, #3b82f633 0%, transparent 100%)",
                  borderLeft: "3px solid #3b82f6",
                  padding: "12px 16px",
                  borderRadius: "0 8px 8px 0",
                  fontSize: "13px",
                }}
              >
                <strong>💡 Pro tip:</strong> Tap any active machine to end its
                session and see the penalty calculation.
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              style={{
                width: "100%",
                marginTop: "24px",
                background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                border: "none",
                borderRadius: "8px",
                padding: "14px",
                color: "#fff",
                fontFamily: '"Courier New", monospace',
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
