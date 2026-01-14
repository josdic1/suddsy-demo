import { Outlet } from "react-router-dom";
import { NavBar } from "./components/NavBar.jsx";



export function App() {


  return (
    <>
 
  

          <header>
            <NavBar />
          </header>
          <main>
            <Outlet />
          </main>

    </>
  );
}