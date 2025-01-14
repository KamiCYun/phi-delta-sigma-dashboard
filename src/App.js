import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import Reimbursements from "./pages/Reimbursements";
import Dues from "./pages/Dues";
import "./App.css"; // Import global styles

// Create Theme Context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState("light"); // Manage light/dark theme

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`app-container ${theme}`}>
        <Router>
          <div style={{ display: "flex", height: "100vh" }}>
            <Sidebar /> {/* Sidebar component */}
            <div style={{ flexGrow: 1, padding: "16px" }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reimbursements" element={<Reimbursements />} />
                <Route path="/dues" element={<Dues />} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
