import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice';

const Navbar = () => {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

  return (
    <header className='h-14 bg-white border-b flex items-center justify-between px-6'>
        { /* Left */ }
        <div className='font-semibold text-lg'>HireLens</div>

        { /* Right */ }
        <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-600'>
                {user?.name} {user?.role}
            </span>

            <button
                onClick={() => dispatch(logout())}
                className='text-sm text-red-600 hover:underline'
            >
                Logout
            </button>
        </div>
    </header>
  )
}

export default Navbar
