'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function UserNavbar() {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const pathname = usePathname();

    // Navigation items array
    const navItems = [
        {
            href: '/',
            icon: 'bi-house-door-fill',
            label: 'Home'
        },
        {
            href: '/dashboard',
            icon: 'bi-speedometer2',
            label: 'Dashboard'
        },
        {
            href: '/task',
            icon: 'bi-list-task',
            label: 'Task'
        }
    ];

    const toggleOffcanvas = () => {
        setShowOffcanvas(!showOffcanvas);
    };

    // Function to check if nav item is active
    const isActive = (href) => pathname === href;

    return(
        <>
            <div className="d-flex flex-column user-navbar d-none d-sm-flex shadow">
                <Link href="/" className="d-block p-3 link-body-emphasis d-flex justify-content-center align-items-center text-decoration-none border-bottom" title="Icon-only" data-bs-toggle="tooltip" data-bs-placement="right">
                    <img src="user-login-logo.svg" style={{ height: '30px' }} alt=""/>
                    <span className="visually-hidden">Icon-only</span>
                </Link>
                <ul className="nav nav-pills nav-flush d-flex flex-column mb-auto text-center">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <Link 
                                href={item.href} 
                                className={`nav-link py-3 border-bottom rounded-0 position-relative ${
                                    isActive(item.href) ? 'active bg-dark border-dark' : ''
                                }`}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                                title={item.label} 
                                data-bs-toggle="tooltip" 
                                data-bs-placement="right"
                            >
                                <h5 className="m-0 p-0">
                                    <i className={`bi ${item.icon} user-navbar-icon ${
                                        isActive(item.href) ? 'text-white' : ''
                                    }`}></i>
                                </h5>
                                <h6 className={`navbar-span m-0 ${
                                    isActive(item.href) ? 'text-white' : 'text-dark'
                                }`}>
                                    {item.label}
                                </h6>
                            </Link>
                        </li>
                    ))}
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

            {/* Mobile Navigation */}
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
                            <img width={'30px'} src="user-login-logo.svg" alt="" />
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setShowOffcanvas(false)}
                        ></button>
                    </div>
                    <div className="offcanvas-body p-0">
                        <ul className='p-0 d-flex flex-column' style={{ listStyleType: 'none' }}>
                            {navItems.map((item, index) => (
                                <li 
                                    key={index}
                                    className={`border-bottom-1 border border-top-0 border-start-0 border-end-0 p-3 ${
                                        isActive(item.href) ? 'bg-dark' : ''
                                    }`}
                                >
                                    <Link 
                                        href={item.href}
                                        className="text-decoration-none"
                                        onClick={() => setShowOffcanvas(false)}
                                    >
                                        <h5 className={isActive(item.href) ? 'text-light' : 'text-dark'}>
                                            <span>
                                                <i className={`bi ${item.icon} user-navbar-icon me-2 ${
                                                    isActive(item.href) ? 'text-light' : ''
                                                }`}></i>
                                            </span>
                                            {item.label}
                                        </h5>
                                    </Link>
                                </li>
                            ))}
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
    );
}