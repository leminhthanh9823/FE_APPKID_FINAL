import CardGroup, { CardProps } from '../components/CardGroup';
import UserLineChart from '../components/UserLineChart';
import useFetchDashboard from '../hooks/useFetchDashboard';

const Dashboard = () => {
  const {
    cardData,
    monthlyUsers,
    topByScore,
    topByPassCount,
    error,
  } = useFetchDashboard();

  const cards: CardProps[] = cardData
    ? [
        {
          title: 'Total Students',
          value: cardData.totalStudents,
          icon: '🎓',
          color: '#4e73df',
        },
        {
          title: 'Total Readings',
          value: cardData.totalReadings,
          icon: '📚',
          color: '#1cc88a',
        },
        {
          title: 'Total E-books',
          value: cardData.totalELibraries,
          icon: '💻',
          color: '#36b9cc',
        },
        {
          title: 'Total Teachers',
          value: cardData.totalTeachers,
          icon: '👨‍🏫',
          color: '#f6c23e',
        },
        {
          title: 'Total Parents',
          value: cardData.totalParents,
          icon: '👨‍👩‍👧‍👦',
          color: '#e74a3b',
        },
        {
          title: 'Total Feedbacks',
          value: cardData.totalFeedbacks,
          icon: '💬',
          color: '#858796',
        },
      ]
    : [];

  return (
    <main className="main" id="main">
      <h1 style={{ marginBottom: 20 }}>System Statistics</h1>

      {/* Card group */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 0 20px #8c98a4',
          borderRadius: '12px',
          marginBottom: '30px',
        }}
      >
        <CardGroup cards={cards} />
      </div>

      {/* Line chart */}
      <div
        style={{
          padding: '40px',
          paddingBottom: '80px',
          backgroundColor: '#fff',
          boxShadow: '0 0 20px #8c98a4',
          borderRadius: '12px',
          marginBottom: '30px',
        }}
      >
        <UserLineChart data={monthlyUsers} />
      </div>

      {/* Leaderboards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          marginBottom: '30px',
        }}
      >
        {/* Leaderboard 1: Score */}
        <LeaderboardBox
          title="🏆 Top 5 users with the highest total scores"
          data={topByScore}
          columns={['Tên', 'Parent', 'Total Score']}
          keys={['student_name', 'parent_name', 'total_score']}
        />

        {/* Leaderboard 2: Pass count */}
        <LeaderboardBox
          title="📈 Top 5 users with the most passes"
          data={topByPassCount}
          columns={['Tên', 'Parent', 'Total pass']}
          keys={['student_name', 'parent_name', 'pass_count']}
        />
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
      )}
    </main>
  );
};

// Leaderboard component for reusability
const LeaderboardBox = ({
  title,
  data,
  columns,
  keys,
}: {
  title: string;
  data: any[];
  columns: string[];
  keys: string[];
}) => (
  <div
    style={{
      flex: 1,
      minWidth: '300px',
      backgroundColor: '#fff',
      boxShadow: '0 0 20px #8c98a4',
      borderRadius: 12,
      padding: 20,
      overflowX: 'auto',
    }}
  >
    <h2 style={{ marginBottom: '10px' }}>{title}</h2>
    <div style={{ width: '100%' }}>
      <table
        style={{
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
        }}
      >
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '50%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={cellStyle}>#</th>
            {columns.map((col) => (
              <th key={col} style={cellStyle}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((user: any, index: number) => (
            <tr key={user.userId ?? index}>
              <td style={cellStyle}>{index + 1}</td>
              {keys.map((key) => (
                <td key={key + '-' + (user.userId ?? index)} style={cellStyle}>
                  {user[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

export default Dashboard;
