import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ControlPanel } from "./components/ControlPanel";
import { StatusBar } from "./components/StatusBar";
import { EmbeddingScatterPlot, type Transform } from "./components/EmbeddingScatterPlot";

const DEFAULT_TRANSFORM: Transform = { x: 0, y: 0, k: 1 };

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [pointCount, setPointCount] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const handleZoomIn = () =>
    setTransform((prev) => ({ ...prev, k: Math.min(prev.k * 1.3, 20) }));

  const handleZoomOut = () =>
    setTransform((prev) => ({ ...prev, k: Math.max(prev.k / 1.3, 0.5) }));

  const handleReset = () => {
    setTransform(DEFAULT_TRANSFORM);
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <Sidebar active="Explore" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={() => setSearchTerm(searchInput)}
        />
        <div style={{ flex: 1, display: "flex", padding: 16, gap: 16, minHeight: 0 }}>
          <div style={{ flex: 1 }}>
            <EmbeddingScatterPlot
              searchTerm={searchTerm}
              transform={transform}
              onTransformChange={setTransform}
              onPointCountChange={setPointCount}
              onCursorDataChange={setCursor}
            />
          </div>
          <ControlPanel
            pointCount={pointCount}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />
        </div>
        <StatusBar cursor={cursor} />
      </div>
    </div>
  );
}

export default App;