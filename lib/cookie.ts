export const setSessionCookie = () => {
  // Configura una cookie simple para que el middleware sepa que hay sesión (dura 7 días)
  document.cookie = "has_session=true; path=/; max-age=604800; samesite=lax";
};

export const removeSessionCookie = () => {
  // Elimina la cookie seteando una fecha de expiración en el pasado
  document.cookie = "has_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};
