import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  UserCheck, 
  Clock, 
  GraduationCap, 
  Building2, 
  Mail, 
  Eye, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { AdminStudentItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminRegistrationsViewProps {
  pendingStudents: AdminStudentItem[];
  loading: boolean;
  onApprove: (studentId: string) => Promise<void>;
  onReject: (studentId: string, reason: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const AdminRegistrationsView: React.FC<AdminRegistrationsViewProps> = ({
  pendingStudents,
  loading,
  onApprove,
  onReject,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Detail Drawer state
  const [detailStudent, setDetailStudent] = useState<AdminStudentItem | null>(null);

  // Filtered applicants
  const departments = Array.from(new Set(pendingStudents.map(s => s.department).filter(Boolean)));
  
  const filtered = pendingStudents.filter(s => {
    const matchesSearch = 
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.institution || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenReject = (student: AdminStudentItem) => {
    setSelectedStudent(student);
    setRejectionReason('Registration details could not be validated against official university enrollment rosters.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedStudent) return;
    setSubmittingAction(true);
    try {
      await onReject(selectedStudent.id, rejectionReason);
      setRejectModalOpen(false);
      setSelectedStudent(null);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleApprove = async (studentId: string) => {
    setSubmittingAction(true);
    try {
      await onApprove(studentId);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber" size="sm">PENDING ADMISSIONS QUEUE</Badge>
            <span className="text-zinc-500 text-xs font-mono">{filtered.length} Applicant{filtered.length === 1 ? '' : 's'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Student Registration Review
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Verify candidate institutional credentials, academic batches, and authorize AI Career Twin generation.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          icon={<Clock className="w-3.5 h-3.5" />}
        >
          {loading ? 'Refreshing...' : 'Refresh Queue'}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search candidate name, email, or campus institution..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F12] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        {departments.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0B0F12] border border-white/10 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Queue Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400 font-mono">
          Loading registration submissions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 flex items-center justify-center mx-auto mb-3 text-[#C5F45B]">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">All Registrations Processed</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            There are no pending student applications in the review queue. All students have been verified.
          </p>
        </div>
      ) : (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C0E] border-b border-white/5 text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Academic Background</th>
                  <th className="py-3 px-4">Career Goal</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{student.full_name}</div>
                      <div className="text-zinc-500 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{student.email}</span>
                      </div>
                    </td>

                    {/* Academic */}
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200 font-medium">
                        {student.institution || 'Institutional Roster'}
                      </div>
                      <div className="text-zinc-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{student.department || 'Computer Science'}</span>
                        {student.graduation_year && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-zinc-300">
                            '{student.graduation_year.slice(-2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Career Goal */}
                    <td className="py-3.5 px-4">
                      <Badge variant="cyan" size="sm">
                        {student.target_career_title || student.headline || 'Full Stack Developer'}
                      </Badge>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailStudent(student)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Inspect Credentials"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(student.id)}
                          disabled={submittingAction}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C5F45B] hover:bg-[#b2e04d] text-black font-semibold text-[11px] transition-all shadow-[0_0_10px_rgba(197,244,91,0.2)] disabled:opacity-50"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(student)}
                          disabled={submittingAction}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-[11px] transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason */}
      {rejectModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0B0F12] border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Reject Student Application</h3>
            </div>
            
            <p className="text-xs text-zinc-400 mb-4">
              Specify the institutional justification for declining access for{' '}
              <span className="text-white font-medium">{selectedStudent.full_name}</span> ({selectedStudent.email}).
              This message will be visible to the student upon sign-in.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-mono text-zinc-400">REJECTION REASON / REMEDIATION *</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full bg-[#11171B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={submittingAction}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                onClick={handleConfirmReject}
                disabled={submittingAction || !rejectionReason.trim()}
              >
                {submittingAction ? 'Processing...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0B0F12] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{detailStudent.full_name}</h3>
                <span className="text-xs font-mono text-zinc-400">{detailStudent.email}</span>
              </div>
              <Badge variant="amber" size="sm">PENDING APPROVAL</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">DEGREE PROGRAM</span>
                <span className="text-white">{detailStudent.education_level || 'Undergraduate'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">CAMPUS / INSTITUTION</span>
                <span className="text-white">{detailStudent.institution || 'Standard Roster'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">DEPARTMENT</span>
                <span className="text-white">{detailStudent.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">GRADUATION BATCH</span>
                <span className="text-white">{detailStudent.graduation_year || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">TARGET CAREER PATH</span>
                <span className="text-[#35D9F2] font-semibold">{detailStudent.target_career_title || 'Full Stack Developer'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">APPLICATION TIMESTAMP</span>
                <span className="text-zinc-400">{new Date(detailStudent.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDetailStudent(null)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  const id = detailStudent.id;
                  setDetailStudent(null);
                  handleApprove(id);
                }}
              >
                Approve Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
