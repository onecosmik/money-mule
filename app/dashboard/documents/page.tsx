'use client';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Info,
    Shield,
    Upload,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/app/components/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface DocumentAnalysis {
    id: string;
    fileName: string;
    documentType?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    uploadedAt: string;
    progress: number;
    result?: {
        document_type?: string;
        score?: number;
        risk_summary?: {
            critical?: string[];
            medium?: string[];
            low?: string[];
        };
    };
}

// Configurar la URL de la API desde variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.moneymule.xyz';

const getStatusColor = (status: DocumentAnalysis['status']) => {
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

const getStatusIcon = (status: DocumentAnalysis['status']) => {
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

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
};

const detectDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase();
    if (name.includes('safe')) return 'SAFE';
    if (name.includes('saft')) return 'SAFT';
    if (name.includes('term sheet') || name.includes('termsheet')) return 'Term Sheet';
    if (name.includes('cap table') || name.includes('captable')) return 'Cap Table';
    if (name.includes('convertible')) return 'Convertible Note';
    if (name.includes('agreement')) return 'Agreement';
    if (name.includes('contract')) return 'Contract';
    return 'Document';
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentAnalysis[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<DocumentAnalysis | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadDocumentsFromStorage();
    }, []);

    const loadDocumentsFromStorage = () => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('document-analyses');
            if (stored) {
                const parsedDocuments = JSON.parse(stored) as DocumentAnalysis[];
                setDocuments(parsedDocuments);
            }
        } catch (error) {
            console.error('Error loading documents from localStorage:', error);
        }
    };

    const saveDocumentsToStorage = (updatedDocuments: DocumentAnalysis[]) => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('document-analyses', JSON.stringify(updatedDocuments));
        } catch (error) {
            console.error('Error saving documents to localStorage:', error);
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
        if (!selectedFile) {
            alert('Por favor selecciona un archivo');
            return;
        }

        setUploading(true);

        const newDocument: DocumentAnalysis = {
            id: generateId(),
            fileName: selectedFile.name,
            documentType: detectDocumentType(selectedFile.name),
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            progress: 0,
        };

        // Agregar el documento al estado y localStorage inmediatamente
        const updatedDocuments = [newDocument, ...documents];
        setDocuments(updatedDocuments);
        saveDocumentsToStorage(updatedDocuments);

        // Limpiar el formulario inmediatamente para permitir más subidas
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setUploading(false);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Actualizar a processing
            updateDocumentStatus(newDocument.id, 'processing', 25);

            const response = await fetch(`${API_URL}/api/v1/analysis/document/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                updateDocumentStatus(newDocument.id, 'completed', 100, result);
            } else {
                updateDocumentStatus(newDocument.id, 'failed', 0);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            updateDocumentStatus(newDocument.id, 'failed', 0);
        }
    };

    const updateDocumentStatus = (
        id: string,
        status: DocumentAnalysis['status'],
        progress: number,
        result?: any
    ) => {
        setDocuments(prevDocuments => {
            const updatedDocuments = prevDocuments.map(document => {
                if (document.id === id) {
                    return {
                        ...document,
                        status,
                        progress,
                        result,
                    };
                }
                return document;
            });
            saveDocumentsToStorage(updatedDocuments);
            return updatedDocuments;
        });
    };

    const handleUploadClick = () => {
        handleUpload().catch(console.error);
    };

    const handleDocumentClick = (document: DocumentAnalysis) => {
        if (document.status === 'completed') {
            setSelectedDocument(document);
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
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                        Análisis de Documentos
                    </h1>
                    <p className='text-gray-600'>
                        Analiza documentos legales como SAFE, SAFT, Term Sheets, Cap Tables y más
                    </p>
                </div>

                {/* Document Types Info */}
                <Card className='mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'>
                    <CardHeader>
                        <CardTitle className='text-lg'>Tipos de Documentos Soportados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>SAFE</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>SAFT</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Term Sheet</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Cap Table</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Convertible Note</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Agreement</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Contract</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-blue-600' />
                                <span>Otros</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Form */}
                <Card className='mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Upload className='h-5 w-5 text-green-600' />
                            Subir Documento
                        </CardTitle>
                        <CardDescription>Selecciona un archivo PDF para analizar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='file-input'>Documento (PDF)</Label>
                                <Input
                                    id='file-input'
                                    type='file'
                                    accept='.pdf'
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>

                            {selectedFile && (
                                <div className='space-y-2'>
                                    <div className='text-sm text-gray-600'>
                                        Archivo seleccionado: {selectedFile.name}
                                    </div>
                                    <div className='text-sm text-blue-600 font-medium'>
                                        Tipo detectado: {detectDocumentType(selectedFile.name)}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleUploadClick}
                                disabled={uploading || !selectedFile}
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

                {/* Documents Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documentos Analizados</CardTitle>
                        <CardDescription>
                            Historial de análisis de documentos legales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {documents.length === 0 ? (
                            <div className='text-center py-8'>
                                <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                <p className='text-gray-500'>
                                    No tienes documentos analizados aún. ¡Sube tu primer documento!
                                </p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {documents.map(document => (
                                    <motion.div
                                        key={document.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`border rounded-lg p-4 transition-all ${document.status === 'completed'
                                                ? 'hover:shadow-md cursor-pointer hover:bg-gray-50'
                                                : 'bg-gray-50'
                                            }`}
                                        onClick={() => handleDocumentClick(document)}
                                    >
                                        <div className='flex items-start justify-between mb-3'>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='font-semibold text-gray-900 text-sm truncate'>
                                                    {document.fileName}
                                                </h3>
                                                <p className='text-xs text-blue-600 font-medium mt-1'>
                                                    {document.result?.document_type ||
                                                        document.documentType}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`${getStatusColor(document.status)} text-xs`}
                                            >
                                                {getStatusIcon(document.status)}
                                                <span className='ml-1 capitalize'>
                                                    {document.status}
                                                </span>
                                            </Badge>
                                        </div>

                                        {document.status === 'completed' &&
                                            document.result?.score && (
                                                <div className='mb-3'>
                                                    <div className='flex items-center justify-between text-sm'>
                                                        <span className='text-gray-600'>
                                                            Score:
                                                        </span>
                                                        <span
                                                            className={`font-bold ${getScoreColor(document.result.score)}`}
                                                        >
                                                            {document.result.score}/100
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between text-xs'>
                                                <span className='text-gray-600'>
                                                    {new Date(
                                                        document.uploadedAt
                                                    ).toLocaleDateString()}
                                                </span>
                                                <span className='text-gray-900'>
                                                    {document.progress}%
                                                </span>
                                            </div>
                                            <Progress value={document.progress} className='h-1' />
                                        </div>

                                        {document.status === 'completed' && (
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

                {/* Document Detail Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                                <FileText className='h-5 w-5' />
                                {selectedDocument?.fileName}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedDocument && selectedDocument.result && (
                            <div className='space-y-6'>
                                {/* Header Info */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <h3 className='font-semibold text-gray-900'>
                                            Tipo de Documento
                                        </h3>
                                        <p className='text-blue-600 font-medium'>
                                            {selectedDocument.result.document_type ||
                                                selectedDocument.documentType}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-gray-900'>
                                            Score de Riesgo
                                        </h3>
                                        <p
                                            className={`text-xl font-bold ${getScoreColor(selectedDocument.result.score || 0)}`}
                                        >
                                            {selectedDocument.result.score || 0}/100
                                        </p>
                                    </div>
                                </div>

                                {/* Risk Summary */}
                                {selectedDocument.result.risk_summary && (
                                    <div className='space-y-4'>
                                        <h3 className='font-semibold text-gray-900'>
                                            Resumen de Riesgos
                                        </h3>

                                        {/* Critical Risks */}
                                        {selectedDocument.result.risk_summary.critical &&
                                            selectedDocument.result.risk_summary.critical.length >
                                            0 && (
                                                <div className='space-y-2'>
                                                    <h4 className='flex items-center gap-2 font-medium text-red-600'>
                                                        <AlertTriangle className='h-4 w-4' />
                                                        Críticos (
                                                        {
                                                            selectedDocument.result.risk_summary
                                                                .critical.length
                                                        }
                                                        )
                                                    </h4>
                                                    <ul className='space-y-1 text-sm'>
                                                        {selectedDocument.result.risk_summary.critical.map(
                                                            (risk, index) => (
                                                                <li
                                                                    key={index}
                                                                    className='flex items-start gap-2'
                                                                >
                                                                    <span className='text-red-500 mt-1'>
                                                                        •
                                                                    </span>
                                                                    <span className='text-gray-700'>
                                                                        {risk}
                                                                    </span>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                        {/* Medium Risks */}
                                        {selectedDocument.result.risk_summary.medium &&
                                            selectedDocument.result.risk_summary.medium.length >
                                            0 && (
                                                <div className='space-y-2'>
                                                    <h4 className='flex items-center gap-2 font-medium text-yellow-600'>
                                                        <Shield className='h-4 w-4' />
                                                        Medios (
                                                        {
                                                            selectedDocument.result.risk_summary
                                                                .medium.length
                                                        }
                                                        )
                                                    </h4>
                                                    <ul className='space-y-1 text-sm'>
                                                        {selectedDocument.result.risk_summary.medium.map(
                                                            (risk, index) => (
                                                                <li
                                                                    key={index}
                                                                    className='flex items-start gap-2'
                                                                >
                                                                    <span className='text-yellow-500 mt-1'>
                                                                        •
                                                                    </span>
                                                                    <span className='text-gray-700'>
                                                                        {risk}
                                                                    </span>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                        {/* Low Risks */}
                                        {selectedDocument.result.risk_summary.low &&
                                            selectedDocument.result.risk_summary.low.length > 0 && (
                                                <div className='space-y-2'>
                                                    <h4 className='flex items-center gap-2 font-medium text-green-600'>
                                                        <Info className='h-4 w-4' />
                                                        Bajos (
                                                        {
                                                            selectedDocument.result.risk_summary.low
                                                                .length
                                                        }
                                                        )
                                                    </h4>
                                                    <ul className='space-y-1 text-sm'>
                                                        {selectedDocument.result.risk_summary.low.map(
                                                            (risk, index) => (
                                                                <li
                                                                    key={index}
                                                                    className='flex items-start gap-2'
                                                                >
                                                                    <span className='text-green-500 mt-1'>
                                                                        •
                                                                    </span>
                                                                    <span className='text-gray-700'>
                                                                        {risk}
                                                                    </span>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
