// components/ReelsFeed.jsx
import React from "react";
import { useSelector } from "react-redux";
import Reel from "./Reel";

const ReelsFeed = () => {
  const { reels } = useSelector(store => store.reel);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {reels.map(reel => (
        <div key={reel._id} className="snap-start">
          <Reel reel={reel} />
        </div>
      ))}
    </div>
  );
};

export default ReelsFeed;
