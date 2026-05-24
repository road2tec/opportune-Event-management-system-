"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSettings,
  IconBuildingCommunity,
  IconMail,
  IconPhone,
  IconCheck,
  IconRefresh
} from "@tabler/icons-react";

interface CollegeSettings {
  name: string;
  code: string;
  email: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  address?: {
    street?: string;
    taluka?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  admin?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function CollegeSettingsPage() {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/college/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error fetching college settings:", error);
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
      const res = await axios.post("/api/college/settings", settings);
      if (res.data.success) {
        toast.success(res.data.message || "College profile saved successfully!");
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
    <div className="poppins space-y-6 pb-12 max-w-4xl mx-auto">
      <Title
        title="College Profile Settings"
        subtitle="Manage institution coordinates, websites, contact phone books, and administrator information."
      />

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl shadow space-y-6">
        <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pb-3">
          <IconBuildingCommunity size={18} className="text-primary" /> Profile Coordinates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">College Name</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.name}
              readOnly
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">College Code</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl font-mono text-secondary"
              value={settings.code}
              readOnly
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">College Contact Email</legend>
            <input
              type="email"
              className="input input-bordered w-full rounded-xl"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">College Contact Phone</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </fieldset>

          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend">Official Website URL</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.website || ""}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
            />
          </fieldset>
        </div>

        {/* Address */}
        <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pt-4 pb-3">
          Address Coordinates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend">Street Address</legend>
            <textarea
              className="textarea textarea-bordered w-full rounded-xl"
              value={settings.address?.street || ""}
              onChange={(e) => setSettings({
                ...settings,
                address: { ...settings.address, street: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Taluka / City</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.address?.taluka || ""}
              onChange={(e) => setSettings({
                ...settings,
                address: { ...settings.address, taluka: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">District</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.address?.district || ""}
              onChange={(e) => setSettings({
                ...settings,
                address: { ...settings.address, district: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">State</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.address?.state || ""}
              onChange={(e) => setSettings({
                ...settings,
                address: { ...settings.address, state: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Pincode</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl font-mono"
              value={settings.address?.pincode || ""}
              onChange={(e) => setSettings({
                ...settings,
                address: { ...settings.address, pincode: e.target.value }
              })}
            />
          </fieldset>
        </div>

        {/* Admin info */}
        <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pt-4 pb-3">
          Authorized Administrator Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Admin Name</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.admin?.name || ""}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, name: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Admin Email</legend>
            <input
              type="email"
              className="input input-bordered w-full rounded-xl"
              value={settings.admin?.email || ""}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, email: e.target.value }
              })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Admin Phone</legend>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl"
              value={settings.admin?.phone || ""}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, phone: e.target.value }
              })}
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
