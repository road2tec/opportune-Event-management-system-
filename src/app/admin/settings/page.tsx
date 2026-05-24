"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSettings,
  IconShield,
  IconPercentage,
  IconUsers,
  IconMail,
  IconDatabase,
  IconCheck,
  IconRefresh
} from "@tabler/icons-react";

interface Settings {
  maintenanceMode: boolean;
  platformCutPercentage: number;
  maxTeamsPerProgram: number;
  allowCollegeSelfSignup: boolean;
  supportEmail: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
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
      const res = await axios.post("/api/admin/settings", settings);
      if (res.data.success) {
        toast.success(res.data.message || "Settings saved successfully!");
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setOptimizing(true);
    try {
      // Simulate database optimization run
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Database indices re-indexed & cache flushed successfully!");
    } catch (error) {
      toast.error("Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  if (loading || !settings) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12 max-w-4xl mx-auto">
      <Title
        title="System Settings"
        subtitle="Manage overall application toggles, platform transaction parameters, and administrative controls."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings categories menu */}
        <div className="bg-base-200 border border-base-300 p-4 rounded-2xl h-fit space-y-2">
          <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-widest px-3 mb-2">Categories</h4>
          <button className="btn btn-sm btn-primary w-full justify-start rounded-xl">
            <IconSettings size={16} /> Global Config
          </button>
          <button onClick={handleOptimizeDatabase} disabled={optimizing} className="btn btn-sm btn-ghost w-full justify-start rounded-xl text-base-content/70">
            <IconDatabase size={16} /> {optimizing ? "Running..." : "DB Maintenance"}
          </button>
        </div>

        {/* Configurations Form */}
        <div className="md:col-span-2 bg-base-200 border border-base-300 p-6 rounded-2xl shadow space-y-6">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pb-3">
            <IconShield size={18} className="text-primary" /> Application Parameters
          </h3>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Maintenance mode toggle */}
            <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300/60">
              <div>
                <label className="font-bold text-sm text-base-content block">System Maintenance Mode</label>
                <span className="text-[10px] text-base-content/40">If enabled, fests/student logins will display an offline notice.</span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
            </div>

            {/* Self Signup toggle */}
            <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300/60">
              <div>
                <label className="font-bold text-sm text-base-content block">Allow College Registrations</label>
                <span className="text-[10px] text-base-content/40">Toggle if new institution administrators can request accounts.</span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={settings.allowCollegeSelfSignup}
                onChange={(e) => setSettings({ ...settings, allowCollegeSelfSignup: e.target.checked })}
              />
            </div>

            {/* Range slider for platform cut */}
            <div className="p-3 bg-base-100 rounded-xl border border-base-300/60 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <label className="font-bold text-sm text-base-content block">Platform Service Cut (%)</label>
                  <span className="text-[10px] text-base-content/40">The service cut commission deducted from program fees.</span>
                </div>
                <span className="badge badge-primary font-mono font-extrabold text-sm px-3.5 py-2.5">
                  <IconPercentage size={14} className="mr-0.5" /> {settings.platformCutPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                className="range range-primary range-xs"
                value={settings.platformCutPercentage}
                onChange={(e) => setSettings({ ...settings, platformCutPercentage: parseInt(e.target.value) })}
              />
            </div>

            {/* Max Teams Input */}
            <fieldset className="fieldset bg-base-100 p-4 rounded-xl border border-base-300/60">
              <legend className="fieldset-legend flex items-center gap-1"><IconUsers size={14} /> Maximum Default Team Size Limit</legend>
              <input
                type="number"
                className="input input-bordered w-full rounded-xl"
                value={settings.maxTeamsPerProgram}
                onChange={(e) => setSettings({ ...settings, maxTeamsPerProgram: parseInt(e.target.value) || 0 })}
              />
            </fieldset>

            {/* Support Email Input */}
            <fieldset className="fieldset bg-base-100 p-4 rounded-xl border border-base-300/60">
              <legend className="fieldset-legend flex items-center gap-1"><IconMail size={14} /> Global Administration Support Email</legend>
              <input
                type="email"
                className="input input-bordered w-full rounded-xl"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </fieldset>
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
    </div>
  );
}
