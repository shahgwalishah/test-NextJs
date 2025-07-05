'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [emails, setEmails] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Debounce effect (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch emails from backend
    const fetchEmails = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!debouncedQuery) {
            setEmails([]);
            setSelectedEmail(null);
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
            setSelectedEmail(null);
        } catch (error) {
            console.error('Error fetching emails:', error);
            setError('Failed to load emails. Please try again.');
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
            alert('Email sent successfully!');
            handleCloseModal();
            fetchEmails();
        } catch (error) {
            alert('Failed to send email: ' + error.message);
        }
    };

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <div className="w-80 bg-gray-100 p-4 flex flex-col">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search emails..."
                    className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {loading && (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-2 bg-white rounded-md shadow animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="space-y-2 overflow-y-auto">
                    {emails.length > 0 ? (
                        emails.map((email, index) => (
                            <div
                                key={index}
                                onClick={() => handleEmailClick(email)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleEmailClick(email);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                className={`p-3 rounded-md shadow cursor-pointer ${
                                    selectedEmail === email ? 'bg-blue-100' : 'bg-white'
                                } hover:bg-blue-50 transition-colors`}
                            >
                                <p className="font-medium">{email.from}</p>
                                <p className="text-sm font-semibold">{email.subject}</p>
                                <p className="text-sm text-gray-500 truncate">{email.body}</p>
                                <p className="text-xs text-gray-400">
                                    {email.date ? new Date(email.date).toLocaleString() : 'No date'}
                                </p>
                            </div>
                        ))
                    ) : (
                        !loading && <p className="text-sm text-gray-500">No emails found</p>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 relative p-6">
                {selectedEmail ? (
                    <div className="bg-white p-6 rounded-md shadow max-w-3xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-4">{selectedEmail.subject}</h2>
                        <p><strong>From:</strong> {selectedEmail.from}</p>
                        <p><strong>To:</strong> {selectedEmail.to}</p>
                        {selectedEmail.cc && <p><strong>CC:</strong> {selectedEmail.cc}</p>}
                        {selectedEmail.bcc && <p><strong>BCC:</strong> {selectedEmail.bcc}</p>}
                        <p><strong>Date:</strong> {selectedEmail.date ? new Date(selectedEmail.date).toLocaleString() : 'N/A'}</p>
                        <hr className="my-4" />
                        <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-screen">
                        <h1 className="text-4xl font-bold text-gray-500">Select an email to view</h1>
                    </div>
                )}

                {/* Compose Email Button */}
                <button
                    style={{ position: 'fixed', bottom: '20px', right: '20px' }}
                    onClick={handleComposeClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                    Compose Email
                </button>

                {/* Modal for Email Composition */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
                                    <input
                                        type="email"
                                        id="to"
                                        name="to"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="cc@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bcc" className="block text-sm font-medium text-gray-700">BCC</label>
                                    <input
                                        type="email"
                                        id="bcc"
                                        name="bcc"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="bcc@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Email subject"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        rows={6}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Write your email here..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
