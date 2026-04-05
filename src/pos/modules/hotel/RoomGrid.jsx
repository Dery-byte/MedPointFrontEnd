import { fmt } from "../../helpers";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, category, onRoomClick, onManageClick }) {
  const catRooms = rooms.filter(r => r.cat?.toLowerCase() === category.name?.toLowerCase());
  if (catRooms.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--g700)", letterSpacing: "-.01em" }}>
          {category.name} Rooms
        </h3>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pd)" }}>{fmt(category.price)}/night</span>
      </div>
      <div className="rooms-grid">
        {catRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={onRoomClick}
            onManageClick={onManageClick}
          />
        ))}
      </div>
    </div>
  );
}
