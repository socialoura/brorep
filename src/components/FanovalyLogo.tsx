import Image from "next/image";

export default function FanovalyLogo({ className = "", variant = "green" }: { className?: string; variant?: "green" | "red" }) {
  const src = variant === "red" ? "/logo-red.png" : "/logo.png";
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Image src={src} alt="Fanovaly" width={200} height={60} priority />
    </div>
  );
}
