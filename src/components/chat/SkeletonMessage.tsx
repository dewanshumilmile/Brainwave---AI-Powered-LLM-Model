// src/components/chat/SkeletonMessage.tsx

interface Props {
  align?: "left" | "right";
}

export function SkeletonMessage({ align = "left" }: Props) {
  const isRight = align === "right";
  return (
    <div className={`flex gap-3 ${isRight ? "flex-row-reverse" : ""}`}>
      <div className="skeleton h-8 w-8 rounded-full shrink-0" />
      <div className={`flex flex-col gap-2 flex-1 ${isRight ? "items-end" : ""}`}>
        <div className="skeleton h-4 w-1/3 rounded-md" />
        <div className="skeleton h-4 w-2/3 rounded-md" />
        <div className="skeleton h-4 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
