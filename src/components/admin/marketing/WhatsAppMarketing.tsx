import React, { useState, useEffect } from 'react';
import { whatsappService } from '@/services/whatsappService';
import { Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface WhatsAppTemplate {
  id?: string;
  name: string;
  language: string;
  category: 'marketing' | 'transactional' | 'service';
  status: 'pending' | 'approved' | 'rejected';
  components: Array<{
    type: string;
    text: string;
    variables?: string[];
  }>;
}

interface WhatsAppCampaign {
  id?: string;
  name: string;
  templateId: string;
  status: string;
  metrics?: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    responded: number;
  };
}

export const WhatsAppMarketing = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState<Partial<WhatsAppTemplate>>({
    language: 'en',
    category: 'marketing',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const activeTemplates = await whatsappService.getActiveTemplates();
      setTemplates(activeTemplates);
      // Fetch active campaigns if needed
    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      toast.error('Failed to fetch WhatsApp data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.components?.[0]?.text) {
        toast.error('Please fill in all required fields');
        return;
      }

      await whatsappService.createTemplate({
        name: newTemplate.name,
        language: newTemplate.language || 'en',
        category: newTemplate.category || 'marketing',
        components: [{
          type: 'body' as const,
          text: newTemplate.components[0].text,
          format: 'text' as const
        }],
      });

      toast.success('Template created successfully');
      fetchData();
      setNewTemplate({
        language: 'en',
        category: 'marketing',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleCreateCampaign = async (templateId: string) => {
    try {
      const now = Timestamp.now();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7 days from now

      const campaign = {
        name: `Campaign ${now.toDate().toISOString()}`,
        templateId,
        schedule: {
          startDate: now,
          endDate: Timestamp.fromDate(endDate),
        },
        targeting: {
          segments: ['all'],
        },
        status: 'draft' as const,
        variables: {}
      };

      await whatsappService.createCampaign(campaign);
      toast.success('Campaign created successfully');
      fetchData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  if (loading) {
    return <div>Loading WhatsApp marketing data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Template Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <Input
                value={newTemplate.name || ''}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message Content
              </label>
              <Textarea
                value={newTemplate.components?.[0]?.text || ''}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    components: [
                      { type: 'body', text: e.target.value },
                    ],
                  })
                }
                placeholder="Enter message content"
                rows={4}
              />
            </div>

            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </div>
        </CardContent>
      </Card>

      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{template.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      template.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : template.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {template.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {template.components[0]?.text}
                </p>
                {template.status === 'approved' && (
                  <Button
                    onClick={() => handleCreateCampaign(template.id!)}
                    variant="outline"
                    size="sm"
                  >
                    Create Campaign
                  </Button>
                )}
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-gray-500">No templates available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{campaign.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status.toUpperCase()}
                  </span>
                </div>
                {campaign.metrics && (
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-medium">{campaign.metrics.sent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Delivered</p>
                      <p className="font-medium">{campaign.metrics.delivered}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Read</p>
                      <p className="font-medium">{campaign.metrics.read}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Responses</p>
                      <p className="font-medium">{campaign.metrics.responded}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-gray-500">No active campaigns</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
