import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, TrendingUp, Plus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const isLoading = false; // No loading state needed for static data

  const stats = [
    {
      title: 'Active Bots',
      value: '3',
      description: 'Currently running',
      icon: <Bot className="h-6 w-6 text-primary" />,
      trend: '+2 this month'
    },
    {
      title: 'Messages Sent',
      value: '1,247',
      description: 'This month',
      icon: <MessageSquare className="h-6 w-6 text-success" />,
      trend: '+15% from last month'
    }
  ];

  const recentBots = [
    {
      id: 1,
      name: 'Customer Support Bot',
      status: 'Active',
      lastActive: '2 hours ago',
      messages: 234
    },
    {
      id: 2,
      name: 'Lead Generation Bot',
      status: 'Active',
      lastActive: '1 day ago',
      messages: 156
    },
    {
      id: 3,
      name: 'FAQ Bot',
      status: 'Inactive',
      lastActive: '3 days ago',
      messages: 89
    }
  ];



  const projects = recentBots; // Using recentBots as projects for now

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Your Bots
        </h1>
        <p className="text-muted-foreground">
          {projects.length} active bots
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <p className="text-xs text-success mt-2">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Combined Row for Recent Bots and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bots */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Bots</CardTitle>
            <CardDescription>
              Your recently created or modified chatbots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {bot.messages} messages • Last active {bot.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bot.status === 'Active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {bot.status}
                  </span>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard/bots')}
            >
              View All Bots
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/bots/create')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Chatbot
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/settings')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Configure WhatsApp API
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/billing')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Bot className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
          </CardContent>
          </Card>
        </div>
      </div>
  );
}