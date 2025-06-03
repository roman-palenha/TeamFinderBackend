import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTeams } from '../services/teamService';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertCircle,
  Bell,
  User,
  Users,
  PlusCircle,
  Gamepad2,
  Settings,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { notifications } = useNotification();
  const [recommendedTeams, setRecommendedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRecommendedTeams = async () => {
      try {
        const filters = {
          game: currentUser?.preferredGame || '',
          platform: currentUser?.gamingPlatform || '',
          skillLevel: currentUser?.skillLevel || ''
        };
        
        const result = await getTeams(filters);
        
        if (result.success) {
          setRecommendedTeams(result.data.slice(0, 3));
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
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* User Profile Card */}
        <Card className="md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>
              Your gaming profile and quick actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={currentUser?.username} />
                <AvatarFallback className="text-lg">{getInitials(currentUser?.username)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-grow">
                <h2 className="text-xl font-semibold">{currentUser?.username}</h2>
                <p className="text-muted-foreground">
                  <span className="inline-flex items-center">
                    <Gamepad2 className="h-4 w-4 mr-1" />
                    {currentUser?.preferredGame || 'No game set'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{currentUser?.gamingPlatform || 'No platform set'}</span>
                  <span className="mx-2">•</span>
                  <span>{currentUser?.skillLevel || 'No skill level set'}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex flex-wrap gap-2 justify-between pt-4">
            <Button asChild className="flex-1">
              <Link to="/teams/create" className="flex items-center justify-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Team
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/teams" className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                Find Teams
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Notifications Card */}
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </CardTitle>
              {notifications.length > 0 && (
                <Badge>{notifications.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="max-h-[200px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent notifications
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div key={index} className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recommended Teams */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended Teams</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/teams" className="flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : recommendedTeams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <h3 className="text-lg font-medium mb-2">No recommended teams found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try updating your profile preferences or create your own team.
              </p>
              <Button asChild>
                <Link to="/teams/create">Create a Team</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedTeams.map(team => (
              <Card key={team.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Gamepad2 className="h-3 w-3 mr-1" />
                    {team.game}
                    <span className="mx-1">•</span>
                    {team.platform}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skill Level:</span>
                    <span>{team.skillLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <span>{team.currentPlayers} / {team.maxPlayers}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/teams/${team.id}`}>View Team</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Activity & Stats */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="stats">Gaming Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Activity</CardTitle>
              <CardDescription>Track your recent team activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Your recent team activities will appear here.
              </p>
              
              {/* This section can be enhanced with actual activity data when available */}
              <div className="flex justify-center mt-4">
                <Button asChild>
                  <Link to="/teams" className="flex items-center">
                    Find Teams
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming Statistics</CardTitle>
              <CardDescription>Your gaming performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Gaming statistics integration coming soon!
              </p>
              
              {/* This section can be enhanced with actual stats when available */}
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <Link to="/profile" className="flex items-center">
                    Update Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;