import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import RightSideBar from "./RightSideBar";

import BottomNav from "./BottomNav";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      <div className="max-w-[1400px] mx-auto flex">

        {/* LEFT SIDEBAR (DESKTOP) */}
        <div className="hidden md:block w-[240px]">
          <LeftSidebar />
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1">
          <Outlet />
        </div>

      </div>

      {/* MOBILE BOTTOM NAV */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;




