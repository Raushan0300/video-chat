import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Lobby from './components/Lobby'
import Room from './components/Room'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Lobby />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
