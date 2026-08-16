// Mirrors the server's own fallback (server/src/utils/defaultAvatar.js) so a
// missing avatar looks the same whether it's rendered from data the server
// already defaulted or from client-side mock/seed data that has none.
export function defaultAvatarUrl(name) {
  const trimmed = (name || "").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&background=4A5568&color=fff`;
}
