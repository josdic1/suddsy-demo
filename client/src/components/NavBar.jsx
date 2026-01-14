import { NavLink } from "react-router-dom";

export function NavBar() {


  return (
    <div className="navbar-container">


        <nav>
          <NavLink to="/">Home</NavLink>
          
          <button type='button' >Logout</button> 
        </nav>
    
    </div>
  );
}