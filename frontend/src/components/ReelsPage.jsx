import React from "react";
import ReelsFeed from "./ReelsFeed";
import useGetAllReel from "@/hooks/useGetAllReel";
import RightSideBar from "./RightSideBar";

const ReelsPage = () => {
  useGetAllReel();

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[1400px] px-6">

        {/* CENTER REELS */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[420px]">
            <ReelsFeed />
          </div>
        </div>

        {/* RIGHT SIDEBAR (DESKTOP ONLY) */}
        <div className="hidden lg:block ml-8">
          <RightSideBar />
        </div>

      </div>
    </div>
  );
};

export default ReelsPage;

