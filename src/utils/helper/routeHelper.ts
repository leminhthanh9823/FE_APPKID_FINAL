export const buildRoute = (route: string, params: Record<string, string | number>): string => {
  return route.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, paramName) => {
    const value = params[paramName];
    if (value === undefined || value === null) {
      return match; // Giữ nguyên nếu không tìm thấy giá trị
    }
    return String(value);
  });
};
