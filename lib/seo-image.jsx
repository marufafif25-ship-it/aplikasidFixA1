import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };

export function createSocialImage() {
  return new ImageResponse(
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "72px 84px",
      color: "#f8fafc",
      background: "linear-gradient(135deg, #07162c 0%, #0c3470 100%)",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#bfdbfe", fontSize: 27, fontWeight: 700 }}>
        <div style={{ display: "flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, background: "#2563eb", color: "white", fontSize: 28 }}>A</div>
        Aplikasi.id
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 38, fontSize: 66, lineHeight: 1.12, fontWeight: 800, letterSpacing: -2 }}>
        <span>Software untuk kuliah,</span>
        <span>riset, desain &amp; kerja</span>
      </div>
      <div style={{ display: "flex", marginTop: 28, color: "#dbeafe", fontSize: 28 }}>
        Pilih software, cek versi, dan temukan panduan instalasi.
      </div>
      <div style={{ display: "flex", marginTop: 46, color: "#93c5fd", fontSize: 22, fontWeight: 700, letterSpacing: 1.5 }}>
        WWW.APLIKASID.COM
      </div>
    </div>,
    socialImageSize
  );
}
