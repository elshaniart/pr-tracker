import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Image src="/Loading.gif" alt="" width={128} height={128} />
    </div>
  );
};

export default Loading;
