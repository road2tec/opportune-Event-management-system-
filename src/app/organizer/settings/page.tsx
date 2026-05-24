"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSettings,
  IconUser,
  IconCheck,
  IconRefresh
} from "@tabler/icons-react";

interface OrganizerSettings {
  name: string;
  email: string;
  phone?: string;
}

export default function OrganizerSettingsPage() {
  const [settings, setSettings] = useState<OrganizerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/organizer/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error fetching organizer settings:", error);
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
      const res = await axios.post("/api/organizer/settings", settings);
      if (res.data.success) {
        toast.success("Organizer profile updated successfully!");
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12 max-w-xl mx-auto">
      <Title
        title="Organizer Settings"
        subtitle="Manage organizer profile coordinates, contact book details, and notifications."
      />

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl shadow space-y-6">
        <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pb-3">
          <IconUser size={18} className="text-primary" /> Profile Coordinates
        </h3>

        <div className="space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Organizer Name</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Contact Email</legend>
            <input
              type="email"
              className="input input-bordered w-full rounded-xl font-mono text-secondary"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Contact Phone</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
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
  );
}
