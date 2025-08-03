import { useState, useEffect, useCallback } from 'react';
import { saveModelConfig, uploadPdfs } from '@/utils/api';
import { getAccessToken } from '@/utils/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '@/config';

// Generate a random token string
const generateRandomToken = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bot, 
  MessageSquare, 
  Brain, 
  Clock, 
  CheckCircle,
  Sparkles,
  Upload,
  UploadCloud,
  Settings,
  Zap,
  X,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
// import { generateRandomToken } from '@/utils/tokenUtils';

interface BotFormData {
  projectName: string;
  projectDescription: string;
  whatsappAccessToken: string;
  phoneNumberId: string;
  phoneNumber: string;
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  uploadedFiles: File[];
  // WhatsApp Integration fields
  whatsappApiKey: string;
  whatsappNumberId: string;
  whatsappNumber: string;
  extraFeaturesEnabled: boolean;
}

const initialFormData: BotFormData = {
  projectName: '',
  projectDescription: '',
  whatsappAccessToken: '',
  phoneNumberId: '',
  phoneNumber: '',
  aiProvider: '',
  aiModel: '',
  aiApiKey: '',
  uploadedFiles: [],  
  // Initialize new fields
  whatsappApiKey: '',
  whatsappNumberId: '',
  whatsappNumber: '',
  extraFeaturesEnabled: false
};

const steps = [
  { id: 1, title: 'Project Details', description: 'Name and describe your bot' },
  { id: 2, title: 'WhatsApp Setup', description: 'Configure API credentials' },
  { id: 3, title: 'AI Provider', description: 'Choose your AI engine' },
  { id: 4, title: 'Upload Data', description: 'Upload your training data' },
  { id: 5, title: 'Extra Features', description: 'Configure additional features' },
  { id: 6, title: 'Review & Launch', description: 'Finalize your bot' }
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
  // State for form data and UI
  const [formData, setFormData] = useState<BotFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentCarousel, setCurrentCarousel] = useState(0);
  const [showWebhookPopup, setShowWebhookPopup] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhook');
  const [verifyToken, setVerifyToken] = useState('');
  const [providers, setProviders] = useState<string[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getAccessToken } = useAuth();
  
  // Function to update form data
  const updateFormData = (field: keyof BotFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Get botId from URL params and determine if we're in edit mode
  const { id: botId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(botId);
  
  // Generate a random token when the component mounts
  useEffect(() => {
    setVerifyToken(generateRandomToken());
  }, []);
  // Model type definition
  interface Model {
    id: string;
    name: string;
    provider?: string;
  }
  
  // State for models
  const [models, setModels] = useState<Record<string, Model[]>>({});

  // Fetch model configuration for a bot
  const fetchModelConfiguration = useCallback(async (botId: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.log('No authentication token available');
        return null;
      }

      const response = await fetch(getApiUrl(`model-config/${botId}`), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No configuration found for bot ${botId}`);
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        console.warn('Failed to fetch model configuration:', {
          status: response.status,
          error: errorData.detail || 'Unknown error'
        });
        return null;
      }

      const config = await response.json();
      console.log('Fetched model configuration:', config);
      return config;
    } catch (error) {
      console.error('Error fetching model configuration:', error);
      return null;
    }
  }, [getAccessToken]);

  // Load model configuration when in edit mode
  useEffect(() => {
    const loadModelConfig = async () => {
      if (isEditMode && botId) {
        const config = await fetchModelConfiguration(botId);
        if (config) {
          setFormData(prev => ({
            ...prev,
            aiProvider: config.provider || config.model_name || '',
            aiModel: config.model || config.sub_model_name || '',
            aiApiKey: config.api_key || ''
          }));
        }
      }
    };

    if (isEditMode) {
      loadModelConfig();
    }
  }, [isEditMode, botId, fetchModelConfiguration]);

  const fetchProviders = useCallback(async () => {
    try {
      console.log('Fetching providers from API...');
      
      // Make the request exactly like the curl command
      const response = await fetch(getApiUrl('model-config/models'), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        throw new Error('Invalid response format: expected an array');
      }
      
      if (data.length === 0) {
        console.warn('No providers found in the API response');
        setProviders([]);
        return [];
      }
      
      // Check if the response is an array of strings (provider names)
      if (typeof data[0] === 'string') {
        console.log('Received array of provider names:', data);
        setProviders(data);
        return data;
      }
      
      // If we get here, it's an array of objects
      console.log('First model structure:', JSON.stringify(data[0], null, 2));
      
      // Extract unique providers from array of objects
      const uniqueProviders = Array.from(
        new Set(
          data.map(model => 
            model.provider || model.model_provider || model.ai_provider || 
            (model.id ? model.id.split('/')[0] : null) || 'unknown'
          )
        )
      ).filter(Boolean).filter(p => p !== 'unknown');
      
      setProviders(uniqueProviders);
      return uniqueProviders;
    } catch (error) {
      setProviders([]);
      console.error('Error fetching AI providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI providers. Please try again later.',
        variant: 'destructive',
      });
      return [];
    }
  }, [getAccessToken, toast]);

  const fetchModels = useCallback(async (provider: string) => {
    if (!provider) return;
    
    setModelsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use the new submodels endpoint
      const response = await fetch(getApiUrl(`model-config/submodels/${provider}`), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submodels fetch error:', errorText);
        throw new Error(`Failed to fetch submodels: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw submodels API response for', provider, ':', JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of models');
      }
      
      // Transform the response to ensure it has the expected structure
      const modelData = data.map((model: any, index: number) => {
        // If model is a string, use it as both id and name
        if (typeof model === 'string') {
          return {
            id: model,  // Use the full model name as id
            name: model, // Use the full model name as display name
            provider: provider
          };
        }
        
        // Log each model's structure for debugging (for non-string models)
        console.log(`Model ${index + 1} structure:`, JSON.stringify(model, null, 2));
        
        // Fallback for object structure if needed
        const modelName = model.name || model.model_name || model.display_name || 
                         model.id || model.model_id || `model-${index + 1}`;
        
        return {
          id: model.id || model.model_id || `model-${index + 1}`,
          name: modelName,
          provider: provider
        };
      });
      
      console.log('Processed model data:', JSON.stringify(modelData, null, 2));
      
      setModels(prev => ({
        ...prev,
        [provider]: modelData
      }));
      
      return modelData;
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch models for ${provider}. Please try again later.`,
        variant: 'destructive',
      });
      return [];
    } finally {
      setModelsLoading(false);
    }
  }, [getAccessToken, toast]);

  const deleteModelConfig = async (modelId: string) => {
    if (!modelId) return;
    
    if (!window.confirm('Are you sure you want to delete this model configuration? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(getApiUrl(`model-config/${modelId}`), {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = `Failed to delete model configuration (${response.status})`;
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 404) {
          errorMessage = 'Model configuration not found. It may have already been deleted.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to delete this model configuration.';
        }

        throw new Error(errorMessage);
      }

      // Refresh the models list after successful deletion
      if (formData.aiProvider) {
        const updatedModels = { ...models };
        if (updatedModels[formData.aiProvider]) {
          updatedModels[formData.aiProvider] = updatedModels[formData.aiProvider]
            .filter(model => model.id !== modelId);
          setModels(updatedModels);
        }
      }

      toast({
        title: 'Success',
        description: 'Model configuration has been deleted successfully.',
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Failed to delete model configuration:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete model configuration. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setModelToDelete(null);
    }
  };

  // We'll fetch providers when the dropdown is opened instead of on mount

  // Fetch models when provider changes
  useEffect(() => {
    if (formData.aiProvider) {
      fetchModels(formData.aiProvider);
    }
  }, [formData.aiProvider, fetchModels]);

  // Fetch existing bot data if in edit mode
  useEffect(() => {
    const fetchBotData = async () => {
      if (!isEditMode || !botId) return;
      
      const token = getAccessToken();
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'You need to be logged in to edit a bot.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(getApiUrl(`bot/${botId}`), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bot data');
        }
        
        const botData = await response.json();
        // Update form data with fetched bot data
        setFormData({
          ...formData,
          projectName: botData.project_name || '',
          projectDescription: botData.description || '',
          // Add other fields from botData as needed
        });
      } catch (error) {
        console.error('Error fetching bot data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bot data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBotData();
  }, [isEditMode, botId, navigate]);
      
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You need to be logged in to create or update a bot.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const baseUrl = getApiUrl('bot');
      const url = isEditMode ? `${baseUrl}/${botId}` : `${baseUrl}/`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const requestBody = isEditMode ? {
        project_name: formData.projectName,
        description: formData.projectDescription || 'No description provided.'
      } : {
        project_name: formData.projectName,
        user_id: user.id,
        description: formData.projectDescription || 'No description provided.'
      };
      
      console.log('Sending request to:', url);
      console.log('Request method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let userMessage = 'An error occurred while saving the bot configuration.';
        const errorData = await response.json().catch(() => ({}));
        const errorDetail = errorData.detail || '';

        if (errorDetail.includes('user_id') && errorDetail.includes('not found')) {
          userMessage = 'Invalid user ID. Please log in again.';
        } else if (errorDetail.includes('not found') || errorDetail.includes('404')) {
          userMessage = 'Bot not found. It may have been deleted.';
        }
        
        throw new Error(userMessage);
      }
      
      const data = await response.json();
      
      // Upload PDFs if any files are selected
      if (formData.uploadedFiles.length > 0) {
        try {
          const uploadResponse = await uploadPdfs(
            formData.projectName,
            formData.uploadedFiles,
            getAccessToken
          );
          
          console.log('PDFs uploaded successfully:', uploadResponse);
          
          toast({
            title: 'Files uploaded',
            description: 'Your PDF files have been uploaded successfully.',
            variant: 'default',
          });
        } catch (error: any) {
          console.error('Error uploading PDFs:', error);
          toast({
            title: 'Warning',
            description: 'Bot was created, but there was an error uploading some files: ' + (error.message || 'Unknown error'),
            variant: 'destructive',
          });
        }
      }
      
      const result = await response.json();
      // Use the botId from URL params if result.id is not available
      const newBotId = result.id || botId;
      
      // Save model configuration if AI provider and model are selected
      if (formData.aiProvider && formData.aiModel && formData.aiApiKey) {
        try {
          const getToken = (): string | null => {
            // Directly access storage instead of using the async getAccessToken
            return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
          };
          
          await saveModelConfig(
            {
              model_name: formData.aiProvider,
              sub_model_name: formData.aiModel,
              api_key: formData.aiApiKey
            },
            newBotId,
            getToken
          );
          console.log('Model configuration saved successfully');
        } catch (error) {
          console.error('Error saving model configuration, but bot was created/updated:', error);
          // Continue even if model config fails, as the bot was created successfully
          toast({
            title: 'Bot saved with warning',
            description: 'Bot was created/updated, but there was an issue saving the model configuration. You can update it later in the bot settings.',
            variant: 'destructive',
          });
          setShowWebhookPopup(true);
          return;
        }
      }
      
      // Show the webhook configuration popup
      setShowWebhookPopup(true);
      // Navigate to bots list after showing the webhook popup
      setTimeout(() => {
        navigate('/dashboard/bots');
      }, 2000);
    } catch (error: any) {
      toast({
        title: isEditMode ? 'Failed to update bot' : 'Failed to create bot',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
    }
  };

  // Render the appropriate step content based on the current step
  const renderStepContent = (
    step: number, 
    formData: BotFormData, 
    updateFormData: (field: keyof BotFormData, value: any) => void,
    providers: string[],
    providersLoading: boolean,
    toast: any,
    models: Record<string, any>,
    modelsLoading: boolean,
    currentCarousel: number,
    setCurrentCarousel: (value: number) => void,
    fetchProviders: () => Promise<void>,
    fetchModels: (provider: string) => Promise<void>
  ) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Project Details</h2>
              <p className="text-muted-foreground">Give your chatbot a name and description</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Customer Support Bot"
                  value={formData.projectName}
                  onChange={(e) => updateFormData('projectName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe what your bot will do and how it will help users"
                  value={formData.projectDescription}
                  onChange={(e) => updateFormData('projectDescription', e.target.value)}
                  rows={4}
                />
              </div>
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
                <Label htmlFor="accessToken">WhatsApp Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="Enter your WhatsApp Access Token"
                  value={formData.whatsappAccessToken}
                  onChange={(e) => updateFormData('whatsappAccessToken', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input
                  id="phoneNumberId"
                  placeholder="Enter your Phone Number ID"
                  value={formData.phoneNumberId}
                  onChange={(e) => updateFormData('phoneNumberId', e.target.value)}
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">AI Provider</h2>
              <p className="text-muted-foreground">Configure your AI engine</p>
              {modelsLoading && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Loading available models...
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aiProvider">AI Provider</Label>
                  {providers.length > 0 && formData.aiProvider && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        updateFormData('aiProvider', '');
                        updateFormData('aiModel', '');
                      }}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear selection
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Select 
                    value={formData.aiProvider || ''}
                    disabled={providersLoading}
                    onOpenChange={async (open) => {
                      if (open && providers.length === 0) {
                        try {
                          await fetchProviders();
                        } catch (error) {
                          toast({
                            title: 'Error loading providers',
                            description: 'Failed to load AI providers. Please try again.',
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    onValueChange={(value) => {
                      if (value === 'clear') {
                        updateFormData('aiProvider', '');
                        updateFormData('aiModel', '');
                        return;
                      }
                      if (value) {
                        updateFormData('aiProvider', value);
                        updateFormData('aiModel', '');
                        fetchModels(value).catch(error => {
                          toast({
                            title: 'Error loading models',
                            description: `Failed to load models for ${value}. Please try again.`,
                            variant: 'destructive',
                          });
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        providersLoading ? 'Loading providers...' : 'Select AI provider'
                      }> 
                        {formData.aiProvider && (
                          <span className="capitalize">
                            {formData.aiProvider.replace(/-/g, ' ')}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {providers.length > 0 ? (
                        providers
                          .filter(provider => provider && provider.trim() !== '')
                          .map((provider) => (
                            <SelectItem 
                              key={provider} 
                              value={provider}
                              className="capitalize"
                            >
                              {provider.replace(/-/g, ' ')}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem 
                          value="no-providers" 
                          disabled
                        >
                          {modelsLoading ? 'Loading providers...' : 'No providers available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formData.aiProvider && (
                    <button
                      type="button"
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData('aiProvider', '');
                        updateFormData('aiModel', '');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {formData.aiProvider && (
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select 
                    value={formData.aiModel || undefined}
                    onValueChange={(value) => {
                      // Only update if we have a valid model ID
                      if (value && !["select-provider-first", "loading-models", "no-models-available"].includes(value)) {
                        updateFormData('aiModel', value);
                      }
                    }}
                    disabled={!formData.aiProvider || modelsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !formData.aiProvider ? 'Select a provider first' :
                          modelsLoading ? 'Loading models...' : 
                          'Select AI model'
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!formData.aiProvider ? (
                        <SelectItem 
                          value="select-provider-first" 
                          disabled
                        >
                          Please select a provider first
                        </SelectItem>
                      ) : modelsLoading ? (
                        <SelectItem 
                          value="loading-models" 
                          disabled
                        >
                          Loading models...
                        </SelectItem>
                      ) : (models[formData.aiProvider]?.filter(m => m?.id)?.length || 0) > 0 ? (
                        models[formData.aiProvider]
                          .filter(model => model?.id) // Ensure model has an ID
                          .map((model) => (
                          <SelectItem 
                            key={model.id} 
                            value={model.id}
                          >
                            {model.name || 'Unnamed Model'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem 
                          value="no-models-available" 
                          disabled
                        >
                          No models available for this provider
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formData.aiProvider && (
                <div className="space-y-2">
                  <Label htmlFor="aiApiKey">API Key</Label>
                  <Input
                    id="aiApiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={formData.aiApiKey}
                    onChange={(e) => updateFormData('aiApiKey', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Upload Your Data</h2>
              <p className="text-muted-foreground">Upload documents to train your AI chatbot</p>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      updateFormData('uploadedFiles', [...formData.uploadedFiles, ...files]);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="mt-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
              {formData.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({formData.uploadedFiles.length})</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = formData.uploadedFiles.filter((_, i) => i !== index);
                            updateFormData('uploadedFiles', newFiles);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Extra Features</h2>
              <p className="text-muted-foreground">Enable additional functionality</p>
            </div>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Allow Button</Label>
              </div>
                <Switch
                  checked={formData.extraFeaturesEnabled}
                  onCheckedChange={(checked) => updateFormData('extraFeaturesEnabled', checked)}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Review & Launch</h2>
              <p className="text-muted-foreground">Review your configuration and launch your bot</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Project Name:</strong> {formData.projectName}
                  </div>
                  <div>
                    <strong>AI Provider:</strong> {formData.aiProvider} ({formData.aiModel})
                  </div>
                  <div>
                    <strong>WhatsApp Access Token:</strong> {formData.whatsappAccessToken ? 'Set' : 'Not set'}
                  </div>
                  <div>
                    <strong>Phone Number ID:</strong> {formData.phoneNumberId}
                  </div>
                  <div>
                    <strong>WhatsApp Phone Number:</strong> {formData.phoneNumber}
                  </div>
                  <div>
                    <strong>API Key:</strong> {formData.aiApiKey ? 'Set' : 'Not set'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // This is the main return statement for the CreateBot component
  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
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
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? 'Edit Chatbot' : 'Create New Chatbot'}
            </h1>
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
            {renderStepContent(
              currentStep, 
              formData, 
              updateFormData,
              providers,
              providersLoading,
              toast,
              models,
              modelsLoading,
              currentCarousel,
              setCurrentCarousel,
              fetchProviders,
              fetchModels  // Add fetchModels here
            )}
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
            {loading ? (isEditMode ? 'Updating Bot...' : 'Creating Bot...') : (isEditMode ? 'Update Bot' : 'Launch Bot')}
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={!canProceedToNext()}
          >
            {currentStep === steps.length ? 'Finish' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>

      {/* Webhook Configuration Dialog */}
      <Dialog open={showWebhookPopup} onOpenChange={setShowWebhookPopup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-blue-500" />
              <span>Webhook Configuration</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast({
                        title: 'Copied!',
                        description: 'Webhook URL copied to clipboard',
                      });
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Set this as your webhook URL in the WhatsApp Business API settings
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="verifyToken"
                    value={verifyToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(verifyToken);
                      toast({
                        title: "Copied!",
                        description: "Verify token copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this token when verifying your webhook in WhatsApp Business API
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Instructions</h4>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2 list-decimal list-inside">
                <li>Go to WhatsApp Business API settings</li>
                <li>Set the webhook URL to: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{webhookUrl}</code></li>
                <li>Set the verify token to: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{verifyToken}</code></li>
                <li>Save the configuration</li>
              </ol>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={handleWebhookSubmit}>
                Done, I've configured the webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
