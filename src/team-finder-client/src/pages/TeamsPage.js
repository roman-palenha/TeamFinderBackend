import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getTeams } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';

const TeamsPage = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    game: '',
    platform: '',
    skillLevel: ''
  });
  
  useEffect(() => {
    fetchTeams();
  }, [filters]);
  
  const fetchTeams = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await getTeams(filters);
      
      if (result.success) {
        setTeams(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      game: '',
      platform: '',
      skillLevel: ''
    });
  };
  
  const applyUserPreferences = () => {
    setFilters({
      game: currentUser.preferredGame || '',
      platform: currentUser.gamingPlatform || '',
      skillLevel: currentUser.skillLevel || ''
    });
  };
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Find Teams</h1>
        <Link to="/teams/create">
          <Button variant="primary">Create Team</Button>
        </Link>
      </div>
      
      <Row>
        <Col md={3}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Game</Form.Label>
                  <Form.Control
                    type="text"
                    name="game"
                    value={filters.game}
                    onChange={handleFilterChange}
                    placeholder="Any game"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    name="platform"
                    value={filters.platform}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any platform</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Skill Level</Form.Label>
                  <Form.Select
                    name="skillLevel"
                    value={filters.skillLevel}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any skill level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Pro">Pro</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" onClick={applyUserPreferences}>
                    Use My Preferences
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          {isLoading ? (
            <p>Loading teams...</p>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : teams.length === 0 ? (
            <Alert variant="info">
              No teams found matching your criteria. Try adjusting your filters or create your own team!
            </Alert>
          ) : (
            <Row xs={1} md={2} className="g-4">
              {teams.map(team => (
                <Col key={team.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title>{team.name}</Card.Title>
                        {!team.isOpen && (
                          <Badge bg="secondary">Closed</Badge>
                        )}
                      </div>
                      
                      <Card.Subtitle className="mb-2 text-muted">
                        {team.game} • {team.platform} • {team.skillLevel}
                      </Card.Subtitle>
                      
                      <ListGroup variant="flush" className="mb-3">
                        <ListGroup.Item className="px-0">
                          <div className="d-flex justify-content-between">
                            <span>Team Size:</span>
                            <span>{team.currentPlayers} / {team.maxPlayers}</span>
                          </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <div className="d-flex justify-content-between">
                            <span>Created:</span>
                            <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                          </div>
                        </ListGroup.Item>
                      </ListGroup>
                      
                      <div className="d-grid">
                        <Link to={`/teams/${team.id}`}>
                          <Button variant="primary" className="w-100">View Team</Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TeamsPage;
