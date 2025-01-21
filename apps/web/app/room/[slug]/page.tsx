import axios from "axios";
import { cookies } from "next/headers";
import Room from "../../components/Room";

async function getRoomId(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await axios.get(`http://localhost:3001/room/${slug}`, {
    headers: { Authorization: token },
  });
  console.log(response.data.room);
  return response.data.room.id;
}

export default async function ChatRoom({
  params,
}: {
  params: { slug: string };
}) {
  const slug = await params.slug;
  const roomId = await getRoomId(slug);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Room id={roomId} />
    </div>
  );
}
