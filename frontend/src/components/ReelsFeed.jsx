import React from "react";
import { useSelector } from "react-redux";
import Reel from "./Reel";

const ReelsFeed = () => {
  const { reels } = useSelector(store => store.reel);

  return (
    <div
      className="
        h-[calc(100vh-80px)]
        overflow-y-scroll
        snap-y snap-mandatory
        scrollbar-hide
        md:h-auto
      "
    >
      {reels.map(reel => (
        <div
          key={reel._id}
          className="snap-start flex justify-center mb-6"
        >
          <Reel reel={reel} />
        </div>
      ))}
    </div>
  );
};

export default ReelsFeed;
