import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, DatePicker, Row, Col, Select, Image } from 'antd';
import { collection, doc, getDocs, updateDoc,deleteDoc } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import moment from 'moment';
import { DeleteOutlined,EditOutlined, CheckOutlined, CloseOutlined, EyeOutlined, LeftOutlined, RightOutlined,StopOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Option } = Select;

const ItemManagement: React.FC = () => {
    const [itemsOnSale, setItemsOnSale] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [editItemId, setEditItemId] = useState<string>("");
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [itemImages, setItemImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current image index for pagination
    const [form] = Form.useForm();

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = async () => {
        try {
            const itemsSnapshot = await getDocs(collection(db, 'itemsOnSale'));
            const itemsData = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItemsOnSale(itemsData);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const categoriesSnapshot = await getDocs(collection(db, 'itemCategories'));
            const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubCategories = async (categoryId: string) => {
        try {
            const subCategoriesSnapshot = await getDocs(collection(db, `itemCategories/${categoryId}/subCategories`));
            const subCategoriesData = subCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubCategories(subCategoriesData);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchItemImages = async (itemId: string) => {
        try {
            const imagesRef = ref(storage, `itemImages/${itemId}`);
            const imageList = await listAll(imagesRef);
            const imageUrls = await Promise.all(imageList.items.map(item => getDownloadURL(item)));
            setItemImages(imageUrls);
        } catch (error) {
            console.error('Error fetching item images:', error);
        }
    };
    const confirmItemDeletion = (itemId: string) => {
        confirm({
            title: 'Are you sure you want to delete this item?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteItem(itemId);
                    message.success('Item deleted successfully');
                } catch (error) {
                    console.error('Failed to delete item:', error);
                    message.error('Failed to delete item');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const deleteItem = async (itemId: string) => {
        try {
            await deleteDoc(doc(db,'itemsOnSale',itemId));
            fetchItems(); // Refresh the item list after deletion
        } catch (error) {
            throw error;
        }
    };

    const handlePreviewItem = async (itemId: string) => {
        const itemToPreview = itemsOnSale.find(item => item.id === itemId);
        if (itemToPreview) {
            setPreviewItem(itemToPreview);
            await fetchItemImages(itemId);
            setPreviewVisible(true);
            setCurrentImageIndex(0); // Reset current image index to first image
        }
    };

    const nextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % itemImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + itemImages.length) % itemImages.length);
    };

    const confirmItemStatusChange = async (itemId: string) => {
        confirm({
            title: 'Are you sure you want to confirm this item?',
            content: (
                <div>
                    <p>Item details:</p>
                    <p>Name: {previewItem.itemName}</p>
                    <p>Price: {previewItem.itemPrice} €</p>
                    {/* Add other item details here */}
                </div>
            ),
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await updateDoc(doc(db, 'itemsOnSale', itemId), { itemStatus: 1 });
                    message.success('Item status updated successfully');
                    fetchItems();
                    setPreviewVisible(false);
                } catch (error) {
                    console.error('Failed to update item status:', error);
                    message.error('Failed to update item status');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handleEditItem = async (itemId: string) => {
        const itemToEdit = itemsOnSale.find(item => item.id === itemId);
        const momentDate = moment(itemToEdit.itemDate.toDate(), "DD-MM-YYYY HH:mm:ss");
        if (itemToEdit) {
            await fetchSubCategories(itemToEdit.itemCategory);
            form.setFieldsValue({
                name: itemToEdit.itemName,
                price: itemToEdit.itemPrice,
                itemBrand: itemToEdit.itemBrand,
                itemCategory: itemToEdit.itemCategory,
                itemCity: itemToEdit.itemCity,
                itemCountry: itemToEdit.itemCountry,
                itemDate: momentDate, // Use moment to format date
                itemDesc: itemToEdit.itemDesc,
                itemDistrict: itemToEdit.itemDistrict,
                itemStreet: itemToEdit.itemStreet,
                itemSubCategory: itemToEdit.itemSubCategory,
                itemTown: itemToEdit.itemTown,
            });
            setEditItemId(itemId);
            setVisible(true);
        }
    };

    const handleEditCancel = () => {
        form.resetFields();
        setEditItemId("");
        setVisible(false);
    };

    const handleCategoryChange = async (value: string) => {
        form.setFieldsValue({ itemSubCategory: undefined });
        await fetchSubCategories(value);
    };
    const changeItemStatus = async (itemId: string) => {
        confirm({
            title: `Are you sure you want to block this item?`,
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await updateDoc(doc(db, 'itemsOnSale', itemId), { itemStatus: 2 });
                    message.success('Item status updated successfully');
                    fetchItems();
                    setPreviewVisible(false);
                } catch (error) {
                    console.error('Failed to update item status:', error);
                    message.error('Failed to update item status');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handleFormSubmit = async (values: any) => {
        try {
            const {
                name,
                price,
                itemBrand,
                itemCategory,
                itemCity,
                itemCountry,
                itemDate,
                itemDesc,
                itemDistrict,
                itemStreet,
                itemSubCategory,
                itemTown
            } = values;
            const newPrice = Number(price);
            await updateDoc(doc(db, 'itemsOnSale', editItemId), {
                itemName: name,
                itemPrice: newPrice,
                itemBrand: itemBrand,
                itemCategory: itemCategory,
                itemCity: itemCity,
                itemCountry: itemCountry,
                itemDate: itemDate.toDate(),
                itemDesc: itemDesc,
                itemDistrict: itemDistrict,
                itemStreet: itemStreet,
                itemSubCategory: itemSubCategory,
                itemTown: itemTown,
            });

            message.success('Item updated successfully');
            form.resetFields();
            setEditItemId("");
            setVisible(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to update item:', error);
            message.error('Failed to update item');
        }
    };

    const columns = [
        {
            title: 'Item Name',
            dataIndex: 'itemName',
            key: 'itemName',
        },
        {
            title: 'Price',
            dataIndex: 'itemPrice',
            key: 'itemPrice',
            render: (price: number) => `${price} €`
        },
        {
            title: 'Category',
            dataIndex: 'itemCategory',
            key: 'itemCategory',
            render: (categoryId: string) => {
                const category = categories.find(cat => cat.id === categoryId);
                return category ? category.categoryName : 'Unknown';
            }
        },
        {
            title: 'Sub-Category',
            dataIndex: 'itemSubCategory',
            key: 'itemSubCategory',
            render: (subCategoryId: string) => {
                const subCategory = subCategories.find(subCat => subCat.id === subCategoryId);
                return subCategory ? subCategory.subCategoryName : 'Unknown';
            }
        },
        {
            title: 'Status',
            dataIndex: 'itemStatus',
            key: 'itemStatus',
            render: (status: number) => {
                switch (status) {
                    case 0:
                        return 'Pending';
                    case 1:
                        return 'Confirmed';
                    case 2:
                        return 'Blocked';
                    default:
                        return 'Unknown';
                }
            },
        },
        {
            title: 'Date',
            dataIndex: 'itemDate',
            key: 'itemDate',
            render: (date: any) => moment(date.toDate()).format("DD-MM-YYYY HH:mm:ss")
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <div className="button-container">
                    <Button type="default" icon={<EditOutlined />} onClick={() => handleEditItem(record.id)}>Edit</Button>
                    <Button type="dashed" icon={<EyeOutlined />} onClick={() => handlePreviewItem(record.id)}>Preview</Button>
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => confirmItemDeletion(record.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Table columns={columns} dataSource={itemsOnSale} rowKey="id" />

            <Modal
                title="Edit Item"
                visible={visible}
                onOk={form.submit}
                onCancel={handleEditCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input type="name" />
                    </Form.Item>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="itemBrand"
                                label="Brand"
                                rules={[{ required: true, message: 'Please input the brand!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[{ required: true, message: 'Please input the price!' }]}
                            >
                                <Input
                                    type="number"
                                    addonAfter="€"
                                    placeholder="Enter price"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="itemCategory"
                                label="Category"
                                rules={[{ required: true, message: 'Please select the category!' }]}
                            >
                                <Select onChange={handleCategoryChange}>
                                    {categories.map(category => (
                                        <Option key={category.id} value={category.id}>{category.categoryName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="itemSubCategory"
                                label="Sub-Category"
                                rules={[{ required: true, message: 'Please select the sub-category!' }]}
                            >
                                <Select>
                                    {subCategories.map(subCategory => (
                                        <Option key={subCategory.id} value={subCategory.id}>{subCategory.subCategoryName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="itemCountry"
                                label="Country"
                                rules={[{ required: true, message: 'Please input the country!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="itemCity"
                                label="City"
                                rules={[{ required: true, message: 'Please input the city!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="itemTown"
                                label="Town"
                                rules={[{ required: true, message: 'Please input the town!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="itemDistrict"
                                label="District"
                                rules={[{ required: true, message: 'Please input the district!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="itemStreet"
                                label="Street"
                                rules={[{ required: true, message: 'Please input the street!' }]}
                            >
                                <Input type="text" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="itemDate"
                        label="Date"
                        rules={[{ required: true, message: 'Please input the date!' }]}
                    >
                        <DatePicker showTime format="DD-MM-YYYY HH:mm:ss" />
                    </Form.Item>
                    <Form.Item
                        name="itemDesc"
                        label="Description"
                        rules={[{ required: true, message: 'Please input the description!' }]}
                    >
                        <Input.TextArea autoSize={{ minRows: 6, maxRows: 6 }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Item Preview"
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="cancel" icon={<CloseOutlined />} onClick={() => setPreviewVisible(false)}>Cancel</Button>,
                    <Button key="reject" icon={<StopOutlined />} type="primary" danger onClick={() => changeItemStatus(previewItem.id)}>Reject</Button>,
                    <Button key="confirm" icon={<CheckOutlined />} type="primary" onClick={() => confirmItemStatusChange(previewItem.id)}>Confirm</Button>
                ]}
            >
                {previewItem && (
                    <div>
                        <div style={{textAlign: 'center'}}>
                            <Image src={itemImages[currentImageIndex]} width={200}/>
                            <br/>
                            <Button type="text" icon={<LeftOutlined/>} disabled={itemImages.length <= 1}
                                    onClick={prevImage}/>
                            <Button type="text" icon={<RightOutlined/>} disabled={itemImages.length <= 1}
                                    onClick={nextImage}/>
                        </div>
                        <p><strong>Name:</strong> {previewItem.itemName}</p>
                        <p><strong>Price:</strong> {previewItem.itemPrice} €</p>
                        <p><strong>Brand:</strong> {previewItem.itemBrand}</p>
                        <p><strong>Category:</strong> {categories.find(cat => cat.id === previewItem.itemCategory)?.categoryName}</p>
                        <p><strong>Sub-Category:</strong> {subCategories.find(subCat => subCat.id === previewItem.itemSubCategory)?.subCategoryName}</p>
                        <p><strong>Country:</strong> {previewItem.itemCountry}</p>
                        <p><strong>City:</strong> {previewItem.itemCity}</p>
                        <p><strong>Town:</strong> {previewItem.itemTown}</p>
                        <p><strong>District:</strong> {previewItem.itemDistrict}</p>
                        <p><strong>Street:</strong> {previewItem.itemStreet}</p>
                        <p><strong>Date:</strong> {moment(previewItem.itemDate.toDate()).format("DD-MM-YYYY HH:mm:ss")}
                        </p>
                        <p><strong>Description:</strong> {previewItem.itemDesc}</p>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ItemManagement;

