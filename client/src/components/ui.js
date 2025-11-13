"use client";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusIndicator({ status }) {
  if (status === "success") {
    return (
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-sm text-green-600">Active</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
        <span className="text-sm text-red-600">Error</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
      <span className="text-sm text-gray-600">Idle</span>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`px-4 py-5 sm:px-6 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
}
