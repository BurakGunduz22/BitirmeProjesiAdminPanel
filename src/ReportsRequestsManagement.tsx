import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import { collection, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DeleteOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const ReportsRequestsManagement: React.FC = () => {
    const [reportsRequests, setReportsRequests] = useState<any[]>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useEffect(() => {
        fetchReportsRequests();
    }, []);

    const fetchReportsRequests = async () => {
        try {
            const reportsRequestsSnapshot = await getDocs(collection(db, 'reportsRequests'));
            const reportsRequestsData = reportsRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReportsRequests(reportsRequestsData);
        } catch (error) {
            console.error('Error fetching reports and requests:', error);
        }
    };

    const showDeleteConfirm = (requestId: string) => {
        confirm({
            title: 'Are you sure delete this report/request?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteRequest(requestId);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const deleteRequest = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, 'reportsRequests', requestId));
            message.success('Report/Request deleted successfully');
            setReportsRequests(reportsRequests.filter(request => request.id !== requestId));
        } catch (error) {
            console.error('Error deleting report/request:', error);
            message.error('Failed to delete report/request');
        }
    };

    const subjectMapping: { [key: number]: string } = {
        0: 'Category Request',
        1: 'Reporting a User',
        2: 'Reporting a bug',
        3: 'Technical Support',
        4: 'General Feedback',
    };

    const statusMapping: { [key: number]: string } = {
        0: 'Created',
        1: 'Pending',
        2: 'Completed',
    };

    const handlePreview = (request: any) => {
        setSelectedRequest(request);
        setPreviewVisible(true);
    };

    const handleStatusChange = async (request: any) => {
        const newStatus = (request.status + 1) % 3; // Cycle through statuses
        try {
            await updateDoc(doc(db, 'reportsRequests', request.id), {
                status: newStatus,
            });
            message.success('Status updated successfully');
            fetchReportsRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Failed to update status');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (subject: number) => subjectMapping[subject] || 'Unknown',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: any) => date.toDate().toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => statusMapping[status] || 'Unknown',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <div className="button-container">
                    <Button type="dashed" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>Preview</Button>
                    <Button type="default" icon={<SyncOutlined />} onClick={() => handleStatusChange(record)}>Change Status</Button>
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div style={{
                height: '60px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '10px',
                paddingRight: '25px',
                justifyContent: 'space-between'
            }}>
                <h2>Reports and Requests</h2>
            </div>
            <div className="table-container">
                <Table columns={columns} dataSource={reportsRequests} rowKey="id" />
            </div>

            <Modal
                title="Report/Request Details"
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>Close</Button>,
                ]}
            >
                {selectedRequest && (
                    <div>
                        <p><strong>Title:</strong> {selectedRequest.title}</p>
                        <p><strong>Subject:</strong> {subjectMapping[selectedRequest.subject] || 'Unknown'}</p>
                        <p><strong>Message:</strong> {selectedRequest.message}</p>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ReportsRequestsManagement;
