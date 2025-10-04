import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import App from './App.jsx'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'
import Home from './Home.jsx'
import './index.css'

const routes = [{
  path: '/',
  element: <App />,
},
{
  path: "/Home",
  element: <Home />,
},
{
  path: "/login",
  element: <Login />,
},
{
  path: "/signup",
  element: <SignUp />,
},

];

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
