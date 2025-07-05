'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, Upload, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/app/components/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    result?: Record<string, unknown>;
}

// Configurar la URL de la API desde variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moneymule.xyz';

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
            setDocuments(updatedDocuments);
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

        // Agregar el documento al localStorage inmediatamente
        const updatedDocuments = [newDocument, ...documents];
        saveDocumentsToStorage(updatedDocuments);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simular progreso mientras se sube
            updateDocumentStatus(newDocument.id, 'processing', 25);

            const response = await fetch(`${API_URL}/api/v1/analysis/document/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = (await response.json()) as Record<string, unknown>;
                updateDocumentStatus(newDocument.id, 'completed', 100, result);
            } else {
                updateDocumentStatus(newDocument.id, 'failed', 0);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            updateDocumentStatus(newDocument.id, 'failed', 0);
        } finally {
            setUploading(false);
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    const updateDocumentStatus = (
        id: string,
        status: DocumentAnalysis['status'],
        progress: number,
        result?: Record<string, unknown>
    ) => {
        const updatedDocuments = documents.map(document => {
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
    };

    const handleUploadClick = () => {
        handleUpload().catch(console.error);
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
                                        Analizando...
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

                {/* Documents List */}
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
                            <div className='space-y-4'>
                                {documents.map(document => (
                                    <motion.div
                                        key={document.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                                    >
                                        <div className='flex items-start justify-between mb-3'>
                                            <div>
                                                <h3 className='font-semibold text-gray-900 mb-1'>
                                                    {document.fileName}
                                                </h3>
                                                <p className='text-sm text-blue-600 font-medium'>
                                                    {document.documentType}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(document.status)}>
                                                {getStatusIcon(document.status)}
                                                <span className='ml-1 capitalize'>
                                                    {document.status}
                                                </span>
                                            </Badge>
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between text-sm'>
                                                <span className='text-gray-600'>
                                                    Subido:{' '}
                                                    {new Date(
                                                        document.uploadedAt
                                                    ).toLocaleDateString()}
                                                </span>
                                                <span className='text-gray-900'>
                                                    {document.progress}%
                                                </span>
                                            </div>
                                            <Progress value={document.progress} className='h-2' />
                                        </div>

                                        {document.result && (
                                            <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                                                <p className='text-sm text-gray-700 font-medium mb-1'>
                                                    Resultado:
                                                </p>
                                                <pre className='text-xs text-gray-600 whitespace-pre-wrap'>
                                                    {JSON.stringify(document.result, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
