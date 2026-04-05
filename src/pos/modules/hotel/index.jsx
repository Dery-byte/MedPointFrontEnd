import { useState } from "react";
import { useApp } from "../../AppContext";
import Badge from "../../components/Badge";
import Icon from "../../../shared/components/Icon";
import RoomGrid from "./RoomGrid";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";
import InStayPanel from "./InStayPanel";

export default function HotelModule() {
  const { state } = useApp();
  const { rooms, roomCats } = state;
  const [checkInRoom,  setCheckInRoom]  = useState(null);
  const [checkOutRoom, setCheckOutRoom] = useState(null);
  const [inStayRoom,   setInStayRoom]   = useState(null);

  const available = rooms.filter(r => !r.occ).length;
  const occupied  = rooms.filter(r =>  r.occ).length;

  const handleRoomClick = (room) => {
    if (room.occ) setCheckOutRoom(room);
    else          setCheckInRoom(room);
  };

  return (
    <div>
      <div className="pg-hd-row">
        <div>
          <h2>Hotel</h2>
          <p style={{ fontSize: 13, color: "var(--g400)", marginTop: 2 }}>
            Manage rooms, check-ins, and guest services
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge type="green">
            <Icon name="building" size={11} color="var(--green)" style={{ marginRight: 4 }} />
            Available: {available}
          </Badge>
          <Badge type="red">Occupied: {occupied}</Badge>
        </div>
      </div>

      {roomCats.map(rc => (
        <RoomGrid
          key={rc.name}
          rooms={rooms}
          category={rc}
          onRoomClick={handleRoomClick}
          onManageClick={setInStayRoom}
        />
      ))}

      {checkInRoom  && <CheckInModal  room={checkInRoom}  onClose={() => setCheckInRoom(null)}  />}
      {checkOutRoom && <CheckOutModal room={checkOutRoom} onClose={() => setCheckOutRoom(null)} />}
      {inStayRoom   && <InStayPanel   room={inStayRoom}   onClose={() => setInStayRoom(null)}   />}
    </div>
  );
}
