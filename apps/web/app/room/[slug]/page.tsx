export default async function ChatRoom({
  params,
}: {
  params: { slug: string };
}) {
  const slug = await params.slug;
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
      {slug}
    </div>
  );
}
