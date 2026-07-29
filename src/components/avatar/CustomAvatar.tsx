import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import type { SxProps, Theme } from "@mui/material/styles";

export interface CustomAvatarProps {
  name?: string;
  src?: string;
  size?: number;
  fontSize?: string;
  sx?: SxProps<Theme>;
}

export function getInitials(name?: string): string {
  if (!name) return "E";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getColorForName(name?: string): string {
  if (!name) return "#6D5DF6";
  const colors = [
    "#6D5DF6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
    "#EC4899", "#3B82F6", "#06B6D4", "#14B8A6", "#6366F1",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function CustomAvatar({
  name,
  src,
  size = 36,
  fontSize = "0.8rem",
  sx,
}: CustomAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const bgColor = getColorForName(name);

  const showSrc = Boolean(src && src.trim() && !imgError);

  return (
    <Avatar
      src={showSrc ? src : undefined}
      alt={name || "User"}
      slotProps={{
        img: {
          onError: () => setImgError(true),
        },
      }}
      sx={{
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        backgroundColor: bgColor,
        color: "#FFFFFF",
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
}
