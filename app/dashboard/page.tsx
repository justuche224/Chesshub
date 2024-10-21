import React from "react";
import Link from "next/link";

const page = () => {
  return (
    <div className="my-4 text-emerald-200">
      <h1 className="font-bold text-3xl text-center">
        <Link href="/game">game</Link>
      </h1>
    </div>
  );
};

export default page;
