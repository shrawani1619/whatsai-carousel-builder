import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bot, 
  MessageSquare, 
  Brain, 
  Clock, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BotFormData {
  projectName: string;
  whatsappApiKey: string;
  phoneNumber: string;
  verifiedSenderId: string;
  aiProvider: string;
  welcomeMessage: string;
  useCases: string[];
  template: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  fallbackMessage: string;
}

const initialFormData: BotFormData = {
  projectName: '',
  whatsappApiKey: '',
  phoneNumber: '',
  verifiedSenderId: '',
  aiProvider: '',
  welcomeMessage: '',
  useCases: [],
  template: '',
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  fallbackMessage: ''
};

const steps = [
  { id: 1, title: 'Project Name', description: 'Give your bot a name' },
  { id: 2, title: 'WhatsApp Setup', description: 'Configure API credentials' },
  { id: 3, title: 'AI Provider', description: 'Choose your AI engine' },
  { id: 4, title: 'Welcome Message', description: 'Set the greeting message' },
  { id: 5, title: 'Use Cases', description: 'Define bot purpose' },
  { id: 6, title: 'Template', description: 'Choose a template' },
  { id: 7, title: 'Working Hours', description: 'Set availability' },
  { id: 8, title: 'Fallback Message', description: 'Default responses' },
  { id: 9, title: 'Review & Launch', description: 'Finalize your bot' }
];

const templates = [
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Handle customer inquiries and support tickets',
    icon: '🎧'
  },
  {
    id: 'lead-generation',
    name: 'Lead Generation',
    description: 'Qualify leads and collect contact information',
    icon: '📈'
  },
  {
    id: 'faq-bot',
    name: 'FAQ Bot',
    description: 'Answer frequently asked questions',
    icon: '❓'
  },
  {
    id: 'appointment-scheduler',
    name: 'Appointment Scheduler',
    description: 'Book and manage appointments',
    icon: '📅'
  }
];

const useCaseOptions = [
  { id: 'support', label: 'Customer Support' },
  { id: 'faq', label: 'FAQ' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'feedback', label: 'Feedback Collection' },
  { id: 'scheduling', label: 'Appointment Scheduling' },
  { id: 'sales', label: 'Sales & Lead Generation' }
];

export default function CreateBot() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BotFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (field: keyof BotFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseCaseChange = (caseId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      useCases: checked 
        ? [...prev.useCases, caseId]
        : prev.useCases.filter(id => id !== caseId)
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName.trim() !== '';
      case 2:
        return formData.whatsappApiKey && formData.phoneNumber && formData.verifiedSenderId;
      case 3:
        return formData.aiProvider !== '';
      case 4:
        return formData.welcomeMessage.trim() !== '';
      case 5:
        return formData.useCases.length > 0;
      case 6:
        return formData.template !== '';
      case 7:
        return true; // Working hours have defaults
      case 8:
        return formData.fallbackMessage.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bot created successfully!",
        description: "Your chatbot is now being deployed. This may take a few minutes.",
      });
      
      navigate('/dashboard/bots');
    } catch (error) {
      toast({
        title: "Failed to create bot",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Name Your Chatbot</h2>
              <p className="text-muted-foreground">Choose a descriptive name for your AI assistant</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Customer Support Bot"
                value={formData.projectName}
                onChange={(e) => updateFormData('projectName', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">WhatsApp Configuration</h2>
              <p className="text-muted-foreground">Connect your WhatsApp Business API</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">WhatsApp API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your WhatsApp Business API key"
                  value={formData.whatsappApiKey}
                  onChange={(e) => updateFormData('whatsappApiKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderId">Verified Sender ID</Label>
                <Input
                  id="senderId"
                  placeholder="Your business name"
                  value={formData.verifiedSenderId}
                  onChange={(e) => updateFormData('verifiedSenderId', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">AI Provider</h2>
              <p className="text-muted-foreground">Choose your preferred AI engine</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiProvider">AI Provider</Label>
              <Select onValueChange={(value) => updateFormData('aiProvider', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Welcome Message</h2>
              <p className="text-muted-foreground">Set the first message users will see</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                placeholder="Hi! I'm your AI assistant. How can I help you today?"
                value={formData.welcomeMessage}
                onChange={(e) => updateFormData('welcomeMessage', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Use Cases</h2>
              <p className="text-muted-foreground">What will your bot be used for?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useCaseOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={option.id}
                    checked={formData.useCases.includes(option.id)}
                    onCheckedChange={(checked) => handleUseCaseChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Choose Template</h2>
              <p className="text-muted-foreground">Select a pre-built template to get started faster</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-custom-lg ${
                    formData.template === template.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateFormData('template', template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h3 className="font-medium text-card-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Working Hours</h2>
              <p className="text-muted-foreground">When should your bot be active?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => updateFormData('workingHoursStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => updateFormData('workingHoursEnd', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Fallback Message</h2>
              <p className="text-muted-foreground">What should the bot say when it doesn't understand?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fallbackMessage">Fallback Message</Label>
              <Textarea
                id="fallbackMessage"
                placeholder="I'm sorry, I didn't understand that. Could you please rephrase your question?"
                value={formData.fallbackMessage}
                onChange={(e) => updateFormData('fallbackMessage', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Review & Launch</h2>
              <p className="text-muted-foreground">Review your configuration and launch your bot</p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bot Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Project Name:</strong> {formData.projectName}
                    </div>
                    <div>
                      <strong>AI Provider:</strong> {formData.aiProvider}
                    </div>
                    <div>
                      <strong>Phone Number:</strong> {formData.phoneNumber}
                    </div>
                    <div>
                      <strong>Working Hours:</strong> {formData.workingHoursStart} - {formData.workingHoursEnd}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Use Cases:</strong> {formData.useCases.join(', ')}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Welcome Message:</strong> {formData.welcomeMessage}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/bots')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bots
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Chatbot</h1>
            <p className="text-muted-foreground">Step {currentStep} of {steps.length}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{steps[currentStep - 1]?.title}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardContent className="p-8">
          <div className="animate-slide-in-right">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep === steps.length ? (
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating Bot...' : 'Launch Bot'}
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={!canProceedToNext()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}