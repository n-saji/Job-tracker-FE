"use client";

import { useCallback, useEffect, useState } from "react";

import {
  cancelApplication as apiCancelApplication,
  getApplicationEvents,
  listApplications,
} from "@/lib/api/applications";
import { ApiError } from "@/lib/api/jobs";
import {
  ACTIVE_APPLICATION_STATUSES,
  type Application,
  type ApplicationEvent,
} from "@/lib/types/application";

const POLL_INTERVAL_MS = 3000;

function getApiMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function isActive(application: Application): boolean {
  return (ACTIVE_APPLICATION_STATUSES as string[]).includes(
    application.status,
  );
}

export function useApplicationsDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailApplication, setDetailApplication] =
    useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await listApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load applications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  // "Live progress" via polling rather than a second real-time transport
  // (SSE/WebSocket) layered on top of the Redis queue + worker — only polls
  // while something is actually in flight.
  useEffect(() => {
    if (!applications.some(isActive)) {
      return;
    }

    const interval = setInterval(() => {
      void fetchApplications();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [applications, fetchApplications]);

  const fetchEvents = useCallback(async (applicationId: string) => {
    setLoadingEvents(true);
    try {
      const data = await getApplicationEvents(applicationId);
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const openDetail = useCallback(
    (application: Application) => {
      setDetailApplication(application);
      void fetchEvents(application.id);
    },
    [fetchEvents],
  );

  const closeDetail = useCallback(() => {
    setDetailApplication(null);
    setEvents([]);
  }, []);

  // Keep the open detail panel's status/error in sync with the list poll.
  useEffect(() => {
    if (!detailApplication) {
      return;
    }
    const latest = applications.find((a) => a.id === detailApplication.id);
    if (latest && latest.status !== detailApplication.status) {
      setDetailApplication(latest);
    }
  }, [applications, detailApplication]);

  // Poll the event log itself while the open application is still active.
  useEffect(() => {
    if (!detailApplication || !isActive(detailApplication)) {
      return;
    }

    const interval = setInterval(() => {
      void fetchEvents(detailApplication.id);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [detailApplication, fetchEvents]);

  const onCancel = useCallback(
    async (id: string) => {
      setCancellingId(id);
      try {
        const updated = await apiCancelApplication(id);
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? updated : a)),
        );
        setDetailApplication((prev) =>
          prev?.id === id ? updated : prev,
        );
      } catch (err) {
        setError(getApiMessage(err, "Failed to cancel application."));
      } finally {
        setCancellingId(null);
      }
    },
    [],
  );

  return {
    applications,
    loading,
    error,
    detailApplication,
    events,
    loadingEvents,
    cancellingId,
    openDetail,
    closeDetail,
    onCancel,
    refetch: fetchApplications,
  };
}
