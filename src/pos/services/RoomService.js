import api from "../../shared/services/api";

/**
 * Backend Room shape:
 *   { id, roomNumber, category: { id, name, pricePerNight }, status }
 * Frontend expects the same — no remapping needed.
 */

const RoomService = {
  /** GET /api/hotel/rooms */
  async getRooms() {
    const { data } = await api.get("/hotel/rooms");
    return data;
  },

  /**
   * POST /api/hotel/rooms
   * Payload: { roomNumber: string, categoryId: number, status: string }
   */
  async createRoom(payload) {
    const { data } = await api.post("/hotel/rooms", payload);
    return data;
  },

  /**
   * PUT /api/hotel/rooms/{id}
   * Payload: { roomNumber: string, categoryId: number, status: string }
   */
  async updateRoom(id, payload) {
    const { data } = await api.put(`/hotel/rooms/${id}`, payload);
    return data;
  },

  /** DELETE /api/hotel/rooms/{id} */
  async deleteRoom(id) {
    await api.delete(`/hotel/rooms/${id}`);
  },

  /** GET /api/hotel/room-categories */
  async getCategories() {
    const { data } = await api.get("/hotel/room-categories");
    return data; // [{ id, name, pricePerNight }]
  },
};

export default RoomService;