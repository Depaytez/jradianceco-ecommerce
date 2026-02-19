/**
 * Issues Log Page
 * 
 * View system bugs and customer complaints with status tracking.
 * Access: Admin, Chief Admin
 */

"use client";

import { useState, useEffect } from "react";
import { checkPermission } from "../actions";
import { AlertTriangle, Bug, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Issue {
  id: string;
  type: "bug" | "complaint";
  title: string;
  description: string;
  status: "reported" | "pending" | "solved";
  priority: "low" | "medium" | "high";
  created_at: string;
  resolved_at?: string;
}

// Mock data - replace with actual database queries when issues table is created
const mockIssues: Issue[] = [
  {
    id: "1",
    type: "bug",
    title: "Cart not updating quantity",
    description: "Users report cart quantity not updating properly on mobile devices",
    status: "pending",
    priority: "high",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    type: "complaint",
    title: "Delayed delivery",
    description: "Customer complaint about order #12345 not delivered on time",
    status: "reported",
    priority: "medium",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    type: "bug",
    title: "Image upload failing",
    description: "Admin unable to upload product images larger than 5MB",
    status: "solved",
    priority: "low",
    created_at: new Date().toISOString(),
    resolved_at: new Date().toISOString(),
  },
];

export default function IssuesLogPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "bug" | "complaint">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "reported" | "pending" | "solved">("all");

  useEffect(() => {
    checkPermissions();
    loadIssues();
  }, []);

  async function checkPermissions() {
    const hasPermission = await checkPermission("admin");
    setHasAccess(hasPermission);
  }

  async function loadIssues() {
    // For now, use mock data. Replace with actual API call when issues table exists
    setIssues(mockIssues);
    setLoading(false);
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter !== "all" && issue.type !== filter) return false;
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported": return <AlertCircle size={16} className="text-red-500" />;
      case "pending": return <Clock size={16} className="text-yellow-500" />;
      case "solved": return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "bug" ? <Bug size={16} /> : <MessageSquare size={16} />;
  };

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to view issues log.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Issues Log</h1>
          <p className="text-gray-600 mt-1">Track system bugs and customer complaints</p>
        </div>
        <AlertTriangle className="text-radiance-goldColor" size={32} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor"
        >
          <option value="all">All Types</option>
          <option value="bug">Bugs Only</option>
          <option value="complaint">Complaints Only</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor"
        >
          <option value="all">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="pending">Pending</option>
          <option value="solved">Solved</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${issue.type === "bug" ? "bg-red-100" : "bg-blue-100"}`}>
                    {getTypeIcon(issue.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{issue.title}</h3>
                      {getStatusIcon(issue.status)}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        issue.status === "reported" ? "bg-red-100 text-red-800" :
                        issue.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {issue.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        issue.priority === "high" ? "bg-red-100 text-red-800" :
                        issue.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{issue.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reported: {new Date(issue.created_at).toLocaleString()}
                      {issue.resolved_at && ` • Resolved: ${new Date(issue.resolved_at).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.type === "bug" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {issue.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredIssues.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No issues found</p>
        </div>
      )}
    </div>
  );
}
