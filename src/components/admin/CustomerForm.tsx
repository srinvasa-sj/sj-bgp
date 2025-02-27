import React from 'react';
import { Form, Input, Button, message } from 'antd';

interface CustomerFormProps {
  onSubmit?: (values: any) => void;
  initialValues?: any;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      message.success('Customer information saved successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to save customer information');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Customer Name"
        rules={[{ required: true, message: 'Please enter customer name' }]}
      >
        <Input placeholder="Enter customer name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input placeholder="Enter email address" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[{ required: true, message: 'Please enter phone number' }]}
      >
        <Input placeholder="Enter phone number" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Customer
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CustomerForm; 