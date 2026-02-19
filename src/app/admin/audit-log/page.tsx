/**
 * Audit Log Page
 * 
 * Track admin actions for forensic/investigation/accountability.
 * Access: Admin, Chief Admin
 */

"use client";

import { useState, useEffect } from "react";
import { getActivityLogs, checkPermission } from "../actions";
import { ClipboardList, FileText } from "lucide-react";

export default function AuditLogPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    checkPermissions();
    loadLogs();
  }, []);

  async function checkPermissions() {
    const hasPermission = await checkPermission("admin");
    setHasAccess(hasPermission);
  }

  async function loadLogs() {
    setLoading(true);
    const result = await getActivityLogs(100);
    if (result.success && result.data) {
      setLogs(result.data);
    }
    setLoading(false);
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Audit Log</h1>
          <p className="text-gray-600 mt-1">Track all admin actions for accountability</p>
        </div>
        <ClipboardList className="text-radiance-goldColor" size={32} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {log.profiles?.email || `Admin ${log.admin_id.slice(0, 8)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.resource_type || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.changes ? JSON.stringify(log.changes) : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No activity logs found</p>
        </div>
      )}
    </div>
  );
}
