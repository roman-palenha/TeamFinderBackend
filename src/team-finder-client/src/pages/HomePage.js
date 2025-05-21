import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Gamepad2, Trophy, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Perfect Gaming Team
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with players, join teams, and dominate the competition together!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/teams">Find Teams</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/teams/create">Create a Team</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Sign up and set your preferences including your favorite games, platform, and skill level.
              </p>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Find or Create Teams</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Browse available teams or create your own. Our matching system helps you find the perfect fit.
              </p>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Play Together</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Connect with your new teammates, communicate in real-time, and dominate your games!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Notifications</CardTitle>
              <CardDescription>
                Stay updated with instant notifications about team activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive immediate updates when someone joins your team, when you're invited to a team, or when important team events occur.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Smart Team Matching</CardTitle>
              <CardDescription>
                Find teams that match your skill level and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our intelligent matching system helps you find teams with similar skill levels, game preferences, and playing styles.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Create and manage your own gaming teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easily set up new teams, manage team members, and organize your team activities all in one place.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cross-Platform Support</CardTitle>
              <CardDescription>
                Connect with gamers across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Whether you play on PC, console, or mobile, find teammates who match your gaming platform preferences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center py-10 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to level up your gaming experience?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of gamers finding their perfect teams today.
        </p>
        {!isAuthenticated ? (
          <Button size="lg" asChild>
            <Link to="/register" className="inline-flex items-center">
              Join Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link to="/teams" className="inline-flex items-center">
              Find Teams
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomePage;