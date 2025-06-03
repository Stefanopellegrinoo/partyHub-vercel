export interface Report {
  id: string
  partyId: string
  type: ReportType
  name: string
  description?: string
  createdAt: string
  createdBy: string
  format: ReportFormat
  url?: string
  status: ReportStatus
  data?: any
}

export type ReportType =
  | "sales_summary"
  | "sales_by_batch"
  | "sales_by_seller"
  | "sales_by_date"
  | "customer_list"
  | "ticket_list"

export type ReportFormat = "pdf" | "csv" | "excel"

export type ReportStatus = "pending" | "completed" | "failed"

export interface ReportCreate {
  partyId: string
  type: ReportType
  name: string
  description?: string
  format: ReportFormat
  dateRange?: {
    startDate: string
    endDate: string
  }
  filters?: Record<string, any>
}

export interface ReportFilters {
  type?: ReportType
  format?: ReportFormat
  status?: ReportStatus
  startDate?: string
  endDate?: string
}
