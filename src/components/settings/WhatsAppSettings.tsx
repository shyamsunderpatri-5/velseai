"use client";

/**
 * WhatsApp Settings Page — /dashboard/settings (WhatsApp section)
 *
 * Allows users to:
 * 1. Connect their WhatsApp phone number via OTP verification
 * 2. See connection status and bot capabilities
 * 3. Configure alert preferences (email / WhatsApp / frequency)
 * 4. Disconnect WhatsApp
 *
 * Must be added to the existing settings page tabs.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import {
  Smartphone,
  Check,
  X,
  Loader2,
  MessageCircle,
  Shield,
  Zap,
  Bell,
  Trash2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface WhatsAppSettingsProps {
  isConnected: boolean;
  connectedPhone?: string;
  onStatusChange?: (connected: boolean) => void;
}

export function WhatsAppSettings({ isConnected: initialConnected, connectedPhone, onStatusChange }: WhatsAppSettingsProps) {
  const [step, setStep] = useState<"idle" | "enter_phone" | "enter_code" | "success">(
    initialConnected ? "success" : "idle"
  );
  const [phone, setPhone] = useState(connectedPhone || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(initialConnected);

  const handleSendCode = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid phone number with country code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "send_code", phone: phone.replace(/\D/g, "") }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send code");
        return;
      }

      toast.success("Code sent to your WhatsApp!");
      setStep("enter_code");

      // Dev mode: auto-fill OTP
      if (data.dev_otp) {
        setOtp(data.dev_otp);
        toast(`Dev mode: OTP is ${data.dev_otp}`, { icon: "🔧" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "confirm_code", phone: phone.replace(/\D/g, ""), code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid code");
        return;
      }

      setStep("success");
      setIsConnected(true);
      onStatusChange?.(true);
      toast.success("WhatsApp connected successfully! 🎉");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/settings/whatsapp/verify", { method: "DELETE" });
      if (!res.ok) throw new Error("Disconnect failed");

      setIsConnected(false);
      setStep("idle");
      setPhone("");
      setOtp("");
      onStatusChange?.(false);
      toast.success("WhatsApp disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">WhatsApp Integration</h2>
          <p className="text-sm text-muted-foreground">
            Get AI-powered career help directly in WhatsApp
          </p>
        </div>
        {isConnected && (
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200">
            <Check className="w-3 h-3 mr-1" /> Connected
          </Badge>
        )}
      </div>

      {/* Connected state */}
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status card */}
            <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">WhatsApp Connected</p>
                    {connectedPhone && (
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        +{connectedPhone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Zap, title: "JD Extraction", desc: "Send any job photo → get instant ATS resume" },
                { icon: Bell, title: "Job Alerts", desc: "Daily job matches sent to your WhatsApp" },
                { icon: Shield, title: "Secure", desc: "No password sharing, phone verified" },
              ].map((cap) => (
                <Card key={cap.title}>
                  <CardContent className="pt-4 pb-4 text-center">
                    <cap.icon className="w-6 h-6 mx-auto text-violet-500 mb-2" />
                    <p className="text-sm font-semibold">{cap.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cap.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Test it */}
            <Card className="border-violet-200 bg-violet-50 dark:bg-violet-950/20">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Try it now!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Open WhatsApp and send us a photo of any job posting. Type <code className="bg-violet-100 px-1 rounded text-violet-700">help</code> to see all commands.
                </p>
              </CardContent>
            </Card>

            {/* Disconnect */}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                {disconnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Disconnect WhatsApp
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Features preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: "📸",
                  title: "Photo → ATS Resume",
                  desc: "Snap a job posting, get a tailored resume in 30 seconds",
                },
                {
                  icon: "🔔",
                  title: "Daily Job Alerts",
                  desc: "Top matching jobs sent every morning",
                },
                {
                  icon: "📊",
                  title: "Track from Chat",
                  desc: "Add jobs to your tracker without opening the app",
                },
              ].map((feat) => (
                <Card key={feat.title} className="border-violet-200/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-2xl mb-2">{feat.icon}</div>
                    <p className="text-sm font-semibold">{feat.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{feat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Connection form */}
            <Card className="border-violet-200">
              <CardContent className="pt-6 pb-6 space-y-5">
                <h3 className="font-semibold">Connect your WhatsApp</h3>

                <AnimatePresence mode="wait">
                  {step !== "enter_code" ? (
                    <motion.div
                      key="phone-step"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-violet-500" />
                          Phone number (with country code)
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="919876543210  (no + or spaces)"
                          type="tel"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: 919876543210 (India) or 14155550123 (US)
                        </p>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          This number must have WhatsApp installed. We'll send a verification code.
                        </p>
                      </div>

                      <Button
                        onClick={handleSendCode}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold"
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : (
                          <><MessageCircle className="w-4 h-4 mr-2" /> Send Code via WhatsApp</>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-step"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to <strong>+{phone.replace(/\D/g, "")}</strong> on WhatsApp:
                      </p>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Verification Code</Label>
                        <Input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="123456"
                          type="text"
                          inputMode="numeric"
                          className="font-mono text-center text-2xl tracking-widest h-14"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setStep("enter_phone")}
                          disabled={loading}
                          className="flex-1"
                        >
                          ← Back
                        </Button>
                        <Button
                          onClick={handleVerifyCode}
                          disabled={loading || otp.length !== 6}
                          className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                          ) : (
                            <><Check className="w-4 h-4 mr-2" /> Verify & Connect</>
                          )}
                        </Button>
                      </div>

                      <button
                        onClick={handleSendCode}
                        disabled={loading}
                        className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                      >
                        Didn't receive it? Resend code
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp number info */}
      <div className="text-xs text-muted-foreground text-center">
        Connect to: <strong>{process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY_NUMBER || "wa.me/velseai"}</strong>
        {" · "}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </div>
    </div>
  );
}
