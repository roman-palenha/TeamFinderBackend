import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, PlusCircle, Users, Gamepad2, TrendingUp, RefreshCw } from 'lucide-react';

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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
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
      game: currentUser?.preferredGame || '',
      platform: currentUser?.gamingPlatform || '',
      skillLevel: currentUser?.skillLevel || ''
    });
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Find Teams</h1>
        <Button asChild>
          <Link to="/teams/create" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Filters Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Input
                  id="game"
                  name="game"
                  value={filters.game}
                  onChange={handleInputChange}
                  placeholder="Any game"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={filters.platform} 
                  onValueChange={(value) => handleSelectChange('platform', value)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Any platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any platform</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="PlayStation">PlayStation</SelectItem>
                    <SelectItem value="Xbox">Xbox</SelectItem>
                    <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select 
                  value={filters.skillLevel} 
                  onValueChange={(value) => handleSelectChange('skillLevel', value)}
                >
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Any skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any skill level</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={applyUserPreferences}
              >
                <Users className="mr-2 h-4 w-4" />
                Use My Preferences
              </Button>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-center" 
                onClick={clearFilters}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Teams Grid */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : teams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No teams found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  No teams match your current filters. Try adjusting your search criteria or create your own team!
                </p>
                <Button asChild>
                  <Link to="/teams/create">Create a Team</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map(team => (
                <Card key={team.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{team.name}</CardTitle>
                      {!team.isOpen && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Gamepad2 className="h-4 w-4 mr-1" />
                      <span>{team.game}</span>
                      <span className="mx-2">•</span>
                      <span>{team.platform}</span>
                      <span className="mx-2">•</span>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>{team.skillLevel}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Team Size:</span>
                        <Badge variant="outline" className="font-normal">
                          {team.currentPlayers} / {team.maxPlayers}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to={`/teams/${team.id}`}>View Team</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;