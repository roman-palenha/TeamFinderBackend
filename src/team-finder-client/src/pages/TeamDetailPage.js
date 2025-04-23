import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTeamById, joinTeam, leaveTeam, deleteTeam } from '../services/teamService';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { joinTeamGroup, leaveTeamGroup } = useNotification();
  
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  
  // Check if current user is the team owner
  const isOwner = team && currentUser && team.ownerId === currentUser.id;
  
  // Check if current user is a member of this team
  const isMember = team && currentUser && team.members.some(member => member.userId === currentUser.id);
  
  // Check if team is full
  const isTeamFull = team && team.currentPlayers >= team.maxPlayers;
  
  useEffect(() => {
    fetchTeamDetails();
    
    // Join the team's notification group when component mounts
    if (id) {
      joinTeamGroup(id);
    }
    
    // Leave the team's notification group when component unmounts
    return () => {
      if (id) {
        leaveTeamGroup(id);
      }
    };
  }, [id]);
  
  const fetchTeamDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await getTeamById(id);
      
      if (result.success) {
        setTeam(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      setError('Failed to load team details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoinTeam = async () => {
    if (!currentUser) return;
    
    setIsActionInProgress(true);
    
    try {
      const joinRequest = {
        userId: currentUser.id,
        username: currentUser.username
      };
      
      const result = await joinTeam(id, joinRequest);
      
      if (result.success) {
        setTeam(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setError('Failed to join team. Please try again.');
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  const handleLeaveTeam = async () => {
    if (!currentUser) return;
    
    setIsActionInProgress(true);
    
    try {
      const result = await leaveTeam(id, currentUser.id);
      
      if (result.success) {
        fetchTeamDetails(); // Refresh team data
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      setError('Failed to leave team. Please try again.');
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  const handleDeleteTeam = async () => {
    if (!isOwner) return;
    
    setIsActionInProgress(true);
    
    try {
      const result = await deleteTeam(id, currentUser.id);
      
      if (result.success) {
        navigate('/teams');
      } else {
        setError(result.error);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  if (isLoading) {
    return <Container><p>Loading team details...</p></Container>;
  }
  
  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </Container>
    );
  }
  
  if (!team) {
    return (
      <Container>
        <Alert variant="warning">Team not found</Alert>
        <Button variant="primary" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">{team.name}</h1>
                <div>
                  {!team.isOpen && (
                    <Badge bg="secondary" className="me-2">Closed</Badge>
                  )}
                  <Badge bg="info">
                    {team.currentPlayers} / {team.maxPlayers} Players
                  </Badge>
                </div>
              </div>
              
              <div className="mb-4">
                <h5>Team Details</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Game:</span>
                    <span>{team.game}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Platform:</span>
                    <span>{team.platform}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Skill Level:</span>
                    <span>{team.skillLevel}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Created:</span>
                    <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
              
              <div>
                <h5>Team Actions</h5>
                {isOwner ? (
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isActionInProgress}
                  >
                    Delete Team
                  </Button>
                ) : isMember ? (
                  <Button 
                    variant="warning" 
                    onClick={handleLeaveTeam}
                    disabled={isActionInProgress}
                  >
                    Leave Team
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={handleJoinTeam}
                    disabled={isActionInProgress || !team.isOpen || isTeamFull}
                  >
                    {!team.isOpen ? 'Team is Closed' : isTeamFull ? 'Team is Full' : 'Join Team'}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Team Members ({team.currentPlayers})</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {team.members.map(member => (
                  <ListGroup.Item key={member.userId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div>{member.username}</div>
                        <small className="text-muted">
                          {member.role === 'Owner' ? 'Team Owner' : 
                            member.role === 'Captain' ? 'Team Captain' : 'Member'}
                        </small>
                      </div>
                      {member.userId === currentUser?.id && (
                        <Badge bg="primary">You</Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Team Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteTeam}
            disabled={isActionInProgress}
          >
            {isActionInProgress ? 'Deleting...' : 'Delete Team'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamDetailPage;
