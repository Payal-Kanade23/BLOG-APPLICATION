import ViewUserBlogs from "../../ViewBlog/ViewUserBlogs";

function Dashboard() {
    console.log("🔥 Dashboard rendered");
  return (
    <div>
      {/* Fixed Navbar */}

      <ViewUserBlogs mode="Dashboard" />
      {/* Main content */}
    </div>
  );
}

export default Dashboard;
