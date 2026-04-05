import { fmt } from "../../helpers";
import Badge from "../../components/Badge";
import Icon from "../../../shared/components/Icon";

export default function RoomCard({ room, onClick, onManageClick }) {
  return (
    <div className={`room-card ${room.occ ? "occ" : ""}`}>
      <div className="room-num">Room {room.id}</div>
      <div className="room-cat">{room.cat}</div>
      <div className="room-price">{fmt(room.price)}/night</div>
      <Badge type={room.occ ? "red" : "green"}>{room.occ ? "Occupied" : "Available"}</Badge>
      {room.booking && (
        <div className="room-guest" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          <Icon name="staff" size={11} color="var(--g500)" />
          {room.booking.guestName}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button
          className={`btn btn-sm ${room.occ ? "btn-danger" : "btn-p"}`}
          style={{ flex: 1, fontSize: 11 }}
          onClick={() => onClick(room)}
        >
          {room.occ ? "Check Out" : "Check In"}
        </button>
        {room.occ && onManageClick && (
          <button
            className="btn btn-sec btn-sm"
            style={{ fontSize: 11, padding: "6px 8px" }}
            onClick={() => onManageClick(room)}
            title="Manage stay"
          >
            <Icon name="pricing" size={13} color="var(--g600)" />
          </button>
        )}
      </div>
    </div>
  );
}
