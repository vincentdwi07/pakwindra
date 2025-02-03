import "../user.css";
// import { Link } from 'react-router-dom';
import Link from 'next/link';


export default function UserRegister() {
  return (
    <>
      <div className="user-login">
        <div className="user-login-left-side">
          {/* <img style={{ zIndex: "1" }} src="user-login-decor.svg" alt="" /> */}
            <h1 style={{ fontSize: "3rem" }}>CODE MENTOR</h1>
            <div className="box">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div className="user-login-right-side">
          <img className="mb-3" src="user-login-logo.svg" alt="" />
          <h2 className="fw-bold">Create Your Account</h2>
          <p className="mb-5" style={{ fontSize: "14px" }}>Please enter your Details</p>
          <form className="user-login-form" style={{ width: "80%" }} action="">
            <div className="d-flex flex-column mb-3 ">
              <label htmlFor="email" className="pb-1">Name</label>
              <input type="text" className="name-input-user" id="name" placeholder="Input your full name"/>
            </div>
            <div className="d-flex flex-column mb-3 ">
              <label htmlFor="email" className="pb-1">Email</label>
              <input type="text" className="email-input-user" id="email" placeholder="Input your e-mail"/>
            </div>
            <div className="d-flex w-100 flex-column mb-5">
              <div className="d-flex w-100 justify-content-between">
                <label htmlFor="">Password</label>
              </div>
              <input type="password" className="password-input-user" placeholder="Input your password" id="password"/>
            </div>
            <button type="submit" className="w-100 outline-0 border-0 p-2 rounded-2 bg-dark text-light fw-bold">REGISTER</button>
          </form>
          <p className="mt-4">Already have account?<span><Link href="/login">Login</Link></span></p>
        </div>
      </div>
    </>
  );
}
