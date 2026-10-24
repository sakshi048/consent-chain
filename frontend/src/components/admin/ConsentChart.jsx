import React, { useState } from "react";
import { FaChevronDown, FaFilter, FaCheck } from "react-icons/fa";

export default function ConsentChart({ chartData, activeRange = "Last 7 Days", onRangeChange }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showGranted, setShowGranted] = useState(true);
  const [showRevoked, setShowRevoked] = useState(true);

  const ranges = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

  const currentDataset = chartData[activeRange] || chartData["Last 7 Days"];
  const labels = currentDataset.labels;
  const grantedData = currentDataset.granted;
  const revokedData = currentDataset.revoked;

  // Coordinate calculations for SVG line graph
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const maxY = 200; // matching the mockup y-axis 0 to 200
  const yTicks = [0, 50, 100, 150, 200];

  const getX = (index) => {
    if (labels.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (labels.length - 1)) * chartW;
  };

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(maxY, val));
    return paddingTop + chartH - (clamped / maxY) * chartH;
  };

  // Build SVG path
  const createSmoothPath = (data) => {
    if (!data || data.length === 0) return "";
    let path = `M ${getX(0)},${getY(data[0])}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(data[i]);
      const x1 = getX(i + 1);
      const y1 = getY(data[i + 1]);
      const cx = (x0 + x1) / 2;
      path += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return path;
  };

  const createAreaPath = (data) => {
    if (!data || data.length === 0) return "";
    const linePath = createSmoothPath(data);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = paddingTop + chartH;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const grantedPath = createSmoothPath(grantedData);
  const grantedArea = createAreaPath(grantedData);
  const revokedPath = createSmoothPath(revokedData);
  const revokedArea = createAreaPath(revokedData);

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
            Consent Activity Over Time
          </h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range dropdown */}
          <div className="relative">
            <select
              value={activeRange}
              onChange={(e) => onRangeChange && onRangeChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {ranges.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <FaChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Filter Series"
            >
              <FaFilter className="w-3 h-3" />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl p-2 z-20 text-xs animate-fadeIn">
                <p className="font-semibold text-slate-700 px-2 py-1 mb-1">
                  Filter Series
                </p>
                <button
                  onClick={() => setShowGranted(!showGranted)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Consents Granted
                  </span>
                  {showGranted && <FaCheck className="text-blue-600 w-3 h-3" />}
                </button>
                <button
                  onClick={() => setShowRevoked(!showRevoked)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    Consents Revoked
                  </span>
                  {showRevoked && <FaCheck className="text-teal-600 w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-3 text-xs font-medium text-slate-600">
        <div
          onClick={() => setShowGranted(!showGranted)}
          className={`flex items-center gap-2 cursor-pointer transition-opacity ${
            showGranted ? "opacity-100" : "opacity-40"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Consents Granted</span>
        </div>

        <div
          onClick={() => setShowRevoked(!showRevoked)}
          className={`flex items-center gap-2 cursor-pointer transition-opacity ${
            showRevoked ? "opacity-100" : "opacity-40"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
          <span>Consents Revoked</span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[500px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              {/* Gradient for Granted Area */}
              <linearGradient id="grantedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradient for Revoked Area */}
              <linearGradient id="revokedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Y Ticks */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={tick === 0 ? "0" : "3,3"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-sans"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {labels.map((label, index) => {
              const x = getX(index);
              const y = paddingTop + chartH + 18;
              return (
                <text
                  key={index}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-sans"
                >
                  {label}
                </text>
              );
            })}

            {/* Area Fills */}
            {showGranted && (
              <path
                d={grantedArea}
                fill="url(#grantedGrad)"
                className="transition-all duration-300"
              />
            )}
            {showRevoked && (
              <path
                d={revokedArea}
                fill="url(#revokedGrad)"
                className="transition-all duration-300"
              />
            )}

            {/* Curves */}
            {showRevoked && (
              <path
                d={revokedPath}
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {showGranted && (
              <path
                d={grantedPath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* Interactive Vertical Cursor Line */}
            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + chartH}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            )}

            {/* Interactive Circles & Hitboxes */}
            {labels.map((_, i) => {
              const x = getX(i);
              const yG = getY(grantedData[i]);
              const yR = getY(revokedData[i]);
              const isHovered = hoverIndex === i;

              return (
                <g key={i}>
                  {/* Invisible Hitbox for smooth hover */}
                  <rect
                    x={x - 20}
                    y={paddingTop}
                    width={40}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                  />

                  {/* Revoked Point */}
                  {showRevoked && (
                    <circle
                      cx={x}
                      cy={yR}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#0D9488"
                      strokeWidth="2.5"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  )}

                  {/* Granted Point */}
                  {showGranted && (
                    <circle
                      cx={x}
                      cy={yG}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoverIndex !== null && (
        <div
          className="absolute z-30 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((getX(hoverIndex) / svgWidth) * 100).toFixed(1)}%`,
            top: "70px",
          }}
        >
          <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-200">
            {labels[hoverIndex]}
          </div>
          {showGranted && (
            <div className="flex items-center justify-between gap-4 text-blue-400">
              <span>Granted:</span>
              <span className="font-bold">{grantedData[hoverIndex]}</span>
            </div>
          )}
          {showRevoked && (
            <div className="flex items-center justify-between gap-4 text-teal-300">
              <span>Revoked:</span>
              <span className="font-bold">{revokedData[hoverIndex]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
