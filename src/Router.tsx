import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Home from './pages/home/Home'
import Game from './pages/game/Game'
import Admin from './pages/admin/Admin'

export default function Router() {
  return (
    <Routes>
      <Route path={'/'} element={<Home />} />
      <Route path={'/game'} element={<Game />} />
      <Route path={'/admin'} element={<Admin />} />
    </Routes>
  )
}
