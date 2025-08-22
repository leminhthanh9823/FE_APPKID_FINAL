export interface ReportStats {
  totalLessons: number;
  totalMinutes: number;
  totalHours: number;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
}

export interface StudentReportProps {
  studentId: string;
  studentName?: string;
}
