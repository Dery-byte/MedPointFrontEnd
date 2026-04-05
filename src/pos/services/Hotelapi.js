import api from "../../shared/services/api";

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapCategory(c) {
  return {
    id:             c.id,
    name:           c.name,
    icon:           c.icon ?? "hotel",        // backend has no icon field; keep for UI only
    price:          c.pricePerNight,
    totalRooms:     c.totalRooms,
    availableRooms: c.availableRooms,
    occupiedRooms:  c.occupiedRooms,
  };
}

function mapRoom(r) {
  return {
    id:         r.id,
    roomNumber: r.roomNumber,
    cat:        r.categoryName,
    price:      r.pricePerNight,
    status:     r.status,                  // "AVAILABLE" | "OCCUPIED"
    occ:        r.status === "OCCUPIED",
    booking:    r.activeBooking ? mapBooking(r.activeBooking) : null,
  };
}

function mapBooking(b) {
  return {
    id:           b.id,
    roomNumber:   b.roomNumber,
    guestName:    b.guestName,
    phone:        b.phone,
    nationality:  b.nationality,
    address:      b.address,
    idType:       b.idType,
    idNumber:     b.idNumber,
    checkIn:      b.checkIn,
    checkOut:     b.checkOut,
    nights:       b.nights,
    baseAmount:   b.baseAmount,
    extras:       b.extras ?? [],
    totalCharged: b.totalCharged,
    paid:         b.paid,
    createdAt:    b.createdAt,
  };
}

function mapExtra(e) {
  return { id: e.id, name: e.name, price: e.price, active: e.active };
}

// ─── Service ──────────────────────────────────────────────────────────────────

const HotelService = {

  // ── Room Categories ─────────────────────────────────────────────────────────

  /** GET /hotel/room-categories → mapped category array */
  async getCategories() {
    const { data } = await api.get("/hotel/room-categories");
    return data.map(mapCategory);
  },

  /** POST /hotel/room-categories — { name, pricePerNight } */
  async createCategory(name, pricePerNight) {
    const { data } = await api.post("/hotel/room-categories", { name, pricePerNight });
    return mapCategory(data);
  },

  /** PUT /hotel/room-categories/:id — price update only (name is immutable) */
  async updateCategoryPrice(id, pricePerNight) {
    const { data } = await api.put(`/hotel/room-categories/${id}`, { pricePerNight });
    return mapCategory(data);
  },

  /** DELETE /hotel/room-categories/:id */
  async deleteCategory(id) {
    await api.delete(`/hotel/room-categories/${id}`);
  },

  // ── Rooms ───────────────────────────────────────────────────────────────────

  /** GET /hotel/rooms → mapped room array */
  async getRooms() {
    const { data } = await api.get("/hotel/rooms");
    return data.map(mapRoom);
  },

  /** POST /hotel/rooms — { roomNumber, categoryId } */
  async addRoom(roomNumber, categoryId) {
    const { data } = await api.post("/hotel/rooms", { roomNumber, categoryId });
    return mapRoom(data);
  },

  /** DELETE /hotel/rooms/:id */
  async deleteRoom(id) {
    await api.delete(`/hotel/rooms/${id}`);
  },

  // ── Extras ──────────────────────────────────────────────────────────────────

  /** GET /hotel/room-extras */
  async getExtras() {
    const { data } = await api.get("/hotel/room-extras");
    return data.map(mapExtra);
  },

  // ── Bookings ─────────────────────────────────────────────────────────────────

  /** GET /hotel/bookings — active (unpaid) bookings only */
  async getBookings() {
    const { data } = await api.get("/hotel/bookings");
    return data.map(mapBooking);
  },

  /**
   * POST /hotel/check-in
   * @param {{ roomId, guestName, phone, nationality, address, idType, idNumber, checkIn, checkOut, extraIds? }} req
   */
  async checkIn(req) {
    const { data } = await api.post("/hotel/check-in", req);
    return mapBooking(data);
  },

  /**
   * POST /hotel/check-out
   * @param {number} bookingId
   * @param {number[]} extraIds
   */
  async checkOut(bookingId, extraIds = []) {
    const { data } = await api.post("/hotel/check-out", { bookingId, extraIds });
    return data; // TransactionResponse — no mapping needed, used for receipt display
  },
};

export default HotelService;