"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSettings,
  IconShield,
  IconCheck,
  IconRefresh
} from "@tabler/icons-react";

interface StudentSettings {
  emailNotifications: boolean;
  pushAlerts: boolean;
  showSkillsPublicly: boolean;
  receiveMarketing: boolean;
}

export default function StudentSettingsPage() {
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/student/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error fetching student settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await axios.post("/api/student/settings", settings);
      if (res.data.success) {
        toast.success("Settings saved successfully!");
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error saving student settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12 max-w-xl mx-auto">
      <Title
        title="Student Settings"
        subtitle="Manage email alert parameters, system pushes, and privacy preferences."
      />

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl shadow space-y-6">
        <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pb-3">
          <IconSettings size={18} className="text-primary" /> System Preferences
        </h3>

        <div className="space-y-4">
          {/* Email Alerts toggle */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300/60">
            <div>
              <label className="font-bold text-sm text-base-content block">Email Notifications</label>
              <span className="text-[10px] text-base-content/40">Receive alert summaries on program milestones and winner logs.</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            />
          </div>

          {/* Push Notifications toggle */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300/60">
            <div>
              <label className="font-bold text-sm text-base-content block">Push Alerts</label>
              <span className="text-[10px] text-base-content/40">Recieve instant browser pushes on team creation / joins.</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={settings.pushAlerts}
              onChange={(e) => setSettings({ ...settings, pushAlerts: e.target.checked })}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300/60">
            <div>
              <label className="font-bold text-sm text-base-content block">Display Skills Publicly</label>
              <span className="text-[10px] text-base-content/40">Allow colleges or organizers to see your skills for team matching.</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-secondary"
              checked={settings.showSkillsPublicly}
              onChange={(e) => setSettings({ ...settings, showSkillsPublicly: e.target.checked })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-base-300 pt-4 mt-6">
          <button onClick={fetchSettings} className="btn btn-outline btn-sm rounded-xl">
            <IconRefresh size={16} className="mr-1" /> Reset
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn btn-primary btn-sm rounded-xl text-white px-6"
          >
            <IconCheck size={16} className="mr-1" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
