import axios from "axios";
import { cookies } from "next/headers";
import ChatRoomClient from "./ChatRoomClient";

async function getChats(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await axios.get(`http://localhost:3001/chats/${id}`, {
    headers: { Authorization: token },
  });
  return response.data.messages;
}

export default async function Room({ id }) {
  const messages = await getChats(id);
  return <ChatRoomClient messages={messages} id={id} />;
}
