
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './pages/RegisterPage/Register'
import Login from './pages/LoginPage/Login'
import CreateBlog from './pages/CreateEditBlog/CreateBlog'
import Dashboard from './pages/Dashboard/api/Dashboard'
import DashboardLayout from './components/DashboardLayout'
import ViewBlog from './pages/ViewBlog/ViewBlog'
import EditBlog from './pages/EditBlog/EditPage'
import ViewUserBlog from './pages/ViewBlog/ViewUserBlogs'
import UserPage from './pages/Users/api/UserPage'
import Profile from './pages/Profile/api/Profile'
import { EditProfile } from './pages/Profile/EditProfile'
import { Toaster } from 'react-hot-toast'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import AdminPage from './pages/AdminDashboard/AdminPage'
import Notifications from './pages/Notification/Notification'
import { RequirePermission } from './auth/RequirePermission'
import ForbiddenPage from './components/Forbidden'
function App() {

  return (
    <>
     <Toaster position='top-right' />
     <BrowserRouter>
     
      <Routes>

      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>} />
      <Route path="/unauthorized" element={<ForbiddenPage/>}/>
     


      <Route element={<DashboardLayout />}>
             <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<RequirePermission />}>
            <Route path="/create-blog" element={<CreateBlog />} />
            <Route path="/view-blog/:id" element={<ViewBlog />} />
            <Route path="/edit-blog/:id" element={<EditBlog />} />
                        <Route path="/view-blogs" element={<ViewUserBlog mode="MyBlogs"/>} />

            <Route path="/users" element={<UserPage />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/edit-profile" element={<EditProfile/>} />

            <Route path="/profile/:id" element={<Profile/>} />


<Route path="/admin-dashboard" element={<AdminDashboard/>}/>
<Route path="/audit" element={<AdminPage/>}/>
<Route path="/notification" element={<Notifications/>}/>
            </Route>


      </Route>
      
      
      </Routes>
     


     </BrowserRouter>

    </>
  )
}

export default App
