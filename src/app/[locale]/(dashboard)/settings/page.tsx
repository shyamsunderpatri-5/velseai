"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  User,
  CreditCard,
  Users,
  Bell,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Crown,
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  plan_expires_at: string | null;
  referral_code: string;
  free_months_earned: number;
}

interface Subscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string;
  expires_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [formData, setFormData] = React.useState({
    fullName: "",
  });

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({ fullName: data.profile.full_name || "" });
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName }),
      });
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        toast.success("Profile updated");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>;
      case "lifetime":
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Crown className="w-3 h-3 mr-1" />Lifetime</Badge>;
      case "starter":
        return <Badge variant="secondary">Starter</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="w-4 h-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.full_name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
                {getPlanBadge(profile?.plan || "free")}
              </div>

              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>Manage your plan and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-lg">
                    {profile?.plan === "pro" ? "Pro Plan" 
                      : profile?.plan === "lifetime" ? "Lifetime Deal"
                      : profile?.plan === "starter" ? "Starter Plan" 
                      : "Free Plan"}
                  </p>
                  {profile?.plan_expires_at && (
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(profile.plan_expires_at).toLocaleDateString()}
                    </p>
                  )}
                  {profile?.plan === "lifetime" && (
                    <p className="text-sm text-success">One-time payment • Never expires</p>
                  )}
                </div>
                {getPlanBadge(profile?.plan || "free")}
              </div>

              {subscriptions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Billing History</h4>
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{sub.plan}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(sub.amount / 100).toFixed(0)}</p>
                        <Badge variant={sub.status === "active" ? "success" : "secondary"} className="text-xs">
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profile?.plan === "free" && (
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <h4 className="font-medium text-accent mb-2">Upgrade to Pro</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get unlimited resumes, AI features, and job tracking
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-accent hover:bg-accent/90">View Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Invite friends and earn free months</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">Your Referral Code</p>
                    <p className="text-2xl font-bold font-mono mt-1">{profile?.referral_code}</p>
                  </div>
                  <Button variant="outline" onClick={handleCopyReferral}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold">{profile?.free_months_earned || 0}</p>
                  <p className="text-sm text-muted-foreground">Free months earned</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold">
                    {profile && "referred_by" in profile && profile.referred_by ? "1" : "0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Friends referred</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">How it works:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Share your referral code with friends</li>
                  <li>They sign up and upgrade to any paid plan</li>
                  <li>You both get 1 free month!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last updated: Never</p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}