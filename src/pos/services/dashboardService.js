import api from "../../shared/services/api";

export const getTransactions = (params) =>
  api.get("/transactions", { params }).then(r => r.data);

export const getStaff = () =>
  api.get("/admin/staff").then(r => r.data);

export const getDrugs = () =>
  api.get("/drugstore/drugs").then(r => r.data);

export const getProducts = () =>
  api.get("/mart/products").then(r => r.data);