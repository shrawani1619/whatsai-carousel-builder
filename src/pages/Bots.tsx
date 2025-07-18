import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MessageSquare,
  Calendar,
  Activity
} from 'lucide-react';

interface BotData {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: string;
  messagesCount: number;
  useCase: string[];
  aiProvider: string;
}

export default function Bots() {
  const navigate = useNavigate();
  const [bots] = useState<BotData[]>([
    {
      id: '1',
      name: 'Customer Support Bot',
      description: 'Handles customer inquiries and support tickets',
      status: 'Active',
      createdAt: '2024-01-15',
      messagesCount: 1247,
      useCase: ['Support', 'FAQ'],
      aiProvider: 'OpenAI'
    },
    {
      id: '2',
      name: 'Lead Generation Bot',
      description: 'Qualifies leads and collects contact information',
      status: 'Active',
      createdAt: '2024-01-10',
      messagesCount: 856,
      useCase: ['Marketing', 'Lead Generation'],
      aiProvider: 'Gemini'
    },
    {
      id: '3',
      name: 'Appointment Scheduler',
      description: 'Books appointments and manages calendar',
      status: 'Draft',
      createdAt: '2024-01-20',
      messagesCount: 0,
      useCase: ['Scheduling'],
      aiProvider: 'OpenAI'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/20';
      case 'Inactive':
        return 'bg-muted text-muted-foreground border-muted';
      case 'Draft':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleEdit = (botId: string) => {
    // Navigate to edit bot (for now, navigate to create with ID)
    navigate(`/dashboard/bots/edit/${botId}`);
  };

  const handleDelete = (botId: string) => {
    // Handle delete logic
    console.log('Delete bot:', botId);
  };

  const toggleStatus = (botId: string) => {
    // Handle status toggle
    console.log('Toggle status for bot:', botId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Chatbots</h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI-powered WhatsApp chatbots
          </p>
        </div>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={() => navigate('/dashboard/bots/create')}
          className="mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bots</p>
                <p className="text-2xl font-bold text-card-foreground">{bots.length}</p>
              </div>
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {bots.filter(bot => bot.status === 'Active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {bots.reduce((total, bot) => total + bot.messagesCount, 0).toLocaleString()}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div className="space-y-4">
        {bots.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No chatbots yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI-powered WhatsApp chatbot to get started.
              </p>
              <Button 
                variant="gradient"
                onClick={() => navigate('/dashboard/bots/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bots.map((bot, index) => (
              <Card 
                key={bot.id} 
                className="hover:shadow-custom-lg transition-all duration-200 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {bot.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(bot.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{bot.messagesCount.toLocaleString()} messages</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      AI: {bot.aiProvider}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bot.useCase.map((use, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(bot.id)}
                      >
                        {bot.status === 'Active' ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(bot.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}