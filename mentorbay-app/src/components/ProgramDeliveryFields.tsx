"use client";
import { useState } from "react";

type Props = {
  defaultMeetingType?: "online" | "physical";
  defaultProvider?: string;        // zoom | google_meet
  defaultMeetingUrl?: string;
  defaultLocation?: string;
  defaultCohortStart?: string;     // yyyy-mm-dd
};

export default function ProgramDeliveryFields({
  defaultMeetingType = "online", defaultProvider = "google_meet",
  defaultMeetingUrl = "", defaultLocation = "", defaultCohortStart = "",
}: Props) {
  const [mode, setMode] = useState<"online" | "physical">(defaultMeetingType);
  const [provider, setProvider] = useState(defaultProvider || "google_meet");

  return (
    <div className="sm:col-span-2 space-y-4 border-t border-slate-100 pt-4">
      {/* Cohort start date (Feature A) */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Cohort start date</label>
        <input name="cohort_start" type="date" defaultValue={defaultCohortStart}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        <p className="text-xs text-slate-400 mt-1">Mentees learn together as a batch starting this date. When a cohort finishes you can set the next start date to run a fresh batch.</p>
      </div>

      {/* Delivery mode (Feature B) */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-1.5">How is this program delivered?</label>
        <input type="hidden" name="meeting_type" value={mode} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode("online")}
            className={"px-3 py-2 rounded-lg border text-sm font-medium " + (mode === "online" ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
            Online (video call)
          </button>
          <button type="button" onClick={() => setMode("physical")}
            className={"px-3 py-2 rounded-lg border text-sm font-medium " + (mode === "physical" ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
            In person
          </button>
        </div>
      </div>

      {mode === "online" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">Meeting platform</label>
            <input type="hidden" name="meeting_provider" value={provider} />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setProvider("google_meet")}
                className={"px-3 py-2 rounded-lg border text-sm font-medium " + (provider === "google_meet" ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
                Google Meet
              </button>
              <button type="button" onClick={() => setProvider("zoom")}
                className={"px-3 py-2 rounded-lg border text-sm font-medium " + (provider === "zoom" ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
                Zoom
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">{provider === "zoom" ? "Zoom" : "Google Meet"} link</label>
            <input name="meeting_url" type="url" defaultValue={defaultMeetingUrl}
              placeholder={provider === "zoom" ? "https://zoom.us/j/..." : "https://meet.google.com/..."}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            <p className="text-xs text-slate-400 mt-1">Shared with enrolled mentees so they can join the sessions.</p>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Venue / location</label>
          <input name="program_location" defaultValue={defaultLocation}
            placeholder="e.g. iHub, Senteu Plaza, Nairobi"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        </div>
      )}
    </div>
  );
}
