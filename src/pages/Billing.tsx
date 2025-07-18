import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  CreditCard, 
  Download, 
  Star, 
  Zap,
  MessageSquare,
  Bot,
  Users,
  Clock
} from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    current: true,
    features: [
      { name: '1 chatbot', included: true },
      { name: '100 messages/month', included: true },
      { name: 'Basic templates', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced AI features', included: false },
      { name: 'Custom branding', included: false },
      { name: 'Analytics dashboard', included: false },
      { name: 'Priority support', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For growing businesses',
    popular: true,
    features: [
      { name: '5 chatbots', included: true },
      { name: '5,000 messages/month', included: true },
      { name: 'All templates', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Email & chat support', included: true },
      { name: 'Priority support', included: false },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large organizations',
    features: [
      { name: 'Unlimited chatbots', included: true },
      { name: 'Unlimited messages', included: true },
      { name: 'All templates', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom integrations', included: true },
    ]
  }
];

const usageStats = [
  {
    title: 'Chatbots Created',
    current: 3,
    limit: 5,
    icon: <Bot className="h-5 w-5" />
  },
  {
    title: 'Messages This Month',
    current: 1247,
    limit: 5000,
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    title: 'Active Users',
    current: 89,
    limit: 'Unlimited',
    icon: <Users className="h-5 w-5" />
  }
];

const invoices = [
  {
    id: 'INV-001',
    date: '2024-01-01',
    amount: 29.00,
    status: 'Paid',
    description: 'Pro Plan - January 2024'
  },
  {
    id: 'INV-002',
    date: '2024-02-01',
    amount: 29.00,
    status: 'Paid',
    description: 'Pro Plan - February 2024'
  },
  {
    id: 'INV-003',
    date: '2024-03-01',
    amount: 29.00,
    status: 'Pending',
    description: 'Pro Plan - March 2024'
  }
];

export default function Billing() {
  const [currentPlan] = useState('free');

  const handleUpgrade = (planId: string) => {
    console.log('Upgrade to plan:', planId);
    // Implement payment flow
  };

  const downloadInvoice = (invoiceId: string) => {
    console.log('Download invoice:', invoiceId);
    // Implement invoice download
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and view usage statistics
        </p>
      </div>

      {/* Current Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {usageStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-2xl font-bold text-card-foreground">{stat.current.toLocaleString()}</p>
                    {typeof stat.limit === 'number' && (
                      <p className="text-sm text-muted-foreground">/ {stat.limit.toLocaleString()}</p>
                    )}
                  </div>
                  {typeof stat.limit === 'number' && (
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stat.current / stat.limit) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="text-primary">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id}
              className={`relative animate-scale-in ${
                plan.popular ? 'ring-2 ring-primary' : ''
              } ${plan.current ? 'bg-primary/5' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-success text-success-foreground px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-card-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check 
                        className={`h-4 w-4 flex-shrink-0 ${
                          feature.included ? 'text-success' : 'text-muted-foreground'
                        }`} 
                      />
                      <span 
                        className={`text-sm ${
                          feature.included ? 'text-card-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.current ? "outline" : plan.popular ? "gradient" : "default"}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()} • {invoice.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-card-foreground">${invoice.amount.toFixed(2)}</p>
                    <Badge 
                      className={
                        invoice.status === 'Paid' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">**** **** **** 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline">
              Update Card
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}