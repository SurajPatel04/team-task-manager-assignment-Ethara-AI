import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Users, Clock, Plus, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CreateProjectModal from '../../components/modals/CreateProjectModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import { useSelector } from 'react-redux';

export default function ProjectsList() {
    const { user } = useSelector((state) => state.auth);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects(page, search);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search]);

    const fetchProjects = async (currentPage, searchQuery = '') => {
        setLoading(true);
        try {
            const response = await api.get(`/project?page=${currentPage}&limit=10&search=${searchQuery}`);
            if (response.data.success) {
                setProjects(response.data.data.projects);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
            toast.error('Could not load projects');
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteProject = (project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            const res = await api.delete(`/project/${projectToDelete._id}`);
            if (res.data.success) {
                toast.success('Project deleted successfully');
                fetchProjects(page);
                setIsDeleteModalOpen(false);
                setProjectToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete project', err);
            toast.error(err.response?.data?.message || 'Could not delete project');
        }
    };



    return (
        <div className="max-w-[1400px] mx-auto px-8 py-8 animate-in fade-in duration-500 font-sans text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight flex items-center gap-3">
                        <FolderKanban className="w-7 h-7 text-[#0F172A]" />
                        All Projects
                    </h1>
                    <p className="text-[14px] text-slate-500 mt-1">Manage and view all your active projects</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-grow md:w-[300px]">
                        <input 
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                            className="w-full bg-white border border-slate-200 rounded-[8px] pl-4 pr-10 py-2.5 text-[13px] outline-none focus:border-[#0F172A] transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#0F172A] text-white px-5 py-2.5 rounded-[8px] text-[13px] font-semibold flex items-center gap-2 shadow-sm hover:opacity-90 transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Project</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[16px] shadow-sm animate-pulse">
                    <Loader2 className="w-8 h-8 text-[#0F172A] animate-spin mb-4" />
                    <p className="text-[14px] text-slate-500 font-medium">Fetching projects...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[16px] p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderKanban className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-[18px] font-bold text-slate-900 mb-2">{search ? 'No projects match your search' : 'No projects yet'}</h3>
                    <p className="text-[14px] text-slate-500 mb-6 max-w-sm mx-auto">
                        {search ? "We couldn't find any projects matching your criteria. Try a different keyword." : "Get started by creating your first project to organize tasks and collaborate with your team."}
                    </p>
                    {!search && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[#0F172A] text-white px-6 py-2.5 rounded-[8px] text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm hover:opacity-90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create My First Project
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        {projects.map((project) => {
                            const isCreator = project.createdBy?._id === user?._id || project.createdBy === user?._id;
                            
                            return (
                                <div 
                                    key={project._id} 
                                    className="bg-white border border-slate-200 rounded-[12px] p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                                >
                                    <Link to={`/projects/${project._id}`} className="flex-grow flex flex-col md:flex-row md:items-center gap-6 cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                            <FolderKanban className="w-6 h-6" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate mb-0.5">
                                                {project.name}
                                            </h3>
                                            <p className="text-[13px] text-slate-500 truncate max-w-xl">
                                                {project.description || "No description provided."}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Creator</span>
                                                <span className="text-[13px] font-semibold text-slate-700">{project.createdBy?.name || 'Unknown'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Team</span>
                                                <div className="flex items-center gap-1 text-slate-700">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="text-[13px] font-semibold">{project.members?.length || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Created</span>
                                                <div className="flex items-center gap-1 text-slate-700">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-[13px] font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 shrink-0">
                                        <button 
                                            disabled={!isCreator}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                confirmDeleteProject(project);
                                            }}
                                            className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all ${
                                                isCreator 
                                                    ? 'text-red-600 hover:bg-red-50 cursor-pointer' 
                                                    : 'text-slate-300 cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Showing <span className="font-bold text-slate-700">{pagination.total > 0 ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, pagination.total)}</span> of <span className="font-bold text-slate-700">{pagination.total}</span> projects
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-[8px] border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map((pg) => (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`w-9 h-9 rounded-[8px] text-[13px] font-bold transition-colors ${
                                        pg === page
                                            ? 'bg-[#0F172A] text-white'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                                disabled={page === (pagination.totalPages || 1)}
                                className="p-2 rounded-[8px] border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            <CreateProjectModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={(newProject) => {
                    // Refresh from page 1 so newly created project shows
                    setPage(1);
                    fetchProjects(1);
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                }}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                itemName={projectToDelete?.name || ''}
                confirmLabel="Delete Project"
            />
        </div>
    );
}
