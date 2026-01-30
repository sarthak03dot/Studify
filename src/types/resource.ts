export interface Resource {
    _id: string;
    title: string;
    description: string;
    type: 'note' | 'syllabus' | 'paper';
    branch: string;
    subject: string;
    year: number;
    fileUrl: string;
    uploadedBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export interface CreateResourceData {
    title: string;
    description: string;
    type: 'note' | 'syllabus' | 'paper';
    branch: string;
    subject: string;
    year: number;
    fileUrl: string;
}
