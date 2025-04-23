import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTeams } from '../services/teamService';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { notifications } = useNotification();
  const [recommendedTeams, setRecommendedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRecommendedTeams = async () => {
      try {
        // Fetch teams that match the user's preferences
        const filters = {
          game: currentUser.preferredGame,
          platform: currentUser.gamingPlatform,
          skillLevel: currentUser.skillLevel
        };
        
        const result = await getTeams(filters);
        
        if (result.success) {
          setRecommendedTeams(result.data.slice(0, 3)); // Display top 3 teams
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Error fetching recommended teams:', error);
        setError('Failed to load recommended teams');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendedTeams();
  }, [currentUser]);
  
  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Welcome, {currentUser?.username}!</Card.Title>
              <Card.Text>
                Your gaming profile is set to <strong>{currentUser?.preferredGame}</strong> on <strong>{currentUser?.gamingPlatform}</strong> with a <strong>{currentUser?.skillLevel}</strong> skill level.
              </Card.Text>
              <Link to="/profile">
                <Button variant="outline-primary">Edit Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Quick Actions</Card.Title>
              <div className="mt-auto">
                <Link to="/teams/create">
                  <Button variant="primary" className="w-100 mb-2">Create Team</Button>
                </Link>
                <Link to="/teams">
                  <Button variant="outline-primary" className="w-100">Find Teams</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Recommended Teams</h5>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <p>Loading recommended teams...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : recommendedTeams.length === 0 ? (
                <Alert variant="info">
                  No teams found matching your preferences. Try adjusting your profile or creating your own team!
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {recommendedTeams.map(team => (
                    <ListGroup.Item key={team.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{team.name}</h6>
                        <div className="small text-muted">
                          {team.game} | {team.platform} | {team.skillLevel}
                        </div>
                        <div className="small">
                          {team.currentPlayers} / {team.maxPlayers} players
                        </div>
                      </div>
                      <Link to={`/teams/${team.id}`}>
                        <Button variant="outline-primary" size="sm">View</Button>
                      </Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <div className="text-center mt-3">
                <Link to="/teams">
                  <Button variant="outline-primary">View All Teams</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Recent Notifications</h5>
            </Card.Header>
            <Card.Body>
              {notifications.length === 0 ? (
                <p className="text-muted">No recent notifications</p>
              ) : (
                <ListGroup variant="flush">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between">
                        <span>{notification.message}</span>
                      </div>
                      <small className="text-muted">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
