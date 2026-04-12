import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Search, Filter, Upload, Download, Eye, Trash2,
  File, FileImage, FileSpreadsheet, CheckCircle, Clock, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Documents() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const deptUsers = await base44.entities.DepartmentUser.filter({ user_email: currentUser.email });
      if (deptUsers.length > 0) {
        const depts = await base44.entities.Department.filter({ id: deptUsers[0].department_id });
        if (depts.length > 0) setDepartment(depts[0]);
      }
    };
    loadData();
  }, []);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", department?.id],
    queryFn: () => department ? base44.entities.Document.filter({ department_id: department.id }, "-created_date") : [],
    enabled: !!department,
  });

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !department) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Document.create({
        department_id: department.id,
        name: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.email,
        status: "pending",
      });
      queryClient.invalidateQueries(["documents"]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusIcons = {
    pending: Clock,
    verified: CheckCircle,
    rejected: XCircle,
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("image")) return FileImage;
    if (fileType?.includes("spreadsheet") || fileType?.includes("excel")) return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-sm text-slate-500">{department?.name || "Loading..."}</p>
        </div>
        <label>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button 
            asChild
            className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold cursor-pointer"
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Document"}
            </span>
          </Button>
        </label>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-[#0f2140] border-[#1e3a5f] text-white">
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Status</SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-[#152a4e]">Pending</SelectItem>
            <SelectItem value="verified" className="text-white focus:bg-[#152a4e]">Verified</SelectItem>
            <SelectItem value="rejected" className="text-white focus:bg-[#152a4e]">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[#152a4e] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-[#1e3a5f]">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-400">No documents found</h3>
          <p className="text-sm text-slate-500 mt-1">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, idx) => {
            const FileIcon = getFileIcon(doc.file_type);
            const StatusIcon = statusIcons[doc.status] || Clock;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] hover:border-[#d4af37]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
                    <FileIcon className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <Badge variant="outline" className={cn("border", statusColors[doc.status])}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {doc.status?.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-medium text-white truncate" title={doc.name}>{doc.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {formatFileSize(doc.file_size)} • {doc.created_date && format(new Date(doc.created_date), "MMM d, yyyy")}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-[#1e3a5f]"
                    onClick={() => window.open(doc.file_url, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-[#1e3a5f]"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = doc.file_url;
                      link.download = doc.name;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}