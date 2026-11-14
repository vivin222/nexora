import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertOctagon, 
  UserX, 
  Clock, 
  Mail,
  Shield,
  Activity,
  Award
} from 'lucide-react';
import { AdminStudentItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../api/client';

interface AdminStudentsViewProps {
  students: AdminStudentItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({
  students,
  loading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Inspection detail modal state
  const [inspectStudent, setInspectStudent] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Status update state
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.institution || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInspect = async (studentId: string) => {
    setInspectLoading(true);
    try {
      const data = await api.getStudentDetails(studentId);
      setInspectStudent(data);
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.updateStudentStatus(studentId, newStatus);
      await onRefresh();
      if (inspectStudent && inspectStudent.student.id === studentId) {
        setInspectStudent({
          ...inspectStudent,
          student: { ...inspectStudent.student, status: newStatus }
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="lime" size="sm">APPROVED / ACTIVE</Badge>;
      case 'pending':
        return <Badge variant="amber" size="sm">PENDING REVIEW</Badge>;
      case 'rejected':
        return <Badge variant="crimson" size="sm">REJECTED</Badge>;
      case 'suspended':
        return <Badge variant="crimson" size="sm">SUSPENDED</Badge>;
      case 'inactive':
        return <Badge variant="cyan" size="sm">INACTIVE</Badge>;
      default:
        return <Badge variant="cyan" size="sm">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">STUDENT DIRECTORY</Badge>
            <span className="text-zinc-500 text-xs font-mono">{filtered.length} Learners</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Institutional Roster & Account Administration
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Manage student access permissions, examine neural competency graphs, and oversee learner accounts.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          icon={<Clock className="w-3.5 h-3.5" />}
        >
          {loading ? 'Refreshing...' : 'Refresh Directory'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search student by name, email, or university..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F12] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#0B0F12] border border-white/10 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400 font-mono">
          Loading student roster...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-12 text-center">
          <Users className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No Students Match Search</h3>
          <p className="text-xs text-zinc-400 mt-1">Try broadening your search keyword or clearing the status filter.</p>
        </div>
      ) : (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C0E] border-b border-white/5 text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Institution / Department</th>
                  <th className="py-3 px-4">Target Career</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{student.full_name}</div>
                      <div className="text-zinc-500 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      <div>{student.institution || 'Standard Campus'}</div>
                      <div className="text-zinc-500 text-[11px]">{student.department || 'Computer Science'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-zinc-300 text-[11px]">
                        {student.target_career_title || 'Full Stack Developer'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleInspect(student.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {student.status === 'suspended' ? (
                          <button
                            onClick={() => handleStatusChange(student.id, 'approved')}
                            disabled={actionLoading}
                            className="px-2 py-1 rounded-lg bg-[#C5F45B]/10 hover:bg-[#C5F45B]/20 text-[#C5F45B] text-[11px] font-mono"
                          >
                            Reactivate
                          </button>
                        ) : student.status === 'approved' ? (
                          <button
                            onClick={() => handleStatusChange(student.id, 'suspended')}
                            disabled={actionLoading}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-mono"
                          >
                            Suspend
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Student Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0B0F12] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{inspectStudent.student.full_name}</h3>
                <span className="text-xs font-mono text-[#35D9F2]">{inspectStudent.student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(inspectStudent.student.status)}
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#11171B] border border-white/5 rounded-xl p-4 mb-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block">EDUCATION</span>
                <span className="text-white font-medium">{inspectStudent.student.education_level || 'Undergraduate'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">DEPARTMENT</span>
                <span className="text-white font-medium">{inspectStudent.student.department || 'CS'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">GRADUATION</span>
                <span className="text-white font-medium">{inspectStudent.student.graduation_year || '2026'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">WEEKLY COMMIT</span>
                <span className="text-white font-medium">{inspectStudent.student.weekly_hours || 10} hrs/wk</span>
              </div>
            </div>

            {/* Verified Skills */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
                ASSESSED SKILLS ({inspectStudent.skills?.length || 0})
              </h4>
              {(!inspectStudent.skills || inspectStudent.skills.length === 0) ? (
                <p className="text-xs text-zinc-500 italic">No skills calibrated yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {inspectStudent.skills.map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11171B] border border-white/5 text-xs">
                      <span className="text-zinc-200">{s.name}</span>
                      <span className="font-mono text-[#35D9F2] font-bold text-[10px]">{s.proficiency}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones & Roadmaps */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
                ROADMAP MILESTONES ({inspectStudent.milestones?.length || 0})
              </h4>
              {(!inspectStudent.milestones || inspectStudent.milestones.length === 0) ? (
                <p className="text-xs text-zinc-500 italic">No milestones assigned yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {inspectStudent.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#080C0E] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-zinc-200 font-medium">{m.title}</span>
                      </div>
                      <Badge variant={m.status === 'completed' ? 'lime' : m.status === 'in_progress' ? 'cyan' : 'neutral'} size="sm">
                        {m.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment Records */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
                EVALUATION RECORDS ({inspectStudent.assessments?.length || 0})
              </h4>
              {(!inspectStudent.assessments || inspectStudent.assessments.length === 0) ? (
                <p className="text-xs text-zinc-500 italic">No assessments submitted yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {inspectStudent.assessments.map((a: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#080C0E] border border-white/5 text-xs">
                      <span className="text-zinc-300">{a.assessment_title || 'Skill Calibration'}</span>
                      <span className="font-mono text-[#C5F45B] font-bold">{a.score_achieved}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                {inspectStudent.student.status !== 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(inspectStudent.student.id, 'suspended')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono hover:bg-rose-500/20"
                  >
                    Suspend Student
                  </button>
                )}
                {inspectStudent.student.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(inspectStudent.student.id, 'approved')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#C5F45B] text-black font-semibold text-xs transition-colors hover:bg-[#b2e04d]"
                  >
                    Activate / Approve
                  </button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setInspectStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
