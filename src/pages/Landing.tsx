import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Zap, Shield, Sparkles, CheckCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Conversations",
      description: "Advanced AI that understands context and provides intelligent responses"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "WhatsApp Integration",
      description: "Seamlessly connect with WhatsApp Business API for instant messaging"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "No-Code Builder",
      description: "Create sophisticated chatbots without any programming knowledge"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data storage and transmission"
    }
  ];

  const benefits = [
    "24/7 Customer Support Automation",
    "Lead Generation & Qualification",
    "FAQ Automation",
    "Order Processing & Updates",
    "Appointment Scheduling",
    "Multi-language Support"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">ChatBot Builder</span>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="gradient"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build AI-Powered
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                WhatsApp Chatbots
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Create intelligent chatbots for WhatsApp without coding. Automate customer support, 
              generate leads, and engage customers 24/7 with our intuitive slide-based builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate('/register')}
                className="animate-scale-in"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building Free
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Build Amazing Chatbots
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, deploy, and manage 
              AI-powered WhatsApp chatbots that deliver real results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg border bg-card hover:shadow-custom-lg transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Automate Your Customer Interactions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform how you engage with customers using intelligent automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Customer Experience?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of businesses using our platform to automate customer interactions
          </p>
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => navigate('/register')}
            className="bg-white text-primary hover:bg-white/90"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">ChatBot Builder</span>
          </div>
          <p className="text-background/80">
            © 2024 ChatBot Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}