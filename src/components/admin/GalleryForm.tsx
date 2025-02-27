import React, { useState } from 'react';
import { Form, Upload, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface GalleryFormProps {
  onSubmit?: (values: any) => void;
  initialValues?: any;
}

const GalleryForm: React.FC<GalleryFormProps> = ({ onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        images: fileList
      };
      
      if (onSubmit) {
        await onSubmit(formData);
      }
      message.success('Gallery items saved successfully');
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Failed to save gallery items');
    }
  };

  const uploadProps = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: UploadFile) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        name="title"
        label="Gallery Title"
        rules={[{ required: true, message: 'Please enter gallery title' }]}
      >
        <Input placeholder="Enter gallery title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter description' }]}
      >
        <Input.TextArea 
          placeholder="Enter gallery description"
          rows={4}
        />
      </Form.Item>

      <Form.Item
        label="Images"
        required
        tooltip="Upload one or more images for the gallery"
      >
        <Upload
          listType="picture-card"
          multiple
          {...uploadProps}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Gallery
        </Button>
      </Form.Item>
    </Form>
  );
};

export default GalleryForm; 