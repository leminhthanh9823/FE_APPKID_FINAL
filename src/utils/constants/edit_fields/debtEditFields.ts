import Field from "@/types/field";

export const DebtEditFields : Field[] = [
  { name: "entity_code", camelName: "entityCode", label: "Mã thực thể", type: "text", value: "", rowGroup: "1", colSpan: 6 },
  { name: "entity_name", camelName: "entityName", label: "Tên thực thể", type: "text", value: "", rowGroup: "1", colSpan: 6 },
  { name: "opening_debt", camelName: "openingDebt", label: "Nợ đầu kỳ", type: "number", value: 0, rowGroup: "2", colSpan: 6 },
  { name: "opening_credit", camelName: "openingCredit", label: "Có đầu kỳ", type: "number", value: 0, rowGroup: "2", colSpan: 6 },
  { name: "opening_receivable_payable", camelName: "openingReceivablePayable", label: "Phải thu/phải trả đầu kỳ", type: "number", value: 0, rowGroup: "3", colSpan: 6 },
  { name: "period_debt", camelName: "periodDebt", label: "Nợ phát sinh", type: "number", value: 0, rowGroup: "3", colSpan: 6 },
  { name: "period_credit", camelName: "periodCredit", label: "Có phát sinh", type: "number", value: 0, rowGroup: "4", colSpan: 6 },
  { name: "ending_receivable", camelName: "endingReceivable", label: "Phải thu cuối kỳ", type: "number", value: 0, rowGroup: "4", colSpan: 6 },
  { name: "ending_payable", camelName: "endingPayable", label: "Phải trả cuối kỳ", type: "number", value: 0, rowGroup: "5", colSpan: 6 },
  { name: "ending_receivable_payable", camelName: "endingReceivablePayable", label: "Phải thu/phải trả cuối kỳ", type: "number", value: 0, rowGroup: "5", colSpan: 6 },
  { name: "account", camelName: "account", label: "Tài khoản", type: "text", value: "", rowGroup: "6", colSpan: 12 },
];
