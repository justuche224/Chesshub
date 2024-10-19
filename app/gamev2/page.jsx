"use client";
import { useState } from "react";
import Chessgame from "./Chessgame";

const GameV2 = () => {
  const [status, setStatus] = useState({});
  return (
    <>
      <Chessgame onStatusChange={setStatus} />
      <div className="all-status-props text-center">
        {Object.keys(status).map((prop) => {
          let value = status[prop] || "false";
          if (value === true) value = "true";
          if (prop == "history") value = value.map((move) => move.lan);
          if (Array.isArray(value)) value = value.join(", ");

          return (
            <p key={prop + value}>
              <strong>{prop}</strong>: {value}
            </p>
          );
        })}

        <p>
          <strong>Captured</strong>:{" "}
          {status.history
            ?.filter((moves) => moves.captured)
            .map((moves) => (moves.color == "w" ? "b" : "w") + moves.captured)}
        </p>
      </div>
    </>
  );
};

export default GameV2;
