import api from "@/api/axios";

export function logout() {
  // ✅ Resume USB listener since user is logging out
  api.post("/auth/hardware-listener-state/", { active: true })
    .catch(() => {})
    .finally(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/";
    });
}