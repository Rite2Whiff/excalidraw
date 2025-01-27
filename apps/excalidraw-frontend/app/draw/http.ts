import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const response = await axios.get(`http://localhost:3001/chats/${roomId}`, {
    headers: {
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRiNWU5Ny04OTc4LTQyMjctODY5Ny0yMjI5ZGM4ZDFhYjkiLCJpYXQiOjE3Mzc2MDg2ODN9.XTgLSkFMPjjw1770215EMmqbyOP2jVDSFr6HH20xrBQ",
    },
  });
  const messages = response.data.messages;

  const shapes = messages.map((message: { message: string }) => {
    const messageData = JSON.parse(message.message);
    return messageData;
  });
  return shapes;
}
