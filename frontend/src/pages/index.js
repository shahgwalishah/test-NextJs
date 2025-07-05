'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [emails, setEmails] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Debounce effect (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch emails from backend when debouncedQuery changes
    const fetchEmails = useCallback(async () => {
        setLoading(true);
        if (!debouncedQuery) {
            setEmails([]);
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/search-emails?query=${encodeURIComponent(debouncedQuery)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setEmails(data);
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    const handleComposeClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = {
            to: event.target.to.value,
            cc: event.target.cc.value,
            bcc: event.target.bcc.value,
            subject: event.target.subject.value,
            body: event.target.body.value,
        };

        try {
            const response = await fetch('http://localhost:3001/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send email');
            const data = await response.json();
            alert('Email sent successfully!');
            handleCloseModal();
            fetchEmails(); // Refresh email list after sending
        } catch (error) {
            alert('Failed to send email: ' + error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 p-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search emails..."
                    className="w-full p-2 mb-4 border rounded-md"
                />
                {loading && <p className="text-sm text-gray-500">Loading...</p>}
                <div className="space-y-2">
                    {emails.length > 0 ? (
                        emails.map((email, index) => (
                            <div key={index} className="p-2 bg-white rounded-md shadow">
                                <p><strong>To:</strong> {email.to}</p>
                                <p><strong>Subject:</strong> {email.subject}</p>
                            </div>
                        ))
                    ) : (
                        !loading && <p className="text-sm text-gray-500">No emails found</p>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 relative">
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold">Home</h1>
                </div>

                {/* Compose Email Button */}
                <button
                    style={{ position: 'absolute', bottom: '10px', right: '20px' }}
                    onClick={handleComposeClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Compose Email
                </button>

                {/* Modal for Email Composition */}
                {isModalOpen && (
                    <div className="fixed bg-black bg-opacity-50 flex items-end justify-end z-50" style={{ inset: 0 }}>
                        <div className="bg-white p-4 rounded-lg w-full max-w-md mr-4 mb-14" style={{ position: 'absolute', bottom: '60px', right: '20px' }}>
                            <h2 className="text-xl font-semibold mb-3">Compose Email</h2>
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
                                    <input
                                        type="email"
                                        id="to"
                                        name="to"
                                        className="mt-1 block w-full border-gray-300 rounded-md"
                                        placeholder="recipient@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cc" className="block text-sm font-medium text-gray-700">CC</label>
                                    <input
                                        type="email"
                                        id="cc"
                                        name="cc"
                                        className="mt-1 block w-full border-gray-300 rounded-md"
                                        placeholder="cc@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bcc" className="block text-sm font-medium text-gray-700">BCC</label>
                                    <input
                                        type="email"
                                        id="bcc"
                                        name="bcc"
                                        className="mt-1 block w-full border-gray-300 rounded-md"
                                        placeholder="bcc@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="mt-1 block w-full border-gray-300 rounded-md"
                                        placeholder="Email subject"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 rounded-md"
                                        placeholder="Write your email here..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
