import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Table } from 'antd';
import { collection, doc, getDocs, addDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { EditOutlined, EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState<string>("");
    const [editSubcategoryId, setEditSubcategoryId] = useState<string>("");
    const [form] = Form.useForm();
    const [subForm] = Form.useForm();
    const [subModalVisible, setSubModalVisible] = useState(false);
    const [editSubModalVisible, setEditSubModalVisible] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesSnapshot = await getDocs(collection(db, 'itemCategories'));
            const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const subcategoriesSnapshot = await getDocs(collection(db, `itemCategories/${categoryId}/subCategories`));
            const subcategoriesData = subcategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubcategories(subcategoriesData);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleEditCategory = async (categoryId: string) => {
        try {
            const categoryRef = doc(db, 'itemCategories', categoryId);
            const categorySnapshot = await getDoc(categoryRef);

            if (categorySnapshot.exists()) {
                const categoryData = categorySnapshot.data();

                form.setFieldsValue({
                    categoryName: categoryData.categoryName,
                });

                setVisible(true);
                setEditCategoryId(categoryId);
            } else {
                console.error('Category document not found');
                message.error('Category not found');
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            message.error('Failed to fetch category');
        }
    };

    const handleEditSubcategory = async (subcategoryId: string) => {
        try {
            const subcategoryRef = doc(db, `itemCategories/${selectedCategoryId}/subCategories`, subcategoryId);
            const subcategorySnapshot = await getDoc(subcategoryRef);

            if (subcategorySnapshot.exists()) {
                const subcategoryData = subcategorySnapshot.data();

                subForm.setFieldsValue({
                    subCategoryName: subcategoryData.subCategoryName,
                });

                setEditSubModalVisible(true);
                setEditSubcategoryId(subcategoryId);
            } else {
                console.error('Subcategory document not found');
                message.error('Subcategory not found');
            }
        } catch (error) {
            console.error('Error fetching subcategory:', error);
            message.error('Failed to fetch subcategory');
        }
    };

    const handleAddCategory = async (values: any) => {
        try {
            const { categoryName } = values;
            await addDoc(collection(db, 'itemCategories'), { categoryName });
            message.success('Category added successfully');
            setVisible(false);
            form.resetFields();
            fetchCategories();
        } catch (error) {
            console.error('Failed to add category:', error);
            message.error('Failed to add category');
        }
    };

    const handleAddSubcategory = async (values: any) => {
        try {
            const { subCategoryName } = values;
            await addDoc(collection(db, `itemCategories/${selectedCategoryId}/subCategories`), { subCategoryName });
            message.success('Subcategory added successfully');
            setSubModalVisible(false);
            subForm.resetFields();
            fetchSubcategories(selectedCategoryId);
        } catch (error) {
            console.error('Failed to add subcategory:', error);
            message.error('Failed to add subcategory');
        }
    };

    const handleFormCancel = () => {
        form.resetFields();
        setEditCategoryId("");
        setVisible(false);
    };

    const handleSubFormCancel = () => {
        subForm.resetFields();
        setEditSubcategoryId("");
        setSubModalVisible(false);
        setEditSubModalVisible(false);
    };

    const handleFormSubmit = async (values: any) => {
        try {
            const { categoryName } = values;

            if (editCategoryId) {
                await updateDoc(doc(db, 'itemCategories', editCategoryId), { categoryName });
                message.success('Category updated successfully');
            } else {
                await addDoc(collection(db, 'itemCategories'), { categoryName });
                message.success('Category added successfully');
            }

            form.resetFields();
            setEditCategoryId('');
            setVisible(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to update category:', error);
            message.error('Failed to update category');
        }
    };

    const handleSubFormSubmit = async (values: any) => {
        try {
            const { subCategoryName } = values;

            if (editSubcategoryId) {
                await updateDoc(doc(db, `itemCategories/${selectedCategoryId}/subCategories`, editSubcategoryId), { subCategoryName });
                message.success('Subcategory updated successfully');
            } else {
                await addDoc(collection(db, `itemCategories/${selectedCategoryId}/subCategories`), { subCategoryName });
                message.success('Subcategory added successfully');
            }

            subForm.resetFields();
            setEditSubcategoryId('');
            setSubModalVisible(false);
            setEditSubModalVisible(false);
            fetchSubcategories(selectedCategoryId);
        } catch (error) {
            console.error('Failed to update subcategory:', error);
            message.error('Failed to update subcategory');
        }
    };

    const handleViewSubcategories = async (categoryId: string) => {
        try {
            setSelectedCategoryId(categoryId);
            await fetchSubcategories(categoryId);
            setSubModalVisible(true);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            message.error('Failed to fetch subcategories');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteDoc(doc(db, 'itemCategories', categoryId));
            message.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            message.error('Failed to delete category');
        }
    };

    const handleDeleteSubcategory = async (subcategoryId: string) => {
        try {
            await deleteDoc(doc(db, `itemCategories/${selectedCategoryId}/subCategories`, subcategoryId));
            message.success('Subcategory deleted successfully');
            fetchSubcategories(selectedCategoryId);
        } catch (error) {
            console.error('Failed to delete subcategory:', error);
            message.error('Failed to delete subcategory');
        }
    };

    const columns = [
        {
            title: 'Category Name',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <div className="button-container">
                    <Button type="default" icon={<EditOutlined />} onClick={() => handleEditCategory(record.id)}>Edit</Button>
                    <Button type="default" icon={<EyeOutlined />} onClick={() => handleViewSubcategories(record.id)}>View Subcategories</Button>
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCategory(record.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    const subcategoryColumns = [
        {
            title: 'Subcategory Name',
            dataIndex: 'subCategoryName',
            key: 'subCategoryName',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <div className="button-container">
                    <Button type="default" icon={<EditOutlined />} onClick={() => handleEditSubcategory(record.id)}>Edit</Button>
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => handleDeleteSubcategory(record.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>Add Category</Button>
            <Modal
                title={editCategoryId ? "Edit Category" : "Add Category"}
                visible={visible}
                onOk={form.submit}
                onCancel={handleFormCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="categoryName"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please input the category name!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Table columns={columns} dataSource={categories} rowKey="id" />

            {/* Subcategories Modal */}
            <Modal
                title="Subcategories"
                visible={subModalVisible}
                onCancel={handleSubFormCancel}
                footer={null}
            >
                <Table columns={subcategoryColumns} dataSource={subcategories} rowKey="id" />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditSubModalVisible(true)}>Add Subcategory</Button>
            </Modal>

            {/* Add/Edit Subcategory Modal */}
            <Modal
                title={editSubcategoryId ? "Edit Subcategory" : "Add Subcategory"}
                visible={editSubModalVisible}
                onOk={subForm.submit}
                onCancel={handleSubFormCancel}
            >
                <Form
                    form={subForm}
                    layout="vertical"
                    onFinish={handleSubFormSubmit}
                >
                    <Form.Item
                        name="subCategoryName"
                        label="Subcategory Name"
                        rules={[{ required: true, message: 'Please input the subcategory name!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CategoryManagement;
