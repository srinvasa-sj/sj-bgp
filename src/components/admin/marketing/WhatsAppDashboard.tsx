import { useState, useEffect } from "react";
import { whatsappService } from "@/services/whatsappService";
import { automatedNotificationService } from "@/services/automatedNotificationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, Bell, Send, Wand2 } from "lucide-react";
import { AITemplateGenerator } from "./AITemplateGenerator";

interface Template {
  id?: string;
  name: string;
  language: string;
  category: 'marketing' | 'transactional' | 'service';
  components: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    text: string;
    format?: 'text' | 'image' | 'document' | 'video';
    example?: any;
  }>;
  status: 'pending' | 'approved' | 'rejected';
}

interface NotificationStats {
  total: number;
  delivered: number;
  read: number;
  failed: number;
}

export const WhatsAppDashboard = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    delivered: 0,
    read: 0,
    failed: 0
  });
  const [automatedEnabled, setAutomatedEnabled] = useState({
    newProducts: false,
    promotions: false
  });
  const [testMessage, setTestMessage] = useState({
    phone: "",
    templateId: "",
    variables: {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch templates
      const activeTemplates = await whatsappService.getActiveTemplates();
      setTemplates(activeTemplates);

      // Fetch notification stats (you'll need to implement this in whatsappService)
      // const notificationStats = await whatsappService.getNotificationStats();
      // setStats(notificationStats);
    } catch (error) {
      console.error("Error fetching WhatsApp data:", error);
      toast.error("Failed to fetch WhatsApp data");
    }
  };

  const handleTestMessage = async () => {
    try {
      if (!testMessage.phone || !testMessage.templateId) {
        toast.error("Please fill in all required fields");
        return;
      }

      await whatsappService.sendMessage({
        templateId: testMessage.templateId,
        recipientPhone: testMessage.phone,
        variables: testMessage.variables
      });

      toast.success("Test message sent successfully");
      setTestMessage({ phone: "", templateId: "", variables: {} });
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    }
  };

  const toggleAutomatedNotification = (type: 'newProducts' | 'promotions') => {
    setAutomatedEnabled(prev => {
      const newState = {
        ...prev,
        [type]: !prev[type]
      };

      // Start or stop the notification service based on the toggle
      if (newState[type]) {
        if (type === 'newProducts') {
          automatedNotificationService.startProductNotifications();
        } else {
          automatedNotificationService.startPromotionNotifications();
        }
      } else {
        if (type === 'newProducts') {
          automatedNotificationService.stopNotifications();
        } else {
          automatedNotificationService.stopNotifications();
        }
      }

      return newState;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">WhatsApp Dashboard</h2>
        <Button variant="outline" onClick={fetchData}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai-templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-templates">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Templates
          </TabsTrigger>
        </TabsList>

        {/* AI Templates Tab */}
        <TabsContent value="ai-templates" className="space-y-4">
          <AITemplateGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 