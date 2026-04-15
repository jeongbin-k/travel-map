import React from "react";
import "./App.css";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="main-container">
      {/* 1. 배경이 될 지도 공간 (나중에 Mapbox가 들어갈 자리) */}
      <div className="map-background" />

      {/* 2. 김종민 스타일의 중앙 타이포그래피 (테스트용) */}
      <motion.div
        className="hero-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="syllable">SE</div>
        <div className="syllable">OUL</div>
        <span className="sub-text">south korea</span>
      </motion.div>

      {/* 3. 우측 하단 share 버튼 등 디테일 요소들 */}
      <div className="ui-overlay">
        <span>share this</span>
      </div>
    </div>
  );
}

export default App;
