"use client";
import { useState } from "react";
import Chessgame from "./Chessgame";

const GameV2 = () => {
  const [status, setStatus] = useState({});
  return (
    <>
      <Chessgame onStatusChange={setStatus} />
      <div className="all-status-props text-center">
        {Object.keys(status).map((prop) => (
          <p>
            <strong>{prop}</strong>:{" "}
            {Array.isArray(status[prop])
              ? status[prop].join(", ")
              : status[prop] || "false"}
          </p>
        ))}
      </div>
    </>
  );
};

export default GameV2;
