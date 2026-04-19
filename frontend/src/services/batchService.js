import api from "./api";

export const createBatch = async (payload) => {
  const response = await api.post("/batches", payload);
  return response.data;
};

export const getBatchesByProduct = async (productId) => {
  const response = await api.get(`/batches/${productId}`);
  return response.data;
};

export const verifyBatch = async (slug, batchNo) => {
  const response = await api.get(`/batch/${slug}/${batchNo}`);
  return response.data;
};

export const updateBatch = async (batchId, payload) => {
  const response = await api.put(`/batches/${batchId}`, payload);
  return response.data;
};

export const deleteBatch = async (batchId) => {
  const response = await api.delete(`/batches/${batchId}`);
  return response.data;
};
