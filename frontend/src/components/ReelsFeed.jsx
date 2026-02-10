// import React from "react";
// import { useSelector } from "react-redux";
// import Reel from "./Reel";

// const ReelsFeed = () => {
//   const { reels } = useSelector(store => store.reel);

//   return (
//     <div
//       className="
//         h-[calc(100vh-80px)]
//         overflow-y-scroll
//         snap-y snap-mandatory
//         scrollbar-hide
//         md:h-auto
//       "
//     >
//       {reels.map(reel => (
//         <div
//           key={reel._id}
//           className="snap-start flex justify-center mb-6"
//         >
//           <Reel reel={reel} />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ReelsFeed;


// components/ReelsFeed.jsx
import React from "react";
import { useSelector } from "react-redux";
import Reel from "./Reel";
import EmptyReels from "./EmptyReels";

const ReelsFeed = () => {
  const { reels } = useSelector(store => store.reel);

  // ✅ EMPTY STATE (OWN + FRIENDS)
  if (!reels || reels.length === 0) {
    return <EmptyReels />;
  }

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
