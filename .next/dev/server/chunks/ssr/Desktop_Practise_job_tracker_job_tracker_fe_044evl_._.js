module.exports = [
"[project]/Desktop/Practise/job_tracker/job_tracker_fe/lib/jobs-api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "ApiError",
    ()=>ApiError,
    "createJob",
    ()=>createJob,
    "deleteJob",
    ()=>deleteJob,
    "existsApplyLink",
    ()=>existsApplyLink,
    "formatAppliedDate",
    ()=>formatAppliedDate,
    "getJob",
    ()=>getJob,
    "listJobs",
    ()=>listJobs,
    "normalizeApplyLink",
    ()=>normalizeApplyLink,
    "toDateTimeLocalValue",
    ()=>toDateTimeLocalValue,
    "toIsoFromDateTimeLocal",
    ()=>toIsoFromDateTimeLocal,
    "updateJob",
    ()=>updateJob
]);
const DEFAULT_API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
class ApiError extends Error {
    status;
    code;
    constructor(message, status, code){
        super(message);
        this.status = status;
        this.code = code;
        this.name = "ApiError";
    }
}
function buildQuery(params) {
    const query = new URLSearchParams();
    if (params.page) {
        query.set("page", String(params.page));
    }
    if (params.limit) {
        query.set("limit", String(params.limit));
    }
    if (params.status) {
        query.set("status", params.status);
    }
    if (params.company?.trim()) {
        query.set("company", params.company.trim());
    }
    return query.toString();
}
async function requestJson(path, init) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers ?? {}
        },
        cache: "no-store"
    });
    if (!response.ok) {
        let message = "Request failed";
        let code = "UNKNOWN_ERROR";
        try {
            const payload = await response.json();
            if (payload.error?.message) {
                message = payload.error.message;
            }
            if (payload.error?.code) {
                code = payload.error.code;
            }
        } catch  {
            message = response.statusText || message;
        }
        throw new ApiError(message, response.status, code);
    }
    if (response.status === 204) {
        return undefined;
    }
    return await response.json();
}
function normalizeApplyLink(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return "";
    }
    try {
        const parsed = new URL(trimmed);
        parsed.protocol = parsed.protocol.toLowerCase();
        parsed.hostname = parsed.hostname.toLowerCase();
        parsed.hash = "";
        if (parsed.pathname !== "/") {
            parsed.pathname = parsed.pathname.replace(/\/$/, "");
        }
        return parsed.toString();
    } catch  {
        return trimmed;
    }
}
function toIsoFromDateTimeLocal(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    return parsed.toISOString();
}
function toDateTimeLocalValue(iso) {
    if (!iso) {
        return "";
    }
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    const pad = (n)=>String(n).padStart(2, "0");
    const year = parsed.getFullYear();
    const month = pad(parsed.getMonth() + 1);
    const day = pad(parsed.getDate());
    const hours = pad(parsed.getHours());
    const minutes = pad(parsed.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
function formatAppliedDate(iso) {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    }).format(parsed);
}
async function listJobs(params) {
    const query = buildQuery(params);
    const path = query ? `/jobs?${query}` : "/jobs";
    return requestJson(path);
}
async function getJob(id) {
    return requestJson(`/jobs/${id}`);
}
async function createJob(payload) {
    return requestJson("/jobs", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
async function updateJob(id, payload) {
    return requestJson(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
async function deleteJob(id) {
    await requestJson(`/jobs/${id}`, {
        method: "DELETE"
    });
}
async function existsApplyLink(applyLink) {
    const normalized = normalizeApplyLink(applyLink);
    const query = new URLSearchParams({
        apply_link: normalized
    });
    const payload = await requestJson(`/jobs/exists?${query.toString()}`);
    return payload.exists;
}
;
}),
"[project]/Desktop/Practise/job_tracker/job_tracker_fe/lib/job-types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JOB_STATUSES",
    ()=>JOB_STATUSES
]);
const JOB_STATUSES = [
    "applied",
    "interview",
    "offer",
    "rejected",
    "withdrawn"
];
}),
"[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Practise/job_tracker/job_tracker_fe/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Practise/job_tracker/job_tracker_fe/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Practise/job_tracker/job_tracker_fe/lib/jobs-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Practise/job_tracker/job_tracker_fe/lib/job-types.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const STATUS_LABELS = {
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn"
};
const PAGE_LIMIT_OPTIONS = [
    20,
    50,
    100
];
function buildEmptyForm() {
    return {
        company_name: "",
        role_title: "",
        location: "",
        apply_link: "",
        linkedin_job_url: "",
        resume_link: "",
        status: "applied",
        salary_text: "",
        is_easy_apply: false,
        applied_at: ""
    };
}
function formFromJob(job) {
    return {
        company_name: job.company_name,
        role_title: job.role_title,
        location: job.location,
        apply_link: job.apply_link,
        linkedin_job_url: job.linkedin_job_url,
        resume_link: job.resume_link,
        status: job.status,
        salary_text: job.salary_text,
        is_easy_apply: job.is_easy_apply,
        applied_at: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toDateTimeLocalValue"])(job.applied_at)
    };
}
function analyticsSeed() {
    return {
        total: 0,
        byStatus: {
            applied: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
            withdrawn: 0
        }
    };
}
function getApiMessage(error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"]) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Something went wrong. Please try again.";
}
function getStatusBadgeClass(status) {
    if (status === "offer") {
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
    if (status === "interview") {
        return "bg-sky-100 text-sky-700 border border-sky-200";
    }
    if (status === "applied") {
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
    if (status === "rejected") {
        return "bg-rose-100 text-rose-700 border border-rose-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
}
function Home() {
    const [jobs, setJobs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(20);
    const [total, setTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [companyFilter, setCompanyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loadingJobs, setLoadingJobs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [jobsError, setJobsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [analytics, setAnalytics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(analyticsSeed());
    const [loadingAnalytics, setLoadingAnalytics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isFormOpen, setIsFormOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCreateMode, setIsCreateMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [originalJob, setOriginalJob] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(buildEmptyForm());
    const [formErrors, setFormErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [checkingApplyLink, setCheckingApplyLink] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingId, setDeletingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const totalPages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!total) {
            return 1;
        }
        return Math.max(1, Math.ceil(total / limit));
    }, [
        total,
        limit
    ]);
    const loadJobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoadingJobs(true);
        setJobsError("");
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listJobs"])({
                page,
                limit,
                status: statusFilter,
                company: companyFilter
            });
            setJobs(response.data);
            setTotal(response.total);
            if (response.page !== page) {
                setPage(response.page);
            }
            if (response.limit !== limit) {
                setLimit(response.limit);
            }
        } catch (error) {
            setJobsError(getApiMessage(error));
        } finally{
            setLoadingJobs(false);
        }
    }, [
        companyFilter,
        limit,
        page,
        statusFilter
    ]);
    const loadAnalytics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoadingAnalytics(true);
        try {
            const [overall, ...statusBreakdown] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listJobs"])({
                    page: 1,
                    limit: 1
                }),
                ...__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].map((status)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listJobs"])({
                        page: 1,
                        limit: 1,
                        status
                    }))
            ]);
            const byStatus = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].reduce((acc, status, index)=>{
                acc[status] = statusBreakdown[index]?.total ?? 0;
                return acc;
            }, {
                applied: 0,
                interview: 0,
                offer: 0,
                rejected: 0,
                withdrawn: 0
            });
            setAnalytics({
                total: overall.total,
                byStatus
            });
        } catch  {
            setAnalytics(analyticsSeed());
        } finally{
            setLoadingAnalytics(false);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void loadJobs();
    }, [
        loadJobs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void loadAnalytics();
    }, [
        loadAnalytics
    ]);
    const refreshAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        await Promise.all([
            loadJobs(),
            loadAnalytics()
        ]);
    }, [
        loadAnalytics,
        loadJobs
    ]);
    function closeForm() {
        setIsFormOpen(false);
        setIsCreateMode(true);
        setEditingId(null);
        setOriginalJob(null);
        setForm(buildEmptyForm());
        setFormErrors({});
        setSubmitting(false);
        setCheckingApplyLink(false);
    }
    function openCreate() {
        setIsCreateMode(true);
        setEditingId(null);
        setOriginalJob(null);
        setForm(buildEmptyForm());
        setFormErrors({});
        setIsFormOpen(true);
    }
    async function openEdit(id) {
        setNotice(null);
        setIsCreateMode(false);
        setEditingId(id);
        setIsFormOpen(true);
        setSubmitting(true);
        setFormErrors({});
        try {
            const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getJob"])(id);
            setOriginalJob(job);
            setForm(formFromJob(job));
        } catch (error) {
            setNotice({
                kind: "error",
                message: getApiMessage(error)
            });
            closeForm();
        } finally{
            setSubmitting(false);
        }
    }
    function validateFormInput(value) {
        const nextErrors = {};
        if (!value.company_name.trim()) {
            nextErrors.company_name = "Company name is required.";
        }
        if (!value.role_title.trim()) {
            nextErrors.role_title = "Role title is required.";
        }
        if (!value.location.trim()) {
            nextErrors.location = "Location is required.";
        }
        const normalizedApplyLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(value.apply_link);
        if (!normalizedApplyLink) {
            nextErrors.apply_link = "Apply link is required.";
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].includes(value.status)) {
            nextErrors.status = "Status is invalid.";
        }
        if (!value.applied_at) {
            nextErrors.applied_at = "Applied date and time is required.";
        } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toIsoFromDateTimeLocal"])(value.applied_at)) {
            nextErrors.applied_at = "Applied date and time is invalid.";
        }
        return nextErrors;
    }
    async function validateApplyLinkUniqueness(link) {
        const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(link);
        if (!normalized) {
            return "Apply link is required.";
        }
        if (!isCreateMode && originalJob) {
            const originalNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(originalJob.apply_link);
            if (normalized === originalNormalized) {
                return "";
            }
        }
        setCheckingApplyLink(true);
        try {
            const exists = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["existsApplyLink"])(normalized);
            return exists ? "This apply link is already tracked." : "";
        } catch  {
            return "Unable to verify apply link now. You can still submit.";
        } finally{
            setCheckingApplyLink(false);
        }
    }
    function buildCreatePayload(value) {
        return {
            company_name: value.company_name.trim(),
            role_title: value.role_title.trim(),
            location: value.location.trim(),
            apply_link: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(value.apply_link),
            linkedin_job_url: value.linkedin_job_url.trim(),
            resume_link: value.resume_link.trim(),
            status: value.status,
            salary_text: value.salary_text.trim(),
            is_easy_apply: value.is_easy_apply,
            applied_at: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toIsoFromDateTimeLocal"])(value.applied_at)
        };
    }
    function buildUpdatePayload(value, current) {
        const nextAppliedAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toIsoFromDateTimeLocal"])(value.applied_at);
        const payload = {};
        const withTrim = {
            company_name: value.company_name.trim(),
            role_title: value.role_title.trim(),
            location: value.location.trim(),
            apply_link: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(value.apply_link),
            linkedin_job_url: value.linkedin_job_url.trim(),
            resume_link: value.resume_link.trim(),
            status: value.status,
            salary_text: value.salary_text.trim(),
            is_easy_apply: value.is_easy_apply,
            applied_at: nextAppliedAt
        };
        if (withTrim.company_name !== current.company_name) {
            payload.company_name = withTrim.company_name;
        }
        if (withTrim.role_title !== current.role_title) {
            payload.role_title = withTrim.role_title;
        }
        if (withTrim.location !== current.location) {
            payload.location = withTrim.location;
        }
        if (withTrim.apply_link !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeApplyLink"])(current.apply_link)) {
            payload.apply_link = withTrim.apply_link;
        }
        if (withTrim.linkedin_job_url !== current.linkedin_job_url) {
            payload.linkedin_job_url = withTrim.linkedin_job_url;
        }
        if (withTrim.resume_link !== current.resume_link) {
            payload.resume_link = withTrim.resume_link;
        }
        if (withTrim.status !== current.status) {
            payload.status = withTrim.status;
        }
        if (withTrim.salary_text !== current.salary_text) {
            payload.salary_text = withTrim.salary_text;
        }
        if (withTrim.is_easy_apply !== current.is_easy_apply) {
            payload.is_easy_apply = withTrim.is_easy_apply;
        }
        if (withTrim.applied_at !== current.applied_at) {
            payload.applied_at = withTrim.applied_at;
        }
        return payload;
    }
    async function onSubmitForm(event) {
        event.preventDefault();
        setNotice(null);
        const nextErrors = validateFormInput(form);
        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }
        const applyLinkError = await validateApplyLinkUniqueness(form.apply_link);
        if (applyLinkError && applyLinkError !== "Unable to verify apply link now. You can still submit.") {
            setFormErrors((prev)=>({
                    ...prev,
                    apply_link: applyLinkError
                }));
            return;
        }
        if (applyLinkError) {
            setNotice({
                kind: "error",
                message: applyLinkError
            });
        }
        setSubmitting(true);
        setFormErrors({});
        try {
            if (isCreateMode) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJob"])(buildCreatePayload(form));
                setNotice({
                    kind: "success",
                    message: "Job application created."
                });
            } else {
                if (!editingId || !originalJob) {
                    throw new Error("Unable to update. Missing job context.");
                }
                const payload = buildUpdatePayload(form, originalJob);
                if (Object.keys(payload).length === 0) {
                    setFormErrors({
                        form: "No changes detected to update."
                    });
                    return;
                }
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateJob"])(editingId, payload);
                setNotice({
                    kind: "success",
                    message: "Job application updated."
                });
            }
            closeForm();
            await refreshAll();
        } catch (error) {
            const message = getApiMessage(error);
            setFormErrors({
                form: message
            });
        } finally{
            setSubmitting(false);
        }
    }
    async function onDelete(id) {
        const confirmed = window.confirm("Delete this job application?");
        if (!confirmed) {
            return;
        }
        setDeletingId(id);
        setNotice(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteJob"])(id);
            setNotice({
                kind: "success",
                message: "Job application deleted."
            });
            await refreshAll();
        } catch (error) {
            setNotice({
                kind: "error",
                message: getApiMessage(error)
            });
        } finally{
            setDeletingId(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen overflow-hidden bg-[linear-gradient(120deg,#f8fafc_0%,#f1f5f9_38%,#e2e8f0_100%)] pb-12",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl"
            }, void 0, false, {
                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                lineNumber: 448,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl"
            }, void 0, false, {
                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                lineNumber: 449,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "mb-8 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-xl backdrop-blur",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-5 md:flex-row md:items-center md:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold uppercase tracking-[0.22em] text-slate-500",
                                            children: "Job Tracker Dashboard"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 455,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl",
                                            children: "Track every role, interview, and offer."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 458,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm text-slate-600",
                                            children: [
                                                "Connected API base URL: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold text-slate-900",
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_BASE_URL"]
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 461,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 454,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: openCreate,
                                    className: "h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700",
                                    children: "New Application"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 465,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                            lineNumber: 453,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                        lineNumber: 452,
                        columnNumber: 9
                    }, this),
                    notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mb-6 rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`,
                        children: notice.message
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                        lineNumber: 476,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500",
                                        children: "Total Jobs"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 489,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-3 text-3xl font-semibold text-slate-900",
                                        children: loadingAnalytics ? "..." : analytics.total
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 490,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                lineNumber: 488,
                                columnNumber: 11
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].slice(0, 2).map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500",
                                            children: STATUS_LABELS[status]
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 496,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-3 text-3xl font-semibold text-slate-900",
                                            children: loadingAnalytics ? "..." : analytics.byStatus[status]
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 499,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, status, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 495,
                                    columnNumber: 13
                                }, this)),
                            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].slice(2).map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500",
                                            children: STATUS_LABELS[status]
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 506,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-3 text-3xl font-semibold text-slate-900",
                                            children: loadingAnalytics ? "..." : analytics.byStatus[status]
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 509,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, status, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 505,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                        lineNumber: 487,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur sm:p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500",
                                                children: [
                                                    "Status",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: statusFilter,
                                                        onChange: (event)=>{
                                                            setPage(1);
                                                            setStatusFilter(event.target.value);
                                                        },
                                                        className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "All statuses"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 529,
                                                                columnNumber: 19
                                                            }, this),
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: status,
                                                                    children: STATUS_LABELS[status]
                                                                }, status, false, {
                                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                    lineNumber: 531,
                                                                    columnNumber: 21
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 521,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 519,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2",
                                                children: [
                                                    "Company",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: companyFilter,
                                                        onChange: (event)=>{
                                                            setPage(1);
                                                            setCompanyFilter(event.target.value);
                                                        },
                                                        placeholder: "Search company",
                                                        className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 538,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 518,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
                                        children: [
                                            "Page size",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: limit,
                                                onChange: (event)=>{
                                                    setPage(1);
                                                    setLimit(Number(event.target.value));
                                                },
                                                className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring",
                                                children: PAGE_LIMIT_OPTIONS.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: value,
                                                        children: value
                                                    }, value, false, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 563,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 554,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 552,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                lineNumber: 517,
                                columnNumber: 11
                            }, this),
                            jobsError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700",
                                children: jobsError
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                lineNumber: 572,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-hidden rounded-2xl border border-slate-200",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "min-w-full border-collapse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "bg-slate-100/70",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500",
                                                            children: "Company & Role"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 582,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500",
                                                            children: "Status"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 585,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500",
                                                            children: "Applied"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 588,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500",
                                                            children: "Location"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 591,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500",
                                                            children: "Actions"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 594,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 581,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 580,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: loadingJobs ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-8 text-center text-sm text-slate-500",
                                                        colSpan: 5,
                                                        children: "Loading jobs..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 602,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 21
                                                }, this) : jobs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-8 text-center text-sm text-slate-500",
                                                        colSpan: 5,
                                                        children: "No jobs found for the current filters."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 608,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 607,
                                                    columnNumber: 21
                                                }, this) : jobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-t border-slate-100",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-4 align-top",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-semibold text-slate-900",
                                                                        children: job.company_name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                        lineNumber: 616,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-slate-600",
                                                                        children: job.role_title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                        lineNumber: 617,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                        href: job.apply_link,
                                                                        target: "_blank",
                                                                        rel: "noreferrer",
                                                                        className: "mt-1 inline-block text-xs font-semibold text-cyan-700 hover:text-cyan-900",
                                                                        children: "Open apply link"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                        lineNumber: 618,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 615,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-4 align-top",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(job.status)}`,
                                                                    children: STATUS_LABELS[job.status]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                    lineNumber: 628,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 627,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-4 align-top text-sm text-slate-700",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$jobs$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatAppliedDate"])(job.applied_at)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 632,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-4 align-top text-sm text-slate-700",
                                                                children: job.location || "-"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 633,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-4 align-top",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>void openEdit(job.id),
                                                                            className: "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500",
                                                                            children: "Edit"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                            lineNumber: 636,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>void onDelete(job.id),
                                                                            disabled: deletingId === job.id,
                                                                            className: "rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50",
                                                                            children: deletingId === job.id ? "Deleting..." : "Delete"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                            lineNumber: 643,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                    lineNumber: 635,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                                lineNumber: 634,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, job.id, true, {
                                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                        lineNumber: 614,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 579,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 578,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                lineNumber: 577,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-600",
                                        children: [
                                            "Page ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold text-slate-900",
                                                children: page
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 663,
                                                columnNumber: 20
                                            }, this),
                                            " of ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold text-slate-900",
                                                children: totalPages
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 663,
                                                columnNumber: 84
                                            }, this),
                                            " (",
                                            total,
                                            " jobs)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 662,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setPage((current)=>Math.max(1, current - 1)),
                                                disabled: page <= 1 || loadingJobs,
                                                className: "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
                                                children: "Previous"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 666,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setPage((current)=>Math.min(totalPages, current + 1)),
                                                disabled: page >= totalPages || loadingJobs,
                                                className: "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
                                                children: "Next"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                lineNumber: 674,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 665,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                lineNumber: 661,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                        lineNumber: 516,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                lineNumber: 451,
                columnNumber: 7
            }, this),
            isFormOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500",
                                            children: isCreateMode ? "Create" : "Edit"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 692,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold text-slate-900",
                                            children: isCreateMode ? "New Job Application" : "Update Job Application"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 695,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 691,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: closeForm,
                                    className: "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700",
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 699,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                            lineNumber: 690,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: (event)=>void onSubmitForm(event),
                            className: "space-y-3",
                            children: [
                                formErrors.form && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700",
                                    children: formErrors.form
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 710,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Company Name",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.company_name,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                company_name: event.target.value
                                                            })),
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 718,
                                                    columnNumber: 19
                                                }, this),
                                                formErrors.company_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mt-1 block text-xs text-rose-700",
                                                    children: formErrors.company_name
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 47
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 716,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Role Title",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.role_title,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                role_title: event.target.value
                                                            })),
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 728,
                                                    columnNumber: 19
                                                }, this),
                                                formErrors.role_title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mt-1 block text-xs text-rose-700",
                                                    children: formErrors.role_title
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 733,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 726,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Location",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.location,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                location: event.target.value
                                                            })),
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 738,
                                                    columnNumber: 19
                                                }, this),
                                                formErrors.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mt-1 block text-xs text-rose-700",
                                                    children: formErrors.location
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 743,
                                                    columnNumber: 43
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 736,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Status",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.status,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                status: event.target.value
                                                            })),
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring",
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$lib$2f$job$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JOB_STATUSES"].map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: status,
                                                            children: STATUS_LABELS[status]
                                                        }, status, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 754,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 748,
                                                    columnNumber: 19
                                                }, this),
                                                formErrors.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mt-1 block text-xs text-rose-700",
                                                    children: formErrors.status
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 759,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 746,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700 sm:col-span-2",
                                            children: [
                                                "Apply Link",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.apply_link,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                apply_link: event.target.value
                                                            })),
                                                    onBlur: ()=>{
                                                        void (async ()=>{
                                                            const applyLinkError = await validateApplyLinkUniqueness(form.apply_link);
                                                            setFormErrors((prev)=>({
                                                                    ...prev,
                                                                    apply_link: applyLinkError === "Unable to verify apply link now. You can still submit." ? undefined : applyLinkError || undefined
                                                                }));
                                                        })();
                                                    },
                                                    placeholder: "https://...",
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 764,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-1 flex items-center justify-between text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-rose-700",
                                                            children: formErrors.apply_link
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 783,
                                                            columnNumber: 21
                                                        }, this),
                                                        checkingApplyLink && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-slate-500",
                                                            children: "Checking link..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                            lineNumber: 784,
                                                            columnNumber: 43
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 782,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 762,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "LinkedIn Job URL",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.linkedin_job_url,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                linkedin_job_url: event.target.value
                                                            })),
                                                    placeholder: "Optional",
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 790,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 788,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Resume Link",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.resume_link,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                resume_link: event.target.value
                                                            })),
                                                    placeholder: "Optional",
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 800,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 798,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Salary Text",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: form.salary_text,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                salary_text: event.target.value
                                                            })),
                                                    placeholder: "Optional",
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 810,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 808,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-slate-700",
                                            children: [
                                                "Applied At",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "datetime-local",
                                                    value: form.applied_at,
                                                    onChange: (event)=>setForm((prev)=>({
                                                                ...prev,
                                                                applied_at: event.target.value
                                                            })),
                                                    className: "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 820,
                                                    columnNumber: 19
                                                }, this),
                                                formErrors.applied_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "mt-1 block text-xs text-rose-700",
                                                    children: formErrors.applied_at
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                                    lineNumber: 826,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 818,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 715,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-2 text-sm font-medium text-slate-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: form.is_easy_apply,
                                            onChange: (event)=>setForm((prev)=>({
                                                        ...prev,
                                                        is_easy_apply: event.target.checked
                                                    })),
                                            className: "h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                            lineNumber: 831,
                                            columnNumber: 17
                                        }, this),
                                        "Easy Apply"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 830,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Practise$2f$job_tracker$2f$job_tracker_fe$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: submitting,
                                        className: "h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60",
                                        children: submitting ? "Saving..." : isCreateMode ? "Create Job" : "Save Changes"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                        lineNumber: 841,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                                    lineNumber: 840,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                            lineNumber: 708,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                    lineNumber: 689,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
                lineNumber: 688,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Practise/job_tracker/job_tracker_fe/app/page.tsx",
        lineNumber: 447,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_Practise_job_tracker_job_tracker_fe_044evl_._.js.map