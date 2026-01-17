import Layout from "../components/layouts/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Dashboard</h1>

        <p>You are logged in 🎉</p>
      </div>
    </Layout>
  );
};

export default Dashboard;
