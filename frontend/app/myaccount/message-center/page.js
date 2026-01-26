import Messenger from "@/components/Messenger";

export default function MessageCenterPage() {
  return (
    <div className="w-full h-[calc(100vh-102.2px)]">
      <Messenger mode="buyer" className="rounded-none border-none" />
    </div>
  );
}
