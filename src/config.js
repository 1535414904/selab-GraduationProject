//export const BASE_URL = 'http://localhost:8080';

export const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080" // ✅ 本機測試
    : "http://163.18.104.159:8080"; // ✅ 讓外部設備存取

    