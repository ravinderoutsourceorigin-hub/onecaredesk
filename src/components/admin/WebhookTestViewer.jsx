import React, { useState, useEffect } from 'react';
import { WebhookTest } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    RefreshCw, 
    Trash2, 
    Eye, 
    Globe,
    Clock,
    Copy,
    ExternalLink
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

export default function WebhookTestViewer() {
    const [webhooks, setWebhooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWebhook, setSelectedWebhook] = useState(null);
    
    const webhookUrl = `${window.location.origin}/functions/webhookTest`;

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            setIsLoading(true);
            const data = await WebhookTest.list('-created_date', 50);
            setWebhooks(data);
        } catch (error) {
            console.error('Error loading webhook tests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAllWebhooks = async () => {
        try {
            const allWebhooks = await WebhookTest.list();
            for (const webhook of allWebhooks) {
                await WebhookTest.delete(webhook.id);
            }
            loadWebhooks();
        } catch (error) {
            console.error('Error clearing webhooks:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const getMethodColor = (method) => {
        const colors = {
            GET: "bg-blue-100 text-blue-800",
            POST: "bg-green-100 text-green-800", 
            PUT: "bg-yellow-100 text-yellow-800",
            DELETE: "bg-red-100 text-red-800"
        };
        return colors[method] || "bg-gray-100 text-gray-800";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Globe className="w-5 h-5" />
                    Webhook Test Endpoint
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Webhook URL Display */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Webhook Test URL:</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={webhookUrl}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(webhookUrl)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(webhookUrl, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                        This endpoint accepts all HTTP methods (GET, POST, PUT, DELETE) and requires no authentication.
                        Use it to test webhook integrations from any external service.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">Recent Webhook Calls ({webhooks.length})</h4>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadWebhooks}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {webhooks.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Clear All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear All Webhook Tests</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all {webhooks.length} webhook test records. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={clearAllWebhooks} className="bg-red-600 hover:bg-red-700">
                                            Delete All
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Webhook List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : webhooks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p>No webhook calls received yet</p>
                            <p className="text-sm">Send a request to the webhook URL above to test it</p>
                        </div>
                    ) : (
                        webhooks.map((webhook) => (
                            <div key={webhook.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge className={getMethodColor(webhook.method)}>
                                        {webhook.method}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {webhook.content_type || 'No content type'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(webhook.created_date), 'MMM d, HH:mm:ss')}
                                            <span>•</span>
                                            <span>IP: {webhook.source_ip}</span>
                                        </div>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedWebhook(webhook)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Webhook Details</DialogTitle>
                                        </DialogHeader>
                                        {selectedWebhook && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <strong>Method:</strong> {selectedWebhook.method}
                                                    </div>
                                                    <div>
                                                        <strong>Content-Type:</strong> {selectedWebhook.content_type || 'None'}
                                                    </div>
                                                    <div>
                                                        <strong>Source IP:</strong> {selectedWebhook.source_ip}
                                                    </div>
                                                    <div>
                                                        <strong>Timestamp:</strong> {format(new Date(selectedWebhook.created_date), 'PPP p')}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <strong className="text-sm">Headers:</strong>
                                                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                                        {JSON.stringify(selectedWebhook.headers, null, 2)}
                                                    </pre>
                                                </div>
                                                
                                                {Object.keys(selectedWebhook.query_params || {}).length > 0 && (
                                                    <div>
                                                        <strong className="text-sm">Query Parameters:</strong>
                                                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                                            {JSON.stringify(selectedWebhook.query_params, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <strong className="text-sm">Body Data:</strong>
                                                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                                                        {selectedWebhook.body_data || '(empty)'}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
