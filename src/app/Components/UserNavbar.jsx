import Link from 'next/link';

export default function UserNavbar(){
    return(
        <>
            <div className="d-flex flex-column user-navbar shadow">
                <Link href="/" className="d-block p-3 link-body-emphasis d-flex justify-content-center align-items-center text-decoration-none border-bottom" title="Icon-only" data-bs-toggle="tooltip" data-bs-placement="right">
                    <img src="user-login-logo.svg" style={{ height: '30px' }} alt=""/>
                    <span className="visually-hidden">Icon-only</span>
                </Link>
                <ul className="nav nav-pills nav-flush d-flex flex-column mb-auto text-center">
                    <li className="nav-item">
                    <Link href="#" className="nav-link py-3 border-bottom rounded-0 position-relative" aria-current="page" title="Home" data-bs-toggle="tooltip" data-bs-placement="right">
                        <h5 className="m-0 p-0"><i className="bi bi-house-door-fill text-dark user-navbar-icon"></i></h5>
                        <h6 className="navbar-span m-0 text-dark">Home</h6>
                    </Link>
                    </li>
                    <li>
                    <Link href="#" className="nav-link py-3 border-bottom rounded-0 position-relative" title="Dashboard" data-bs-toggle="tooltip" data-bs-placement="right">
                        <h5 className="m-0 p-0"><i className="bi bi-speedometer2 text-dark user-navbar-icon"></i></h5>
                        <h6 className="navbar-span m-0 text-dark">Dashboard</h6>
                    </Link>
                    </li>
                    <li>
                    <Link href="#" className="nav-link py-3 border-bottom rounded-0 position-relative" title="Task" data-bs-toggle="tooltip" data-bs-placement="right">
                        <h5 className="m-0 p-0"><i className="bi bi-list-task text-dark user-navbar-icon"></i></h5>
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
        </>
    )
}