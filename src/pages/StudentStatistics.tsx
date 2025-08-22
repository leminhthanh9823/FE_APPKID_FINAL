import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useFetchStudentStatistics from '@/hooks/useFetchStudentStatistics';
import { ROUTES } from '@/routers/routes';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentStatistics: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const [type, setType] = useState<'week' | 'month' | 'year'>('week');
  const [currentPeriod, setCurrentPeriod] = useState(0); // 0 = current, -1 = previous, 1 = next

  const {
    data: stats,
    loading,
    error,
  } = useFetchStudentStatistics({
    studentId: studentId || '',
    type,
    currentPeriod,
  });

  const handlePreviousPeriod = () => {
    setCurrentPeriod((prev) => prev - 1);
  };

  const handleNextPeriod = () => {
    setCurrentPeriod((prev) => prev + 1);
  };

  const getPeriodLabel = () => {
    const now = new Date();
    let label = '';

    if (type === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + currentPeriod * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      label = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    } else if (type === 'month') {
      const targetMonth = new Date(
        now.getFullYear(),
        now.getMonth() + currentPeriod,
        1
      );
      label = targetMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } else if (type === 'year') {
      const targetYear = now.getFullYear() + currentPeriod;
      label = targetYear.toString();
    }

    return label;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
        ticks: {
          color: '#666',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  const defaultChartData = {
    labels: [],
    datasets: [
      {
        label: 'Minutes',
        data: [],
        backgroundColor: '#4fc3f7',
        borderColor: '#29b6f6',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <main className="main" id="main">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '400px' }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main" id="main">
        <div className="alert alert-danger">{error}</div>
      </main>
    );
  }

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Student Statistics</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href={ROUTES.DASHBOARD}>CMS</a>
            </li>
            <li className="breadcrumb-item">
              <a href={ROUTES.STUDENT}>Students</a>
            </li>
            <li className="breadcrumb-item active">Statistics</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-12">
          <div
            className="card"
            style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6' }}
          >
            <div className="card-body">
              {/* Header with avatar and time filters */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <i className="bi bi-person-fill text-white fs-4"></i>
                  </div>
                  <div>
                    <h5 className="mb-0">Student Statistics</h5>
                    <small className="text-muted">ID: {studentId}</small>
                  </div>
                </div>

                {/* Time period controls with navigation */}
                <div className="d-flex align-items-center gap-3">
                  {/* Period navigation */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handlePreviousPeriod}
                      title="Previous period"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>

                    <div className="text-center" style={{ minWidth: '200px' }}>
                      <small className="text-muted d-block">
                        {getPeriodLabel()}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleNextPeriod}
                      title="Next period"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>

                  {/* Time period buttons */}
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${type === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        setType('week');
                        setCurrentPeriod(0);
                      }}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      className={`btn ${type === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        setType('month');
                        setCurrentPeriod(0);
                      }}
                    >
                      Month
                    </button>
                    <button
                      type="button"
                      className={`btn ${type === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        setType('year');
                        setCurrentPeriod(0);
                      }}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Statistics Section */}
                <div className="col-md-4">
                  <div
                    className="bg-light rounded p-4 h-100"
                    style={{ border: '1px solid #dee2e6' }}
                  >
                    {/* Lessons */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-book text-white"></i>
                        </div>
                        <span className="text-muted">Lessons</span>
                      </div>
                      <h2
                        className="text-danger mb-0"
                        style={{ fontSize: '2.5rem', fontWeight: 'bold' }}
                      >
                        {stats?.totalLessons ?? 0}
                      </h2>
                    </div>

                    {/* Minutes */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-clock text-white"></i>
                        </div>
                        <span className="text-muted">Minutes</span>
                      </div>
                      <h2
                        className="text-success mb-0"
                        style={{ fontSize: '2.5rem', fontWeight: 'bold' }}
                      >
                        {stats?.totalMinutes ?? 0}
                      </h2>
                    </div>

                    {/* Hours */}
                    <div className="mb-0">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-hourglass text-white"></i>
                        </div>
                        <span className="text-muted">Hours</span>
                      </div>
                      <h2
                        className="text-warning mb-0"
                        style={{ fontSize: '2.5rem', fontWeight: 'bold' }}
                      >
                        {stats?.totalHours ?? 0}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="col-md-8">
                  <div
                    className="bg-light rounded p-4"
                    style={{ height: '400px', border: '1px solid #dee2e6' }}
                  >
                    <Bar
                      data={stats?.chartData || defaultChartData}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentStatistics;
