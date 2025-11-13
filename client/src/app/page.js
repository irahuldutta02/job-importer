"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Error loading data</h3>
          <div className="mt-2 text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ refreshInterval = 5000 }) {
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let intervalId = null;
    if (isActive) {
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return refreshInterval / 1000; // Reset to 5 seconds
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, refreshInterval]);

  const percentage =
    ((refreshInterval / 1000 - countdown) / (refreshInterval / 1000)) * 100;

  return (
    <div className="flex items-center gap-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          {/* Background circle */}
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-gray-300"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - percentage / 100)}`}
              className="text-blue-600 transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">{countdown}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-blue-900">
            Next update in
          </span>
          <span className="text-xs text-blue-700">{countdown} seconds</span>
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors shadow-sm ${
          isActive
            ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200"
            : "border-green-300 bg-green-100 text-green-800 hover:bg-green-200"
        }`}
      >
        {isActive ? "⏸️ Pause" : "▶️ Resume"}
      </button>
    </div>
  );
}

function TriggerImportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastTriggered, setLastTriggered] = useState(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/imports/trigger-now",
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (result.ok) {
        setLastTriggered(new Date());
      }
    } catch (error) {
      console.error("Failed to trigger import:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleTrigger}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
      >
        {isLoading ? "Triggering..." : "Trigger Import Now"}
      </button>
      {lastTriggered && (
        <span className="text-sm text-gray-600">
          Last triggered: {lastTriggered.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const { data, error, isValidating } = useSWR(
    "http://localhost:4000/api/imports/logs",
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: statsData, isValidating: isStatsValidating } = useSWR(
    "http://localhost:4000/api/imports/stats",
    fetcher,
    { refreshInterval: 10000 }
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage message="Failed to connect to the server. Make sure the backend is running on port 4000." />
        </div>
      </div>
    );
  }

  if (!data) return <LoadingSpinner />;

  const logs = data.logs || [];
  const stats = statsData?.stats || {};

  // Calculate summary statistics
  const totalImports = logs.length;
  const totalJobsProcessed = logs.reduce(
    (sum, log) => sum + (log.totalImported || 0),
    0
  );
  const totalNewJobs = logs.reduce((sum, log) => sum + (log.newJobs || 0), 0);
  const totalFailures = logs.reduce(
    (sum, log) => sum + (log.failedJobs?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Importer Dashboard
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <p className="text-sm text-gray-500">
                    Real-time monitoring of job feed imports
                  </p>
                  <CountdownTimer refreshInterval={5000} />
                </div>
              </div>
              <div className="shrink-0">
                <TriggerImportButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs in DB"
            value={stats.totalJobs?.toLocaleString() || "0"}
            subtitle="All imported jobs"
            color="blue"
          />
          <StatCard
            title="Import Runs"
            value={totalImports}
            subtitle="Recent import runs"
            color="green"
          />
          <StatCard
            title="Jobs Processed"
            value={totalJobsProcessed.toLocaleString()}
            subtitle="From recent runs"
            color="yellow"
          />
          <StatCard
            title="Failed Jobs"
            value={totalFailures}
            subtitle="Processing failures"
            color={totalFailures > 0 ? "red" : "green"}
          />
        </div>

        {/* Import History Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Import History
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Recent import runs from job feed APIs
                </p>
              </div>
              {isValidating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-lg mb-2">
                No import runs found
              </div>
              <p className="text-gray-500">
                Trigger an import to see data here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feed Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fetched
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imported
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => {
                    const duration =
                      log.finishedAt && log.startedAt
                        ? Math.round(
                            (new Date(log.finishedAt) -
                              new Date(log.startedAt)) /
                              1000
                          )
                        : null;

                    const failedCount = (log.failedJobs || []).length;
                    const isRecent = index < 3;

                    // Extract domain from feed URL for cleaner display
                    const feedDomain = log.feedUrl
                      ? new URL(log.feedUrl).hostname
                      : "Unknown";

                    return (
                      <tr
                        key={log._id}
                        className={isRecent ? "bg-blue-50" : ""}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {feedDomain}
                            </div>
                            <div
                              className="text-xs text-gray-500 truncate max-w-xs"
                              title={log.feedUrl}
                            >
                              {log.feedUrl}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(log.startedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {log.totalFetched || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.totalImported || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {log.newJobs || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {log.updatedJobs || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              failedCount > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {failedCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">
                          {duration ? `${duration}s` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Created By{" "}
            <Link
              className="font-bold"
              href={"https://www.linkedin.com/in/irahuldutta02"}
            >
              Rahul Dutta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
