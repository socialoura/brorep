export default function FanovalyLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img src="/logo.png" alt="Fanovaly" width="200" height="auto" />
    </div>
  );
}
