'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, Upload, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/app/components/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface ProjectAnalysis {
    id: string;
    projectName: string;
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    uploadedAt: string;
    progress: number;
    result?: Record<string, unknown>;
}

// Configurar la URL de la API desde variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.moneymule.xyz';

const getStatusColor = (status: ProjectAnalysis['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusIcon = (status: ProjectAnalysis['status']) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className='h-4 w-4' />;
        case 'processing':
            return <Clock className='h-4 w-4' />;
        case 'pending':
            return <Clock className='h-4 w-4' />;
        case 'failed':
            return <XCircle className='h-4 w-4' />;
        default:
            return <FileText className='h-4 w-4' />;
    }
};

export default function DashboardPage() {
    const [projects, setProjects] = useState<ProjectAnalysis[]>([]);
    const [uploading, setUploading] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectAnalysis | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadProjectsFromStorage();
    }, []);

    const loadProjectsFromStorage = () => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('project-analyses');
            if (stored) {
                const parsedProjects = JSON.parse(stored) as ProjectAnalysis[];
                setProjects(parsedProjects);
            }
        } catch (error) {
            console.error('Error loading projects from localStorage:', error);
        }
    };

    const saveProjectsToStorage = (updatedProjects: ProjectAnalysis[]) => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('project-analyses', JSON.stringify(updatedProjects));
        } catch (error) {
            console.error('Error saving projects to localStorage:', error);
        }
    };

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !projectName.trim()) {
            alert('Por favor selecciona un archivo y escribe el nombre del proyecto');
            return;
        }

        setUploading(true);

        const newProject: ProjectAnalysis = {
            id: generateId(),
            projectName: projectName.trim(),
            fileName: selectedFile.name,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            progress: 0,
        };

        // Agregar el proyecto al estado y localStorage inmediatamente
        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        saveProjectsToStorage(updatedProjects);

        // Limpiar el formulario inmediatamente para permitir más subidas
        setProjectName('');
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setUploading(false);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('project_name', projectName.trim());

            // Actualizar a processing
            updateProjectStatus(newProject.id, 'processing', 25);

            const response = await fetch(`${API_URL}/api/v1/analysis/project/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = (await response.json()) as Record<string, unknown>;
                updateProjectStatus(newProject.id, 'completed', 100, result);
            } else {
                updateProjectStatus(newProject.id, 'failed', 0);
            }
        } catch (error) {
            console.error('Error uploading project:', error);
            updateProjectStatus(newProject.id, 'failed', 0);
        }
    };

    const updateProjectStatus = (
        id: string,
        status: ProjectAnalysis['status'],
        progress: number,
        result?: Record<string, unknown>
    ) => {
        setProjects(prevProjects => {
            const updatedProjects = prevProjects.map(project => {
                if (project.id === id) {
                    return {
                        ...project,
                        status,
                        progress,
                        result,
                    };
                }
                return project;
            });
            saveProjectsToStorage(updatedProjects);
            return updatedProjects;
        });
    };

    const handleUploadClick = () => {
        handleUpload().catch(console.error);
    };

    const handleProjectClick = (project: ProjectAnalysis) => {
        if (project.status === 'completed') {
            setSelectedProject(project);
            setModalOpen(true);
        }
    };

    // Prevenir renderizado hasta que el componente se monte en el cliente
    if (!mounted) {
        return (
            <div className='min-h-screen bg-gray-50'>
                <DashboardNav />
                <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600' />
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <DashboardNav />
            <div className='container mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Análisis de Proyectos</h1>
                    <p className='text-gray-600'>
                        Sube tu deck y obtén un análisis detallado del proyecto
                    </p>
                </div>

                {/* Upload Form */}
                <Card className='mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Upload className='h-5 w-5 text-green-600' />
                            Subir Proyecto
                        </CardTitle>
                        <CardDescription>
                            Selecciona un archivo PDF y proporciona el nombre del proyecto
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='project-name'>Nombre del Proyecto</Label>
                                <Input
                                    id='project-name'
                                    type='text'
                                    placeholder='Ej: Mi Startup SaaS'
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    disabled={uploading}
                                />
                            </div>

                            <div>
                                <Label htmlFor='file-input'>Archivo del Deck (PDF)</Label>
                                <Input
                                    id='file-input'
                                    type='file'
                                    accept='.pdf'
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>

                            {selectedFile && (
                                <div className='text-sm text-gray-600'>
                                    Archivo seleccionado: {selectedFile.name}
                                </div>
                            )}

                            <Button
                                onClick={handleUploadClick}
                                disabled={uploading || !selectedFile || !projectName.trim()}
                                className='bg-green-600 hover:bg-green-700 text-white'
                                size='lg'
                            >
                                {uploading ? (
                                    <>
                                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Upload className='h-4 w-4 mr-2' />
                                        Subir y Analizar
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>Proyectos Analizados</CardTitle>
                        <CardDescription>Historial de análisis realizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {projects.length === 0 ? (
                            <div className='text-center py-8'>
                                <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                <p className='text-gray-500'>
                                    No tienes proyectos analizados aún. ¡Sube tu primer deck!
                                </p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {projects.map(project => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`border rounded-lg p-4 transition-all ${project.status === 'completed'
                                                ? 'hover:shadow-md cursor-pointer hover:bg-gray-50'
                                                : 'bg-gray-50'
                                            }`}
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        <div className='flex items-start justify-between mb-3'>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='font-semibold text-gray-900 text-sm truncate'>
                                                    {project.projectName}
                                                </h3>
                                                <p className='text-xs text-gray-600 mt-1'>
                                                    {project.fileName}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`${getStatusColor(project.status)} text-xs`}
                                            >
                                                {getStatusIcon(project.status)}
                                                <span className='ml-1 capitalize'>
                                                    {project.status}
                                                </span>
                                            </Badge>
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between text-xs'>
                                                <span className='text-gray-600'>
                                                    {new Date(
                                                        project.uploadedAt
                                                    ).toLocaleDateString()}
                                                </span>
                                                <span className='text-gray-900'>
                                                    {project.progress}%
                                                </span>
                                            </div>
                                            <Progress value={project.progress} className='h-1' />
                                        </div>

                                        {project.status === 'completed' && (
                                            <div className='mt-3 text-xs text-gray-500'>
                                                Click para ver detalles
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Project Detail Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                                <FileText className='h-5 w-5' />
                                {selectedProject?.projectName}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedProject && selectedProject.result && (
                            <div className='space-y-6'>
                                <div className='grid grid-cols-1 gap-4'>
                                    <div>
                                        <h3 className='font-semibold text-gray-900 mb-2'>
                                            Resultado del Análisis
                                        </h3>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <pre className='text-sm text-gray-700 whitespace-pre-wrap'>
                                                {JSON.stringify(selectedProject.result, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
