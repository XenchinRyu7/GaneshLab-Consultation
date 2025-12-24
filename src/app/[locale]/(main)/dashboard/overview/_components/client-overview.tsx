"use client";

import { useEffect, useState } from "react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { ClientAppointments } from "./client-appointments";
import { ClientMetrics } from "./client-metrics";
import { ClientProjects } from "./client-projects";
import { ClientQuickActions } from "./client-quick-actions";

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  upcomingAppointments: number;
  unreadMessages: number;
  totalMessages: number;
  overallProgress: number;
  nextAppointmentDate: string;
  nextAppointmentPIC: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  picName: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  picName: string;
  status: string;
}

export function ClientOverview() {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        const response = await fetch("/api/client/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setProjects(data.projects);
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error("Failed to fetch client stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientStats();
  }, []);

  if (loading) {
    return <div>Loading client dashboard...</div>;
  }

  if (!stats) {
    return <div>Failed to load client statistics</div>;
  }

  return (
    <>
      <ClientMetrics stats={stats} />

      {/* Project Progress Chart */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card rounded-lg border p-6 shadow-xs">
            <h3 className="mb-4 text-lg font-semibold">Project Progress Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={value => [`${value}%`, "Progress"]} />
                  <Bar dataKey="progress" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
        <ClientAppointments appointments={appointments} />
        <ClientProjects projects={projects} />
      </div>
      <ClientQuickActions />
    </>
  );
}
