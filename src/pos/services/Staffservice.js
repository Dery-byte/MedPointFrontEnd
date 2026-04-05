import api from "../../shared/services/api";

/**
 * Maps a backend UserResponse to the shape AppContext expects.
 * Backend: { id, name, email, role (StaffRole), accessModules (Set<AccessModule>), manageModules (Set<ManageModule>), active, createdAt }
 * App:     { id, name, email, role (lowercase), modules (lowercase[]), manageModules (lowercase[]), active }
 */
export function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),                                   // "SUPERADMIN" → "superadmin"
    modules: (u.accessModules || []).map(m => m.toLowerCase()),   // ["MART"] → ["mart"]
    manageModules: (u.manageModules || []).map(m => m.toLowerCase()),
    active: u.active,
    createdAt: u.createdAt,
  };
}

/**
 * Maps app-side module arrays back to uppercase enums for the backend.
 */
function toUpperSet(arr) {
  return (arr || []).map(m => m.toUpperCase());
}

const StaffService = {

  /** GET /api/admin/staff — returns mapped user array */
  async getAll() {
    const { data } = await api.get("/admin/staff");
    return data.map(mapUser);
  },

  /** GET /api/admin/staff/:id */
  async getById(id) {
    const { data } = await api.get(`/admin/staff/${id}`);
    return mapUser(data);
  },

  /**
   * POST /api/admin/staff — create a new staff member.
   * @param {{ name, email, password, role, modules, manageModules }} user - app-side shape
   */
  async create(user) {
    const payload = {
      name:         user.name,          // full name — kept for backward compat
      firstName:    user.firstName,     // new explicit fields
      lastName:     user.lastName,
      email:        user.email,
      password:     user.password,
      role:         user.role.toUpperCase(),
      accessModules: toUpperSet(user.modules),
      manageModules: toUpperSet(user.manageModules),
    };
    const { data } = await api.post("/admin/staff", payload);
    return mapUser(data);
  },

  /**
   * PUT /api/admin/staff/:id — update existing staff.
   * @param {number} id
   * @param {{ name, role, password, modules, manageModules }} user - app-side shape
   */
  async update(id, user) {
    const payload = {
      name: user.name,
      role: user.role.toUpperCase(),
      password: user.password || undefined,           // omit if blank — keep existing
      accessModules: toUpperSet(user.modules),
      manageModules: toUpperSet(user.manageModules),
    };
    const { data } = await api.put(`/admin/staff/${id}`, payload);
    return mapUser(data);
  },

  /**
   * PATCH /api/admin/staff/:id/toggle — toggle active status.
   * Returns the updated mapped user.
   */
  async toggle(id) {
    const { data } = await api.patch(`/admin/staff/${id}/toggle`);
    return mapUser(data);
  },
};

export default StaffService;