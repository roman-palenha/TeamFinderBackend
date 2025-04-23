import { useState } from 'react';
import { Button, Modal, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const [show, setShow] = useState(false);
  const { currentUser, token } = useAuth();
  
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  
  const getLocalStorageUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return `Error parsing user: ${e.message}`;
    }
  };
  
  return (
    <div className="position-fixed bottom-0 end-0 p-3">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleShow} 
        className="opacity-50"
      >
        Debug
      </Button>
      
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Debug Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Current User from Context</h5>
          <pre className="bg-light p-3 mb-3" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(currentUser, null, 2)}
          </pre>
          
          <h5>User from LocalStorage</h5>
          <pre className="bg-light p-3 mb-3" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(getLocalStorageUser(), null, 2)}
          </pre>
          
          <h5>Auth Token</h5>
          <pre className="bg-light p-3 mb-3" style={{ maxHeight: '50px', overflow: 'auto' }}>
            {token || 'No token found'}
          </pre>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear Storage & Reload
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DebugInfo;