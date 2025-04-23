import { Navbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const NavBar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { notifications } = useNotification();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">Gaming Team Finder</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/teams">Teams</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <NavDropdown 
                  title={
                    <>
                      Notifications
                      {notifications.length > 0 && (
                        <Badge pill bg="danger" className="ms-1">
                          {notifications.length}
                        </Badge>
                      )}
                    </>
                  } 
                  id="notifications-dropdown"
                >
                  {notifications.length === 0 ? (
                    <NavDropdown.Item disabled>No new notifications</NavDropdown.Item>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notification, index) => (
                        <NavDropdown.Item key={index}>
                          <small className="text-muted">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </small>
                          <div>{notification.message}</div>
                        </NavDropdown.Item>
                      ))}
                      {notifications.length > 5 && (
                        <NavDropdown.Item as={Link} to="/notifications">
                          View all {notifications.length} notifications
                        </NavDropdown.Item>
                      )}
                    </>
                  )}
                </NavDropdown>
                
                <NavDropdown title={currentUser?.username || 'User'} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
