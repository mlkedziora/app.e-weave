export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📊 Welcome Back!</h2>
      <div>
        <p>This is your team's central dashboard.</p>
        <ul className="list-disc ml-6">
          <li>Team progress overview</li>
          <li>Most used materials</li>
          <li>Upcoming project deadlines</li>
        </ul>
      </div>
    </div>
  );
}
