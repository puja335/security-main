import React from "react"
import AdminNavbar from "../components/admin/AdminNavbar"
import LeftSidebar from "../components/admin/LeftSidebar"
import Footer from "../components/footer/Footer"
import Content from "../pages/admin/Content"

const AdminLayout = () => {
  return (
    <>
      <div className='drawer flex lg:drawer-open'>
        <input
          id='left-sidebar-drawer'
          type='checkbox'
          className='drawer-toggle'
        />
        <LeftSidebar />
        <div className='flex flex-col flex-1 w-3/4'>
          <AdminNavbar />
          <Content />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default AdminLayout
