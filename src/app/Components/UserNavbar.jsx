'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function UserNavbar(){
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const toggleOffcanvas = () => {
        setShowOffcanvas(!showOffcanvas);
    };


    return(
        <>
            <div className="d-flex flex-column user-navbar d-none d-sm-flex shadow">
                <Link href="/" className="d-block p-3 link-body-emphasis d-flex justify-content-center align-items-center text-decoration-none border-bottom" title="Icon-only" data-bs-toggle="tooltip" data-bs-placement="right">
                    <img src="user-login-logo.svg" style={{ height: '30px' }} alt=""/>
                    <span className="visually-hidden">Icon-only</span>
                </Link>
                <ul className="nav nav-pills nav-flush d-flex flex-column mb-auto text-center">
                    <li>
                        <Link href="/" className="nav-link py-3 border-bottom rounded-0 position-relative" aria-current="page" title="Home" data-bs-toggle="tooltip" data-bs-placement="right">
                            <h5 className="m-0 p-0"><i className="bi bi-house-door-fill user-navbar-icon"></i></h5>
                            <h6 className="navbar-span m-0 text-dark">Home</h6>
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link py-3 border-bottom rounded-0 position-relative" title="Dashboard" data-bs-toggle="tooltip" data-bs-placement="right">
                            <h5 className="m-0 p-0"><i className="bi bi-speedometer2 user-navbar-icon"></i></h5>
                            <h6 className="navbar-span m-0 text-dark">Dashboard</h6>
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link py-3 border-bottom rounded-0 position-relative" title="Task" data-bs-toggle="tooltip" data-bs-placement="right">
                            <h5 className="m-0 p-0"><i className="bi bi-list-task user-navbar-icon"></i></h5>
                            <h6 className="navbar-span m-0 text-dark">Task</h6>
                        </Link>
                    </li>
                </ul>
                <div className="dropdown border-top">
                    <Link href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://github.com/mdo.png" alt="mdo" width="24" height="24" className="rounded-circle" />
                    </Link>
                    <ul className="dropdown-menu w-100 text-small shadow">
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Sign out</a></li>
                    </ul>
                </div>
            </div>

            <div className="responsive-user-navbar d-flex d-sm-none">
                <button 
                    className="btn" 
                    type="button" 
                    onClick={toggleOffcanvas}
                >
                    <i className="bi bi-list"></i>
                </button>
            
                <div 
                    className={`offcanvas offcanvas-start ${showOffcanvas ? 'show' : ''}`} 
                    tabIndex="-1" 
                    id="offcanvasExample" 
                    aria-labelledby="offcanvasExampleLabel"
                    style={{ visibility: showOffcanvas ? 'visible' : 'hidden', width: '80vw' }}
                >
                    <div className="offcanvas-header border-bottom-1 border border-top-0 border-start-0 border-end-0">
                        <h5 className="offcanvas-title" id="offcanvasExampleLabel">
                            <img width={ '30px' } src="user-login-logo.svg" alt="" />
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setShowOffcanvas(false)}
                        ></button>
                    </div>
                    <div className="offcanvas-body p-0">
                        <ul className='p-0 d-flex flex-column' style={{ listStyleType: 'none' }}>
                            <li className='border-bottom-1 border border-top-0 border-start-0 border-end-0 p-3'>
                                <h5><span><i className="bi bi-house-door-fill user-navbar-icon me-2"></i></span>Home</h5>
                            </li>
                            <li className='border-bottom-1 border border-top-0 border-start-0 border-end-0 p-3'> 
                                <h5><span><i className="bi bi-house-door-fill user-navbar-icon me-2"></i></span>Home</h5>
                            </li>
                            <li className='border-bottom-1 border border-top-0 border-start-0 border-end-0 p-3'>
                                <h5><span><i className="bi bi-house-door-fill user-navbar-icon me-2"></i></span>Home</h5>
                            </li>
                        </ul>
                    </div>
                    <div className="dropdown border-top">
                        <Link href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="https://github.com/mdo.png" alt="mdo" width="24" height="24" className="rounded-circle" />
                        </Link>
                        <ul className="dropdown-menu w-100 text-small shadow">
                            <li><a className="dropdown-item" href="#">Profile</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a className="dropdown-item" href="#">Sign out</a></li>
                        </ul>
                    </div>
                </div>

                {showOffcanvas && (
                    <div 
                        className="offcanvas-backdrop fade show"
                        onClick={() => setShowOffcanvas(false)}
                    ></div>
                )}
        </div>

        </>
    )
}