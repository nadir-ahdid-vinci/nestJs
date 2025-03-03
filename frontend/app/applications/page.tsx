import next from 'next';
import React from 'react'

interface Application {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: Date;
    ownerId: number;
}

const ApplicationsPage = async () => {
    const res = await fetch(
        'http://localhost:8000/applications', 
        {
            next: { 
                revalidate: 10 
            }
        }
    );
    const data = await res.json();


    return (
        <>
            <h1>Applications</h1>
            <ul>
                {data.map((application: Application) => (
                    <li key={application.id}>
                        <h2>{application.name}</h2>
                        <p>{application.description}</p>
                        <p>{application.status}</p>
                        <p>{application.createdAt}</p>
                        <p>{application.ownerId}</p>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default ApplicationsPage; 