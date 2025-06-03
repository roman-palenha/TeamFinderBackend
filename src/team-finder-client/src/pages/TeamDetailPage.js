import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTeamById, joinTeam, leaveTeam, deleteTeam } from '../services/teamService';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Users,
  Gamepad2,
  TrendingUp,
  UserPlus,
  UserMinus,
  Trash2,
  Calendar,
  Crown,
  Shield,
  User
} from 'lucide-react';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { joinTeamGroup, leaveTeamGroup } = useNotification();
  
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const isOwner = team && currentUser && team.ownerId === currentUser.username;
  

  const isMember = team && currentUser && team.members.some(member => member.userId === currentUser.username);
  

  const isTeamFull = team && team.currentPlayers >= team.maxPlayers;
  
  useEffect(() => {
    fetchTeamDetails();
    

    if (id) {
      joinTeamGroup(id);
    }
    

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
      const result = await leaveTeam(id, currentUser.username);
      
      if (result.success) {
        fetchTeamDetails();
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
      const result = await deleteTeam(id, currentUser.username);
      
      if (result.success) {
        navigate('/teams');
      } else {
        setError(result.error);
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setIsActionInProgress(false);
    }
  };
  

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'Captain':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };
  

  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="container py-8">
        <Alert className="mb-6">
          <AlertDescription>Team not found</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/teams')} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Teams
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Team Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{team.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Gamepad2 className="h-4 w-4 mr-1" />
                    <span>{team.game}</span>
                    <span className="mx-2">•</span>
                    <span>{team.platform}</span>
                    <span className="mx-2">•</span>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{team.skillLevel}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {!team.isOpen && (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {team.currentPlayers} / {team.maxPlayers}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Team Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center">
                    {team.isOpen ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Open for new members
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                        Closed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <Separator />
            
            <CardFooter className="py-4">
              {isOwner ? (
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Team</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the team "{team.name}"?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteTeam}
                        disabled={isActionInProgress}
                      >
                        {isActionInProgress ? 'Deleting...' : 'Delete Team'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : isMember ? (
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLeaveTeam}
                  disabled={isActionInProgress}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {isActionInProgress ? 'Leaving...' : 'Leave Team'}
                </Button>
              ) : (
                <Button 
                  onClick={handleJoinTeam}
                  disabled={isActionInProgress || !team.isOpen || isTeamFull}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {!team.isOpen 
                    ? 'Team is Closed' 
                    : isTeamFull 
                      ? 'Team is Full' 
                      : isActionInProgress 
                        ? 'Joining...' 
                        : 'Join Team'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Team Members */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members ({team.currentPlayers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map(member => (
                  <div key={member.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="" alt={member.username} />
                        <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.username}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {getRoleIcon(member.role)}
                          <span className="ml-1">
                            {member.role === 'Owner' ? 'Team Owner' : 
                              member.role === 'Captain' ? 'Team Captain' : 'Member'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {member.userId === currentUser?.username && (
                      <Badge>You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;