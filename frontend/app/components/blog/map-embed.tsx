interface MapEmbedProps {
  src: string;
  title?: string;
  height?: string;
}

export function MapEmbed({
  src,
  title = "Interactive Map",
  height = "500px",
}: MapEmbedProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={src}
        title={title}
        width="100%"
        height={height}
        style={{ border: "none" }}
        loading="lazy"
      />
    </div>
  );
}
