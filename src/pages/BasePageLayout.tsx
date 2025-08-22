import React, { useEffect, useState } from "react";
import "../styles/index.css";
import Header from "../components/ui/Header";
import SideBar from "../components/ui/SideBar";
import { Outlet } from "react-router-dom";

const BasePageLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showGoToBottom, setShowGoToBottom] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.remove("toggle-sidebar");
    } else {
      document.body.classList.add("toggle-sidebar");
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setShowBackToTop(scrollTop > 100);
      setShowGoToBottom(scrollTop + windowHeight < documentHeight - 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showBackToTop, showGoToBottom]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <SideBar />
      <Outlet />

      {/* Nút Back to Top và Go to Bottom */}
      <div className="scroll-buttons">
        {showBackToTop && (
          <button className="scroll-btn top" onClick={scrollToTop}>▲</button>
        )}
        {showGoToBottom && (
          <button className="scroll-btn bottom" onClick={scrollToBottom}>▼</button>
        )}
      </div>
    </>
  );
};

export default BasePageLayout;
