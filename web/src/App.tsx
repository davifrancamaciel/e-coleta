import React from 'react'
import { ToastContainer } from 'react-toastify'

import './App.css'

import Routes from './routes'

function App () {
  return (
    <div>
      <Routes/>      
      <ToastContainer autoClose={3000} />
    </div>
  )
}

export default App
