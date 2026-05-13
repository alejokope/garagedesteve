import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/** Logo de marca; fondo blanco para que en tabs no se pierda el canal alpha. */
export const runtime = "nodejs";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const buf = await readFile(join(process.cwd(), "public/brand/garage-logo.png"));
  const src = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={src} alt="" height={22} width={32} style={{ objectFit: "contain" }} />
      </div>
    ),
    { width: 32, height: 32 },
  );
}
