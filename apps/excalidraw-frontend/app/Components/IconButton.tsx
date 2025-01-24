import { ReactNode } from "react";

export default function IconButton({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`pointer rounded-full border p-2 bg-black hover:bg-grey ${activated ? "bg-red-400" : "text-white"}`}
      >
        {icon}
      </button>
    </div>
  );
}
