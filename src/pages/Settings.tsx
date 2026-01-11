import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import EditorLayout from "@/components/EditorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Moon,
  Sun,
  User,
  Bell,
  CreditCard,
  Shield,
  Trash2,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface Profile {
  full_name: string | null;
  email: string | null;
  theme: string;
  email_notifications: boolean;
  generation_alerts: boolean;
  marketing_updates: boolean;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    theme: "dark",
    email_notifications: true,
    generation_alerts: true,
    marketing_updates: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          theme: data.theme || "dark",
          email_notifications: data.email_notifications !== false,
          generation_alerts: data.generation_alerts !== false,
          marketing_updates: !!data.marketing_updates,
        });

        // Sync local theme with stored preference
        if (data.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));

      if (updates.theme) {
        if (updates.theme === 'light') {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        }
      }

      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.");
    if (confirmed) {
      toast({ title: "Account Deletion", description: "Please contact support to complete account deletion.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <EditorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </EditorLayout>
    );
  }

  return (
    <EditorLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account settings and preferences.</p>
        </div>

        {/* Appearance */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold">
            <Sun className="w-4 h-4" />
            Appearance
          </div>
          <Card className="ios-glass-card border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-lg items-center flex gap-2">
                    {profile.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    Mode
                  </div>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => handleUpdateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' })}
                >
                  {profile.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold">
            <User className="w-4 h-4" />
            Profile
          </div>
          <Card className="ios-glass-card border-none shadow-sm">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Update your personal information and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="display-name"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="ios-glass-input"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateProfile({ full_name: profile.full_name })}
                      disabled={saving}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    value={profile.email || ""}
                    disabled
                    className="ios-glass-input opacity-70"
                  />
                  <p className="text-[10px] text-muted-foreground">Email changes require security verification.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Notifications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold">
            <Bell className="w-4 h-4" />
            Notifications
          </div>
          <Card className="ios-glass-card border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your account via email.</p>
                </div>
                <Switch
                  checked={profile.email_notifications}
                  onCheckedChange={(v) => handleUpdateProfile({ email_notifications: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Generation Complete Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified immediately when your AI styling is ready.</p>
                </div>
                <Switch
                  checked={profile.generation_alerts}
                  onCheckedChange={(v) => handleUpdateProfile({ generation_alerts: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">Stay informed about new features and exclusive releases.</p>
                </div>
                <Switch
                  checked={profile.marketing_updates}
                  onCheckedChange={(v) => handleUpdateProfile({ marketing_updates: v })}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Billing */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold">
            <CreditCard className="w-4 h-4" />
            Billing
          </div>
          <Card className="ios-glass-card border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Pro Plan</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Next billing date: <span className="text-foreground font-medium">Jan 28, 2026</span>
                  </p>
                </div>
                <Button variant="outline" className="rounded-full">Manage Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold">
            <Shield className="w-4 h-4" />
            Security
          </div>
          <Card className="ios-glass-card border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">Setup 2FA</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">You are currently logged in on 2 devices.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">Revoke All</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-destructive uppercase tracking-wider text-xs font-bold">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </div>
          <Card className="border-destructive/20 bg-destructive/[0.02] shadow-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
              </div>
              <Button variant="destructive" className="rounded-full px-6" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </EditorLayout>
  );
};

export default Settings;
