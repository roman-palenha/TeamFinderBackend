import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTeam } from '../services/teamService';

const CreateTeamPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    platform: '',
    skillLevel: '',
    maxPlayers: 5
  });
  
  const [userInfo, setUserInfo] = useState({
    id: null,
    loaded: false
  });
  
  useEffect(() => {
    if (currentUser) {
      let userId = currentUser.id;
      
      if (!userId) {
        userId = currentUser.userId || currentUser._id || currentUser.Id;
      }
      
      if (userId) {
        setUserInfo({
          id: userId,
          loaded: true
        });
        
        setFormData(prev => ({
          ...prev,
          game: currentUser.preferredGame || '',
          platform: currentUser.gamingPlatform || '',
          skillLevel: currentUser.skillLevel || ''
        }));
      }
    }
    
    if (!userInfo.id) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const userId = user.id || user.userId || user._id || user.Id;
          
          if (userId) {
            setUserInfo({
              id: userId,
              loaded: true
            });
            
            if (!formData.game && !formData.platform && !formData.skillLevel) {
              setFormData(prev => ({
                ...prev,
                game: user.preferredGame || '',
                platform: user.gamingPlatform || '',
                skillLevel: user.skillLevel || ''
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error reading user from localStorage:", error);
      }
    }
  }, [currentUser]);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }
    
    if (!formData.game.trim()) {
      newErrors.game = 'Game is required';
    }
    
    if (!formData.platform) {
      newErrors.platform = 'Platform is required';
    }
    
    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Skill level is required';
    }
    
    if (!formData.maxPlayers || formData.maxPlayers < 2) {
      newErrors.maxPlayers = 'Team must have at least 2 players';
    } else if (formData.maxPlayers > 20) {
      newErrors.maxPlayers = 'Team cannot have more than 20 players';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (!userInfo.id) {
      setSubmitError('User information is not available. Please try again or log out and log back in.');
      return;
    }
    
    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);
    
    try {
      const teamData = {
        name: formData.name,
        game: formData.game,
        platform: formData.platform,
        skillLevel: formData.skillLevel,
        maxPlayers: Number(formData.maxPlayers),
        ownerId: userInfo.id
      };
      
      console.log('Creating team with data:', teamData);
      
      const result = await createTeam(teamData);
      
      if (result.success) {
        navigate(`/teams/${result.data.id}`);
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      console.error('Team creation error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Create a New Team</h2>
              
              {!userInfo.loaded && (
                <Alert variant="info">
                  Loading user information...
                </Alert>
              )}
              
              {userInfo.loaded && !userInfo.id && (
                <Alert variant="warning">
                  Unable to determine your user ID. This may cause issues when creating a team.
                  Try logging out and logging back in.
                </Alert>
              )}
              
              {submitError && (
                <Alert variant="danger">{submitError}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Team Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter a team name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Game</Form.Label>
                  <Form.Control
                    type="text"
                    name="game"
                    value={formData.game}
                    onChange={handleChange}
                    isInvalid={!!errors.game}
                    placeholder="e.g., Valorant, League of Legends, CS:GO"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.game}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    isInvalid={!!errors.platform}
                  >
                    <option value="">Select Platform</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.platform}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Skill Level</Form.Label>
                  <Form.Select
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    isInvalid={!!errors.skillLevel}
                  >
                    <option value="">Select Skill Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Pro">Pro</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.skillLevel}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Maximum Players</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxPlayers"
                    min="2"
                    max="20"
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    isInvalid={!!errors.maxPlayers}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.maxPlayers}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Choose between 2-20 players for your team
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !userInfo.id}
                  >
                    {isSubmitting ? 'Creating Team...' : 'Create Team'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateTeamPage;