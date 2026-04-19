const avatars = [
  "https://i.pravatar.cc/64?img=12",
  "https://i.pravatar.cc/64?img=32",
  "https://i.pravatar.cc/64?img=25",
  "https://i.pravatar.cc/64?img=47",
  "https://i.pravatar.cc/64?img=52",
];

export default function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {avatars.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] object-cover"
          style={{ zIndex: avatars.length - i }}
        />
      ))}
    </div>
  );
}
