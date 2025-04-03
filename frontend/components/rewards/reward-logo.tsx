import Image from "next/image";

interface RewardLogoProps {
  logo: string | null;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: 48,
  md: 96,
  lg: 192,
};

export function RewardLogo({
  logo,
  name,
  className = "",
  size = "md",
}: RewardLogoProps) {
  const dimension = sizes[size];

  if (!logo) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}
        style={{ width: dimension, height: dimension }}
      >
        <span className="text-gray-500 text-xl">{name[0].toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={`${process.env.API_URL}/uploads/rewards/${logo}`}
        alt={`Logo de ${name}`}
        fill
        className="object-cover"
        sizes={`${dimension}px`}
      />
    </div>
  );
}
