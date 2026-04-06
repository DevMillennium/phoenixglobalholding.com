"use client";

import Error from "next/error";

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className="bg-[#07080c]">
        <Error statusCode={404} />
      </body>
    </html>
  );
}
