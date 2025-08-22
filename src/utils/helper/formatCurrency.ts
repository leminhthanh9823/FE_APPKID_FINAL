export const formatCurrency = (value: number | null | undefined) => 
  value ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value) : "";