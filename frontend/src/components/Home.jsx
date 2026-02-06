import React from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSideBar from "./RightSideBar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[1100px] px-6 gap-8">

        {/* FEED */}
        <div className="flex-1 flex justify-end">
          <div className="w-full max-w-[600px]">
            <Feed />
            <Outlet />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden lg:block">
          <RightSideBar />
        </div>

      </div>
    </div>
  );
};

export default Home;