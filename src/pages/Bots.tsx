import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, removeAccessToken as signOut } from '@/utils/auth';
import { getApiUrl } from '@/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBots, getBot, saveBot, LocalBot } from '@/utils/localBots';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MessageSquare,
  Calendar,
  Activity,
  X,
  Upload,
  CheckCircle,
  Sparkles,
  Zap,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BotData {
  id: string;
  project_name: string;
  user_id: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  created_at: string;
  updated_at: string;
  verify_token: string;
  messagesCount?: number;
  useCase?: string[];
  aiProvider?: string;
  // For backward compatibility
  name?: string;
  createdAt?: string;
}

interface SidebarFormData {
  whatsappAccessToken: string;
  phoneNumberId: string;
  phoneNumber: string;
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  uploadedFiles: File[];
}

export default function Bots() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getAccessToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [formData, setFormData] = useState<SidebarFormData>({
    whatsappAccessToken: '',
    phoneNumberId: '',
    phoneNumber: '',
    aiProvider: '',
    aiModel: '',
    apiKey: '',
    uploadedFiles: []
  });
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{[key: string]: boolean}>({});
  const [botStatuses, setBotStatuses] = useState<{[key: string]: boolean}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<BotData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bots, setBots] = useState<BotData[]>([]);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiProviders, setAiProviders] = useState<{id: string, name: string}[]>([]);
  const [models, setModels] = useState<{[key: string]: string[]}>({});
  const [modelsLoading, setModelsLoading] = useState<{[key: string]: boolean}>({});
  const [providersLoading, setProvidersLoading] = useState(false);
  const [aiModels, setAiModels] = useState<{[key: string]: string[]}>({});
  const [isButtonAllowed, setIsButtonAllowed] = useState(false);
  const [isUpdatingButtonCondition, setIsUpdatingButtonCondition] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Fetch models for a specific AI provider
  const fetchModels = async (provider: string) => {
    try {
      console.log(`Fetching models for provider: ${provider}`);
      // You can add more providers and their respective model fetching logic here
      let models: string[] = [];
      
      // Example: Fetch models based on the provider
      if (provider === 'openai') {
        models = ['gpt-4', 'gpt-3.5-turbo', 'text-davinci-003'];
      } else if (provider === 'anthropic') {
        models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      } else if (provider === 'google') {
        models = ['gemini-pro', 'text-bison-001', 'chat-bison-001'];
      } else {
        models = ['default-model'];
      }
      
      setAvailableModels(models);
      
      // Auto-select the first model if none is selected
      if (formData.aiModel === '' && models.length > 0) {
        setFormData(prev => ({
          ...prev,
          aiModel: models[0]
        }));
      }
      
      return models;
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available models',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Fetch model configuration for a specific bot
  const fetchModelConfiguration = async (botId: string) => {
    try {
      console.log(`Fetching configuration for bot ID: ${botId}`);
      
      // Get bot from local storage
      const bot = getBot(botId);
      
      if (!bot) {
        console.log(`No bot found with ID: ${botId}`);
        return null;
      }
      
      if (!bot.config) {
        console.log(`No configuration found for bot ${botId}`);
        return null;
      }
      
      // Return normalized config
      const normalizedConfig = {
        ...bot.config,
        whatsapp_access_token: bot.config.whatsapp_access_token || '',
        phone_number_id: bot.config.phone_number_id || '',
        phone_number: bot.config.phone_number || '',
        provider: bot.config.model_name || '',
        model: bot.config.sub_model_name || '',
        api_key: bot.config.api_key || ''
      };
      
      console.log('Fetched bot configuration:', normalizedConfig);
      return normalizedConfig;
    } catch (error) {
      console.error('Error fetching model configuration:', error);
      return null;
    }
  };

  // Load model configuration when a bot is selected
  useEffect(() => {
    if (selectedBot) {
      console.log(`Loading configuration for bot: ${selectedBot.id}`);
      const loadModelConfig = async () => {
        try {
          const config = await fetchModelConfiguration(selectedBot.id);
          console.log('Fetched config:', config); // Debug log
          
          if (config) {
            console.log('Updating form with bot config:', config);
            // Map the API response to form fields
            const updatedFormData = {
              ...formData,
              whatsappAccessToken: config.whatsapp_access_token || '',
              phoneNumberId: config.phone_number_id || '',
              phoneNumber: config.phone_number || '',
              aiProvider: config.provider || config.model_name || '',
              aiModel: config.model || config.sub_model_name || '',
              apiKey: config.api_key || ''
            };
            
            console.log('Updating form data with:', updatedFormData);
            setFormData(updatedFormData);
            
            // If we have a provider, load its models
            if (updatedFormData.aiProvider) {
              fetchModels(updatedFormData.aiProvider);
            }
          } else {
            console.log('No configuration found, using empty form');
            // Reset form fields if no config found
            setFormData({
              ...formData,
              whatsappAccessToken: '',
              phoneNumberId: '',
              phoneNumber: '',
              aiProvider: '',
              aiModel: '',
              apiKey: '',
              uploadedFiles: []
            });
          }
        } catch (error) {
          console.error('Error loading model config:', error);
          // Show error to user if needed
          toast({
            title: 'Error',
            description: 'Failed to load bot configuration. Please try again.',
            variant: 'destructive',
          });
        }
      };
      
      loadModelConfig();
    } else {
      // Reset form when no bot is selected
      setFormData({
        whatsappAccessToken: '',
        phoneNumberId: '',
        phoneNumber: '',
        aiProvider: '',
        aiModel: '',
        apiKey: '',
        uploadedFiles: []
      });
    }
  }, [selectedBot]); // Add formData to dependencies if needed

  // Fetch AI providers and models from API
  useEffect(() => {
    const fetchAIProviders = async () => {
      setProvidersLoading(true);
      try {
        const response = await fetch(getApiUrl('model-config/models'), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyaXR6ejIwMDdAZ21haWwuY29tIiwidXNlcl9pZCI6IjI0YWE2NDBjLWQ3OWItNGZiZS05ODk2LTc4OGVlZTNkZThhMSIsImV4cCI6MTc1MzgxNDU0M30.OGbzK5BP_b2g8y3E8_7RJNieAHUG0rUlT3nXQ7HZI00'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch AI providers: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Handle array response (e.g., ["gemini", "gpt"])
        if (Array.isArray(data)) {
          const providers = data.map(provider => ({
            id: provider,
            name: provider.charAt(0).toUpperCase() + provider.slice(1) // Capitalize first letter
          }));
          setAiProviders(providers);
          
          // Initialize empty models object (or fetch models for each provider if needed)
          const modelsMap: {[key: string]: string[]} = {};
          data.forEach(provider => {
            modelsMap[provider] = [];
          });
          setModels(modelsMap);
        } else {
          // Handle object response (if the format changes in the future)
          const providers = Object.keys(data).map(provider => ({
            id: provider,
            name: provider.charAt(0).toUpperCase() + provider.slice(1)
          }));
          setAiProviders(providers);
          setModels(data);
          
          // Check if providers array is empty
          if (providers.length === 0) {
            throw new Error('No AI providers found');
          }
        }
        
      } catch (error: any) {
        console.error('Failed to fetch AI providers:', error);
        setAiProviders([]);
        setModels({});
        
        toast({
          title: 'Error',
          description: error.message || 'Failed to load AI providers. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchAIProviders();
  }, [getAccessToken]);

  // Function to fetch bots
  const fetchBots = async () => {

    if (!user) return [];
    setLoading(true);
    
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(
        `http://127.0.0.1:8000/bot/user/${user.id}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 401) {
        // Handle unauthorized (e.g., token expired)
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bots');
      }

      const data = await response.json();
      const botsList = Array.isArray(data) ? data : [];
      setBots(botsList);
      return botsList;
    } catch (error: any) {
      console.error('Error fetching bots:', error);
      toast({
        title: 'Failed to load bots',
        description: error.message || 'Please check your connection and try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch bots for the current user on mount
  useEffect(() => {
    const loadBots = async () => {
      if (!user) return;
      
      try {
        const token = await getAccessToken();
        if (!token) {
          console.warn('No access token found. User might not be authenticated.');
          return;
        }

        console.log('Fetching bots for user:', user.id);
        
        // First try the user-specific endpoint
        try {
          const response = await fetch(getApiUrl(`bot/user/${user.id}`), {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies for session-based auth if needed
          });
          
          console.log('Bots API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Received bots data:', data);
            // Handle both array and object responses
            const botsData = Array.isArray(data) ? data : (data.bots || data.data || []);
            setBots(botsData);
            return;
          }
          
          // If user-specific endpoint fails, try the general endpoint
          if (response.status === 401 || response.status === 403) {
            console.warn('Unauthorized access. Token might be invalid or expired.');
            // You might want to handle token refresh or logout here
            return;
          }
          
          const errorText = await response.text();
          console.warn('Failed to fetch bots from user endpoint, trying general endpoint. Error:', errorText);
          
          // Fallback to general endpoint
          const generalResponse = await fetch(getApiUrl('bot/'), {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (generalResponse.ok) {
            const data = await generalResponse.json();
            const botsData = Array.isArray(data) ? data : (data.bots || data.data || []);
            setBots(botsData);
            return;
          }
          
          const generalError = await generalResponse.text();
          console.warn('Failed to fetch bots from general endpoint:', generalError);
          
        } catch (error) {
          console.error('Error fetching bots from API:', error);
        }

        // Fall back to local storage if API call fails or no token
        const localBots = getBots();
        // Map LocalBot[] to BotData[] ensuring all required fields are present
        const bots = localBots.map(bot => ({
          ...bot,
          verify_token: bot.verify_token || '',
          updated_at: bot.updated_at || bot.created_at || new Date().toISOString(),
          created_at: bot.created_at || new Date().toISOString(),
          status: bot.status || 'Draft',
          description: bot.description || '',
          project_name: bot.project_name || 'Untitled Project',
          user_id: bot.user_id || 'unknown'
        } as BotData));
        
        setBots(bots);
      } catch (error) {
        console.error('Error loading bots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bots from local storage',
          variant: 'destructive',
        });
      }
    };
    
    loadBots();
  }, [user, toast]);

  // Save model configuration for a bot using local storage
  const saveModelConfiguration = async (botId: string) => {
    try {
      console.log('Saving model configuration for bot:', botId);
      
      // Get the current bot
      const bot = getBot(botId);
      if (!bot) {
        throw new Error(`Bot with ID ${botId} not found in local storage`);
      }
      
      // Prepare the updated configuration
      const updatedConfig = {
        ...bot.config,
        model_name: formData.aiProvider,
        sub_model_name: formData.aiModel,
        api_key: formData.apiKey,
        whatsapp_access_token: formData.whatsappAccessToken,
        phone_number_id: formData.phoneNumberId,
        phone_number: formData.phoneNumber
      };
      
      // Update the bot with the new configuration
      const updatedBot = {
        ...bot,
        config: updatedConfig,
        updated_at: new Date().toISOString()
      };
      
      // Save the updated bot to local storage
      saveBot(updatedBot);
      
      console.log('Model configuration saved successfully to local storage');
      return updatedConfig;
    } catch (error) {
      console.error('Error saving model configuration to local storage:', error);
      throw error;
    }
  };

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

  // Function to fetch bot details by ID from the API
  // Function to update bot details
  const updateBot = async (botId: string, updateData: { project_name: string; description: string }) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log(`Updating bot ID: ${botId}`, updateData);
      
      const response = await fetch(
        getApiUrl(`bot/${botId}`),
        {
          method: 'PUT',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData),
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        await signOut();
        navigate('/login');
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update bot');
      }

      const updatedBot = await response.json();
      
      // Update the bots list with the updated bot
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, ...updatedBot } : bot
        )
      );

      // If the updated bot is the currently selected one, update it
      if (selectedBot?.id === botId) {
        setSelectedBot(prev => prev ? { ...prev, ...updatedBot } : null);
      }

      toast({
        title: 'Success',
        description: 'Bot updated successfully',
      });

      return updatedBot;
    } catch (error: any) {
      console.error('Error updating bot:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update bot',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const fetchBotDetails = async (botId: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log(`Fetching details for bot ID: ${botId}`);
      
      // First try the user-specific endpoint
      let response = await fetch(
        getApiUrl(`bot/user/${botId}`),
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      console.log('Response status:', response.status);
      
      // If 404 or 405, try the general bot endpoint
      if (response.status === 404 || response.status === 405) {
        console.log('Trying general bot endpoint...');
        response = await fetch(
          getApiUrl('bot/'),
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );
      }
      
      if (response.status === 401) {
        // Clear any invalid token and redirect to login
        await signOut();
        navigate('/login');
        throw new Error('Your session has expired. Please log in again.');
      }

      if (response.status === 403) {
        // Handle 403 Forbidden - user doesn't have permission to access this bot
        console.error('Access denied - 403 Forbidden');
        // Try to get more details from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        
        // Check if we can get the bot from the local list first
        const localBot = bots.find(bot => bot.id === botId);
        if (localBot) {
          console.log('Using locally cached bot data due to permission issues');
          return localBot;
        }
        
        throw new Error(errorData.detail || 'You do not have permission to access this bot.');
      }

      if (!response.ok) {
        // If the API call fails, try to get the bot from the local list
        const localBot = bots.find(bot => bot.id === botId);
        if (localBot) {
          console.log('Using locally cached bot data due to API error');
          return localBot;
        }
        
        // Try to parse error details
        let errorMessage = 'Failed to fetch bot details';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let botData = await response.json();
      console.log('Fetched bot data:', botData);
      
      // Handle different response formats
      if (botData.data) {
        botData = botData.data;
      } else if (botData.bot) {
        botData = botData.bot;
      }
      
      return botData;
    } catch (error: any) {
      console.error('Error fetching bot details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load bot details',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleBotCardClick = async (bot: BotData) => {
    try {
      // First set the bot to show in the UI immediately
      setSelectedBot(bot);
      setSidebarOpen(true);
      
      // Then try to fetch the latest details from the API
      const updatedBot = await fetchBotDetails(bot.id);
      if (updatedBot) {
        setSelectedBot(updatedBot);
      }
    } catch (error) {
      console.error('Error handling bot selection:', error);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedBot(null);
    // Reset form data when closing
    setFormData({
      whatsappAccessToken: '',
      phoneNumberId: '',
      phoneNumber: '',
      aiProvider: '',
      aiModel: '',
      apiKey: '',
      uploadedFiles: []
    });
    setValidationResults({});
  };

  const updateFormData = (field: keyof SidebarFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation result when field is updated
    if (validationResults[field]) {
      setValidationResults(prev => ({ ...prev, [field]: false }));
    }
  };

  const updateButtonCondition = async (projectId: string, allowButton: boolean) => {
    if (!projectId) return;
    
    setIsUpdatingButtonCondition(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(getApiUrl(`condition/?project_id=${projectId}`), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_button: allowButton
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsButtonAllowed(allowButton);
      
      toast({
        title: 'Success',
        description: `Buttons are now ${allowButton ? 'enabled' : 'disabled'} for this bot`,
        variant: 'default',
      });
      
      return data;
    } catch (error) {
      console.error('Failed to update button condition:', error);
      toast({
        title: 'Error',
        description: 'Failed to update button settings',
        variant: 'destructive',
      });
      // Revert the toggle if the API call fails
      setIsButtonAllowed(!allowButton);
      throw error;
    } finally {
      setIsUpdatingButtonCondition(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateFormData('uploadedFiles', [...formData.uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = formData.uploadedFiles.filter((_, i) => i !== index);
    updateFormData('uploadedFiles', newFiles);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateField = async (field: keyof SidebarFormData) => {
    setIsValidating(true);
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isValid = formData[field] && formData[field].toString().length > 0;
    setValidationResults(prev => ({ ...prev, [field]: isValid }));
    setIsValidating(false);
  };

  const handleNext = async () => {
    // Validate all required fields
    const requiredFields = ['whatsappAccessToken', 'phoneNumberId', 'phoneNumber', 'aiProvider', 'aiModel', 'apiKey'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof SidebarFormData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBot) {
      toast({
        title: "No bot selected",
        description: "Please select a bot to configure.",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated. Please log in again.');
      }

      console.log('Updating bot with ID:', selectedBot.id);
      
      // First, update the basic bot information
      const response = await fetch(getApiUrl(`bot/${selectedBot.id}`), {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_name: selectedBot.name,
          description: selectedBot.description || 'No description provided.'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update bot:', { status: response.status, error: errorData });
        
        // Check for specific error types and show user-friendly messages
        let userMessage = 'Failed to update bot configuration';
        
        if (errorData.detail) {
          const errorDetail = errorData.detail.toString().toLowerCase();
          
          if (errorDetail.includes('unauthorized') || errorDetail.includes('401')) {
            userMessage = 'Authentication failed. Please log in again.';
          } else if (errorDetail.includes('not found') || errorDetail.includes('404')) {
            userMessage = 'Bot not found. It may have been deleted.';
          } else if (errorDetail.includes('forbidden') || errorDetail.includes('403')) {
            userMessage = 'You do not have permission to update this bot.';
          } else if (errorDetail.includes('validation') || errorDetail.includes('422')) {
            userMessage = 'Please check your input and try again.';
          } else {
            userMessage = 'An unexpected error occurred. Please try again.';
          }
        }
        
        throw new Error(userMessage);
      }
      
      // Save the model configuration with all the form data
      console.log('Saving model configuration...');
      try {
        await saveModelConfiguration(selectedBot.id);
        console.log('Model configuration saved successfully');
        
        // Refresh the bot list to show the updated configuration
        const updatedBots = await fetchBots();
        if (updatedBots) {
          setBots(updatedBots);
        }
        
        toast({
          title: 'Configuration saved',
          description: 'Your bot settings and configuration have been saved successfully.',
          variant: 'default',
        });
        
        // Close the sidebar after successful save
        handleCloseSidebar();
        
      } catch (error: any) {
        console.error('Error saving model configuration:', error);
        toast({
          title: 'Warning',
          description: 'Bot information was updated, but there was an error saving the model configuration: ' + (error.message || 'Unknown error'),
          variant: 'destructive',
        });
      }
      
    } catch (error: any) {
      console.error('Error in handleNext:', error);
      toast({
        title: "Failed to save configuration",
        description: error.message || "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleEdit = (botId: string) => {
    // Navigate to edit bot (for now, navigate to create with ID)
    navigate(`/dashboard/bots/edit/${botId}`);
  };

  // saveModelConfiguration function is already defined above

  const handleDelete = (bot: BotData) => {
    setBotToDelete(bot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (botToDelete) {
      setIsDeleting(true);
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          throw new Error('User not authenticated. Please log in again.');
        }

        const response = await fetch(getApiUrl(`bot/${botToDelete.id}`), {
          method: 'DELETE',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Check for specific error types and show user-friendly messages
          let userMessage = 'Failed to delete bot';
          
          if (errorData.detail) {
            const errorDetail = errorData.detail.toString().toLowerCase();
            
            if (errorDetail.includes('unauthorized') || errorDetail.includes('401')) {
              userMessage = 'Authentication failed. Please log in again.';
            } else if (errorDetail.includes('not found') || errorDetail.includes('404')) {
              userMessage = 'Bot not found. It may have already been deleted.';
            } else if (errorDetail.includes('forbidden') || errorDetail.includes('403')) {
              userMessage = 'You do not have permission to delete this bot.';
            } else {
              userMessage = 'An unexpected error occurred. Please try again.';
            }
          }
          
          throw new Error(userMessage);
        }
        
        // Remove bot from state
        setBots(prevBots => prevBots.filter(bot => bot.id !== botToDelete.id));
        
        toast({
          title: "Bot deleted successfully!",
          description: `${botToDelete.name} has been permanently removed.`,
        });
        
        setIsDeleteDialogOpen(false);
        setBotToDelete(null);
      } catch (error: any) {
        toast({
          title: "Failed to delete bot",
          description: error.message || "Please try again or contact support if the problem persists.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const deleteModelConfig = async (modelId: string) => {
    if (!modelId) return;
    
    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(getApiUrl(`model-config/${modelId}`), {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the models list after successful deletion
      if (formData.aiProvider) {
        const models = { ...aiModels };
        delete models[formData.aiProvider];
        setAiModels(models);
      }

      toast({
        title: 'Success',
        description: 'Model configuration deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to delete model configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete model configuration',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setBotToDelete(null);
    setModelToDelete(null);
  };

  const toggleStatus = (botId: string) => {
    setBots(prevBots =>
      prevBots.map(bot => {
        if (bot.id === botId) {
          const newStatus = bot.status === 'Active' ? 'Inactive' : 'Active';
          // Show toast notification
          toast({
            title: `Bot ${newStatus.toLowerCase()}`,
            description: `${bot.name} has been ${newStatus.toLowerCase()}.`,
          });
          return { ...bot, status: newStatus };
        }
        return bot;
      })
    );
    setBotStatuses(prev => ({
      ...prev,
      [botId]: !prev[botId]
    }));
  };

  // Fetch models when AI provider changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.aiProvider) return;

      setModelsLoading(prev => ({ ...prev, [formData.aiProvider]: true }));
      
      try {
        // If we already have models for this provider, don't fetch again
        if (aiModels[formData.aiProvider]) {
          setModels(prev => ({
            ...prev,
            [formData.aiProvider]: aiModels[formData.aiProvider]
          }));
          return;
        }

        const token = await getAccessToken();
        const response = await fetch(
          getApiUrl(`model-config/submodels/${formData.aiProvider}`),
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const modelsList = Array.isArray(data) ? data : [];
        
        // Cache the models for this provider
        setAiModels(prev => ({
          ...prev,
          [formData.aiProvider]: modelsList
        }));
        
        // Update the models state
        setModels(prev => ({
          ...prev,
          [formData.aiProvider]: modelsList
        }));

      } catch (error) {
        console.error(`Failed to fetch ${formData.aiProvider} models:`, error);
        toast({
          title: 'Error',
          description: `Failed to load ${formData.aiProvider} models. Using default models.`,
          variant: 'destructive',
        });
        
        // Set empty array to prevent infinite loading
        setModels(prev => ({
          ...prev,
          [formData.aiProvider]: []
        }));
      } finally {
        setModelsLoading(prev => ({ ...prev, [formData.aiProvider]: false }));
      }
    };

    if (formData.aiProvider) {
      fetchModels();
    }
  }, [formData.aiProvider]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="relative">
      {/* Main Content */}
      <div className={`transition-all duration-500 ease-in-out ${sidebarOpen ? 'mr-96' : ''}`}>
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
          className="mt-4 sm:mt-0 hover:scale-105 transition-transform duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
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
        
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {(bots || []).filter(bot => bot.status === 'Active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-card-foreground">
                      {(bots || []).reduce((total, bot) => total + (bot.messagesCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div className="space-y-4">
            {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Loading chatbots...
              </h3>
              <p className="text-muted-foreground mb-6">
                Please wait while we fetch your chatbots.
              </p>
            </CardContent>
          </Card>
        ) : (bots || []).length === 0 ? (
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
                {(bots || []).map((bot, index) => (
              <Card 
                key={bot.id} 
                    className="hover:shadow-custom-lg transition-all duration-300 animate-scale-in cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleBotCardClick(bot)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">{bot.project_name || bot.name}</CardTitle>
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
                      <span>Created {bot.created_at ? new Date(bot.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                          <span>{(bot.messagesCount || 0).toLocaleString()} messages</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          AI: {bot.aiProvider || 'Not configured'}
                    </div>
                  </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(bot.useCase || []).map((use, index) => (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(bot.id);
                            }}
                            className="hover:bg-primary/10 transition-colors duration-200"
                      >
                        {bot.status === 'Active' ? (
                            <Pause className="mr-2 h-4 w-4" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                            )}
                            {bot.status === 'Active' ? 'Pause' : 'Activate'}
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(bot);
                          }}
                          className="hover:bg-destructive/90 transition-colors duration-200"
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
      </div>

      {/* Enhanced Left Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-96 bg-background border-r shadow-2xl z-50 transform transition-transform duration-500 ease-in-out animate-slide-in-left">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Bot Configuration</h2>
                  <p className="text-sm text-muted-foreground">{selectedBot?.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSidebar}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Accordion type="multiple" className="space-y-4">
                {/* WhatsApp Configuration */}
                <AccordionItem value="whatsapp-config" className="border rounded-lg hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-200">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="font-medium">WhatsApp Configuration</span>
                      {validationResults.whatsappAccessToken && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsappAccessToken" className="flex items-center justify-between">
                          WhatsApp Access Token
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => validateField('whatsappAccessToken')}
                            disabled={isValidating}
                            className="h-6 w-6 p-0"
                          >
                            {isValidating ? (
                              <RotateCcw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                          </Button>
                        </Label>
                        <div className="relative">
                          <Input
                            id="whatsappAccessToken"
                            type={showPasswords.whatsappAccessToken ? "text" : "password"}
                            placeholder="Enter your WhatsApp Access Token"
                            value={formData.whatsappAccessToken}
                            onChange={(e) => updateFormData('whatsappAccessToken', e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility('whatsappAccessToken')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            {showPasswords.whatsappAccessToken ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                        <Input
                          id="phoneNumberId"
                          placeholder="Enter your Phone Number ID"
                          value={formData.phoneNumberId}
                          onChange={(e) => updateFormData('phoneNumberId', e.target.value)}
                          className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="+1234567890"
                          value={formData.phoneNumber}
                          onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                          className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* AI Provider */}
                <AccordionItem value="ai-provider" className="border rounded-lg hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-200">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="font-medium">AI Provider</span>
                      {validationResults.aiProvider && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="aiProvider">AI Provider</Label>
                        <Select 
                          value={formData.aiProvider}
                          onValueChange={(value) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              aiProvider: value,
                              aiModel: '' // Reset model when provider changes
                            }));
                          }}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder={
                              providersLoading ? 'Loading AI providers...' : 'Select AI provider'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {providersLoading ? (
                              <SelectItem value="" disabled>Loading AI providers...</SelectItem>
                            ) : (
                              aiProviders.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.aiProvider && (
                        <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="aiModel">AI Model</Label>
                          <Select 
                            value={formData.aiModel}
                            onValueChange={(value) => updateFormData('aiModel', value)}
                          >
                            <SelectTrigger className="focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                              <SelectValue 
                                placeholder={
                                  modelsLoading[formData.aiProvider] 
                                    ? 'Loading models...' 
                                    : (aiModels[formData.aiProvider]?.length === 0 ? 'No models available' : 'Select AI model')
                                } 
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {modelsLoading[formData.aiProvider] ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  Loading models...
                                </div>
                              ) : Array.isArray(aiModels[formData.aiProvider]) && aiModels[formData.aiProvider].length > 0 ? (
                                aiModels[formData.aiProvider]
                                  .filter(model => model) // Filter out any falsy values
                                  .map((model: string) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))
                              ) : (
                                // Fallback to hardcoded models if API data is not available
                                <>
                                  {formData.aiProvider === 'openai' && (
                                    <>
                                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                    </>
                                  )}
                                  {formData.aiProvider === 'gemini' && (
                                    <>
                                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                      <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                                    </>
                                  )}
                                  {formData.aiProvider === 'anthropic' && (
                                    <>
                                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                    </>
                                  )}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="apiKey" className="flex items-center justify-between">
                          API Key
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => validateField('apiKey')}
                            disabled={isValidating}
                            className="h-6 w-6 p-0"
                          >
                            {isValidating ? (
                              <RotateCcw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                          </Button>
                        </Label>
                        <div className="relative">
                          <Input
                            id="apiKey"
                            type={showPasswords.apiKey ? "text" : "password"}
                            placeholder="Enter your API key"
                            value={formData.apiKey}
                            onChange={(e) => updateFormData('apiKey', e.target.value)}
                            className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility('apiKey')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            {showPasswords.apiKey ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Upload Data */}
                <AccordionItem value="upload-data" className="border rounded-lg hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors duration-200">
                        <Upload className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="font-medium">Upload Data</span>
                      {formData.uploadedFiles.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {formData.uploadedFiles.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors duration-200">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drop files here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Supported: .txt, .csv, .json, .pdf
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".txt,.csv,.json,.pdf"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:bg-primary/10 transition-colors duration-200"
                        >
                          <Upload className="mr-2 h-3 w-3" />
                          Choose Files
                        </Button>
                      </div>
                      {(formData.uploadedFiles || []).length > 0 && (
                        <div className="space-y-2 animate-fade-in">
                          <Label>Uploaded Files ({(formData.uploadedFiles || []).length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {(formData.uploadedFiles || []).map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm hover:bg-muted/80 transition-colors duration-200">
                                <span className="truncate">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Extra Features */}
                <AccordionItem value="extra-features" className="border rounded-lg hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors duration-200">
                        <Zap className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="font-medium">Extra Features</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-buttons" className="font-medium">Allow Buttons</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable or disable interactive buttons for this bot
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isUpdatingButtonCondition && (
                            <RotateCcw className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              isButtonAllowed ? 'bg-primary' : 'bg-muted-foreground/20'
                            }`}
                            onClick={() => {
                              if (selectedBot?.id) {
                                const newValue = !isButtonAllowed;
                                setIsButtonAllowed(newValue);
                                updateButtonCondition(selectedBot.id, newValue).catch(() => {
                                  // Error is handled in the function
                                });
                              }
                            }}
                            disabled={isUpdatingButtonCondition || !selectedBot?.id}
                          >
                            <span className="sr-only">Enable buttons</span>
                            <span
                              className={`${
                                isButtonAllowed ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t bg-gradient-to-r from-primary/5 to-primary/10">
              <Button 
                variant="gradient" 
                className="w-full hover:scale-105 transition-transform duration-200"
                onClick={handleNext}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Next
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>{modelToDelete ? 'Delete Model Configuration' : 'Delete Bot'}</span>
            </DialogTitle>
            <DialogDescription>
              {modelToDelete 
                ? 'This action cannot be undone. This will permanently delete the selected model configuration.'
                : 'This action cannot be undone. This will permanently delete your bot and remove its data from our servers.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {modelToDelete ? (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Delete Model Configuration</p>
                  <p className="text-sm text-muted-foreground">
                    Model ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{modelToDelete}</code>
                  </p>
                </div>
              </div>
            </div>
          ) : botToDelete ? (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{botToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">{botToDelete.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {(botToDelete.messagesCount || 0).toLocaleString()} messages
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Created {botToDelete.createdAt ? new Date(botToDelete.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => modelToDelete ? deleteModelConfig(modelToDelete) : confirmDelete?.()} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {modelToDelete ? 'Delete Model' : 'Delete Bot'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}