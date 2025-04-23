import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="py-5">
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <h1 className="display-4 mb-4">Find Your Perfect Gaming Team</h1>
            <p className="lead">
              Connect with players, join teams, and dominate the competition together!
            </p>
            {!isAuthenticated && (
              <div className="mt-4">
                <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-primary" size="lg">
                  Login
                </Button>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-4">
                <Button as={Link} to="/teams" variant="primary" size="lg" className="me-3">
                  Find Teams
                </Button>
                <Button as={Link} to="/teams/create" variant="outline-primary" size="lg">
                  Create a Team
                </Button>
              </div>
            )}
          </Col>
        </Row>
        
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">How It Works</h2>
          </Col>
        </Row>
        
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-person-plus" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>Create Your Profile</Card.Title>
                <Card.Text>
                  Sign up and set your preferences including your favorite games, platform, and skill level.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>Find or Create Teams</Card.Title>
                <Card.Text>
                  Browse available teams or create your own. Our matching system helps you find the perfect fit.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-controller" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>Play Together</Card.Title>
                <Card.Text>
                  Connect with your new teammates, communicate in real-time, and dominate your games!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col className="text-center">
            <h3>Ready to level up your gaming experience?</h3>
            {!isAuthenticated && (
              <Button as={Link} to="/register" variant="primary" size="lg" className="mt-3">
                Join Now
              </Button>
            )}
            {isAuthenticated && (
              <Button as={Link} to="/teams" variant="primary" size="lg" className="mt-3">
                Find Teams
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
