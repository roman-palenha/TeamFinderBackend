import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    gamingPlatform: currentUser?.gamingPlatform || '',
    preferredGame: currentUser?.preferredGame || '',
    skillLevel: currentUser?.skillLevel || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (successMessage || submitError) {
      setSuccessMessage('');
      setSubmitError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.gamingPlatform) {
      newErrors.gamingPlatform = 'Please select your gaming platform';
    }
    
    if (!formData.preferredGame) {
      newErrors.preferredGame = 'Please enter your preferred game';
    }

    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Please select your skill level';
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
    
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
      console.error('Profile update error:', error);
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
              <h2 className="text-center mb-4">Your Profile</h2>
              
              {submitError && (
                <Alert variant="danger">{submitError}</Alert>
              )}
              
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Gaming Platform</Form.Label>
                  <Form.Select
                    name="gamingPlatform"
                    value={formData.gamingPlatform}
                    onChange={handleChange}
                    isInvalid={!!errors.gamingPlatform}
                  >
                    <option value="">Select Platform</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.gamingPlatform}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Game</Form.Label>
                  <Form.Control
                    type="text"
                    name="preferredGame"
                    value={formData.preferredGame}
                    onChange={handleChange}
                    isInvalid={!!errors.preferredGame}
                    placeholder="e.g., Valorant, League of Legends, CS:GO"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.preferredGame}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
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
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
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

export default ProfilePage;
