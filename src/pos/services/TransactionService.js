import api from "../../shared/services/api";

/** POST /transactions/issue */
export const issueServiceReceipt = async (body) => {
  const response = await api.post("/transactions/issue", body);
  return response.data;
};

/** GET /transactions */
export const getTransactions = async (params) => {
  const response = await api.get("/transactions", { params });
  return response.data;
};

/** GET /transactions/:id */
export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

/** PATCH /transactions/:id/cancel */
export const cancelTransaction = async (id) => {
  const response = await api.patch(`/transactions/${id}/cancel`);
  return response.data;
};



/** POST /transactions/dispense */
export const issueDispenseReceipt = async (body) => {
  const response = await api.post("/transactions/dispense", body);
  return response.data;
};



