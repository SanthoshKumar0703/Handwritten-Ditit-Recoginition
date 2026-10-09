import api from "./client";

export async function updateProfile({ name, avatarUrl }) {
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (avatarUrl !== undefined) payload.avatar_url = avatarUrl;
  const { data } = await api.patch("/auth/profile", payload);
  return data.user;
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  const { data } = await api.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return data;
}

export async function deleteAccount(password) {
  const { data } = await api.delete("/auth/account", { data: { password } });
  return data;
}
